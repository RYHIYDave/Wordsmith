// FLOOR 19, THE KEEP (THE THRONE HALL): ITS OWN PIECES, themed after its boss, the King (a mock-up; nothing of the game
// imports it).
//
// His rule for a set of floors from the second on (10 Oct, 14:54): “Going forward, let’s do 25 that are the theme of the 5
// levels, then 25 for each boss.” This floor's boss is the King (his doc "Wordsmith Act 2, Part Two: The High City
// (Levels 16–20)", planned with him in the main chat; his "Yes, go (Recommended)"): "Boss: The King. His floor is the
// Throne Hall. The old king in his armour, raised from his deathbed with the Hush riding on his back, its fog in his
// crown, his great sword dragging on the stones." The level: "Level 19: The Keep. The old castle at the hill's crown,
// where the king lies dying."; its layout "walls and towers: battlements, a gatehouse, the barracks and the armoury, the
// throne hall, and the king's bedchamber at the top of the keep."; its hazards "murder holes that drop pitch, and
// portcullises that slam down to cut a hall in two."; its enemies "the king's knights, still loyal and silent in their
// armour, crossbowmen on the walls, and the Silent Order's last."; its story "the king is dying. The Hush sits on his
// chest wearing his crown, holding his sword, and the faces of everything he ever did look out at him from the bed
// curtains (as Death does in "The Nightingale"). His clockwork songbird lies broken on the floor."; its palette "Cold
// stone, royal blue, old gold." From Andersen's "The Nightingale" (1843), only from the book: the emperor's bed with its
// velvet curtains and heavy golden tassels, the strange heads peeping from among the folds of the curtains, the
// artificial bird of gold set with diamonds, rubies and sapphires, its tail glittering silver and gold, that sat on a
// silken cushion by his bed and broke, a spring snapping and its wheels running down.
//
// THE RULES THEY KEEP: as art/act2_kit.ts says (built in depth in floor 4's Scene, a step quieter than any word through
// art/act2_quiet.ts, seams of ink where one thing ends before another). NOTHING GLOWS BUT HONEST FIRE: the torches, the
// braziers and the fire under the pitch, in the honest fire's own orange; the old gold is gilt and thread and metal, dull;
// the songbird's gems are glints of colour, never a light; nothing cyan (the royal blue held to a true blue), no pink.
//
// HOW THEY GO IN (the main chat's): the battlements stand along a wall walk's outer row of tiles, their parapet on the
// tiles' far edge (the walk's own walls are the sky: art/keep.ts); a portcullis is laid one tile of it on each tile of a
// row across a hall or a doorway (its sections join into one grille under one lintel), and plays up, its warning,
// falling, slammed and down; a murder hole is laid on a floor tile of a passage and plays still, its warning, pouring,
// and its pool left smoking; the runner is laid tile by tile down a way; what hangs on a wall has its spots, as the
// Crypt's wall pieces have (no two in the same place).

import type { Sprite } from '../engine/px';
import type { Piece, Spot } from './floorkit';
import { toneAt } from './floor4';
import type { Scene, V3 } from './floor4';
import { hash } from './kit';
import type { Ramp } from './kit';
import { EMBER, COAL } from './props';
import { IRON, OAK, STRAW, cylinder, done, frontPiece, lying, scene, turned } from './act2_kit';

const fr = (t: number): number => t - Math.floor(t);
const AXES: readonly [V3, V3, V3] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const dot = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const TOWARD: V3 = [0.61, 0.61, 0.5];
const LIGHT: V3 = (() => {
  const v = [-0.55, 0.45, 0.7];
  const n = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / n, v[1] / n, v[2] / n];
})();

// =================================================================================================
// THE KEEP'S MATERIALS (each from its deep shade to its lit top), as the ground's (art/keep.ts)

/** The cold stone, a grey with blue in it. */
export const COLD: Ramp = ['#1b1e2a', '#2e3444', '#3f475a', '#545d72', '#6f7990'];
/** Royal blue cloth and paint (never the friend's cyan: hue 220 and more). */
export const ROYAL: Ramp = ['#12172c', '#1e2647', '#2b3560', '#3a4677', '#4e5a8c'];
/** Old gold: gilt, thread, the songbird's body; dull, never a glow. */
export const GOLD: Ramp = ['#3a2e1a', '#5a4826', '#7c6434', '#9c8146', '#b89c5e'];
/** Polished steel: the armour, the blades. */
export const STEEL: Ramp = ['#1c1f2a', '#343948', '#525868', '#767d90', '#a3aab8'];
/** Silver, the songbird's tail. */
const SILVER: Ramp = ['#3c3e48', '#5e626e', '#868a96', '#aeb2bc', '#d0d3da'];
/** Pitch: black, its sheen cold. */
export const PITCH: Ramp = ['#060509', '#0f0d13', '#1a171f', '#2b2731', '#48424f'];
/** Grey wool, the soldiers' blankets. */
const WOOL: Ramp = ['#22232a', '#34363e', '#4a4c56', '#62656f', '#7c7f8a'];
/** Linen, the king's sheets, greyed in the night. */
const LINEN: Ramp = ['#3e404a', '#5c5e68', '#7a7c86', '#979aa2', '#b4b6bc'];
/** Parchment, the war map. */
const PARCH: Ramp = ['#4a4234', '#6a604c', '#8a7e62', '#a69a7a', '#bfb392'];
/** The pale grey of the faces in the curtains (the Hush's grey: not a glow). */
const GHOST: Ramp = ['#3a3d4a', '#565a68', '#757987', '#9195a2', '#aaaeba'];
/** The songbird's gems, glints of colour (rubies a dull red, never the enemy's pink; sapphires; diamonds pale). */
const RUBY = '#8e3c3a';
const SAPPHIRE = '#3c4a8a';
const DIAMOND = '#c4c8d2';
/** Smoke off the pitch, and dust. */
const SMOKE = ['#26242c', '#35333d', '#46444f'];
const DUST = ['#363a46', '#4a505e', '#62687a'];
/** The deep dark of a hole, a shaft, a slit. */
const HOLE = '#07080d';
/** The night through an arrow slit. */
const NIGHT = ['#0c0e16', '#2a3048', '#6a7290'];

/** A tone of a ramp as a face is turned. */
const tone = (r: Ramp, bias = 0) => (n: V3): string => toneAt(n, r, bias);

// =================================================================================================
// HONEST FIRE: a flame painted straight onto the picture in the fire's own colours (never quietened)

/** A FLAME at a point of the world: tongues licking up, `size` picture pixels tall; `seed` its own shape, `f` its frame. */
function fire(S: Scene, base: V3, size: number, seed: number, f: number, id: number): void {
  const [bx, by] = S.at(base);
  const d = dot(base, TOWARD) + 40;
  const lean = [0, 0.18, -0.14][f % 3];
  const tongues = [
    { dx: 0, h: size * [1, 0.9, 1.08][f % 3], w: size * 0.42 },
    { dx: -size * 0.28, h: size * [0.66, 0.78, 0.58][f % 3], w: size * 0.3 },
    { dx: size * 0.3, h: size * [0.72, 0.6, 0.8][f % 3], w: size * 0.28 },
  ];
  const H0 = Math.ceil(size * 1.2);
  for (let yy = -H0; yy <= 2; yy++) {
    for (let xx = -Math.ceil(size); xx <= Math.ceil(size); xx++) {
      let best = 0;
      for (const [i, t] of tongues.entries()) {
        const up = -yy / t.h;
        if (up < -0.15 || up > 1) continue;
        const half = t.w * (up < 0.3 ? Math.sqrt(Math.max(0, (up + 0.15) / 0.45)) : Math.pow(Math.max(0, 1 - (up - 0.3) / 0.7), 1.1));
        const wob = Math.sin(up * 7 + seed * 1.7 + i * 2.1 + f * 2.3) * t.w * 0.25 * up + lean * up * size * 0.3;
        const off = Math.abs(xx - t.dx - wob);
        if (off > half) continue;
        best = Math.max(best, (1 - off / Math.max(0.5, half)) * (1 - Math.max(0, up - 0.5) * 0.9) + (i === 0 ? 0.15 : 0));
      }
      if (best <= 0) continue;
      const c = best > 0.78 ? EMBER[4] : best > 0.55 ? EMBER[3] : best > 0.3 ? EMBER[2] : EMBER[1];
      S.put(Math.round(bx + xx), Math.round(by + yy), d, c, id, base[2] + 1);
    }
  }
  // a spark or two above it
  for (let k = 0; k < 2; k++) {
    const sx = Math.round(bx + (hash(seed, f * 2 + k, 9101) - 0.5) * size);
    const sy = Math.round(by - size * (1.15 + 0.3 * hash(seed, f * 2 + k, 9102)));
    S.put(sx, sy, d, EMBER[3], id, base[2] + size);
  }
}
/** Embers on a bed of coals, a round of them at `c`, `r` across. */
function coals(S: Scene, c: V3, r: number, seed: number, id: number): void {
  S.egg(c, AXES, [r, r, 0.6], (_n, w) => {
    const h = hash(Math.floor(w[0] / 2.5), Math.floor(w[1] / 2.5), seed);
    return h < 0.35 ? EMBER[0] : h < 0.6 ? COAL[2] : h < 0.72 ? EMBER[1] : COAL[0];
  }, id);
}

// =================================================================================================
// THE ROYAL CREST (the palace guard's own mark, art/palace_guard.ts: a white swan, its wings raised, its neck in its S),
// here in old gold. A picture of its own, 15 x 15, facing left.

const CREST = [
  '.......#.....#.',
  '......##....##.',
  '.....###...###.',
  '.##..###..####.',
  '#..#.####.###..',
  '...#..#######..',
  '...#..#######..',
  '..#..########..',
  '..#.#########..',
  '...##########..',
  '....########...',
  '.....######....',
  '...#########...',
  '...............',
  '...............',
];
const crestAt = (cx: number, cy: number): boolean => {
  const x = Math.floor(cx);
  const y = Math.floor(cy);
  return y >= 0 && y < 15 && x >= 0 && x < 15 && CREST[y][x] === '#';
};

// =================================================================================================
// THE THRONE, THE CLOTH OF ESTATE, THE RUNNER, THE BANNERS

/**
 * THE THRONE ON ITS DAIS (the King's, empty: he is raised from his deathbed): a dais of three stone steps, the runner up
 * its middle; on it the throne, carved oak gilt along its edges, a high back of royal blue framed in gilt with the royal
 * crest at its head, under a pointed gable with a gilt finial; posts up to gilt pinnacles; arms ending in gilt scrolls;
 * its royal blue cushion dented, no one on it. Facing +y. Three tiles across, two deep. 200 x 230 at (100, 176).
 */
function throneOnDais(): Sprite {
  const S = scene(200, 230, 100, 176);
  const steps = [
    { hx: 60, y0: -40, y1: 40, z: 7 },
    { hx: 52, y0: -40, y1: 28, z: 14 },
    { hx: 44, y0: -40, y1: 16, z: 21 },
  ];
  steps.forEach((s, i) => {
    S.box([0, (s.y0 + s.y1) / 2, s.z / 2], AXES, [s.hx, (s.y1 - s.y0) / 2, s.z / 2], (f, u, v, n) => {
      const x = f === 4 ? -s.hx + 2 * s.hx * u : f === 0 ? s.hx : -s.hx + 2 * s.hx * v;
      const onRunner = Math.abs(x) < 25;
      if (onRunner && (f === 4 || f === 2)) {
        if (Math.abs(x) > 21.5) return toneAt(n, GOLD, f === 4 ? 0.1 : 0);
        return toneAt(n, ROYAL, f === 4 && v > 0.9 ? 0.4 : 0.05);
      }
      if (f === 4) return toneAt(n, COLD, v > 0.92 || u < 0.03 ? 0.5 : 0);
      // a joint up the riser every so often
      if (f === 2 && fr((x + 60) / 30) < 0.03) return COLD[0];
      return toneAt(n, COLD, f === 2 && u > 0.85 ? 0.4 : 0);
    }, 1 + i);
  });
  throneIn(S, [0, -18, 21]);
  return done(S, 100, 176);
}
/** The throne itself, built in a scene with its seat's foot at `o`, facing +y. */
function throneIn(S: Scene, o: V3): void {
  const O = (x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
  const gilt = tone(GOLD, 0.15);
  // its seat, a chest of oak, three little arches carved on its front, gilt along its edges
  S.box(O(0, 0, 10), AXES, [18, 13, 10], (f, u, v, n) => {
    if (f === 2) {
      const a = (v - 0.5) * 36;
      const z = u * 20;
      if (z > 17.6 || z < 2 || Math.abs(a) > 16) return toneAt(n, GOLD, z > 17.6 ? 0.4 : 0);
      const k = Math.floor((a + 16) / 10.7);
      const ca = -16 + (k + 0.5) * 10.7;
      const r = Math.hypot(a - ca, Math.max(0, z - 10));
      if (z > 4 && r < 3.6) return r > 2.6 ? OAK[4] : OAK[1];
      return toneAt(n, OAK, 0.1);
    }
    return toneAt(n, OAK, f === 0 && v > 0.9 ? 0.4 : 0);
  }, 10);
  S.egg(O(0, 1, 21), AXES, [16, 11, 3.2], (n, w) => toneAt(n, ROYAL, Math.hypot(w[0] - o[0], w[1] - o[1] - 1) < 7 ? -0.3 : 0.1), 11);
  // its back: royal blue framed in gilt, the crest at its head, buttoned in rows
  S.box(O(0, -11, 61), AXES, [16, 2.5, 41], (f, u, v, n) => {
    if (f !== 2) return toneAt(n, OAK, 0);
    const a = (v - 0.5) * 32;
    const z = 20 + u * 82;
    const e = Math.min(16 - Math.abs(a), z - 20, 102 - z);
    if (e < 2) return toneAt(n, OAK, 0.3);
    if (e < 3.6) return toneAt(n, GOLD, e < 2.8 ? 0.4 : 0);
    if (crestAt(a / 1.2 + 7.5, (102 - z - 9) / 1.2)) return toneAt(n, GOLD, 0.3);
    if (fr((z - 20) / 16) < 0.08 && z < 80) return ROYAL[1];
    return toneAt(n, ROYAL, 0);
  }, 12);
  // its gable, carved, gilt along its edges, a trefoil cut in it; a crown-like finial on its peak
  S.quad([O(-17, -8.3, 102), O(17, -8.3, 102), O(1.5, -8.3, 121), O(-1.5, -8.3, 121)], (u, v) => {
    const e = Math.min(u, 1 - u) * (1 - v * 0.9) * 34;
    if (e < 2.2 || v < 0.1) return e < 1.2 ? GOLD[4] : GOLD[3];
    const r = Math.hypot((u - 0.5) * 34, (v - 0.42) * 19);
    if (r < 3.4) return r > 2.4 ? OAK[4] : OAK[0];
    return OAK[3];
  }, 13);
  for (const s of [-1, 0, 1]) S.egg(O(s * 2.6, -8.4, 123 + (s ? 0 : 1.6)), AXES, [1.6, 1.4, s ? 2.4 : 3.2], gilt, 13);
  S.egg(O(0, -8.4, 121.4), AXES, [4.4, 1.6, 1.4], gilt, 13);
  for (const s of [-1, 1]) {
    // its posts, banded with gilt, each up to a gilt pinnacle
    S.rod(O(s * 19, -11, 0), O(s * 19, -11, 104), 3, 2.8, OAK, 14);
    for (const z of [36, 70, 105]) S.egg(O(s * 19, -11, z), AXES, [3.6, 3.6, 2], gilt, 14);
    S.rod(O(s * 19, -11, 106), O(s * 19, -11, 122), 2.8, 0.3, GOLD, 15);
    // its arm on a turned post, ending in a gilt scroll
    S.box(O(s * 19, 0.5, 34), AXES, [2.8, 12.5, 2], (f, _u, _v, n) => toneAt(n, f === 4 ? GOLD : OAK, 0), 16);
    S.rod(O(s * 19, 11, 0), O(s * 19, 11, 32), 2.6, 2.3, OAK, 17);
    S.egg(O(s * 19, 13, 35), AXES, [3, 3.6, 3.6], gilt, 17);
  }
}

/** A SPOT a wall piece is built at: across the face (`du`, picture pixels) and up it (`dv`). */
type At = readonly [number, number];
/** A WALL PIECE on both faces at each of its spots, frame by frame: `make(S, w, f)` builds frame `f` in front of the face. */
function onWall(make: (S: Scene, w: (a: number, b: number, z: number) => V3, f: number) => void, frames: number, spots: readonly At[], Wd: number, Ht: number, below: number, lights?: (w: (a: number, b: number, z: number) => V3, f: number) => { at: V3; r: number; color: string; a?: number }[]): { left: Sprite[]; right: Sprite[]; spots: Spot[] } {
  const all: Spot[] = spots.map(([du, dv]) => {
    const left: Sprite[] = [];
    const right: Sprite[] = [];
    for (let f = 0; f < frames; f++) {
      // (a picture pixel across the face is 1.25 of the world's units along it; up it, one)
      const s = frontPiece((S, w) => make(S, (a, b, z) => w(a + du * 1.25, b, z + dv), f), Wd, Ht, lights ? (_S, w) => lights((a, b, z) => w(a + du * 1.25, b, z + dv), f) : undefined, below);
      left.push(s.left);
      right.push(s.right);
    }
    return { du, dv, left, right };
  });
  return { left: all[0].left, right: all[0].right, spots: all };
}

/**
 * THE CLOTH OF ESTATE (on the wall, behind the throne): royal blue in long folds, an old gold border and a fringe of gold
 * at its foot, the royal crest twice as big high on it, a powdering of small gold stars; over it a narrow tester out from
 * the wall, gilt, and its valance hanging, scalloped, tasselled.
 */
function clothOfEstate(S: Scene, w: (a: number, b: number, z: number) => V3): void {
  const HW = 48;
  const Z0 = 22;
  const Z1 = 84;
  S.quad([w(-HW, 0.6, Z0), w(HW, 0.6, Z0), w(HW, 0.6, Z1), w(-HW, 0.6, Z1)], (u, v) => {
    const a = (u - 0.5) * 2 * HW;
    const z = Z0 + v * (Z1 - Z0);
    const fromTop = Z1 - z;
    const ph = (a / HW) * Math.PI * 4;
    const k = Math.sin(ph) > 0.85 ? 3 : Math.sin(ph) < -0.8 ? 1 : 2;
    const edge = Math.min(HW - Math.abs(a), z - Z0);
    if (z - Z0 < 4) return fr(a / 3) < 0.5 ? GOLD[2] : z - Z0 < 1.6 ? null : GOLD[3];
    if (edge < 3) return GOLD[k >= 2 ? 3 : 2];
    if (edge < 4.4) return ROYAL[0];
    if (crestAt((a + 15) / 2, (fromTop - 9) / 2)) return crestAt((a + 14) / 2, (fromTop - 10) / 2) ? GOLD[2] : GOLD[4];
    const si = Math.floor(a / 11 + 20);
    const sj = Math.floor(fromTop / 12);
    if ((si + sj) % 2 === 0 && Math.abs(fr(a / 11) - 0.5) < 0.12 && Math.abs(fr(fromTop / 12) - 0.5) < 0.13 && !(fromTop > 5 && fromTop < 40 && Math.abs(a) < 20)) return GOLD[2];
    return ROYAL[k];
  }, 1);
  // the tester out from the wall over it; its valance
  S.box(w(0, 4, 87), [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((d) => {
    const p = w(d[0], d[1], d[2]);
    const o = w(0, 0, 0);
    return [p[0] - o[0], p[1] - o[1], p[2] - o[2]] as V3;
  }) as unknown as [V3, V3, V3], [HW + 4, 4, 1.4], (f, _u, _v, n) => (f === 4 ? toneAt(n, ROYAL, 0.2) : toneAt(n, GOLD, 0.1)), 2);
  S.quad([w(-HW - 4, 8.3, 74), w(HW + 4, 8.3, 74), w(HW + 4, 8.3, 86), w(-HW - 4, 8.3, 86)], (u, v) => {
    const a = u * (2 * HW + 8);
    const z = 74 + v * 12;
    const sc = 2.5 + 5 * Math.abs(Math.sin((a / 16) * Math.PI));
    const tassel = fr(a / 16) < 0.12 || fr(a / 16) > 0.95;
    if (tassel) return z < 75.5 ? null : z < 78 ? GOLD[4] : GOLD[3];
    if (z < 74 + sc) return null;
    if (z < 76 + sc) return fr(a / 2.5) < 0.5 ? GOLD[2] : GOLD[3];
    if (z > 83.6) return GOLD[3];
    return ROYAL[2];
  }, 3);
}

/**
 * THE ROYAL RUNNER (on the floor), a tile of it laid down a way: royal blue, worn threadbare down its middle, an old gold
 * border, a lozenge of gold in each tile; or torn across, the flags showing through. Its tiles laid end to end are one
 * runner. Along x or along y; whole or torn. 100 x 60 at (50, 30).
 */
function runner(alongX: boolean, torn: boolean): Sprite {
  return lying(100, 60, 50, 30, (u, v, px, py) => {
    const a = alongX ? u : v;
    const b = alongX ? v : u;
    if (Math.abs(a) > 0.5 || Math.abs(b) > 0.31) return null;
    const e = 0.31 - Math.abs(b);
    if (torn) {
      const t = Math.abs(a - 0.08 - b * 0.4 - 0.04 * Math.sin(b * 40)) < 0.05 + 0.03 * hash(Math.floor(b * 30), 0, 9111);
      if (t) return null;
      if (Math.abs(a - 0.08 - b * 0.4) < 0.08 && hash(px, py, 9112) < 0.4) return ROYAL[3];
    }
    if (e < 0.02) return ROYAL[1];
    if (e < 0.065) return fr(a * 12) < 0.5 ? GOLD[3] : GOLD[4];
    if (e < 0.095) return ROYAL[1];
    // the lozenge in the tile's middle
    const lz = Math.abs(a) * 1.3 + Math.abs(b) * 2.6;
    if (lz > 0.34 && lz < 0.42) return GOLD[3];
    if (lz <= 0.34 && lz > 0.27) return ROYAL[4];
    const worn = Math.abs(b) < 0.12 && hash(px >> 1, py, 9113) < 0.3;
    return worn ? ROYAL[4] : ROYAL[3];
  });
}

/**
 * A ROYAL BANNER (on the wall): hung from an iron pole on its brackets, royal blue in long folds, an old gold border and
 * fringe at its head, the royal crest in old gold, a band and a lozenge under it, its foot cut in a swallow tail.
 */
function banner(S: Scene, w: (a: number, b: number, z: number) => V3): void {
  const HW = 15;
  const TOP = 86;
  const LEN = 62;
  S.quad([w(-HW, 1.4, TOP - LEN - 12), w(HW, 1.4, TOP - LEN - 12), w(HW, 1.4, TOP), w(-HW, 1.4, TOP)], (u, v) => {
    const a = (u - 0.5) * 2 * HW;
    const fromTop = (1 - v) * (LEN + 12);
    const foot = LEN - 12 * (1 - Math.abs(a) / HW);
    if (fromTop > foot) return null;
    const ph = (a / (2 * HW)) * Math.PI * 4 + 0.6;
    const k = Math.sin(ph) > 0.7 ? 3 : Math.sin(ph) < -0.6 ? 1 : 2;
    const edge = Math.min(HW - Math.abs(a), foot - fromTop);
    if (fromTop < 4) return fr(a / 3) < 0.5 ? GOLD[3] : GOLD[2];
    if (edge < 2.4) return GOLD[k >= 2 ? 3 : 2];
    if (edge < 3.6) return ROYAL[0];
    if (crestAt((a + 9.5) / 1.3, (fromTop - 10) / 1.3)) return crestAt((a + 8.5) / 1.3, (fromTop - 11) / 1.3) ? GOLD[2] : GOLD[4];
    if (Math.abs(fromTop - 33) < 1.2) return GOLD[2];
    if (Math.abs(fromTop - 46) * 0.9 + Math.abs(a) < 4.5 && Math.abs(fromTop - 46) * 0.9 + Math.abs(a) > 2.4) return GOLD[2];
    return ROYAL[k];
  }, 1);
  S.rod(w(-HW - 4, 2, TOP + 1), w(HW + 4, 2, TOP + 1), 1.1, 1.1, IRON, 2);
  for (const s of [-1, 1]) {
    S.ball(w(s * (HW + 5), 2, TOP + 1), 1.8, IRON, 2);
    S.rod(w(s * (HW - 2), 0, TOP + 5), w(s * (HW - 2), 2, TOP + 1), 0.8, 0.8, IRON, 3);
  }
}

// =================================================================================================
// FIRE: THE TORCH IN ITS SCONCE, THE BRAZIER, THE CAULDRON OF PITCH

/** A TORCH IN ITS SCONCE (on the wall): an iron bracket, a cup, a torch of wood its head wrapped in pitched rag, burning (honest fire); a smudge of soot on the wall over it. Three frames of its flame. */
function torch(S: Scene, w: (a: number, b: number, z: number) => V3, f: number): void {
  const Z = 50;
  // the soot on the wall over it
  S.quad([w(-7, 0.3, Z + 14), w(7, 0.3, Z + 14), w(4, 0.3, Z + 40), w(-4, 0.3, Z + 40)], (u, v, wp) => {
    const [px, py] = S.at(wp);
    return hash(Math.floor(px), Math.floor(py), 9121) < 0.55 - v * 0.4 ? '#14161e' : null;
  }, 1);
  S.box(w(0, 0.8, Z - 2), [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((d) => {
    const p = w(d[0], d[1], d[2]);
    const o = w(0, 0, 0);
    return [p[0] - o[0], p[1] - o[1], p[2] - o[2]] as V3;
  }) as unknown as [V3, V3, V3], [3, 0.8, 6], (_f, _u, _v, n) => toneAt(n, IRON, 0.1), 2);
  S.rod(w(0, 1.5, Z - 6), w(0, 8, Z), 0.8, 0.8, IRON, 3);
  S.egg(w(0, 8.5, Z + 1.5), AXES, [2.6, 2.6, 2.2], tone(IRON, 0.1), 3);
  S.rod(w(0, 8.3, Z - 8), w(0, 10, Z + 9), 1.4, 1.6, OAK, 4);
  S.egg(w(0, 10.2, Z + 10), AXES, [2.5, 2.5, 3], tone(['#1c1416', '#2a1e1a', '#3e2c22', '#4e3a2a', '#5e4632'], -0.2), 5);
  fire(S, w(0, 10.4, Z + 11), 13, 3, f, 6);
}
/** A BRAZIER: an iron bowl on three curled legs, coals in it, fire (honest). Three frames. 80 x 110 at (40, 92). */
function brazier(f: number): Sprite {
  const S = scene(80, 110, 40, 92);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.4;
    S.rod([Math.cos(a) * 13, Math.sin(a) * 13, 0], [Math.cos(a) * 8, Math.sin(a) * 8, 26], 1.2, 1, IRON, 1);
    S.egg([Math.cos(a) * 13.5, Math.sin(a) * 13.5, 1.6], AXES, [2.2, 2.2, 1.6], tone(IRON), 1);
  }
  S.egg([0, 0, 30], AXES, [12, 12, 8], (n, w) => toneAt(n, IRON, Math.abs(w[2] - 33.4) < 0.8 ? 0.6 : 0), 2, (w) => w[2] <= 33.8);
  coals(S, [0, 0, 33.6], 11, 9131, 3);
  fire(S, [-2, 2, 34], 26, 1, f, 4);
  fire(S, [4, -3, 34], 17, 2, (f + 1) % 3, 4);
  return done(S, 40, 92, [{ at: [0, 0, 46], r: 70, color: EMBER[2], a: 0.5 }]);
}
/**
 * A CAULDRON OF PITCH on its fire (the murder holes' pitch, heating on the gatehouse's floor): a round-bellied iron pot on
 * three short legs, its lip lit, the pitch black and steaming in it, a ladle in it; logs and fire under it (honest).
 * Three frames. 90 x 110 at (45, 86).
 */
function cauldron(f: number): Sprite {
  const S = scene(90, 110, 45, 86);
  for (const [a, b] of [[-11, 5], [10, -6], [-4, -11]] as const) S.rod([a, b, 1.4], [-a * 0.15, -b * 0.15, 2.6], 1.8, 1.6, OAK, 1);
  coals(S, [0, 0, 0.6], 10, 9141, 2);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.9;
    S.rod([Math.cos(a) * 11, Math.sin(a) * 11, 0], [Math.cos(a) * 9, Math.sin(a) * 9, 12], 1.4, 1.2, IRON, 3);
  }
  S.egg([0, 0, 21], AXES, [14, 14, 12], (n, w) => toneAt(n, STEEL, (w[2] > 28.6 ? 0.6 : 0) - 0.25), 4, (w) => w[2] <= 29.6);
  S.egg([0, 0, 29.4], AXES, [12, 12, 0.5], (_n, w) => (fr((w[0] - w[1]) * 0.12) < 0.12 ? PITCH[4] : PITCH[2]), 5);
  S.rod([5, -5, 29], [15, -16, 48], 1.1, 1.1, OAK, 6);
  fire(S, [-9, 10, 2], 13, 7, f, 7);
  fire(S, [10, 6, 2], 11, 8, (f + 1) % 3, 7);
  fire(S, [-1, 13, 2], 9, 9, (f + 2) % 3, 7);
  // its steam, curling up off it
  for (let i = 0; i < 9; i++) {
    const t = i / 9;
    S.egg([-2 + 5 * Math.sin(t * 6 + f), 2 * Math.cos(t * 5), 32 + t * 24], AXES, [1.6 + t * 2, 1.6 + t * 2, 1.4 + t], (n, w) => {
      const [px, py] = S.at(w);
      if (t > 0.4 && (Math.floor(px) + Math.floor(py)) % 2) return null;
      return dot(n, LIGHT) > 0.2 ? '#6a6e7c' : '#545866';
    }, (1 << 20) + i);
  }
  return done(S, 45, 86, [{ at: [0, 8, 10], r: 56, color: EMBER[2], a: 0.45 }]);
}

// =================================================================================================
// THE WALLS: AN ARROW SLIT, THE BATTLEMENTS, THE GREAT DOORS

/**
 * AN ARROW SLIT (on the wall): a cross-shaped loop for the crossbowmen, deep in the wall, its embrasure splayed and lit
 * down one side, a stone sill, a dressed surround; the night through it, pale where the moon catches its edge.
 */
function arrowSlit(S: Scene, w: (a: number, b: number, z: number) => V3): void {
  const Z0 = 22;
  const Z1 = 70;
  const HW = 10;
  // the surround of dressed stone, its blocks
  S.quad([w(-HW - 5, 0.4, Z0 - 5), w(HW + 5, 0.4, Z0 - 5), w(HW + 5, 0.4, Z1 + 5), w(-HW - 5, 0.4, Z1 + 5)], (u, v) => {
    const a = (u - 0.5) * (2 * HW + 10);
    const z = Z0 - 5 + v * (Z1 - Z0 + 10);
    const inSplay = Math.abs(a) < HW - (z - Z0 < 0 ? 99 : 0) && z > Z0 && z < Z1;
    if (inSplay) {
      // the splay narrowing in to the slit: lit on its left, dark on its right, the slit dark
      const narrow = 1.6 + (HW - 1.6) * (1 - Math.abs(z - (Z0 + Z1) / 2) / ((Z1 - Z0) / 2)) * 0.15;
      const cross = Math.abs(z - 52) < 1.8 && Math.abs(a) < 8;
      if (Math.abs(a) < narrow || cross) return Math.abs(a) < 0.8 && z > 54 ? NIGHT[2] : Math.abs(a) < 1.2 || cross ? NIGHT[1] : NIGHT[0];
      return a < 0 ? (Math.abs(a) > HW - 1.5 ? COLD[4] : COLD[3]) : Math.abs(a) > HW - 1.5 ? COLD[0] : COLD[1];
    }
    if (z <= Z0 && z > Z0 - 3 && Math.abs(a) < HW + 2) return z > Z0 - 1 ? COLD[4] : COLD[2];
    const blk = Math.floor((z - Z0 + 5) / 12.5) + (Math.abs(a) > HW ? 10 : 0);
    if (fr((z - Z0 + 5) / 12.5) < 0.08 || Math.abs(Math.abs(a) - HW - 0.5) < 0.6) return COLD[0];
    return hash(blk, a < 0 ? 0 : 1, 9151) < 0.3 ? COLD[2] : COLD[3];
  }, 1);
}

/**
 * BATTLEMENTS, a tile of them (laid along a wall walk's outer row, its parapet on the tile's far edge): a parapet of the
 * cold stone waist high, its coping lit, a merlon on it half the tile long, a crenel beside it; weathered, lichen in a
 * joint. Along x (`k` 0: the walk runs along x, the parapet at the tile's -y edge) or along y (1). 100 x 110 at (50, 70).
 */
function battlements(k: number): Sprite {
  const S = turned(scene(100, 110, 50, 70), k);
  const course = (z: number, a: number, seed: number): number => {
    const c = Math.floor(z / 10);
    const len = 14 + Math.floor(hash(c, 1, seed) * 3) * 4;
    const off = hash(c, 0, seed) * len;
    if (fr(z / 10) < 0.1 || fr((a + off) / len) < 1 / len) return -1;
    return hash(Math.floor((a + off) / len), c, seed + 2) < 0.25 ? -0.25 : 0;
  };
  const stone = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, id: number): void => {
    S.box([(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], AXES, [(x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2], (f, u, v, n) => {
      if (f === 4) return toneAt(n, COLD, v > 0.85 || u < 0.08 ? 0.3 : 0);
      const z = z0 + (f === 0 ? v : u) * (z1 - z0);
      const a = f === 0 ? y0 + u * (y1 - y0) : x0 + v * (x1 - x0);
      const c = course(z, a, 9161 + f);
      if (c < -0.5) return hash(Math.floor(a), Math.floor(z), 9163) < 0.3 ? '#3e4638' : COLD[0];
      return toneAt(n, COLD, c + (z > z1 - 1.5 ? 0.5 : 0));
    }, id);
  };
  // the parapet along the tile's far edge, its coping; one merlon on it
  stone(-20, 20, -20, -12, 0, 28, 1);
  S.box([0, -16, 29.5], AXES, [20.5, 5, 1.5], (f, _u, v, n) => (f === 4 && v > 0.8 ? COLD[4] : toneAt(n, COLD, 0.2)), 2);
  stone(-11, 11, -20, -12, 31, 48, 3);
  return done(S, 50, 70);
}

/**
 * THE KEEP'S GREAT DOORS (a door, on the wall): two leaves of oak in an arch of dressed voussoirs, each leaf banded with
 * iron and studded in rows, long strap hinges, a ring to pull; a wicket door in the right leaf; shut, or swung open on the
 * dark.
 */
function greatDoors(open: boolean): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    const HW = 22;
    const SPR = 48;
    const R = HW;
    const archZ = (a: number): number => SPR + Math.sqrt(Math.max(0, R * R - a * a));
    // the voussoirs round the arch, the jambs
    for (let i = 0; i <= 26; i++) {
      const t = (i / 26) * Math.PI;
      S.box(w(-Math.cos(t) * (R + 3.5), 1, SPR + Math.sin(t) * (R + 3.5)), [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((d) => {
        const p = w(d[0], d[1], d[2]);
        const o = w(0, 0, 0);
        return [p[0] - o[0], p[1] - o[1], p[2] - o[2]] as V3;
      }) as unknown as [V3, V3, V3], [2.4, 1, 3.6], (_f, _u, _v, n) => toneAt(n, COLD, i % 3 === 0 ? -0.2 : 0.15), 1);
    }
    for (const s of [-1, 1]) S.box(w(s * (R + 3.5), 1, SPR / 2), [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((d) => {
      const p = w(d[0], d[1], d[2]);
      const o = w(0, 0, 0);
      return [p[0] - o[0], p[1] - o[1], p[2] - o[2]] as V3;
    }) as unknown as [V3, V3, V3], [3.4, 1, SPR / 2], (_f, _u, v, n) => (fr(v * 4) < 0.06 ? COLD[0] : toneAt(n, COLD, 0.1)), 1);
    // the dark behind
    S.quad([w(-HW, 0.1, 0), w(HW, 0.1, 0), w(HW, 0.1, SPR + R), w(-HW, 0.1, SPR + R)], (u, v) => (v * (SPR + R) < archZ((u - 0.5) * 2 * HW) ? HOLE : null), 2);
    const leaf = (side: number, id: number): void => {
      const hinge = side * HW;
      const ang = open ? 1.3 : 0;
      const P = (a: number, z: number): V3 => w(hinge + (a - hinge) * Math.cos(ang), 0.6 + Math.abs(a - hinge) * Math.sin(ang), z);
      const a0 = side < 0 ? -HW : 0;
      const a1 = side < 0 ? 0 : HW;
      S.quad([P(a0, 0), P(a1, 0), P(a1, SPR + R), P(a0, SPR + R)], (u, v) => {
        const a = a0 + (a1 - a0) * u;
        const z = v * (SPR + R);
        if (z > archZ(a) - 0.5) return null;
        // planks upright, iron bands across with their strap hinges, studs in rows, the wicket's frame
        const plank = fr((a + HW) / 6.5) < 0.12;
        if (Math.abs(z - 12) < 1.4 || Math.abs(z - 40) < 1.4) return Math.abs(a - hinge) < 18 ? IRON[3] : IRON[2];
        if (fr((a + HW) / 6.5) > 0.4 && fr((a + HW) / 6.5) < 0.6 && fr(z / 7) < 0.2) return IRON[3];
        if (side > 0 && !open && a > 4 && a < 16 && z < 34 && (Math.abs(a - 4) < 0.8 || Math.abs(a - 16) < 0.8 || Math.abs(z - 34) < 0.8)) return OAK[0];
        if (plank) return OAK[0];
        return open ? OAK[2] : OAK[3];
      }, id);
      // its ring pull
      for (let i = 0; i < 10; i++) {
        const t = (i / 10) * Math.PI * 2;
        S.ball(P((side < 0 ? -3.5 : 3.5) + Math.cos(t) * 2.2, 26 + Math.sin(t) * 2.2), 0.6, IRON, id + 2);
      }
    };
    leaf(-1, 5);
    leaf(1, 8);
  }, 110, 120, undefined, 24);
}

// =================================================================================================
// THE HAZARDS: THE PORTCULLIS AND ITS WINCH, THE MURDER HOLE

/**
 * A PORTCULLIS, a tile of it (the trap: they "slam down to cut a hall in two"): under a lintel of the cold stone, its slot
 * dark, a grille of oak bars shod with iron, banded with iron across, an iron spike on each bar's foot; laid one on each
 * tile of a row across a hall, their lintels and grilles join into one. Frames: up (only its spikes under the lintel); the
 * warning (dropped a hand, shaking, grit and dust falling from the slot); falling (half way, smeared); slammed (its spikes
 * in the floor, dust bursting out either side, chips flying); down (still, the last dust settling). Along x (`k` 0: the
 * row runs along x) or along y (1). 130 x 150 at (65, 110).
 */
const PORT = [78, 66, 32, 0, 0];
function portcullis(f: number, k: number): Sprite {
  const S = turned(scene(130, 150, 65, 110), k);
  const LZ0 = 84;
  // the lintel: a beam of the cold stone the tile's length, its slot dark along its underside
  S.box([0, 0, LZ0 + 6], AXES, [20, 6, 6], (face, u, v, n) => {
    if (face === 5) return HOLE;
    if (face === 4) return toneAt(n, COLD, v > 0.8 || u < 0.05 ? 0.4 : 0.1);
    const a = face === 0 ? u : v;
    if (fr(a * 2) < 0.04) return COLD[0];
    return toneAt(n, COLD, (face === 2 ? u : v) > 0.85 ? 0.4 : 0);
  }, 1);
  S.box([0, 0, LZ0 - 0.4], AXES, [20, 2.2, 0.4], () => HOLE, 1);
  const bottom = PORT[f];
  const shake = f === 1 ? 0.8 : 0;
  const top = Math.min(LZ0, bottom + 140);
  // the bars: oak, shod with iron at their feet, a spike on each
  for (let i = 0; i < 4; i++) {
    const x = -15 + i * 10 + (i % 2 ? shake : -shake);
    if (bottom + 8 < LZ0) S.rod([x, 0, bottom + 8], [x, 0, top], 1.9, 1.9, OAK, 2);
    if (bottom + 2 < LZ0) S.rod([x, 0, bottom + 2], [x, 0, Math.min(LZ0, bottom + 10)], 2.1, 2.1, IRON, 3);
    S.rod([x, 0, bottom + 3], [x, 0, Math.max(bottom - 8, -1)], 2.2, 0.3, IRON, 3);
  }
  // the iron bands across
  for (const z of [bottom + 14, bottom + 36, bottom + 58]) if (z < LZ0 - 1) S.rod([-20, 0.4, z], [20, 0.4, z], 1.3, 1.3, IRON, 4);
  // FALLING: smeared, its bars' streaks above them in the slot's dark
  if (f === 2) {
    for (let i = 0; i < 4; i++) {
      const x = -15 + i * 10;
      for (let z = bottom + 14; z < LZ0; z += 3) S.rod([x, 0.6, z], [x, 0.6, z + 1.6], 1.2, 1.2, i % 2 ? OAK : IRON, 5);
    }
  }
  // grit and dust falling from the slot (the warning, falling); bursting out at its foot (slammed), settling (down)
  if (f === 1 || f === 2) {
    for (let i = 0; i < 10; i++) {
      const x = (hash(i, f, 9171) - 0.5) * 38;
      const z = LZ0 - 6 - hash(i, f + 3, 9171) * (f === 1 ? 30 : 60);
      S.ball([x, (hash(i, 5, 9171) - 0.5) * 6, z], 0.9, ['#2a2e3a', '#3a3e4a', '#545a68', '#6e7484', '#6e7484'], (1 << 20) + 10 + i);
    }
  }
  if (f === 3 || f === 4) {
    const n = f === 3 ? 16 : 7;
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1;
      const a = (hash(i, f, 9173) - 0.5) * 44;
      const out = (f === 3 ? 6 : 10) + hash(i, f + 1, 9173) * (f === 3 ? 18 : 8);
      const r = f === 3 ? 4 + hash(i, f + 2, 9173) * 4 : 3 + hash(i, f + 2, 9173) * 2;
      S.egg([a, side * out, r * 0.8], AXES, [r, r, r * 0.8], (nn, w) => {
        const [px, py] = S.at(w);
        if ((Math.floor(px) + Math.floor(py)) % 2 && (f === 4 || out > 10 || hash(Math.floor(px), Math.floor(py), 9174) < 0.5)) return null;
        const l = dot(nn, LIGHT);
        return l > 0.3 ? DUST[1] : l > -0.2 ? DUST[0] : '#2a2e38';
      }, (1 << 20) + 30 + i);
    }
    if (f === 3) for (let i = 0; i < 6; i++) S.ball([(hash(i, 1, 9175) - 0.5) * 50, (hash(i, 2, 9175) - 0.5) * 30, 10 + hash(i, 3, 9175) * 14], 1.1, COLD, 40 + i);
  }
  return done(S, 65, 110);
}

/**
 * THE PORTCULLIS'S WINCH: a windlass on two A-frames of oak, its drum wound with chain, the chain running up off it into
 * the dark; a ratchet wheel of iron and its pawl; capstan bars through the drum's end. Facing +y. 120 x 110 at (60, 80).
 */
function winch(): Sprite {
  const S = scene(120, 124, 60, 94);
  for (const s of [-1, 1]) {
    const x = s * 22;
    S.rod([x, -10, 0], [x, 0, 30], 2.2, 2, OAK, 1);
    S.rod([x, 10, 0], [x, 0, 30], 2.2, 2, OAK, 1);
    S.rod([x, -10, 6], [x, 10, 6], 1.6, 1.6, OAK, 1);
  }
  // the drum along x, its chain wound round it
  for (let i = 0; i <= 18; i++) {
    const x = -18 + i * 2;
    S.egg([x, 0, 30], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.4, 7, 7], (n) => toneAt(n, OAK, -0.1), 2);
    for (let j = 0; j < 6; j++) {
      const t = (j / 6) * Math.PI * 2 + i * 0.5;
      S.egg([x, Math.cos(t) * 7.6, 30 + Math.sin(t) * 7.6], AXES, [1, 1.1, 1.1], tone(IRON, 0.1), 3);
    }
  }
  // the chain up into the dark
  for (let z = 37; z < 82; z += 2.4) S.egg([-4 + ((z / 2.4) % 2) * 0.6, 0, z], AXES, [0.9, 0.9, 1.4], tone(IRON, 0.1), 4);
  // the ratchet wheel, its pawl; the capstan bars
  for (let i = 0; i < 16; i++) {
    const t = (i / 16) * Math.PI * 2;
    S.egg([20, Math.cos(t) * 10, 30 + Math.sin(t) * 10], AXES, [1.4, 1.6, 1.6], tone(IRON, i % 2 ? 0.2 : -0.1), 5);
  }
  S.egg([20, 0, 30], AXES, [1.2, 6, 6], tone(IRON), 5);
  S.rod([24, 8, 46], [21, 4, 38], 1, 0.8, IRON, 6);
  for (const t of [0.3, 1.9, 3.5, 5.1]) S.rod([-26, 0, 30], [-26, Math.cos(t) * 16, 30 + Math.sin(t) * 16], 1.3, 1.1, OAK, 7);
  return done(S, 60, 94);
}

/**
 * A MURDER HOLE (the trap: it "drops pitch"), as the floor of a passage under it shows it: old pitch splashed black on the
 * flags, scorched. Frames: still; the warning (a dribble of pitch falling from the dark above, a drop splashing, a wisp of
 * smoke); pouring (a heavy black stream from above, a crown thrown up where it lands, smoke); its pool (the pitch spread a
 * tile and more, black, its sheen cold, bubbles, smoking). Laid on a floor tile, anchored at its middle. 150 x 190 at (75, 160).
 */
function murderHole(f: number): Sprite {
  const S = scene(150, 190, 75, 160);
  const TOPZ = 140;
  const pool = f === 3 ? 38 : f === 2 ? 20 : 0;
  // the stains of old pitch, splashed and run; or the pool
  S.egg([0, 0, 0.3], [[0.9, 0.44, 0], [-0.44, 0.9, 0], [0, 0, 1]], [Math.max(26, pool), Math.max(19, pool * 0.75), 0.3], (_n, w) => {
    const d = Math.hypot(w[0] / Math.max(26, pool), w[1] / Math.max(19, pool * 0.75));
    const rag = 0.25 * Math.sin(Math.atan2(w[1], w[0]) * 5 + 1) + 0.1 * Math.sin(Math.atan2(w[1], w[0]) * 13);
    if (d > 0.82 + rag * 0.4) return null;
    if (pool) {
      // the pool: black, its sheen cold in long streaks, rings where it pours, bubbles
      if (f >= 2 && Math.abs(fr(Math.hypot(w[0], w[1] * 1.3) / 6) - 0.5) < 0.08 && Math.hypot(w[0], w[1]) < pool * 0.7) return PITCH[4];
      if (f === 3 && hash(Math.floor(w[0] / 3), Math.floor(w[1] / 3), 9181) < 0.05) return PITCH[3];
      return fr((w[0] - w[1]) * 0.09) < 0.07 ? PITCH[3] : PITCH[1];
    }
    // old pitch: black blotches with the flags between, scorched brown at their edges
    const b = hash(Math.floor(w[0] / 4), Math.floor(w[1] / 4), 9183);
    if (d > 0.6 + rag * 0.4) return b < 0.4 ? '#2a221e' : null;
    return b < 0.25 ? PITCH[2] : PITCH[1];
  }, 1);
  if (f >= 1) {
    // the pitch falling from the dark above: a dribble of drops, or a heavy stream
    if (f === 1) {
      for (const [z, r] of [[TOPZ - 2, 1.1], [TOPZ - 20, 1.3], [TOPZ - 46, 1.4], [TOPZ - 80, 1.3], [24, 1.6]] as const) S.egg([0, 0, z], AXES, [r, r, r * 2], tone(PITCH, -0.1), 2);
      S.egg([2, 1, 1], AXES, [4, 3, 1], tone(PITCH, 0.2), 2);
    } else {
      // (the stream: black, wavering, a cold sheen down its lit side)
      const r0 = f === 2 ? 3.4 : 1.5;
      // (out of the dark above: drops first, then the stream)
      for (const [z, r] of [[TOPZ + 12, 1.1], [TOPZ + 5, 1.5]] as const) S.egg([0, 0, z], AXES, [r, r, r * 2], tone(PITCH, -0.1), 2);
      for (let z = TOPZ - 6; z > 2; z -= 4) {
        const wob = Math.sin(z * 0.21) * (f === 2 ? 0.8 : 0.4);
        S.rod([wob, 0, z], [Math.sin((z - 4) * 0.21) * (f === 2 ? 0.8 : 0.4), 0, Math.max(1, z - 4)], r0 + (z < 30 ? 0.6 : 0), r0 + (z < 30 ? 0.6 : 0), PITCH, 2);
      }
      if (f === 2) {
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          S.rod([Math.cos(a) * 3, Math.sin(a) * 3, 1], [Math.cos(a) * 9, Math.sin(a) * 8, 6 + 6 * hash(i, 1, 9185)], 1.4, 0.6, PITCH, 3);
          S.ball([Math.cos(a) * 12, Math.sin(a) * 11, 8 + 6 * hash(i, 2, 9185)], 0.9, PITCH, 3);
        }
      }
    }
    // the smoke off it, curling up, thinning
    const n = f === 1 ? 5 : f === 2 ? 12 : 16;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const sx = (hash(i, 1, 9187) - 0.5) * (f === 3 ? 36 : 14) + 4 * Math.sin(t * 6);
      const sy = (hash(i, 2, 9187) - 0.5) * (f === 3 ? 26 : 10);
      S.egg([sx, sy, 4 + t * (f === 3 ? 40 : 30)], AXES, [2 + t * 3, 2 + t * 3, 1.6 + t * 2], (nn, w) => {
        const [px, py] = S.at(w);
        if (t > 0.35 && (Math.floor(px) + Math.floor(py)) % 2) return null;
        return dot(nn, LIGHT) > 0.2 ? SMOKE[2] : dot(nn, LIGHT) > -0.2 ? SMOKE[1] : SMOKE[0];
      }, (1 << 20) + 50 + i);
    }
  }
  return done(S, 75, 160);
}

// =================================================================================================
// THE ARMOURY AND THE BARRACKS

/** A SUIT OF ARMOUR ON ITS STAND (the king's knights' kind, standing empty): plate, dark and polished, the plates' seams dark; a great helm, its sights and breaths; on a plinth of oak. Or knocked down: the stand toppled, the plates strewn, the helm rolled away. 70 x 100 at (35, 84). */
function armour(broken: boolean): Sprite {
  const S = scene(70, 100, 35, 84);
  const st = (bias: number) => tone(STEEL, bias - 0.32);
  if (broken) {
    S.box([0, 0, 2.5], AXES, [10, 10, 2.5], (_f, _u, _v, n) => toneAt(n, OAK, 0), 1);
    S.rod([-4, -6, 5], [-26, 8, 2], 1.2, 1.2, OAK, 2);
    S.egg([-14, 6, 5], AXES, [8, 6, 4.4], st(0), 3);
    for (const [x, y] of [[6, 10], [12, 2], [-8, 16]] as const) S.egg([x, y, 2.4], AXES, [3.2, 6, 2.4], st(-0.1), 4);
    for (const [x, y] of [[-20, -4], [16, -8]] as const) S.egg([x, y, 3], AXES, [4.6, 4.6, 3], st(0.05), 5);
    // the helm rolled away, on its side
    S.egg([20, 14, 5], [[0, 0, 1], [0, 1, 0], [1, 0, 0]], [4.6, 4.8, 5.6], (n, w) => (Math.abs(w[0] - 20 - 1) < 0.8 && n[1] > 0.3 ? HOLE : toneAt(n, STEEL, -0.1)), 6);
    return done(S, 35, 84);
  }
  S.box([0, 0, 2.5], AXES, [10, 10, 2.5], (f, _u, v, n) => toneAt(n, OAK, f === 4 && v > 0.9 ? 0.4 : 0), 1);
  S.rod([-2, -4, 5], [-2, -4, 50], 1.2, 1.2, OAK, 2);
  for (const s of [-1, 1]) {
    const hx = s * 3.2;
    S.egg([hx, 3.4, 6.6], AXES, [2.6, 5.2, 1.8], st(-0.1), 3);
    S.egg([hx, 0, 13], AXES, [2.4, 2.6, 7.4], st(-0.1), 3);
    S.egg([hx, 0.8, 20.5], AXES, [2.9, 2.9, 2.4], st(0.1), 4);
    S.egg([hx + s * 2.6, 0.6, 20.5], [[0, 1, 0], [1, 0, 0], [0, 0, 1]], [2.2, 0.8, 2], st(0.2), 4);
    S.egg([hx * 0.95, 0, 27.5], AXES, [3.1, 3.2, 6], st(0), 3);
  }
  for (const [k, z] of [33, 35.6, 38.2].entries()) S.egg([0, 0, z], AXES, [7.4 - k * 0.5, 6 - k * 0.4, 2], (n, w) => toneAt(n, STEEL, (w[2] < z - 1.2 ? -0.6 : 0) - 0.3), 5 + k);
  S.egg([0, 0.3, 46], AXES, [7.4, 5.6, 9], (n, w) => {
    const ridge = Math.abs(w[0]) < 0.9 && n[1] > 0.3;
    const plack = w[2] < 42 && w[2] > 40.8;
    return toneAt(n, STEEL, (ridge ? 0.6 : 0) + (plack ? -0.7 : 0) - 0.3);
  }, 8);
  S.egg([0, -0.4, 55], AXES, [4.4, 4, 2.2], st(0.05), 9);
  for (const s of [-1, 1]) {
    S.egg([s * 7.6, -0.4, 52.4], AXES, [4.8, 4.8, 3.4], st(0.1), 10);
    S.egg([s * 8.2, -0.2, 49.2], AXES, [4.2, 4.4, 2.4], (n, w) => toneAt(n, STEEL, (w[2] > 50.6 ? -0.6 : 0) - 0.1), 11);
    S.rod([s * 8.6, 0, 47], [s * 9, 0.4, 39], 2.2, 2.1, STEEL, 12);
    S.egg([s * 9, 1, 38.4], AXES, [2.6, 2.6, 2.2], st(0.1), 12);
    S.rod([s * 9, 0.6, 37], [s * 8.6, 2, 29.5], 2.1, 1.9, STEEL, 12);
    S.egg([s * 8.6, 2.4, 27.6], AXES, [2.2, 2.4, 2.8], st(0), 13);
  }
  for (let k = 0; k < 9; k++) {
    const z = 58 + k * 1.4;
    S.egg([0, 0, z], AXES, [4.6 - (k > 7 ? 0.6 : 0), 4.8 - (k > 7 ? 0.6 : 0), 0.9], (n, w) => {
      const front = n[1] > 0.45;
      if (front && k === 5) return HOLE;
      if (front && Math.abs(w[0]) < 0.8 && k < 5) return STEEL[4];
      if (n[0] > 0.2 && n[1] > 0.2 && k < 4 && k > 1 && fr(w[1] / 1.6) < 0.45) return HOLE;
      return toneAt([n[0], n[1], 0], STEEL, (k > 7 ? 0.5 : 0.05) + (k === 4 || k === 6 ? 0.3 : 0));
    }, 14);
  }
  S.egg([0, 0, 70.4], AXES, [3.8, 4, 0.7], st(0.4), 14);
  S.rod([0, 0, 70], [0, 0, 76], 1.6, 0.5, GOLD, 15);
  return done(S, 35, 84);
}

/** A sword, upright, point down, along `d` from its pommel at `p` (a blade of steel, a cross guard, a grip, a pommel). */
function sword(S: Scene, p: V3, d: V3, len: number, id: number): void {
  const at = (t: number): V3 => [p[0] + d[0] * t, p[1] + d[1] * t, p[2] + d[2] * t];
  S.ball(p, 1.4, GOLD, id);
  S.rod(at(1), at(6), 0.9, 0.9, OAK, id);
  const g = at(6.5);
  S.rod([g[0] - 4.5, g[1], g[2]], [g[0] + 4.5, g[1], g[2]], 0.9, 0.9, STEEL, id + 1);
  S.rod(at(7), at(len), 1.4, 0.3, STEEL, id + 2);
}
/** A WEAPON RACK: two uprights of oak, a rail with holes; spears and halberds stood in it, leaning; two swords hung point down. Along x (`k` 0) or along y (1). 110 x 124 at (55, 96). */
function weaponRack(k: number): Sprite {
  const S = turned(scene(110, 124, 55, 96), k);
  for (const x of [-18, 18]) S.rod([x, -4, 0], [x, -4, 44], 1.8, 1.6, OAK, 1);
  S.box([0, -4, 2], AXES, [20, 4, 2], (_f, _u, _v, n) => toneAt(n, OAK, 0), 1);
  S.box([0, -4, 30], AXES, [20, 3, 1.6], (_f, _u, _v, n) => toneAt(n, OAK, 0.1), 1);
  S.box([0, -4, 44], AXES, [21, 2, 1.4], (_f, _u, _v, n) => toneAt(n, OAK, 0.2), 1);
  // the long weapons stood in it, leaning back against the top rail
  const longs: [number, string][] = [[-13, 'spear'], [-6, 'halberd'], [1, 'spear'], [8, 'halberd'], [14, 'spear']];
  for (const [x, kind] of longs) {
    const foot: V3 = [x, -1, 3];
    const head: V3 = [x + 1, -6, 70];
    S.rod(foot, head, 1, 1, OAK, 2);
    if (kind === 'spear') S.rod(head, [x + 1.1, -6.3, 80], 1.6, 0.2, STEEL, 3);
    else {
      // a halberd: an axe blade and a back spike, a point
      S.quad([[x + 1, -6, 62], [x + 1, -6, 72], [x + 7, -6.4, 74], [x + 8, -6.4, 60]], (_u, v) => (v > 0.85 ? STEEL[4] : STEEL[2]), 3);
      S.rod([x + 1, -6, 68], [x - 4, -6, 70], 0.8, 0.2, STEEL, 3);
      S.rod(head, [x + 1.1, -6.3, 80], 1.4, 0.2, STEEL, 3);
    }
  }
  // two swords hung point down from the middle rail
  sword(S, [-9, 0, 44], [0, 0.02, -1], 30, 4);
  sword(S, [9, 0, 44], [0, 0.02, -1], 30, 7);
  return done(S, 55, 96);
}
/** A CROSSBOW RACK: a frame of oak, crossbows hung by their stirrups, stocks down; a barrel of quarrels by it, their fletchings grey. Along x (`k` 0) or along y (1). 110 x 110 at (55, 80). */
function crossbowRack(k: number): Sprite {
  const S = turned(scene(110, 110, 55, 80), k);
  for (const x of [-20, 12]) S.rod([x, -4, 0], [x, -4, 46], 1.7, 1.5, OAK, 1);
  S.box([-4, -4, 44], AXES, [17, 2, 1.6], (_f, _u, _v, n) => toneAt(n, OAK, 0.1), 1);
  S.box([-4, -4, 4], AXES, [17, 3, 1.4], (_f, _u, _v, n) => toneAt(n, OAK, 0), 1);
  for (const x of [-14, -4, 6]) {
    // hung by its stirrup from a peg: the stirrup, the bow (a steel lath across), the stock down
    S.rod([x, -2, 44], [x, -1, 40], 0.6, 0.6, IRON, 2);
    S.rod([x - 8, -1, 37], [x + 8, -1, 37], 1, 1, STEEL, 3);
    S.rod([x - 8, -1, 37], [x, -0.6, 35], 0.3, 0.3, ['#4a4434', '#6a6048', '#8a7e62', '#a69a7a', '#bfb392'], 3);
    S.rod([x + 8, -1, 37], [x, -0.6, 35], 0.3, 0.3, ['#4a4434', '#6a6048', '#8a7e62', '#a69a7a', '#bfb392'], 3);
    S.rod([x, -0.4, 38], [x, 0.4, 12], 1.5, 1.8, OAK, 4);
  }
  // the barrel of quarrels
  cylinder(S, 22, 6, (z) => 6.5 + Math.sin((z / 20) * Math.PI) * 1.2, 0, 20, (n, a, z) => {
    if (Math.abs(z - 3) < 1 || Math.abs(z - 17) < 1) return toneAt(n, IRON, 0.1);
    return toneAt(n, OAK, fr(a * 3) < 0.1 ? -0.5 : 0);
  }, 5, (_a, rr) => (rr > 0.85 ? OAK[3] : HOLE));
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4;
    const r = 3.5 * Math.sqrt(hash(i, 1, 9191));
    const bx = 22 + Math.cos(a) * r;
    const by = 6 + Math.sin(a) * r;
    S.rod([bx, by, 18], [bx + Math.cos(a) * 1.5, by + Math.sin(a) * 1.5, 30], 0.5, 0.5, OAK, 6);
    S.egg([bx + Math.cos(a) * 1.6, by + Math.sin(a) * 1.6, 29], AXES, [1, 1, 2], tone(['#3a3c44', '#4e5058', '#62656e', '#787b84', '#8e919a']), 7);
  }
  return done(S, 55, 80);
}
/** AN ARMOURER'S ANVIL: a horned anvil on an oak stump banded with iron; a hammer laid on it, tongs leaning; a dented helm on the floor waiting; a quenching bucket. 100 x 80 at (50, 56). */
function anvil(): Sprite {
  const S = scene(100, 80, 50, 56);
  cylinder(S, 0, 0, 9, 0, 16, (n, a, z) => (Math.abs(z - 3) < 0.8 || Math.abs(z - 13) < 0.8 ? toneAt(n, IRON, 0) : toneAt(n, OAK, fr(a * 5) < 0.12 ? -0.4 : 0)), 1, (_a, rr) => (fr(rr * 4) < 0.15 ? OAK[2] : OAK[3]));
  // the anvil: its waist, its face, its horn to the left, its heel
  S.box([0, 0, 19], AXES, [5, 4, 3], (_f, _u, _v, n) => toneAt(n, IRON, 0), 2);
  S.box([0, 0, 24.5], AXES, [9, 5, 2.5], (f, _u, _v, n) => (f === 4 ? IRON[4] : toneAt(n, IRON, 0.1)), 2);
  S.rod([-9, 0, 25], [-17, 0, 24], 3.6, 0.6, IRON, 3);
  S.box([10, 0, 24.5], AXES, [2, 3, 1.6], (_f, _u, _v, n) => toneAt(n, IRON, 0.1), 2);
  // the hammer on it, the tongs leaning on the stump
  S.rod([-2, 2, 27.6], [10, 8, 27.6], 0.9, 0.9, OAK, 4);
  S.box([-3, 1.5, 28.4], [[0.85, 0.5, 0], [-0.5, 0.85, 0], [0, 0, 1]], [3, 1.6, 1.6], (_f, _u, _v, n) => toneAt(n, IRON, 0.2), 4);
  S.rod([10, 8, 0], [7, 6, 22], 0.6, 0.6, IRON, 5);
  S.rod([11, 9, 0], [7.6, 6.6, 22], 0.6, 0.6, IRON, 5);
  // a dented helm on the floor; the quenching bucket
  S.egg([-16, 12, 4], AXES, [4.6, 4.8, 5], (n, w) => (Math.abs(w[2] - 5) < 0.8 && n[1] > 0.4 ? HOLE : toneAt(n, STEEL, w[0] < -18 && w[2] > 6 ? -0.5 : -0.1)), 6);
  cylinder(S, 18, -12, (z) => 5 + z * 0.08, 0, 10, (n, _a, z) => (Math.abs(z - 2) < 0.7 || Math.abs(z - 8) < 0.7 ? toneAt(n, IRON, 0) : toneAt(n, OAK, 0)), 7, (_a, rr) => (rr > 0.85 ? OAK[3] : PITCH[2]));
  return done(S, 50, 56);
}
/** BARRACKS BUNKS: a two-tier bunk of oak, two tiles long; straw pallets, grey wool blankets, one thrown back, a helmet hung on a post. Along x (`k` 0) or along y (1). 160 x 140 at (80, 96). */
function bunks(k: number): Sprite {
  const S = turned(scene(160, 140, 80, 96), k);
  const L = 38;
  const D = 12;
  for (const x of [-L, L]) for (const y of [-D, D]) S.rod([x, y, 0], [x, y, 58], 1.8, 1.8, OAK, 1);
  for (const z of [12, 40]) {
    // the frame, the pallet of straw, the blanket
    for (const y of [-D, D]) S.rod([-L, y, z], [L, y, z], 1.4, 1.4, OAK, 2);
    for (const x of [-L, L]) S.rod([x, -D, z], [x, D, z], 1.4, 1.4, OAK, 2);
    S.box([0, 0, z + 2], AXES, [L - 1, D - 1, 2], (f, u, v, n) => (f === 4 ? (fr(u * 14) < 0.2 ? STRAW[2] : STRAW[3]) : toneAt(n, STRAW, -0.2)), 3);
    const thrown = z === 12;
    S.box([thrown ? -12 : 4, 0, z + 5], AXES, [thrown ? L - 26 : L - 6, D - 0.5, 1.5], (f, u, v, n) => {
      if (f === 4 && fr(u * 6) < 0.08) return WOOL[1];
      if (f === 4 && v > 0.9) return WOOL[3];
      return toneAt(n, WOOL, f === 4 ? 0.1 : 0);
    }, 4);
    if (thrown) S.egg([10, 0, z + 6], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [8, D - 1, 3], (n, w) => toneAt(n, WOOL, fr(w[0] * 0.3) < 0.2 ? -0.4 : 0.1), 4);
    S.egg([-L + 7, 0, z + 7], AXES, [5, 8, 2.4], tone(LINEN, -0.1), 5);
  }
  // a helmet hung on a post
  S.egg([L + 1, D + 1, 52], AXES, [4, 4, 3.6], (n, w) => (w[2] < 50 && n[1] > 0.5 ? HOLE : toneAt(n, STEEL, -0.1)), 6, (w) => w[2] > 48.6);
  S.egg([L + 1, D + 1, 49], AXES, [5.4, 5.4, 0.8], tone(STEEL, 0.1), 6);
  return done(S, 80, 96);
}
/** BARRELS: two barrels of the keep's stores and a little one, hooped with iron; or smashed: staves burst and splayed, hoops rolled loose, ale spilled dark. 90 x 80 at (45, 60). */
function barrels(broken: boolean): Sprite {
  const S = scene(90, 80, 45, 60);
  const barrel = (cx: number, cy: number, r: number, h: number, id: number): void => {
    cylinder(S, cx, cy, (z) => r + Math.sin((z / h) * Math.PI) * r * 0.16, 0, h, (n, a, z) => {
      if (Math.abs(z - h * 0.16) < 1 || Math.abs(z - h * 0.84) < 1) return toneAt(n, IRON, 0.1);
      return toneAt(n, OAK, fr(a * 3.2) < 0.1 ? -0.5 : 0);
    }, id, (_a, rr) => (rr > 0.86 ? OAK[4] : fr(rr * 3) < 0.12 ? OAK[1] : OAK[3]));
  };
  if (!broken) {
    barrel(-8, -4, 10, 26, 1);
    barrel(10, 4, 10, 26, 2);
    barrel(-6, 16, 6.5, 15, 3);
    return done(S, 45, 60);
  }
  barrel(-8, -4, 10, 26, 1);
  // the other burst: its staves splayed on the floor, its hoops loose, the ale spilled
  S.egg([10, 6, 0.3], AXES, [20, 14, 0.3], (_n, w) => (hash(Math.floor(w[0] / 3), Math.floor(w[1] / 3), 9201) < 0.15 ? '#3a2c24' : '#241a16'), 4);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    S.rod([10 + Math.cos(a) * 4, 6 + Math.sin(a) * 4, 1.2], [10 + Math.cos(a) * 17, 6 + Math.sin(a) * 13, 1 + (i % 3)], 1.5, 1.3, OAK, 5);
  }
  for (const [x, y] of [[0, 18], [22, -6]] as const) {
    for (let j = 0; j < 14; j++) {
      const t = (j / 14) * Math.PI * 2;
      S.ball([x + Math.cos(t) * 8, y + Math.sin(t) * 3, 1 + Math.sin(t) * 0.5 + 0.6], 0.8, IRON, 6);
    }
  }
  return done(S, 45, 60);
}

// =================================================================================================
// THE HALLS: THE LONG TABLE, THE WAR TABLE, THE WELL

/** A LONG TABLE of oak on trestles, two tiles and a half long, a bench either side; pewter plates and tankards left, a candlestick out, crumbs. Along x (`k` 0) or along y (1). 200 x 120 at (100, 70). */
function longTable(k: number): Sprite {
  const S = turned(scene(200, 120, 100, 70), k);
  const L = 48;
  const PEW: Ramp = ['#2c2e36', '#454852', '#62656f', '#82858e', '#a4a7ae'];
  for (const x of [-L + 8, L - 8]) {
    S.rod([x, -10, 0], [x, 0, 20], 1.4, 1.4, OAK, 1);
    S.rod([x, 10, 0], [x, 0, 20], 1.4, 1.4, OAK, 1);
  }
  S.rod([-L + 8, 0, 8], [L - 8, 0, 8], 1.1, 1.1, OAK, 1);
  S.box([0, 0, 21.5], AXES, [L, 12, 1.5], (f, u, v, n) => (f === 4 ? (fr(v * 4) < 0.05 ? OAK[1] : toneAt(n, OAK, 0.05)) : toneAt(n, OAK, -0.1)), 2);
  for (const y of [-20, 20]) {
    S.box([0, y, 12], AXES, [L - 4, 4, 1.2], (f, _u, _v, n) => toneAt(n, OAK, f === 4 ? 0.1 : -0.1), 3);
    for (const x of [-L + 8, L - 8]) S.rod([x, y, 0], [x, y, 11], 1.2, 1.2, OAK, 3);
  }
  // pewter: plates, tankards, one knocked over; a candlestick, its candle burnt out
  for (const [x, y] of [[-34, -6], [-14, 7], [8, -6], [28, 6]] as const) S.egg([x, y, 23.4], AXES, [4.6, 4.6, 0.5], (n, w) => (Math.hypot(w[0] - x, w[1] - y) > 3.6 ? PEW[4] : toneAt(n, PEW, -0.2)), 4);
  for (const [x, y] of [[-26, 4], [16, -4]] as const) cylinder(S, x, y, 2, 23, 29, (n) => toneAt(n, PEW, 0), 5, (_a, rr) => (rr > 0.7 ? PEW[3] : PEW[1]));
  S.rod([0, 5, 24.6], [6, 9, 24.6], 2, 2, PEW, 5);
  cylinder(S, -2, 0, 2.4, 23, 25, (n) => toneAt(n, PEW, 0.1), 6);
  S.rod([-2, 0, 25], [-2, 0, 33], 0.8, 0.8, PEW, 6);
  S.rod([-2, 0, 33], [-2, 0, 36], 1.2, 1.2, ['#4a4840', '#6a675c', '#8a877a', '#a9a698', '#c6c3b4'], 6);
  return done(S, 100, 70);
}
/** THE WAR TABLE, ITS MAP: a heavy table of oak, the map of the realm on it (parchment, the river, the hills, the High City and the keep marked), carved markers on it, a dagger driven through it, a candle stub. 130 x 100 at (65, 66). */
function warTable(): Sprite {
  const S = scene(130, 100, 65, 66);
  for (const [x, y] of [[-24, -16], [24, -16], [-24, 16], [24, 16]] as const) S.rod([x, y, 0], [x, y, 21], 2.4, 2.2, OAK, 1);
  S.box([0, 0, 22.5], AXES, [28, 20, 2.5], (f, _u, _v, n) => toneAt(n, OAK, f === 4 ? 0.2 : -0.1), 2);
  S.quad([[-24, -16, 25.2], [24, -16, 25.2], [24, 16, 25.2], [-24, 16, 25.2]], (u, v) => {
    const x = (u - 0.5) * 48;
    const y = (v - 0.5) * 32;
    const e = Math.min(24 - Math.abs(x), 16 - Math.abs(y));
    if (e < 1.2) return PARCH[1];
    // the river winding across, hills, the city and the keep at the hill's crown, a border
    const river = Math.abs(y - 6 * Math.sin(x * 0.18) - 2) < 1.2;
    if (river) return '#4a5468';
    if (e < 2.4 && fr((x + y) * 0.25) < 0.5) return PARCH[2];
    const hill = fr((x * 0.3 + y * 0.6) / 3) < 0.2 && Math.hypot(x + 10, y + 7) < 9;
    if (hill) return PARCH[1];
    if (Math.hypot(x - 6, y + 5) < 4.6) return Math.hypot(x - 6, y + 5) < 2.4 ? '#5a4c3e' : PARCH[2];
    return hash(Math.floor(x), Math.floor(y), 9211) < 0.1 ? PARCH[2] : PARCH[3];
  }, 3);
  // the markers: small carved pieces, a crowned one
  for (const [x, y, c] of [[6, -5, 1], [-12, 8, 0], [-16, 4, 0], [14, 9, 0]] as const) {
    cylinder(S, x, y, 1.6, 25.2, 29, (n) => toneAt(n, c ? GOLD : OAK, 0.1), 4);
    S.ball([x, y, 30], 1.6, c ? GOLD : OAK, 4);
  }
  // the dagger, driven through the map
  S.rod([-6, 2, 25], [-6, 2, 33], 0.8, 0.2, STEEL, 5);
  S.rod([-8.5, 2, 33], [-3.5, 2, 33], 0.7, 0.7, STEEL, 5);
  S.rod([-6, 2, 33], [-6, 2, 38], 0.8, 0.8, OAK, 5);
  S.ball([-6, 2, 38.6], 1, GOLD, 5);
  cylinder(S, 18, -10, 1.6, 25.2, 29, (n) => toneAt(n, ['#4a4840', '#6a675c', '#8a877a', '#a9a698', '#c6c3b4'], 0), 6, () => '#3a3830');
  return done(S, 65, 66);
}
/** THE CASTLE WELL: a well-head of the cold stone, round, its coping lit; two posts and a crossbeam over it with a windlass, the rope down into the dark, a bucket on its lip. 100 x 120 at (50, 90). */
function well(): Sprite {
  const S = scene(100, 120, 50, 90);
  cylinder(S, 0, 0, 18, 0, 20, (n, a, z) => {
    const course = Math.floor(z / 7);
    const j = fr(z / 7) < 0.14 || fr((a * 18) / 9 + course * 0.5) < 0.08;
    return j ? COLD[0] : toneAt(n, COLD, hash(Math.floor((a * 18) / 9 + course * 0.5), course, 9221) < 0.25 ? -0.3 : 0);
  }, 1, (_a, rr) => (rr > 0.78 ? (rr > 0.92 ? COLD[4] : COLD[3]) : rr > 0.7 ? COLD[1] : HOLE));
  for (const s of [-1, 1]) S.rod([s * 15, 0, 18], [s * 15, 0, 58], 2, 1.8, OAK, 2);
  S.rod([-19, 0, 57], [19, 0, 57], 2, 2, OAK, 3);
  // the windlass: a drum on the posts, rope wound, its crank
  for (let i = 0; i <= 12; i++) S.egg([-11 + i * 1.8, 0, 46], AXES, [1.2, 4.4, 4.4], (n) => toneAt(n, OAK, -0.1), 4);
  for (let i = 0; i <= 12; i += 2) S.egg([-11 + i * 1.8, 0, 46], AXES, [0.8, 4.8, 4.8], tone(['#4a3e32', '#62533f', '#7e6c52', '#9a8766', '#b4a07c'], 0.1), 5);
  S.rod([16, 0, 46], [22, 0, 46], 1, 1, IRON, 6);
  S.rod([22, 0, 46], [22, 6, 40], 1, 1, IRON, 6);
  S.rod([0, 0, 42], [0, 0, 16], 0.6, 0.6, ['#4a3e32', '#62533f', '#7e6c52', '#9a8766', '#b4a07c'], 7);
  // a bucket on the lip
  cylinder(S, 10, 12, (z) => 4.6 + z * 0.06, 20, 28, (n, _a, z) => (Math.abs(z - 22) < 0.7 || Math.abs(z - 26.6) < 0.7 ? toneAt(n, IRON, 0) : toneAt(n, OAK, 0)), 8, (_a, rr) => (rr > 0.82 ? OAK[3] : '#1c1e28'));
  return done(S, 50, 90);
}

// =================================================================================================
// THE KING'S BEDCHAMBER (from the book): THE GREAT BED, THE SONGBIRD'S CUSHION, THE SONGBIRD

/** A face in a fold of the curtains (the book: "strange heads ... some very ugly, and others lovely and gentle-looking"): pale grey, its eyes and mouth dark; `kind` 0 gentle, 1 ugly. A picture pixel (fu, fv) from its middle: its colour, or null. */
function faceAt(fu: number, fv: number, kind: number): string | null {
  // (an oval, a little longer than wide)
  const e = (fu / 3.4) ** 2 + (fv / 4.4) ** 2;
  if (e > 1) return null;
  const eye = Math.abs(Math.abs(fu) - 1.4) < 0.7 && Math.abs(fv - (kind ? 1.4 : 1)) < (kind ? 0.9 : 0.5);
  if (eye) return '#14161e';
  const mouth = kind ? Math.abs(fv + 2) < 0.7 && Math.abs(fu) < 1.8 : Math.abs(fv + 2.1 + Math.abs(fu) * 0.25) < 0.5 && Math.abs(fu) < 1.3;
  if (mouth) return '#20232c';
  if (kind && Math.abs(fu) < 0.5 && fv > -1 && fv < 0.6) return GHOST[1];
  return fu < -1.4 ? GHOST[3] : e > 0.7 ? GHOST[1] : GHOST[2];
}
/**
 * THE KING'S GREAT BED (from the book: "the emperor's bed" with its "velvet curtains and heavy golden tassels"): a bed of
 * dark oak, four carved posts, a tester over it hung with royal blue velvet, its valance fringed with gold; the curtains
 * heavy, drawn back at its foot and tied with heavy golden tassels, hanging closed along its head and its far side; and
 * looking out from among their folds, pale, the faces of everything he ever did (the book's "strange heads", some very
 * ugly, some lovely and gentle). The bed empty: the linen thrown back where he rose, his pillows dented. Its head to -y.
 * Two tiles by two and a half. 230 x 260 at (115, 170).
 */
function greatBed(): Sprite {
  const S = scene(230, 260, 115, 170);
  const X = 34;
  const Y0 = -46;
  const Y1 = 50;
  const TOPZ = 118;
  // the bed: its frame, the mattress, the linen thrown back, the pillows; a coverlet of royal blue at its foot
  S.box([0, (Y0 + Y1) / 2, 9], AXES, [X - 2, (Y1 - Y0) / 2 - 2, 9], (f, _u, _v, n) => toneAt(n, OAK, f === 4 ? 0.1 : 0), 1);
  S.box([0, (Y0 + Y1) / 2, 21], AXES, [X - 4, (Y1 - Y0) / 2 - 4, 3], (_f, _u, _v, n) => toneAt(n, LINEN, -0.05), 2);
  S.egg([-6, 6, 25], AXES, [22, 16, 4], (n, w) => toneAt(n, LINEN, fr((w[0] + w[1]) * 0.18) < 0.25 ? -0.4 : 0.1), 3);
  S.box([0, 34, 25.5], AXES, [X - 3, 12, 2.5], (f, u, v, n) => (f === 4 && fr(u * 6) < 0.08 ? GOLD[2] : toneAt(n, ROYAL, f === 4 ? 0.1 : -0.1)), 4);
  for (const x of [-15, 12]) S.egg([x, Y0 + 14, 27], AXES, [12, 7, 4], (n, w) => toneAt(n, LINEN, Math.hypot(w[0] - x, w[1] - Y0 - 14) < 4 ? -0.3 : 0.15), 5);
  // the headboard, carved, the crest on it in gilt
  S.box([0, Y0 + 2, 46], AXES, [X - 2, 2, 22], (f, u, v, n) => {
    if (f !== 2) return toneAt(n, OAK, 0);
    const a = (v - 0.5) * 2 * (X - 2);
    const z = 24 + u * 44;
    if (crestAt(a / 1.4 + 7.5, (68 - z - 12) / 1.4)) return GOLD[3];
    if (Math.abs(fr((a + X) / 10.7) - 0.5) < 0.06 || Math.abs(z - 64) < 1) return OAK[1];
    return toneAt(n, OAK, 0.05);
  }, 6);
  // the posts, carved, to the tester
  for (const x of [-X, X]) for (const y of [Y0, Y1]) {
    S.rod([x, y, 0], [x, y, TOPZ], 2.6, 2.4, OAK, 7);
    for (const z of [26, 60, 90]) S.egg([x, y, z], AXES, [3.2, 3.2, 2.2], tone(OAK, 0.2), 7);
  }
  // the tester: a frame over it, its valance of royal blue, fringed with gold, a gold finial at each corner
  S.box([0, (Y0 + Y1) / 2, TOPZ + 3], AXES, [X + 3, (Y1 - Y0) / 2 + 3, 3], (f, _u, _v, n) => toneAt(n, f === 4 ? ROYAL : OAK, f === 4 ? 0.1 : 0), 8);
  for (const [face, len] of [[0, Y1 - Y0 + 6], [1, 2 * X + 6]] as const) {
    // (its valance along the near sides: +x and +y)
    const P = (s: number, z: number): V3 => (face === 0 ? [X + 3.4, Y0 - 3 + s, z] : [-X - 3 + s, Y1 + 3.4, z]);
    S.quad([P(0, TOPZ - 12), P(len, TOPZ - 12), P(len, TOPZ + 0.5), P(0, TOPZ + 0.5)], (u, v) => {
      const s = u * len;
      const z = TOPZ - 12 + v * 12.5;
      const sc = 2 + 4 * Math.abs(Math.sin((s / 14) * Math.PI));
      if (z < TOPZ - 12 + sc) return fr(s / 14) < 0.1 ? GOLD[3] : null;
      if (z < TOPZ - 10 + sc) return fr(s / 2.5) < 0.5 ? GOLD[2] : GOLD[3];
      return face === 0 ? ROYAL[1] : ROYAL[2];
    }, 9);
  }
  for (const x of [-X, X]) for (const y of [Y0, Y1]) S.rod([x, y, TOPZ + 6], [x, y, TOPZ + 13], 2, 0.3, GOLD, 10);
  // THE CURTAINS: heavy velvet in deep folds, closed along its head and its far side (-x), drawn back to the posts at its
  // foot and its near side and tied with heavy golden tassels; the faces looking out from among the folds
  const FACES: [number, number, number, number][] = [
    // (which curtain: 0 its far side along y at -x, 1 its head along x at Y0; where along it; how high; gentle 0 or ugly 1)
    [0, 0.22, 74, 1],
    [0, 0.48, 92, 0],
    [0, 0.7, 64, 1],
    [1, 0.3, 86, 0],
    [1, 0.62, 70, 1],
    [1, 0.85, 96, 0],
  ];
  const curtain = (which: number, id: number): void => {
    const len = which === 0 ? Y1 - Y0 : 2 * X;
    // (the far side's curtain hangs just inside its posts, along y; the head's along x)
    const P = (s: number, out: number, z: number): V3 => (which === 0 ? [-X + 1.5 + out, Y0 + s, z] : [-X + s, Y0 + 1.5 + out, z]);
    const n0: V3 = which === 0 ? [1, 0, 0] : [0, 1, 0];
    S.quad([P(0, 0, 4), P(len, 0, 4), P(len, 0, TOPZ - 1), P(0, 0, TOPZ - 1)], (u, v) => {
      const s = u * len;
      const z = 4 + v * (TOPZ - 5);
      for (const [c, at, fz, kind] of FACES) {
        if (c !== which) continue;
        const fu = s - at * len;
        const fv = z - fz;
        const col = faceAt(fu / 1.45, fv / 1.45, kind);
        if (col) return col;
      }
      // the folds: deep, upright, each lit on its left and dark in its hollow
      const ph = fr(s / 9);
      const k = ph < 0.18 ? 3 : ph < 0.55 ? 2 : ph < 0.8 ? 1 : 0;
      const bias = which === 0 ? -0.4 : 0;
      const nn = norm3([n0[0] + (which === 1 ? (0.5 - ph) : 0), n0[1] + (which === 0 ? (ph - 0.5) : 0), 0.2]);
      void nn;
      // their hems gold where they brush the floor
      if (z < 7) return GOLD[1];
      return ROYAL[Math.max(0, Math.min(4, Math.round(k + bias)))];
    }, id);
  };
  curtain(0, 11);
  curtain(1, 12);
  // the curtains at its foot and near side, drawn back to the posts, gathered and tied, the tassels heavy and gold
  for (const [x, y, side] of [[X, Y1, 0], [-X, Y1, 1], [X, Y0, 2]] as const) {
    S.egg([x - (side === 1 ? -4 : 4), y - (side === 2 ? -4 : 4), 64], AXES, [5.6, 5.6, 54], (n, w) => {
      const ph = fr((Math.atan2(w[1] - y, w[0] - x) / (Math.PI * 2)) * 10);
      const pinch = Math.abs(w[2] - 56) < 2.4;
      if (pinch) return GOLD[2];
      return toneAt(n, ROYAL, (ph < 0.3 ? 0.3 : ph > 0.7 ? -0.3 : 0) + (w[2] > 56 ? 0.05 : -0.1));
    }, 13, (w) => w[2] > 4);
    // the tassel, heavy, gold: its cord, its knob, its long fringe
    const tx = x + (side === 1 ? 4 : -4) * 0.4;
    const ty = y + (side === 2 ? 4 : -4) * 0.4 + 5;
    S.rod([tx, ty, 56], [tx, ty, 48], 0.6, 0.6, GOLD, 14);
    S.ball([tx, ty, 47], 2, GOLD, 14, undefined, 0.2);
    S.rod([tx, ty, 45], [tx, ty, 36], 2.4, 3, GOLD, 14);
  }
  return done(S, 115, 170);
}
const norm3 = (a: readonly number[]): V3 => {
  const n = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};
/** THE SONGBIRD'S SILK CUSHION (from the book: the artificial bird "had its place on a silken cushion close to the emperor's bed"): a little gilt stand, a cushion of royal blue silk on it, gold tassels at its corners, its middle pressed hollow where the bird sat; empty. 60 x 70 at (30, 54). */
function songbirdCushion(): Sprite {
  const S = scene(60, 70, 30, 54);
  for (const [x, y] of [[-8, -8], [8, -8], [-8, 8], [8, 8]] as const) S.rod([x, y, 0], [x * 0.8, y * 0.8, 16], 1, 0.8, GOLD, 1);
  S.box([0, 0, 17], AXES, [9.5, 9.5, 1.2], (f, _u, _v, n) => toneAt(n, GOLD, f === 4 ? 0.2 : 0), 2);
  S.egg([0, 0, 20.5], AXES, [9.6, 9.6, 3], (n, w) => {
    const hollow = Math.hypot(w[0], w[1]) < 4 && w[2] > 21.6;
    return toneAt(n, ROYAL, hollow ? -0.6 : fr((w[0] + w[1]) * 0.2) < 0.2 ? 0.3 : 0.1);
  }, 3);
  for (const [x, y] of [[-9, -9], [9, -9], [-9, 9], [9, 9]] as const) {
    S.ball([x, y, 21], 1.1, GOLD, 4);
    S.rod([x * 1.04, y * 1.04, 20], [x * 1.08, y * 1.08, 15], 1.1, 1.5, GOLD, 4);
  }
  return done(S, 30, 54);
}
/**
 * THE CLOCKWORK SONGBIRD, BROKEN (the quest; from the book: the emperor's artificial bird, "covered all over with diamonds,
 * rubies and sapphires", its tail glittering silver and gold; it broke: something in it snapped and its wheels ran
 * down): lying on its side on the floor, golden, its gems glinting dull, its tail of silver and gold feathers fanned; the
 * little door in its back sprung open, its spring uncoiled out of it, its wheels spilled across the floor, the key that
 * wound it by them. 100 x 70 at (50, 44).
 */
function songbird(): Sprite {
  const S = scene(100, 70, 50, 44);
  // its body, on its side: a plump golden egg, its breast toward the eye, a ridge of gems along its back
  const F: V3 = norm3([-0.8, 0.6, 0]);
  const Sd: V3 = norm3([0.6, 0.8, 0]);
  S.egg([0, 0, 5], [F, Sd, [0, 0, 1]], [10, 5.4, 5], (n, w) => {
    const g = hash(Math.floor(w[0] * 0.7), Math.floor(w[1] * 0.7 + w[2] * 0.7), 9231);
    if (n[2] > 0.55 && g < 0.3) return g < 0.1 ? RUBY : g < 0.2 ? SAPPHIRE : DIAMOND;
    // the feathers chased in its gold, in rows
    if (fr((w[0] - w[1]) * 0.35 + w[2] * 0.3) < 0.18) return GOLD[1];
    return toneAt(n, GOLD, 0.15);
  }, 1);
  // its head, its beak, its eye a sapphire
  S.egg([-10, 7, 6], AXES, [4.2, 4.2, 4], (n, w) => (Math.hypot(w[0] + 11.5, w[1] - 9, w[2] - 7) < 1.3 ? SAPPHIRE : toneAt(n, GOLD, 0.15)), 2);
  S.rod([-13, 9.5, 6], [-17, 12, 5.6], 1.1, 0.2, GOLD, 2);
  // its wing, folded along its side, gem-set
  S.egg([1, 0.5, 8.4], [F, Sd, [0, 0, 1]], [7.5, 3.6, 1.6], (n, w) => {
    const g = hash(Math.floor(w[0]), Math.floor(w[1]), 9233);
    if (g < 0.16) return g < 0.06 ? RUBY : g < 0.11 ? DIAMOND : SAPPHIRE;
    return toneAt(n, GOLD, fr(w[0] * 0.5) < 0.2 ? -0.3 : 0.2);
  }, 3);
  // its tail fanned on the floor: feathers of silver and of gold by turns
  for (let i = 0; i < 7; i++) {
    const a = 0.3 + (i - 3) * 0.17;
    const d: V3 = [Math.cos(a) * 0.8 + 0.2, -Math.sin(a) * 0.6 + 0.3, 0];
    const base: V3 = [8, -4, 3];
    S.egg([base[0] + d[0] * 10, base[1] + d[1] * 10, 1.6], [norm3(d), norm3([-d[1], d[0], 0]), [0, 0, 1]], [10, 1.7, 0.9], (n) => toneAt(n, i % 2 ? GOLD : SILVER, 0.2), 4);
  }
  // the little door in its back sprung open; its spring uncoiled out of it in loops
  S.quad([[2, -4, 9], [7, -4, 9], [7, -9, 12], [2, -9, 12]], () => GOLD[3], 5);
  for (let i = 0; i < 40; i++) {
    const t = i / 40;
    const a = t * Math.PI * 5;
    const r = 2 + t * 5;
    S.ball([4 + t * 14 + Math.cos(a) * r * 0.6, -2 + Math.sin(a) * r * 0.4 + t * 6, 2 + Math.abs(Math.sin(a)) * 2], 0.6, STEEL, 6);
  }
  // its wheels spilled across the floor: little toothed wheels of brass and steel
  for (const [x, y, r, gold] of [[22, 10, 3.6, 1], [14, 16, 2.6, 0], [-6, 14, 3, 1], [28, 2, 2.2, 0]] as const) {
    S.egg([x, y, 0.8], AXES, [r, r, 0.6], (_n, w) => {
      const a = Math.atan2(w[1] - y, w[0] - x);
      const d = Math.hypot(w[0] - x, w[1] - y);
      if (d > r - 0.7 && fr((a / (Math.PI * 2)) * 12) < 0.5) return null;
      if (d < 0.9) return HOLE;
      return (gold ? GOLD : STEEL)[d < r * 0.5 ? 2 : 3];
    }, 7);
  }
  // the key that wound it
  S.rod([-14, -8, 0.8], [-6, -10, 0.8], 0.6, 0.6, GOLD, 8);
  S.egg([-16, -7.4, 0.8], AXES, [2.4, 2.4, 0.5], (_n, w) => (Math.hypot(w[0] + 16, w[1] + 7.4) < 1 ? null : GOLD[3]), 8);
  return done(S, 50, 44);
}

// =================================================================================================
// THE SET

/** Where each wall piece may be set: its first spot the piece's own, then others across the face and up it. */
const SPOTS: Record<string, readonly At[]> = {
  cloth: [[0, 0]],
  banner: [[0, 0], [-12, 0], [12, -4], [0, -8]],
  torch: [[0, 0], [-10, 4], [10, -2]],
  slit: [[0, 0], [-10, 0], [10, 6]],
};

let made: Piece[] | null = null;
/** THE KEEP'S OWN PIECES, the King's twenty-five, made the first time they are asked for and kept. */
export function keepPieces(): Piece[] {
  if (made) return made;
  made = [
    { name: 'the throne on its dais', kind: 'obstacle', frames: [throneOnDais()], shadow: 1.2 },
    { name: 'the cloth of estate', kind: 'on the wall', ...onWall((S, w) => clothOfEstate(S, w), 1, SPOTS.cloth, 184, 166, 30) },
    // (frames: along x, torn along x, along y, torn along y)
    { name: 'the royal runner', kind: 'on the floor', frames: [runner(true, false), runner(true, true), runner(false, false), runner(false, true)] },
    { name: 'a royal banner', kind: 'on the wall', ...onWall((S, w) => banner(S, w), 1, SPOTS.banner, 90, 140, 30) },
    // (frames: its flame, three)
    { name: 'a torch in its sconce', kind: 'on the wall', ...onWall((S, w, f) => torch(S, w, f), 3, SPOTS.torch, 80, 134, 30, (w) => [{ at: w(0, 10.4, 66), r: 60, color: EMBER[2], a: 0.5 }]) },
    { name: 'a brazier', kind: 'obstacle', frames: [0, 1, 2].map(brazier), shadow: 0.4 },
    { name: 'an arrow slit', kind: 'on the wall', ...onWall((S, w) => arrowSlit(S, w), 1, SPOTS.slit, 100, 130, 30) },
    // (frames: along x, along y)
    { name: 'battlements', kind: 'obstacle', frames: [battlements(0), battlements(1)], shadow: 0 },
    // (frames: up, the warning, falling, slammed, down; along x, then along y)
    { name: 'a portcullis', kind: 'trap', frames: [0, 1].flatMap((k) => [0, 1, 2, 3, 4].map((f) => portcullis(f, k))), shadow: 0 },
    { name: "the portcullis's winch", kind: 'obstacle', frames: [winch()], shadow: 0.7 },
    // (frames: still, the warning, pouring, its pool)
    { name: 'a murder hole', kind: 'trap', frames: [0, 1, 2, 3].map(murderHole) },
    { name: 'a cauldron of pitch', kind: 'obstacle', frames: [0, 1, 2].map(cauldron), shadow: 0.45 },
    { name: 'a suit of armour on its stand', kind: 'breakable', frames: [armour(false), armour(true)], shadow: 0.35 },
    { name: 'a weapon rack', kind: 'obstacle', frames: [weaponRack(0), weaponRack(1)], shadow: 0.6 },
    { name: 'a crossbow rack', kind: 'obstacle', frames: [crossbowRack(0), crossbowRack(1)], shadow: 0.6 },
    { name: "an armourer's anvil", kind: 'obstacle', frames: [anvil()], shadow: 0.45 },
    { name: 'barracks bunks', kind: 'obstacle', frames: [bunks(0), bunks(1)], shadow: 1.0 },
    { name: 'barrels', kind: 'breakable', frames: [barrels(false), barrels(true)], shadow: 0.45 },
    { name: 'a long table', kind: 'obstacle', frames: [longTable(0), longTable(1)], shadow: 1.2 },
    { name: 'the war table, its map', kind: 'obstacle', frames: [warTable()], shadow: 0.8 },
    { name: 'the castle well', kind: 'obstacle', frames: [well()], shadow: 0.6 },
    { name: "the king's great bed", kind: 'obstacle', frames: [greatBed()], shadow: 1.4 },
    { name: "the songbird's silk cushion", kind: 'obstacle', frames: [songbirdCushion()], shadow: 0.25 },
    { name: 'the clockwork songbird, broken', kind: 'quest', frames: [songbird()], shadow: 0.2 },
    // (frames: shut, open)
    { name: "the keep's great doors", kind: 'door', left: [greatDoors(false).left, greatDoors(true).left], right: [greatDoors(false).right, greatDoors(true).right] },
  ];
  return made;
}
