// THE CULT'S SANCTUM: A STRONGHOLD'S HALL MADE NEW (the Godot cloud chat, 21 Nov 2026; behind HALL_LOOK in game/act1_dress.ts,
// off until his yes to the game's pictures of it).
//
// His words, 21 Nov 2026: “The strongholds need a little work as well.  I like the outside, but the inside in uninspired”; shown a
// first try of a few more of the set's pieces about the old hall: “I don't want to just add a few pieces of decoration, I want
// something new that looks like a cultist stronghold.”
//
// So the hall inside is the cult's own: not the quarry's limestone (art/redoubt.ts) but THE SANCTUM'S STONE, a black-violet
// basalt laid in great flags and courses, its joints run with a dull glow of the cult's pink, as if its power seeped through the
// stone; and in it, of the cult's own making:
//   THE CULT'S PILLARS, a nave of them: a square plinth, a shaft of the black stone fluted and banded in iron, the shrieking skull
//     carved on its faces with its sockets burning, a capital, and on it an iron bowl of the cult's pink fire (4 frames);
//   THE HOODED IDOLS, two, flanking the back of the hall: a robed and hooded figure of the black stone on its plinth, a mask of
//     bone-white with the cult's skull's scowl on its face, its sockets burning, both arms raised holding up a bowl of its fire;
//   THE GREAT SIGIL, carved into the floor round the obelisk in place of the ring: a ring of the cult's pink cut deep in the
//     stone, a second inside it, eight channels running in from it to the middle with the power crawling inward along them,
//     the cult's mark at each of its eight points;
//   and the cult's hangings on its walls (art/redoubt.ts, the planning chat's, never yet hung in the game), its cages in the back
//   corners and its skull standards at the door (art/act1_camp.ts).
// The enemy's pink, never the friend's cyan; no letters (his rulebook: the cult's marks are its skull, not words).

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { PAINT, PAINT_SHADE, pinkFlame } from './act1_cult';
import { Scene, XYZ, toneAt } from './floor4';
import type { V3 } from './floor4';
import { shriekAt } from './floor5';
import type { Piece } from './floorkit';
import { VAULT, makeGroundArt } from './ground';
import type { GroundArt, Theme } from './ground';
import { GRAIN, compose, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';

/**
 * THE SANCTUM'S STONE: a black-violet basalt, its flags and courses darker than any floor of the descent's, its joints a dull
 * glow of the cult's pink (the mortar), its lit lips a cold violet.
 */
export const SANCTUM: Theme = {
  ...VAULT,
  id: 'sanctum',
  mortar: '#3c1030',
  slab: ['#130e19', '#1b1523', '#231b2e', '#2c2339'],
  slabs: 1.25,
  cap: ['#241c2e', '#3c3150', '#4a3e62', '#43385a', '#625478'],
  capLow: ['#201928', '#362c48', '#433858', '#3d3352', '#584c6e'],
  lit: ['#18121f', '#271f33', '#322940', '#2d2539', '#45395a'],
  shade: ['#0d0a12', '#140f1b', '#1b1524', '#181220', '#251d32'],
};

let ground: GroundArt | null = null;
/** The sanctum's floor and walls, as the game paints a dungeon's (art/redoubt.ts redoubtGround, for the old hall). */
export function sanctumGround(): GroundArt {
  return ground ?? (ground = makeGroundArt(SANCTUM));
}

/** The black stone of the cult's own carving. */
const BASALT: Ramp = ['#100b16', '#1c1526', '#2a2138', '#3b304e', '#53476a'];
/** Its iron: bands, bowls. */
const IRON: Ramp = ['#0d0b12', '#1f1c28', '#373344', '#565166', '#7d7790'];
/** The embers in a bowl, under its flame. */
const EMBER = '#5a1240';

const fr = (t: number): number => t - Math.floor(t);

/** A flame's light, and the bowl's own, in game pixels on the sprite. */
function lightAt(S: Scene, w: V3, r: number, a: number): Light {
  const [x, y] = S.at(w);
  return { x: x / GRAIN, y: y / GRAIN, r, color: FLAME[2], a };
}

/** An iron bowl of the cult's fire at `c` (its rim's middle), `r` across: its bowl, its embers, laid in the scene. */
function fireBowl(S: Scene, c: V3, r: number, id: number): void {
  S.egg([c[0], c[1], c[2] - r * 0.35], XYZ, [r, r, r * 0.45], (n, w) => (w[2] > c[2] ? null : toneAt(n, IRON, 0.05)), id);
  // (its rim, and the embers glowing in it)
  S.egg([c[0], c[1], c[2]], XYZ, [r * 0.86, r * 0.86, 0.6], (_n, w) => (Math.hypot(w[0] - c[0], w[1] - c[1]) > r * 0.7 ? IRON[3] : EMBER), id + 1);
}

/**
 * THE CULT'S PILLAR: a square plinth; a shaft of the black stone, fluted, banded in iron near its foot and its head, the
 * shrieking skull carved on its two faces seen with its sockets burning; a capital; and on it an iron bowl of the cult's fire
 * (4 frames, at about 6 a second). 104 x 240 at (52, 214): a tile across its plinth, half again a hero's height to its fire.
 */
function cultPillar(f: number): Sprite {
  const S = new Scene(new Px(104, 240), 52, 214);
  const pulse = [0, 1, 2, 1][f % 4];
  const Z0 = 14;
  const Z1 = 124;
  // the plinth, two steps of it
  S.box([0, 0, 5], XYZ, [17, 17, 5], (_f, _u, _v, n) => toneAt(n, BASALT, 0.05), 1);
  S.box([0, 0, 12], XYZ, [14.5, 14.5, 2.5], (_f, _u, _v, n) => toneAt(n, BASALT, 0.12), 2);
  // the shaft: fluted; its two seen faces carved with the cult's skull, its sockets burning
  S.box([0, 0, (Z0 + Z1) / 2], XYZ, [10.5, 10.5, (Z1 - Z0) / 2], (face, u, v, n) => {
    const z = Z0 + v * (Z1 - Z0);
    if (face === 0 || face === 2) {
      const m = shriekAt((u - 0.5) * 2.6, (z - 84) / 11);
      if (m === 'bone') return face === 0 ? PAINT_SHADE : PAINT;
      if (m === 'dark') return FLAME[Math.min(4, 1 + pulse)];
    }
    // (its flutes: three down each face, a darker groove)
    if (fr(u * 3) < 0.14 && (z < 66 || z > 102)) return toneAt(n, BASALT, -0.35);
    return toneAt(n, BASALT, 0);
  }, 3);
  // its iron bands, near its foot and its head
  for (const z of [26, 112]) S.box([0, 0, z], XYZ, [11.6, 11.6, 2.2], (_f, u, _v, n) => (fr(u * 4) < 0.12 ? IRON[4] : toneAt(n, IRON, 0.1)), 4);
  // the capital: a broad slab and a narrower one under it
  S.box([0, 0, Z1 + 2], XYZ, [13, 13, 2], (_f, _u, _v, n) => toneAt(n, BASALT, 0.1), 5);
  S.box([0, 0, Z1 + 7], XYZ, [16, 16, 3], (_f, _u, _v, n) => toneAt(n, BASALT, 0.18), 6);
  const RIM = Z1 + 18;
  fireBowl(S, [0, 0, RIM], 13, 7);
  S.seams();
  const px = compose(null, [S.p], null);
  // ITS FIRE: two tongues of the cult's pink burning to gold, licking up out of the bowl
  const [bx, by] = S.at([0, 0, RIM]);
  const lean = [0, 2, -1, 1][f % 4];
  pinkFlame(px, Math.round(bx), Math.round(by), 22 + pulse * 3, 7, lean);
  pinkFlame(px, Math.round(bx) - 6, Math.round(by) + 1, 12 + ((f + 1) % 3) * 2, 4, lean - 1);
  pinkFlame(px, Math.round(bx) + 6, Math.round(by) + 1, 11 + ((f + 2) % 3) * 2, 4, lean + 1);
  const sp = px.sprite(52, 214, GRAIN);
  sp.lights = [lightAt(S, [0, 0, RIM + 14], 54 + pulse * 4, 0.5), lightAt(S, [10, 10, 84], 10, 0.35)];
  return sp;
}

/**
 * THE HOODED IDOL: on its plinth, a robed figure of the black stone, its robe falling to the plinth in folds, its hood deep;
 * in the hood a mask of bone-white with the cult's skull's scowl, its sockets burning; both arms raised, holding up over its
 * head an iron bowl of the cult's fire (4 frames). 128 x 270 at (64, 244).
 */
function hoodedIdol(f: number): Sprite {
  const S = new Scene(new Px(128, 270), 64, 244);
  const pulse = [0, 1, 2, 1][f % 4];
  S.box([0, 0, 8], XYZ, [21, 21, 8], (_f, _u, _v, n) => toneAt(n, BASALT, 0.08), 1);
  S.box([0, 0, 18], XYZ, [18, 18, 2], (_f, _u, _v, n) => toneAt(n, BASALT, 0.16), 2);
  // its robe: wider at its foot, falling in folds (the folds a darker line every so often round it)
  S.egg([0, 0, 64], XYZ, [16, 14, 50], (n, w) => {
    if (w[2] < 20 || w[2] > 104) return null;
    const a = Math.atan2(w[1], w[0]);
    if (fr(a / (Math.PI / 5) + w[2] * 0.004) < 0.12 && w[2] < 88) return toneAt(n, BASALT, -0.4);
    return toneAt(n, BASALT, 0);
  }, 3);
  // its shoulders, broad under the hood
  S.egg([0, 0, 100], XYZ, [15, 14, 8], (n) => toneAt(n, BASALT, 0.05), 4);
  // its hood: deep, and in it, toward the eye, the mask
  const HC: V3 = [2, 2, 116];
  S.egg(HC, XYZ, [11.5, 11.5, 14], (n, w) => {
    const front = n[0] * 0.7071 + n[1] * 0.7071;
    if (front > 0.55 && Math.abs(n[2]) < 0.6) {
      const x = ((w[0] - HC[0]) - (w[1] - HC[1])) * 0.7071 / 6.8;
      const y = (w[2] - (HC[2] - 2)) / 8.6;
      const m = shriekAt(x, y);
      if (m === 'bone') return n[0] < n[1] ? PAINT : PAINT_SHADE;
      if (m === 'dark') return FLAME[Math.min(4, 2 + (pulse > 1 ? 1 : 0))];
      // (the hollow of the hood round the mask: black)
      if (front > 0.72) return '#07050b';
    }
    return toneAt(n, BASALT, 0.02);
  }, 5);
  // its arms raised, holding up the bowl over its head
  const BOWL: V3 = [3, 0, 160];
  for (const s of [-1, 1]) {
    S.rod([0, s * 12, 102], [2, s * 13, 126], 5, 4.2, BASALT, 6);
    S.rod([2, s * 13, 126], [3, s * 8, BOWL[2] - 4], 4.2, 3.4, BASALT, 6);
  }
  fireBowl(S, BOWL, 12, 7);
  S.seams();
  const px = compose(null, [S.p], null);
  const [bx, by] = S.at(BOWL);
  const lean = [1, -1, 2, 0][f % 4];
  pinkFlame(px, Math.round(bx), Math.round(by), 20 + pulse * 3, 6.5, lean);
  pinkFlame(px, Math.round(bx) - 5, Math.round(by) + 1, 11 + (f % 3) * 2, 3.5, lean - 1);
  pinkFlame(px, Math.round(bx) + 5, Math.round(by) + 1, 10 + ((f + 1) % 3) * 2, 3.5, lean + 1);
  const sp = px.sprite(64, 244, GRAIN);
  sp.lights = [lightAt(S, [BOWL[0], BOWL[1], BOWL[2] + 14], 56 + pulse * 4, 0.5), lightAt(S, [HC[0] + 6, HC[1] + 6, HC[2]], 9, 0.4)];
  return sp;
}

/**
 * THE GREAT SIGIL, carved into the floor: a ring `r` tiles round of the cult's pink cut deep in the stone (its cut dark, its
 * fire in it), a second inside it, eight channels running in from it to a ring round the middle, the power crawling inward along
 * them, the cult's mark at each of its eight points; pulsing (4 frames). Lying on the floor; anchored at its middle; it lights it.
 */
function greatSigil(f: number, r: number): Sprite {
  const W = Math.ceil(r * 64 * 1.02 + 24);
  const H = Math.ceil(r * 32 * 1.02 + 16);
  const p = new Px(W, H);
  const ox = W / 2;
  const oy = H / 2;
  const pulse = [0, 1, 2, 1][f % 4];
  const CUT = '#1a0816';
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // (the floor under this pixel, from the middle, in tiles)
      const a = (x + 0.5 - ox) / 32;
      const b = (y + 0.5 - oy) / 16;
      const wx = (a + b) / 2;
      const wy = (b - a) / 2;
      const d = Math.hypot(wx, wy) / r;
      const ang = Math.atan2(wy, wx);
      const px = (k: number): number => Math.abs(d - k) * r * 32;
      // the outer ring: a cut two stones wide, its fire in it
      if (d > 0.9 && d < 1.0) {
        const e = Math.min(px(0.9), px(1.0));
        p.set(x, y, e < 1.2 ? FLAME[Math.min(4, 1 + (pulse > 1 ? 1 : 0))] : CUT);
        if (px(0.95) < 1.1) p.set(x, y, FLAME[pulse > 0 ? 2 : 1]);
        continue;
      }
      // the inner ring, one line, broken where the channels meet it
      if (px(0.78) < 0.9) {
        p.set(x, y, FLAME[1]);
        continue;
      }
      // the ring round the middle
      if (px(0.26) < 1.0) {
        p.set(x, y, FLAME[pulse > 1 ? 3 : 2]);
        continue;
      }
      if (d < 0.26 && d > 0.2) {
        p.set(x, y, CUT);
        continue;
      }
      // the eight channels running in, the power crawling inward along them
      if (d > 0.26 && d < 0.9) {
        const spoke = Math.abs(fr((ang / (Math.PI * 2)) * 8 + 0.5) - 0.5) * (Math.PI * 2 / 8) * d * r * 32;
        if (spoke < 1.6) {
          const crawl = fr(d * 3 + (f / 4) * 0.75);
          p.set(x, y, spoke < 0.7 ? (crawl < 0.3 ? FLAME[3] : FLAME[2]) : CUT);
        }
      }
    }
  }
  // the cult's mark at each of its eight points, between the rings, seen at the floor's slant
  for (let q = 0; q < 8; q++) {
    const qa = (q / 8) * Math.PI * 2 + Math.PI / 8;
    const mx = Math.cos(qa) * 0.86 * r;
    const my = Math.sin(qa) * 0.86 * r;
    const cx = ox + (mx - my) * 32;
    const cy = oy + (mx + my) * 16;
    for (let y = Math.floor(cy - 6); y <= Math.ceil(cy + 6); y++) {
      for (let x = Math.floor(cx - 8); x <= Math.ceil(cx + 8); x++) {
        const m = shriekAt((x + 0.5 - cx) / 6.2, -(y + 0.5 - cy) / 4.4);
        if (m === 'bone') p.set(x, y, FLAME[pulse > 0 ? 2 : 1]);
        else if (m === 'dark') p.set(x, y, CUT);
      }
    }
  }
  // (scuffs: a few of its cut's lines worn faint, where the cult walks it)
  for (let k = 0; k < 40; k++) {
    const x = Math.floor(hash(k, 1, 771) * W);
    const y = Math.floor(hash(k, 2, 771) * H);
    if (p.get(x, y) === FLAME[1]) p.set(x, y, CUT);
  }
  const s = p.sprite(ox, oy, GRAIN);
  s.lights = [{ x: ox / GRAIN, y: oy / GRAIN, r: r * 22, color: FLAME[2], a: 0.24 + pulse * 0.04 }];
  return s;
}

/** THE SANCTUM'S OWN PIECES. */
let made: Piece[] | null = null;
export function sanctumPieces(): Piece[] {
  return (made ??= [
    { name: "the cult's pillar", kind: 'obstacle', frames: [0, 1, 2, 3].map(cultPillar), shadow: 0.55 },
    { name: 'the hooded idol', kind: 'obstacle', frames: [0, 1, 2, 3].map(hoodedIdol), shadow: 0.6 },
    { name: "the cult's great sigil", kind: 'on the floor', frames: [0, 1, 2, 3].map((f) => greatSigil(f, 3.3)) },
  ] as Piece[]);
}
