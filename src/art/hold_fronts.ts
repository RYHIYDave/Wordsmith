// THE STRONGHOLDS' FRONTS, A FLOOR'S OWN EACH (behind HOLD_FRONTS, game/act1_dress.ts, off until his yes). The owner, 25 Nov 2026,
// 08:58 (Eastern), as endless mode puts strongholds on every level: “Endless mode is adding strongholds to every level, and I need
// the facades of the strongholds that you go into to match each of the levels.” Asked whose they are on the levels outside the
// Wilds, his pick by 10:04: “The cult's, in each level's building (Recommended)” (each level's own kind of building, taken by the
// cult: its banners and its burning seal on the door, so it still reads as the same place to go in); and whether levels 7, 9 and
// 10 should have their own in the story too (they wear the Quarry's gatehouse): “Yes, story and endless alike (Recommended)”.
//
// So a front for each of the twenty floors, in that floor's own stone and colours and its own kind of building (the Quarry's is
// its gatehouse, art/floor6.ts; Echo Canyon's its waystation's gate, art/floor8.ts), every one the cult's: its door sealed with
// the cult's mark burning pink (four frames of flicker), then open; the cult's banners on it; its pink fire in sconces. Each as the
// gatehouse is built and anchored (art/hold_fronts_kit.ts): its face along x looking out down the screen to the left, the door's
// foot at its anchor, so that any of them stands where the gatehouse stands. docs/mockups/hold_fronts/README.md.

import type { Sprite } from '../engine/px';
import { COURT_NAMES, FRONT_NAMES } from '../game/act1_dress';
import { PAINT as CULT_PAINT } from './act1_cult';
import { crownAt } from './floor1';
import type { V3 } from './floor4';
import { shriekAt } from './floor5';
import { TIMBER as Q_TIMBER, courtTiles, fr } from './floor6';
import { Front, along, ashlar, banner, bars, boneWall, books, brick, creeping, door, frames, inArch, leaves, lit, logs, panes, plain, planks, plaster, plates, roofing, rubble, sconce, sigil, tower, voussoirs, wheel, where, window } from './hold_fronts_kit';
import type { Arch, Paint } from './hold_fronts_kit';
import { hash } from './kit';
import type { Ramp } from './kit';
import * as TOMB from './tomb';
import * as PRISON from './prison';
import * as CHAPEL from './chapel';
import * as LAIRT from './lair_temple';
import * as LEDGE from './floor7';
import * as PINEWOOD from './floor9';
import * as FEN from './floor10';
import * as UNDER from './floor12';
import * as MILL from './floor13';
import * as QUIET from './floor14';
import * as LIBRARY from './floor15';
import * as SWAN from './floor16';
import * as MASQUE from './floor17';
import * as GALLERY from './floor18';
import * as KEEP from './floor19';
import * as QUIETTOWER from './floor20';

/** A floor's stronghold's front: its name (a piece's, kind 'gate': frames 0 to 3 its door sealed and burning, 4 open). */
export interface HoldFront {
  floor: number;
  name: string;
  make: (open: boolean, f: number) => Sprite;
}

// =================================================================================================
// FLOOR 1, THE WARDEN'S TOMB: THE KING'S TOMB WITH DAYLIGHT, THE ROOTS BREAKING IN (art/tomb.ts)
//
// A ROYAL MAUSOLEUM taken by the cult: the tomb's pale carved stone gone green with damp, a portico of two columns under a
// pediment with the king's crown carved in its middle, a lower wing either side with a dark niche, moss up from its foot and the
// town's roots breaking out over its roof and down its left; the cult's banners hung on the wings, its pink fire either side of
// the door, its mark burning in the tomb's slab.

const T_SEAM = '#0e0f0b';
const T_STONE: Ramp = TOMB.STONE as unknown as Ramp;
const T_SLAB: Ramp = TOMB.SLAB as unknown as Ramp;
const T_IRON: Ramp = TOMB.IRON as unknown as Ramp;
const T_TRIM: Ramp = TOMB.TRIM as unknown as Ramp;
const T_MOSS: Ramp = TOMB.MOSS as unknown as Ramp;
const T_ROOT: Ramp = TOMB.ROOT as unknown as Ramp;

function tombFront(open: boolean, f: number): Sprite {
  const F = new Front();
  const wall = creeping(ashlar(T_STONE, T_SEAM, 1101, 11, 24), T_MOSS, 16, 1102);
  const dressed = creeping(plain(T_STONE, 0, 0.05), T_MOSS, 10, 1103);
  // THE WINGS, lower, either side: a niche in each, dark, and the cult's banner hung on it
  for (const [x0, x1, s] of [[-82, -46, 1], [46, 82, 2]] as const) {
    F.box(x0, -58, x1, -2, 0, 74, wall, (w, n) => n[1] > 0.5 && Math.abs(w[0] - (x0 + x1) / 2) < 8 && w[2] > 18 && (w[2] < 44 || Math.hypot(w[0] - (x0 + x1) / 2, w[2] - 44) < 8));
    // the niche's dark, and its sill
    F.face([[(x0 + x1) / 2 - 8, -4, 18], [(x0 + x1) / 2 + 8, -4, 18], [(x0 + x1) / 2 + 8, -4, 52], [(x0 + x1) / 2 - 8, -4, 52]], (w) => (w[2] < 44 || Math.hypot(w[0] - (x0 + x1) / 2, w[2] - 44) < 8 ? '#0a0b09' : null));
    F.box(x0 - 2, -60, x1 + 2, 0, 74, 80, plain(T_STONE, 1, 0.1));
    banner(F, x0 + 4, x0 + 13, 8, 66, -2, T_IRON);
    void s;
  }
  // THE TOMB ITSELF, behind the portico
  const DOOR: Arch = { half: 15, spring: 46, shape: 'round' };
  F.box(-46, -66, 46, -6, 0, 112, wall, (w, n) => n[1] > 0.5 && Math.abs(w[0]) < DOOR.half && (w[2] < DOOR.spring || Math.hypot(w[0], w[2] - DOOR.spring) < DOOR.half));
  voussoirs(F, DOOR, -6, 5, T_STONE, T_SEAM, 0, (w) => (w[2] > DOOR.spring + DOOR.half ? T_TRIM[2] : null));
  door(F, DOOR, -6, 6, open, f, { slab: (x, z, n) => (Math.abs(z - 10) < 1.4 || Math.abs(z - 40) < 1.4 ? lit(n, T_IRON, 1) : lit(n, T_SLAB, Math.abs(x) < 0.7 ? -1 : 0)) }, ashlar(T_STONE, T_SEAM, 1104, 11, 24));
  // the steps up to it
  F.box(-40, -6, 40, 6, 0, 3, plain(T_STONE, 0, 0.1));
  F.box(-36, -6, 36, 1, 3, 5, plain(T_STONE, 1, 0.1));
  // THE PORTICO: two columns on their plinths, their capitals touched with the old gold, the entablature on them
  for (const x of [-30, 30]) {
    F.box(x - 6, -2, x + 6, 10, 0, 10, dressed);
    F.column(x, 4, 10, 88, 4.6, T_STONE, 4.2);
    F.box(x - 6.5, -2.5, x + 6.5, 10.5, 88, 94, plain(T_TRIM, 0, 0.1));
  }
  F.box(-40, -6, 40, 12, 94, 108, (w, n) => (n[1] > 0.5 && Math.abs(w[2] - 101) < 1 ? T_SEAM : lit(n, T_STONE, 0, 0.05)));
  // THE PEDIMENT, the king's crown carved in it, gold gone dull; the roof's slopes back from it
  const PZ = 108;
  const PT = 138;
  F.tri([-42, 12, PZ], [42, 12, PZ], [0, 12, PT], (w, n) => {
    const c = crownAt(w[0] / 12, (w[2] - 120) / 12);
    if (c === 'hollow' || c === 'jewel') return T_SEAM;
    if (c) return lit(n, T_TRIM, 1);
    if (Math.abs(w[2] - PZ - 1) < 1 || Math.abs(Math.abs(w[0]) - (42 - (w[2] - PZ) * 42 / (PT - PZ)) - 2) < 1) return T_SEAM;
    return lit(n, T_STONE, 0, 0.05);
  });
  const slope: [V3, V3, V3, V3] = [[0, 12, PT], [42, 12, PZ], [42, -66, PZ], [0, -66, PT]];
  F.face(slope, (w, n) => (Math.floor((w[1] + 66) / 6) % 2 && w[1] > -60 ? lit(n, T_STONE, -1) : lit(n, T_STONE, 0)));
  F.face([[0, 12, PT], [-42, 12, PZ], [-42, -66, PZ], [0, -66, PT]], plain(T_STONE, 0));
  // an urn on its peak, and one at each corner
  for (const [x, z] of [[0, PT + 4], [-40, PZ + 4], [40, PZ + 4]] as const) {
    F.egg([x, 10, z + 1], [3.4, 3.4, 4.2], (n) => lit(n as V3, T_STONE, 1));
    F.box(x - 2.5, 7.5, x + 2.5, 12.5, z - 4, z - 2, plain(T_STONE, 0));
  }
  // THE PINK FIRE either side of the door
  sconce(F, -21, -6, 64, f, T_IRON);
  sconce(F, 21, -6, 64, f, T_IRON);
  // THE ROOTS, out over the roof and down its left, the moss along them
  const roots: [V3, V3, number][] = [
    [[-56, -70, 104], [-48, -44, 116], 4.2],
    [[-48, -44, 116], [-47, -16, 110], 3.6],
    [[-47, -16, 110], [-50, -2, 88], 3],
    [[-50, -2, 88], [-49, 1, 62], 2.4],
    [[-49, 1, 62], [-52, 2, 40], 1.8],
    [[-48, -44, 116], [-26, -36, 126], 2.8],
    [[-26, -36, 126], [-10, -22, 133], 2],
    [[-10, -22, 133], [-2, -8, 136], 1.3],
    [[-47, -16, 110], [-64, -10, 82], 1.8],
    [[-64, -10, 82], [-74, -2, 78], 1.2],
    [[28, -72, 112], [40, -52, 114], 3.4],
    [[40, -52, 114], [58, -40, 84], 2.8],
    [[58, -40, 84], [70, -24, 80], 2],
    [[70, -24, 80], [76, -6, 78], 1.4],
    [[76, -6, 78], [80, 0, 60], 1],
  ];
  const rid = F.id();
  for (const [a, b, r] of roots) F.rod(a, b, r, T_ROOT, r * 0.78, rid);
  // (moss along the roots where they lie on the stone)
  for (const [a, b, r] of roots) if (r > 2) F.rod([a[0], a[1], a[2] + r * 0.7], [b[0], b[1], b[2] + r * 0.7], r * 0.45, T_MOSS, r * 0.3, rid);
  return F.finish();
}

// =================================================================================================
// FLOOR 2, THE HEADSMAN'S YARD: THE PRISON'S GROUNDS AT NIGHT (art/grounds.ts, its own colours)
//
// THE CONDEMNED'S BLOCK taken by the cult: a tall cell block of the grounds' blue-grey stone under a steep slate gable, buttresses
// at its corners, its iron-bound timber door in a round arch, two barred windows above it lit from within as the grounds' are, a
// lower range of cells to its right with its own barred lights, an iron cage hung from a bracket on its left; the cult's banners
// on the buttresses, its pink fire beside the door.

const G_STONE: Ramp = ['#0e0c24', '#1b1c36', '#262850', '#343867', '#4e5886'];
const G_TIMBER: Ramp = ['#120d1a', '#20182a', '#2f2338', '#3f3046', '#53435a'];
const G_IRON: Ramp = ['#0e0c24', '#1a1c32', '#282b46', '#393d5e', '#5c628a'];
const G_SLATE: Ramp = ['#0d0e20', '#16182e', '#1f223e', '#2a2e50', '#404672'];
const G_SEAM = '#0e0c24';
const G_WINDOW = ['#7a3a22', '#a8502a', '#e07a36'] as const;

function blockFront(open: boolean, f: number): Sprite {
  const F = new Front();
  const wall = ashlar(G_STONE, G_SEAM, 1201, 10, 20);
  // THE LOWER RANGE OF CELLS, to the right, its lean-to of slate, three barred lights
  F.box(40, -58, 92, -8, 0, 78, wall);
  F.face([[38, -6, 78], [94, -6, 78], [94, -40, 98], [38, -40, 98]], roofing(G_SLATE, 1202, 0, 5, 7));
  F.face([[94, -6, 78], [94, -60, 78], [94, -60, 98], [94, -40, 98]], (w, n) => (w[2] > 78 + ((w[1] + 6) / -34) * 20 + 0.1 && w[1] > -40 ? null : wall(w, n)));
  for (const x of [52, 68, 84]) {
    window(F, x - 3, x + 3, -8, 46, 60, G_WINDOW[1], false, G_WINDOW[2]);
    bars(F, x - 3, x + 3, -7.6, 46, 60, 2, G_IRON, 0.6);
  }
  // THE CELL BLOCK, tall, its gable to the front
  const DOOR: Arch = { half: 14, spring: 40, shape: 'round' };
  F.box(-40, -72, 40, 0, 0, 122, wall, (w, n) => (n[1] > 0.5 && Math.abs(w[0]) < DOOR.half && (w[2] < DOOR.spring || Math.hypot(w[0], w[2] - DOOR.spring) < DOOR.half)) || (n[1] > 0.5 && Math.abs(Math.abs(w[0]) - 18) < 5 && w[2] > 72 && w[2] < 92));
  voussoirs(F, DOOR, 0, 5, G_STONE, G_SEAM);
  door(F, DOOR, 0, 7, open, f, {
    slab: (x, z, n) => {
      if (Math.abs(z - 9) < 1.6 || Math.abs(z - 34) < 1.6) return Math.abs(x % 8) < 1.2 ? G_IRON[4] : lit(n, G_IRON, 1);
      return Math.abs(x % 7) < 0.8 ? G_TIMBER[0] : lit(n, G_TIMBER, 0);
    },
  }, ashlar(G_STONE, G_SEAM, 1203, 10, 20));
  // its two barred windows above, lit within
  for (const x of [-18, 18]) {
    window(F, x - 5, x + 5, -2, 72, 92, G_WINDOW[1], true, G_WINDOW[2]);
    bars(F, x - 5, x + 5, 0.4, 72, 92, 3.3, G_IRON, 0.7);
    F.box(x - 7, 0, x + 7, 3, 69, 72, plain(G_STONE, 1, 0.1));
  }
  // its gable and steep slate roof
  F.tri([-42, 0.1, 122], [42, 0.1, 122], [0, 0.1, 168], (w, n) => (Math.abs(w[2] - 145) < 6 && Math.abs(w[0]) < 3 ? G_WINDOW[0] : wall(w, n)));
  F.face([[-46, 6, 118], [0, 6, 170], [0, -78, 170], [-46, -78, 118]], roofing(G_SLATE, 1204, 1, 5, 7));
  F.face([[46, 6, 118], [0, 6, 170], [0, -78, 170], [46, -78, 118]], roofing(G_SLATE, 1205, 1, 5, 7));
  F.box(-2, -78, 2, 6, 168, 172, plain(G_IRON, 0));
  // its buttresses, the cult's banners on them
  for (const x of [-48, 40]) {
    F.box(x, -12, x + 8, 8, 0, 96, wall);
    F.face([[x, 8, 96], [x + 8, 8, 96], [x + 8, -12, 108], [x, -12, 108]], plain(G_STONE, 1, 0.1));
    banner(F, x + 0.5, x + 7.5, 22, 84, 8, G_IRON);
  }
  // THE CAGE, hung from an iron bracket on its left
  const cid = F.id();
  F.rod([-48, -30, 104], [-64, -30, 104], 1.1, G_IRON, 1.1, cid);
  F.rod([-64, -30, 104], [-64, -30, 94], 0.6, G_IRON, 0.6, cid);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    F.rod([-64 + Math.cos(a) * 6, -30 + Math.sin(a) * 6, 92], [-64 + Math.cos(a) * 6, -30 + Math.sin(a) * 6, 66], 0.55, G_IRON, 0.55, cid);
  }
  F.egg([-64, -30, 92], [6.5, 6.5, 2.4], (n) => (n[2] > 0.5 ? G_IRON[2] : G_IRON[1]), cid);
  F.egg([-64, -30, 66], [6.5, 6.5, 1.4], () => G_IRON[1], cid);
  // THE PINK FIRE either side of the door
  sconce(F, -24, 0, 54, f, G_IRON);
  sconce(F, 24, 0, 54, f, G_IRON);
  return F.finish();
}

// =================================================================================================
// FLOOR 3, THE CHAINED ONE'S PIT: THE BLACK IRON PRISON, TORCHLIT DARK (art/prison.ts)
//
// THE IRON VAULT taken by the cult: a wall of the prison's black stone with its great door cased in riveted iron under a massive
// lintel, two iron-clad piers either side with the great rings the chains hang from in heavy loops, a grate along its foot glowing
// with the prison's coals; the cult's banners on the piers, its pink fire either side, its mark burning in the iron.

const P_STONE: Ramp = PRISON.STONE as unknown as Ramp;
const P_IRON: Ramp = PRISON.IRON as unknown as Ramp;
const P_RUST: Ramp = [PRISON.RUST[0], PRISON.RUST[0], PRISON.RUST[1], PRISON.RUST[2], PRISON.RUST[2]];
const P_SEAM = '#08080c';
const COALS: Ramp = ['#24100c', '#3a120c', '#7a2a10', '#c0561c', '#ffb070'];

function vaultFront(open: boolean, f: number): Sprite {
  const F = new Front();
  const wall = ashlar(P_STONE, P_SEAM, 1301, 13, 28);
  const iron = plates(P_IRON, 1302, 14, 13, P_RUST);
  const vents = (under: Paint): Paint => (w, n) => {
    // (the prison's coals glowing through slits along its foot)
    if (n[1] > 0.5 && w[2] > 3 && w[2] < 9 && Math.abs(w[0]) > 30 && fr(w[0] / 14) < 0.55) return Math.abs(w[0] % 3.5) < 0.9 ? P_IRON[2] : COALS[2 + ((Math.floor(w[0] / 14) + f) % 3 === 0 ? 1 : 0)];
    return under(w, n);
  };
  // THE BLOCK of the prison's black stone, squat, its foot battered out, its top a heavy coping
  F.box(-78, -54, 78, -8, 0, 92, vents(wall), (w, n) => n[1] > 0.5 && Math.abs(w[0]) < 30 && w[2] < 86);
  F.face([[-80, -6, 0], [80, -6, 0], [80, -8, 14], [-80, -8, 14]], (w, n) => (Math.abs(w[0]) < 30 ? null : lit(n, P_STONE, -1)));
  F.box(-80, -56, 80, -6, 92, 100, plain(P_STONE, 1, 0.05));
  for (const x of [-60, -44, 44, 60]) F.box(x - 3, -10, x + 3, -6, 30, 40, plain(P_IRON, 0));
  // THE DOOR'S BAY, cased in riveted iron, standing out from the block; the door flat-topped; a grille over it
  F.box(-30, -8, 30, 4, 0, 104, iron, (w, n) => n[1] > 0.5 && Math.abs(w[0]) < 18 && w[2] < 64);
  const DOOR: Arch = { half: 18, spring: 64, shape: 'flat' };
  door(F, DOOR, 4, 6, open, f, { slab: (x, z, n) => plates(P_IRON, 1303, 12, 16, P_RUST)([x, 0, z], n) ?? P_IRON[1], markZ: 0.52 }, iron);
  F.box(-32, -9, 32, 6, 104, 112, plain(P_IRON, 1));
  F.face([[-14, 4.1, 72], [14, 4.1, 72], [14, 4.1, 98], [-14, 4.1, 98]], (w) => (Math.abs(w[0] % 4) < 1 || Math.abs((w[2] - 72) % 6) < 1 ? P_IRON[3] : '#060608'));
  // THE PIERS, iron-clad, spiked; a great ring on each, the chain from it sagging in a loop to the bay
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -48 : 36;
    F.box(x0, -12, x0 + 12, 6, 0, 128, iron);
    F.box(x0 - 1, -13, x0 + 13, 7, 128, 132, plain(P_IRON, 1));
    for (const dx of [2, 6, 10]) F.rod([x0 + dx, -3, 132], [x0 + dx, -3, 142], 1.3, P_IRON, 0.1);
    banner(F, x0 + 1.5, x0 + 10.5, 30, 112, 6, P_IRON);
    const rx = x0 + 6;
    const cid = F.id();
    F.egg([rx, 7, 118], [3.8, 1.4, 3.8], (n) => (n[1] > 0.6 ? P_IRON[3] : P_IRON[1]), cid);
    const ex = s * 30;
    for (let k = 0; k < 14; k++) {
      const t0 = k / 14;
      const t1 = (k + 1) / 14;
      const px = (t: number) => rx + (ex - rx) * t;
      const pz = (t: number) => 115 - 30 * Math.sin(t * Math.PI) + (100 - 115) * t;
      F.rod([px(t0), 8, pz(t0)], [px(t1), 8, pz(t1)], k % 2 ? 1.1 : 1.7, P_IRON, k % 2 ? 1.1 : 1.7, cid);
    }
  }
  for (const x of [-52, 52]) F.light([x, -6, 6], 18, COALS[3], 0.28);
  // THE PINK FIRE either side of the door
  sconce(F, -24, 4, 54, f, P_IRON);
  sconce(F, 24, 4, 54, f, P_IRON);
  return F.finish();
}

// =================================================================================================
// FLOOR 4, THE OSSUARY: THE BURIED CHAPEL OF BONES, CANDLELIT (art/chapel.ts)
//
// THE BONE CHAPEL'S PORTAL taken by the cult: a front of the chapel's dark stone faced with skulls and long bones set in rows,
// a pointed arch ringed with skulls, columns of stacked skulls either side, a steep gable of bones with a skull at its peak,
// candles guttering in its niches as the chapel's do; the cult's banners hung either side, its pink fire, its mark in the slab.

const C_STONE: Ramp = CHAPEL.STONE as unknown as Ramp;
const C_BONE: Ramp = CHAPEL.BONE as unknown as Ramp;
const C_SLAB: Ramp = CHAPEL.SLAB as unknown as Ramp;
const C_SEAM = '#0a090d';
const C_WAX = ['#8c7c62', '#c8b694'] as const;
const CANDLE: Ramp = ['#7a3a22', '#c0561c', '#e8a050', '#ffd890', '#fff0c0'];

function boneFront(open: boolean, f: number): Sprite {
  const F = new Front();
  const bones = boneWall(C_BONE, C_SEAM, 1401);
  const stone = ashlar(C_STONE, C_SEAM, 1402, 12, 22);
  // THE FRONT, its dark stone faced with bones above a plinth
  const DOOR: Arch = { half: 15, spring: 46, shape: 'pointed' };
  const inDoor = (w: V3, n: V3): boolean => n[1] > 0.5 && inArch(DOOR, w[0], w[2]);
  F.box(-58, -60, 58, -6, 0, 14, stone, inDoor);
  F.box(-58, -60, 58, -6, 14, 104, where((w) => Math.abs(w[0]) < 50, bones, stone), (w, n) => inDoor(w, n) || (n[1] > 0.5 && Math.abs(Math.abs(w[0]) - 34) < 5 && w[2] > 28 && w[2] < 56));
  // the niches, a candle in each
  for (const x of [-34, 34]) {
    F.face([[x - 5, -9, 28], [x + 5, -9, 28], [x + 5, -9, 56], [x - 5, -9, 56]], (w) => (w[2] < 51 || Math.hypot(w[0] - x, w[2] - 51) < 5 ? '#0c0a0e' : null));
    F.column(x, -7.5, 28, 35, 1.4, [C_WAX[0], C_WAX[0], C_WAX[1], C_WAX[1], C_WAX[1]]);
    F.egg([x, -7.5, 37.5], [0.9, 0.9, 2.2], () => CANDLE[3 + (f % 2)]);
    F.light([x, -6, 38], 14, CANDLE[3], 0.3);
  }
  // the ring of skulls round the arch
  voussoirs(F, DOOR, -6, 6, C_BONE, C_SEAM);
  door(F, DOOR, -6, 6, open, f, { slab: (x, z, n) => (Math.abs(x) < 0.7 ? C_SEAM : lit(n, C_SLAB, z < 6 ? -1 : 0)) }, stone);
  // the gable of bones over it, a skull at its peak
  F.tri([-60, -5.9, 104], [60, -5.9, 104], [0, -5.9, 150], (w, n) => (Math.abs(w[2] - 104.6) < 1 ? C_SEAM : bones(w, n)));
  F.face([[-62, -3, 102], [0, -3, 152], [0, -64, 152], [-62, -64, 102]], roofing(C_STONE, 1403, 1, 6, 9));
  F.face([[62, -3, 102], [0, -3, 152], [0, -64, 152], [62, -64, 102]], roofing(C_STONE, 1404, 1, 6, 9));
  F.egg([0, -3, 156], [5, 4, 5.5], (n) => lit(n as V3, C_BONE, 1));
  F.face([[-2.4, 1.1, 154.5], [2.4, 1.1, 154.5], [2.4, 1.1, 157.5], [-2.4, 1.1, 157.5]], (w) => (Math.abs(Math.abs(w[0]) - 1.3) < 0.9 ? C_SEAM : null));
  // THE COLUMNS OF SKULLS either side, a candle on each
  for (const x of [-48, 48]) {
    F.box(x - 6, -12, x + 6, 0, 0, 8, stone);
    for (let k = 0; k < 9; k++) {
      const z = 12 + k * 8.4;
      F.egg([x, -6, z], [5, 5, 4.4], (n, w) => {
        const fy = w[1] + 6;
        if (n[1] > 0.4 && w[2] > z - 0.4 && w[2] < z + 2 && Math.abs(Math.abs(w[0] - x) - 1.8) < 1.1 && fy > 0) return C_SEAM;
        return lit(n as V3, C_BONE, k % 3 === 1 ? -1 : 0);
      });
    }
    F.column(x, -6, 88, 96, 2, [C_WAX[0], C_WAX[0], C_WAX[1], C_WAX[1], C_WAX[1]]);
    F.egg([x, -6, 99], [1.2, 1.2, 2.8], () => CANDLE[3 + ((f + 1) % 2)]);
    F.light([x, -6, 99], 18, CANDLE[3], 0.32);
    banner(F, x - (x < 0 ? -8 : 15), x - (x < 0 ? -15 : 8), 30, 92, -5.9, C_BONE);
  }
  // THE PINK FIRE either side of the door
  sconce(F, -22, -6, 60, f, CHAPEL_IRON);
  sconce(F, 22, -6, 60, f, CHAPEL_IRON);
  return F.finish();
}
const CHAPEL_IRON: Ramp = ['#0b0a0d', '#17151a', '#242128', '#35313a', '#524c56'];

// =================================================================================================
// FLOOR 5, THE FLESHMANCER'S LAIR: THE MINE THAT BECOMES HIS TEMPLE (art/lair_temple.ts)
//
// THE TEMPLE IN THE ROCK taken by the cult: the mine's raw rock face, a great frame of the mine's timbers propping it, and set in
// it the temple's carved black doorway, its jambs stepped back, a lintel carved with the cult's skull; a miner's lantern hung on
// the frame, a cart's rails running in under the door; the cult's cloth hung from the timbers, its pink fire, its mark burning.

const L_ROCK: Ramp = LAIRT.ROCK as unknown as Ramp;
const L_STONE: Ramp = LAIRT.STONE as unknown as Ramp;
const L_WOOD: Ramp = LAIRT.WOOD as unknown as Ramp;
const L_IRON: Ramp = LAIRT.IRON as unknown as Ramp;
const L_SEAM = '#07060a';
const LANTERN: Ramp = ['#4a2a10', '#8a5018', '#d08a30', '#ffc860', '#fff0b0'];

function mineFront(open: boolean, f: number): Sprite {
  const F = new Front();
  const rock = rubble(L_ROCK, L_SEAM, 1501, 10);
  const black = ashlar(L_STONE, L_SEAM, 1502, 9, 16);
  // THE ROCK FACE, a mass of the mine's rock in heights of its own, broken back at its top
  const top: Paint = (w, n) => lit(n, L_ROCK, hash(Math.floor(w[0] / 6), Math.floor(w[1] / 6), 1504) > 0.6 ? -1 : -2, 0.1);
  // (in narrow columns, each its own height and how far it stands out, the whole highest over the doorway and falling away)
  for (let x0 = -98; x0 < 98; x0 += 7) {
    const x1 = x0 + 7;
    const m = (x0 + x1) / 2;
    const fall = Math.max(0, Math.abs(m) - 30);
    const h = 132 - fall * 0.95 - 14 * hash(Math.floor(x0 / 7), 1, 1505) - 8 * Math.sin(m * 0.11);
    const y1 = -10 - 3 * hash(Math.floor(x0 / 7), 2, 1505) - fall * 0.12;
    F.box(x0, -72, x1, y1, 0, Math.max(30, h), { front: rock, side: rock, top }, (w, n) => (n[1] > 0.5 || n[0] > 0.5) && Math.abs(w[0]) < 33.5 && w[2] < 96);
  }
  // THE TEMPLE'S DOORWAY, its jambs stepped back into the rock, black and carved
  const DOOR: Arch = { half: 14, spring: 58, shape: 'flat' };
  for (let k = 0; k < 3; k++) {
    const hw = 30 - k * 5.5;
    const y = -10 - k * 4;
    F.face([[-hw, y, 0], [hw, y, 0], [hw, y, 90 - k * 7], [-hw, y, 90 - k * 7]], (w, n) => (Math.abs(w[0]) < hw - 5.5 && w[2] < 90 - (k + 1) * 7 ? null : black(w, n)));
    F.face([[-hw + 0.01, y, 0], [-hw + 0.01, y - 4, 0], [-hw + 0.01, y - 4, 90 - k * 7], [-hw + 0.01, y, 90 - k * 7]], black);
  }
  door(F, DOOR, -22, 4, open, f, { slab: (x, z, n) => lit(n, L_STONE, Math.abs(x) < 0.7 ? -1 : 0), markZ: 0.55 }, black);
  sigil(F, 0, 80, 5, -10, plain(L_STONE));
  // THE MINE'S FRAME, its great timbers propping the rock round the doorway
  const wood = planks(L_WOOD, 1503, 4, false);
  for (const x of [-40, 32]) F.box(x, -12, x + 8, -4, 0, 100, wood);
  F.box(-46, -14, 46, -4, 100, 110, wood);
  F.rod([-36, -6, 70], [-24, -6, 96], 2, L_WOOD, 2);
  F.rod([36, -6, 70], [24, -6, 96], 2, L_WOOD, 2);
  // the cult's cloth hung from the cross-timber, either side
  banner(F, -38, -30, 40, 100, -3.6, L_IRON);
  banner(F, 30, 38, 40, 100, -3.6, L_IRON);
  // the miner's lantern on the frame
  F.rod([46, -8, 108], [52, -8, 108], 0.7, L_IRON);
  F.egg([52, -8, 101], [2.6, 2.6, 4], (n) => (Math.abs(n[2]) > 0.7 ? L_IRON[2] : LANTERN[3]));
  F.light([52, -8, 101], 20, LANTERN[3], 0.34);
  // the rails, in under the door
  for (const x of [-7, 7]) F.face([[x - 1, 14, 0.5], [x + 1, 14, 0.5], [x + 1, -22, 0.5], [x - 1, -22, 0.5]], () => L_IRON[3]);
  for (let y = 12; y > -20; y -= 6) F.face([[-11, y, 0.3], [11, y, 0.3], [11, y - 2.4, 0.3], [-11, y - 2.4, 0.3]], () => L_WOOD[1]);
  // THE PINK FIRE either side of the doorway
  sconce(F, -26, -10, 62, f, L_IRON);
  sconce(F, 26, -10, 62, f, L_IRON);
  return F.finish();
}

// =================================================================================================
// FLOOR 7, THE LEDGE ROAD: THE MOUNTAIN ROAD UNDER THE QUEEN'S EYRIE (art/floor7.ts)
//
// THE CLIFF WATCH-FORT taken by the cult: a squat tower of the ledge's grey rock laid rough, its foot battered out against the
// slope, a timber hoarding round its top under a roof of shingles with snow on it, the old road's heavy plank gate in a low arch,
// and on its roof one of the queen's great nests of sticks and drift, bones and dark feathers caught in it; the cult's banners on
// the tower, its pink fire either side of the gate.

const LG_SEAM = '#2a2432';

function ledgeFront(open: boolean, f: number): Sprite {
  const F = new Front();
  const rock = rubble(LEDGE.LROCK, LG_SEAM, 1701, 12);
  const snowTop: Paint = (w, n) => lit(n, LEDGE.SNOWY, hash(Math.floor(w[0] / 5), Math.floor(w[1] / 5), 1702) > 0.75 ? -1 : 0);
  // THE CURTAIN WALL either side, low, snow along its top
  F.box(-96, -44, -40, -10, 0, 64, { front: rock, side: rock, top: snowTop });
  F.box(40, -44, 96, -10, 0, 56, { front: rock, side: rock, top: snowTop });
  // THE TOWER, its foot battered out
  const DOOR: Arch = { half: 16, spring: 40, shape: 'segment' };
  F.box(-42, -66, 42, -4, 0, 118, rock, (w, n) => n[1] > 0.5 && inArch(DOOR, w[0], w[2]));
  F.face([[-46, 2, 0], [46, 2, 0], [42, -4, 22], [-42, -4, 22]], (w, n) => (inArch(DOOR, w[0], w[2] + 2) ? null : rock(w, n)));
  voussoirs(F, DOOR, -4, 5, LEDGE.LROCK, LG_SEAM);
  door(F, DOOR, -4, 6, open, f, { slab: (x, z, n) => (Math.abs(z - 8) < 1.5 || Math.abs(z - 30) < 1.5 ? lit(n, IRON_Q, 1) : planks(Q_TIMBER, 1703, 6)([x, 0, z], n) ?? Q_TIMBER[2]) }, rock);
  // its arrow slits
  for (const x of [-26, 26]) F.face([[x - 1.2, -3.9, 66], [x + 1.2, -3.9, 66], [x + 1.2, -3.9, 84], [x - 1.2, -3.9, 84]], () => '#120e18');
  // THE HOARDING, timber, round its top, standing out on its beams; its shingled roof, snow on it
  for (const x of [-40, -20, 0, 20, 40]) F.box(x - 2, -4, x + 2, 6, 112, 116, plain(Q_TIMBER, 0));
  F.box(-48, -72, 48, 6, 116, 136, planks(Q_TIMBER, 1704, 5), (w, n) => n[1] > 0.5 && w[2] > 124 && w[2] < 130 && fr(w[0] / 16) < 0.25);
  F.face([[-52, 10, 136], [52, 10, 136], [52, -30, 160], [-52, -30, 160]], (w, n) => (w[1] > 4 + Math.sin(w[0] * 0.4) * 2 ? lit(n, LEDGE.SNOWY, 0) : roofing(LEDGE.STICK, 1705, 0, 4, 6)(w, n)));
  F.face([[52, 10, 136], [52, -76, 136], [52, -76, 160], [52, -30, 160]], (w, n) => (w[2] > 136 + Math.max(0, (w[1] - 10) / -40) * 24 + 0.1 ? null : planks(Q_TIMBER, 1706, 5)(w, n)));
  F.face([[-52, -30, 160], [52, -30, 160], [52, -76, 160], [-52, -76, 160]], (w, n) => lit(n, LEDGE.SNOWY, -1));
  // THE QUEEN'S NEST on its roof: a great ring of sticks and drift, bones and dark feathers in it
  const nid = F.id();
  for (let k = 0; k < 26; k++) {
    const a0 = hash(k, 1, 1707) * Math.PI * 2;
    const r0 = 16 + hash(k, 2, 1707) * 6;
    const a1 = a0 + 0.6 + hash(k, 3, 1707) * 0.7;
    const r1 = 14 + hash(k, 4, 1707) * 8;
    const z = 162 + hash(k, 5, 1707) * 7;
    F.rod([10 + Math.cos(a0) * r0, -40 + Math.sin(a0) * r0 * 0.9, z], [10 + Math.cos(a1) * r1, -40 + Math.sin(a1) * r1 * 0.9, z + 2], 1.4, k % 4 === 0 ? LEDGE.DRIFT : LEDGE.STICK, 1.1, nid);
  }
  F.rod([0, -24, 168], [10, -20, 171], 1.6, LEDGE.BONE, 1.2);
  F.rod([20, -26, 167], [26, -34, 170], 1.4, LEDGE.BONE, 1);
  for (const [x, y] of [[-4, -30], [24, -22], [6, -56]] as const) F.egg([x, y, 170], [4, 1.4, 1.6], (n) => lit(n as V3, LEDGE.FEATHER, 0));
  // the cult's banners on the tower, its pink fire either side of the gate
  banner(F, -38, -29, 40, 104, -4, IRON_Q);
  banner(F, 29, 38, 40, 104, -4, IRON_Q);
  sconce(F, -22, -4, 54, f, IRON_Q);
  sconce(F, 22, -4, 54, f, IRON_Q);
  return F.finish();
}
const IRON_Q: Ramp = ['#24222e', '#353342', '#4e4c5e', '#727083', '#9a98aa'];

// =================================================================================================
// FLOOR 9, THE PINEWOOD: THE HOLLOW WOOD (art/floor9.ts)
//
// THE STOCKADE GATE taken by the cult: a palisade of the wood's own pines, each trunk sharpened, on a foot of the wood's granite;
// a log tower either side with a roof of bark and needles; the gate of split logs between, a walk of planks over it; moss up the
// palisade's foot; the cult's banners on the towers, its pink fire either side of the gate, its mark burning in the logs.


function stockadeFront(open: boolean, f: number): Sprite {
  const F = new Front();
  const granite = rubble(PINEWOOD.GRANITE, '#26281f', 1901, 9);
  // THE PALISADE either side: trunks side by side, sharpened, on their granite foot
  F.box(-98, -26, 98, -8, 0, 10, granite, (_w, n) => n[1] > 0.5 && false);
  for (let x = -94; x <= 94; x += 6.4) {
    if (Math.abs(x) < 46) continue;
    const h = 92 + hash(Math.floor(x), 1, 1902) * 10;
    F.column(x, -14, 8, h, 3.1, PINEWOOD.PBARK, 3);
    F.rod([x, -14, h], [x, -14, h + 7], 3, PINEWOOD.PBARK, 0.2);
    F.rod([x, -10.5, 10], [x, -10.5, 10 + 10 * hash(Math.floor(x), 2, 1902)], 1.6, PINEWOOD.MOSS, 1);
  }
  // THE TOWERS, of logs laid crosswise, their bark roofs
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -46 : 22;
    F.box(x0, -40, x0 + 24, -2, 0, 124, logs(PINEWOOD.PBARK, 1903 + s, 7), (w, n) => n[1] > 0.5 && Math.abs(w[0] - (x0 + 12)) < 2 && w[2] > 86 && w[2] < 104);
    F.face([[x0 + 10.8, -1.9, 86], [x0 + 13.2, -1.9, 86], [x0 + 13.2, -1.9, 104], [x0 + 10.8, -1.9, 104]], () => '#0e120c');
    F.face([[x0 - 4, 4, 124], [x0 + 28, 4, 124], [x0 + 12, -20, 146], [x0 + 12, -20, 146]], roofing(PINEWOOD.NEEDLES, 1905 + s, 0, 4, 5));
    F.face([[x0 + 28, 4, 124], [x0 + 28, -44, 124], [x0 + 12, -20, 146], [x0 + 12, -20, 146]], roofing(PINEWOOD.PBARK, 1907 + s, 1, 4, 5));
    banner(F, x0 + 7, x0 + 17, 40, 112, -2, IRON_Q);
  }
  // THE GATE between them, split logs upright, its walk of planks over it on two beams
  const DOOR: Arch = { half: 22, spring: 76, shape: 'flat' };
  door(F, DOOR, -6, 2, open, f, { slab: (x, z, n) => logs(PINEWOOD.PBARK, 1909, 6.2, true)([x, 0, z], n) ?? PINEWOOD.PBARK[2], markZ: 0.55, markW: 0.55 }, plain(PINEWOOD.PBARK, -1));
  F.box(-22, -12, 22, -4, 76, 82, planks(Q_TIMBER, 1910, 5, false));
  for (let x = -21; x <= 21; x += 6) F.rod([x, -6, 82], [x, -6, 94], 1, Q_TIMBER, 1);
  F.rod([-22, -6, 93], [22, -6, 93], 1, Q_TIMBER, 1);
  // THE PINK FIRE on the towers' fronts by the gate
  sconce(F, -26, -2, 60, f, IRON_Q);
  sconce(F, 26, -2, 60, f, IRON_Q);
  return F.finish();
}

// =================================================================================================
// FLOOR 10, THE SUNKEN FEN: THE DROWNED EYE (art/floor10.ts)
//
// THE DROWNED SHRINE taken by the cult: an old shrine of the fen's grey ruin-stone half sunk in the mire and leaning, its arch's
// stones slipped, a broken pillar either side, propped with the fen's dead wood; hanging moss trailing from everything, the
// mire's dark water lapping round its foot; the cult's cloth hung from its props, its pink fire, its mark burning in the slab.

const FEN_SEAM = '#1c1a20';
const MIRE: Ramp = ['#0c1410', '#122019', '#1a2c22', '#26402e', '#36543c'];

function shrineFront(open: boolean, f: number): Sprite {
  const F = new Front();
  const ruin = creeping(ashlar(FEN.RUIN, FEN_SEAM, 2001, 11, 20), FEN.HANGMOSS, 20, 2002);
  const sunk = (z: number, x: number): number => 6 + 4 * Math.sin(x * 0.09);
  // THE SHRINE, sunk in the mire, the front leaning a little out of true
  const DOOR: Arch = { half: 15, spring: 44, shape: 'round' };
  // (its walls whole to their cornice; its roof of stone slabs, moss along their foot)
  F.box(-50, -64, 50, -6, 0, 94, ruin, (w, n) => n[1] > 0.5 && inArch(DOOR, w[0], w[2]));
  F.box(-53, -67, 53, -3, 94, 101, plain(FEN.RUIN, 1, 0.05), (w) => w[0] > 26 && w[0] < 44 && w[1] > -8);
  const slab = creeping(roofing(FEN.RUIN, 2006, 0, 7, 12), FEN.HANGMOSS, 6, 2007);
  F.face([[-53, -3, 101], [53, -3, 101], [53, -35, 130], [-53, -35, 130]], slab);
  F.face([[53, -3, 101], [53, -67, 101], [53, -35, 130], [53, -35, 130]], (w, n) => ruin(w, n));
  const topOf = (x: number): number => (x > 22 && x < 46 ? 98 : 100);
  voussoirs(F, DOOR, -6, 6, FEN.RUIN, FEN_SEAM);
  door(F, DOOR, -6, 6, open, f, { slab: (x, z, n) => (Math.abs(z - 22) < 0.8 ? FEN_SEAM : lit(n, FEN.RUIN, Math.abs(x) < 0.6 ? -1 : -1)) }, ruin);
  // its broken pillars, one either side
  F.column(-38, 8, 0, 76, 5, FEN.RUIN, 4.6);
  F.box(-44, 2, -32, 14, 76, 82, plain(FEN.RUIN, 0));
  F.column(38, 8, 0, 52, 5, FEN.RUIN, 4.8);
  F.rod([38, 8, 52], [41, 9, 56], 4.6, FEN.RUIN, 3);
  // THE PROPS of the fen's dead wood, leaning against it
  F.rod([-62, 14, 0], [-46, -6, 96], 2.8, FEN.DEADWOOD, 2);
  F.rod([64, 12, 0], [48, -6, 86], 2.6, FEN.DEADWOOD, 1.8);
  F.rod([48, -6, 86], [56, -10, 104], 1.4, FEN.DEADWOOD, 0.6);
  // the cult's cloth hung from them
  banner(F, -56, -48, 30, 84, 4, FEN.DEADWOOD);
  banner(F, 48, 56, 26, 76, 4, FEN.DEADWOOD);
  // HANGING MOSS trailing from its top and the props
  const mid = F.id();
  for (let k = 0; k < 18; k++) {
    const x = -48 + k * 5.6 + hash(k, 1, 2003) * 3;
    const top = topOf(x) - 2;
    const len = 10 + hash(k, 2, 2003) * 26;
    F.rod([x, -5, top], [x + hash(k, 3, 2003) * 2 - 1, -4.5, top - len], 1.2, FEN.HANGMOSS, 0.4, mid);
  }
  // THE MIRE about its foot, its dark water lapping, the slab of the doorway's sill just above it
  F.face([[-80, 30, 0.5], [80, 30, 0.5], [80, -6, 0.5], [-80, -6, 0.5]], (w) => {
    const d = Math.hypot(w[0] / 80, (w[1] - 10) / 22);
    if (d > 1 + 0.08 * Math.sin(w[0] * 0.3)) return null;
    if (Math.abs(w[0]) < 15 && w[1] < 6) return null;
    return MIRE[fr(w[0] * 0.07 + w[1] * 0.21) < 0.08 ? 3 : d > 0.85 ? 1 : 2];
  });
  void sunk;
  // THE PINK FIRE either side of the door
  sconce(F, -22, -6, 58, f, IRON_Q);
  sconce(F, 22, -6, 58, f, IRON_Q);
  return F.finish();
}

// =================================================================================================
// TIMBER FRAMING: oak posts, rails and braces over the panels of plaster between them (the Gate Ward's houses, the mill)

function framed(plasterOf: Paint, oak: Ramp, every = 16, rail = 0.5, z0 = 0, z1 = 100): Paint {
  return (w, n) => {
    const a = along(w, n);
    const u = a - Math.floor(a / every) * every;
    const z = w[2];
    const t = (z - z0) / (z1 - z0);
    if (u < 2.4) return lit(n, oak, u < 1 ? 1 : 0);
    if (Math.abs(t - rail) * (z1 - z0) < 1.4 || t < 0.04 || t > 0.96) return lit(n, oak, 0);
    // (a brace across a panel now and then, down from its post)
    const panel = Math.floor(a / every);
    if (hash(panel, 3, 77) > 0.55 && t > rail) {
      const d = (u - 2.4) / (every - 2.4) - (t - rail) / (1 - rail);
      if (Math.abs(d) < 0.09) return lit(n, oak, -1);
    }
    return plasterOf(w, n);
  };
}

// =================================================================================================
// FLOOR 11, THE GATE WARD: THE CRIER'S SQUARE (art/gateward.ts, its own colours)
//
// THE WATCH-HOUSE taken by the cult: a ground floor of the ward's stone, a jettied upper floor of oak framing and cream plaster
// with its windows lit, a steep roof of the ward's clay tiles, a round stair turret of stone on its left under a cone of slate;
// the cult's banners either side of its door, its pink fire, its mark burning in the oak.

const GW_STONE5: Ramp = ['#2a2637', '#433e51', '#695d5b', '#857567', '#ae9a88'];
const GW_OAK5: Ramp = ['#1e161c', '#2c2025', '#3a2823', '#47302a', '#5c3f33'];
const GW_CREAM: Ramp = ['#5e5044', '#857462', '#a8927a', '#c4ad8c', '#d6c2a2'];
const GW_CLAY5: Ramp = ['#371f26', '#53292b', '#6d3833', '#874a3c', '#9f5c47'];
const GW_SLATE5: Ramp = ['#141923', '#1e2634', '#293346', '#354158', '#47536b'];
const GW_LAMP = '#f0c070';

function watchFront(open: boolean, f: number): Sprite {
  const F = new Front();
  const stone = ashlar(GW_STONE5, '#2a2637', 2101, 9, 18);
  const upper = framed(plaster(GW_CREAM, 2102), GW_OAK5, 15, 0.55, 64, 112);
  // THE TURRET on its left, round, its cone of slate
  tower(F, -54, -30, 15, 0, 140, ashlar(GW_STONE5, '#2a2637', 2103, 9, 14), roofing(GW_SLATE5, 2104, 0, 4, 5), 178, 14, 4);
  for (const z of [56, 96]) F.face([[-45, -20, z], [-43, -18, z], [-43, -18, z + 10], [-45, -20, z + 10]], () => '#120e16');
  // THE GROUND FLOOR of stone
  const DOOR: Arch = { half: 13, spring: 36, shape: 'round' };
  F.box(-40, -60, 40, -6, 0, 62, stone, (w, n) => n[1] > 0.5 && inArch(DOOR, w[0], w[2]));
  voussoirs(F, DOOR, -6, 4, GW_STONE5, '#2a2637');
  door(F, DOOR, -6, 5, open, f, { slab: (x, z, n) => (Math.abs(z - 12) < 1.4 || Math.abs(z - 32) < 1.4 ? lit(n, IRON_Q, 1) : planks(GW_OAK5, 2105, 6)([x, 0, z], n) ?? GW_OAK5[2]) }, stone);
  // THE UPPER FLOOR, jettied out over it on its beams' ends: oak framing and plaster, two windows lit
  for (let x = -38; x <= 38; x += 12.6) F.box(x - 1.6, -6, x + 1.6, 2, 58, 62, plain(GW_OAK5, 0));
  F.box(-46, -66, 46, 2, 62, 112, upper, (w, n) => n[1] > 0.5 && Math.abs(Math.abs(w[0]) - 20) < 6 && w[2] > 76 && w[2] < 98);
  for (const x of [-20, 20]) {
    window(F, x - 6, x + 6, 1, 76, 98, GW_LAMP, false, GW_LAMP);
    F.face([[x - 6, 2.1, 76], [x + 6, 2.1, 76], [x + 6, 2.1, 98], [x - 6, 2.1, 98]], (w) => (Math.abs(w[0] - x) < 0.6 || Math.abs(w[2] - 87) < 0.6 ? GW_OAK5[1] : null));
    F.box(x - 8, 2, x + 8, 4, 73, 76, plain(GW_OAK5, 0));
  }
  // its steep roof of clay tiles, its gable to the right
  F.face([[-50, 8, 110], [50, 8, 110], [50, -32, 152], [-50, -32, 152]], roofing(GW_CLAY5, 2106, 0, 5, 6));
  F.face([[50, 8, 110], [50, -72, 110], [50, -72, 110], [50, -32, 152]], framed(plaster(GW_CREAM, 2107), GW_OAK5, 15, 0.5, 110, 152));
  F.box(-50, -34, 50, -30, 150, 154, plain(GW_CLAY5, 1));
  F.box(18, -38, 28, -26, 140, 170, brick(GW_CLAY5, '#2a1a1e', 2108, 4, 8));
  // the cult's banners either side of the door, its pink fire
  banner(F, -34, -24, 6, 54, -6, IRON_Q);
  banner(F, 24, 34, 6, 54, -6, IRON_Q);
  sconce(F, -19, -6, 44, f, IRON_Q);
  sconce(F, 19, -6, 44, f, IRON_Q);
  return F.finish();
}

// =================================================================================================
// FLOOR 12, THE UNDERCITY: THE KING'S CISTERN (art/floor12.ts, art/undercity.ts)
//
// THE SLUICE-HOUSE taken by the cult: a vaulted front of the cistern's brick, its culvert's low wide arch with the door sealed in
// it, an iron sluice-frame over it, a stone coping slimed and dripping, rusted pipes out of the wall either side, a channel of
// the cistern's green water along its foot with a slab across it to the door; the cult's banners, its pink fire.


function sluiceFront(open: boolean, f: number): Sprite {
  const F = new Front();
  const wall = creeping(brick(UNDER.SBRICK, '#1c1a26', 2201, 5, 12), UNDER.SLIME, 22, 2202);
  const drip = (under: Paint): Paint => (w, n) => {
    // (slime run down from the coping in streaks)
    const a = along(w, n);
    const k = Math.floor(a / 5);
    const len = 8 + hash(k, 1, 2203) * 34;
    if (hash(k, 2, 2203) > 0.6 && w[2] > 96 - len && fr(a / 5) < 0.4) return lit(n, UNDER.SLIME, w[2] > 96 - len * 0.4 ? 0 : -1);
    return under(w, n);
  };
  // THE VAULTED FRONT, its coping
  const DOOR: Arch = { half: 20, spring: 30, shape: 'segment' };
  F.box(-66, -54, 66, -6, 0, 96, drip(wall), (w, n) => n[1] > 0.5 && inArch(DOOR, w[0], w[2]));
  F.box(-68, -56, 68, -4, 96, 104, { front: plain(UNDER.WSTONE, 1, 0.05), side: plain(UNDER.WSTONE, 0), top: (w, n) => lit(n, UNDER.WSTONE, hash(Math.floor(w[0] / 5), Math.floor(w[1] / 5), 2205) > 0.7 ? -3 : -2) });
  voussoirs(F, DOOR, -6, 6, UNDER.SBRICK, '#1c1a26');
  door(F, DOOR, -6, 6, open, f, { slab: (x, z, n) => plates(UNDER.WSTONE, 2204, 14, 12, UNDER.RUST)([x, 0, z], n) ?? UNDER.WSTONE[1], markZ: 0.5 }, wall);
  // THE SLUICE-FRAME over it: two iron rails up to a beam, its screw
  for (const x of [-16, 16]) F.rod([x, -3, 48], [x, -3, 92], 1.4, IRON_Q);
  F.box(-20, -6, 20, -1, 88, 94, plain(UNDER.RUST, 0));
  F.rod([0, -3, 60], [0, -3, 100], 1, IRON_Q);
  F.box(-4, -5, 4, -1, 58, 62, plain(IRON_Q, 1));
  // THE PIPES either side, rusted, dripping
  for (const s of [-1, 1]) {
    const x = s * 48;
    F.rod([x, -6, 64], [x, 6, 64], 3, UNDER.RUST, 3);
    F.rod([x, 6, 64], [x, 8, 58], 2.6, UNDER.RUST, 2.6);
    F.ball([x, 8.4, 56], 1, UNDER.GWATER, 0.3);
  }
  // THE CHANNEL along its foot, its water green and still; a slab across it to the door
  F.face([[-70, 16, 0.4], [70, 16, 0.4], [70, 2, 0.4], [-70, 2, 0.4]], (w) => (Math.abs(w[0]) < DOOR.half + 2 ? (fr(w[1] / 7) < 0.12 ? UNDER.WSTONE[0] : UNDER.WSTONE[2]) : UNDER.GWATER[fr(w[0] * 0.05 + w[1] * 0.3) < 0.1 ? 3 : 1]));
  F.box(-70, 0, 70, 2, 0, 3, (w, n) => (Math.abs(w[0]) < DOOR.half + 2 ? null : lit(n, UNDER.WSTONE, 0)));
  // the cult's banners and its pink fire
  banner(F, -46, -36, 18, 86, -6, IRON_Q);
  banner(F, 36, 46, 18, 86, -6, IRON_Q);
  sconce(F, -30, -6, 50, f, IRON_Q);
  sconce(F, 30, -6, 50, f, IRON_Q);
  return F.finish();
}

// =================================================================================================
// FLOOR 13, THE MILLRACE: THE PULPING FLOOR (art/floor13.ts)
//
// THE MILL-HOUSE taken by the cult: a ground floor of the fields' stone, an upper floor of timber framing and limewash, a slate
// roof, a hoist-beam out over its door with a sack on its rope, and on its right its great water-wheel turning in the race; the
// cult's banners either side of the door, its pink fire, its mark burning in the planks.


function millFront(open: boolean, f: number): Sprite {
  const F = new Front();
  const fieldstone = rubble(MILL.FIELDSTONE, '#26221e', 2301, 9);
  const upper = framed(plaster(MILL.LIME, 2302), MILL.TIMBER, 14, 0.5, 56, 102);
  // THE GROUND FLOOR, fieldstone
  const DOOR: Arch = { half: 14, spring: 44, shape: 'flat' };
  F.box(-54, -62, 44, -6, 0, 56, fieldstone, (w, n) => n[1] > 0.5 && inArch(DOOR, w[0], w[2]));
  F.box(-18, -8, 18, -4, 44, 50, plain(MILL.TIMBER, 0));
  door(F, DOOR, -6, 4, open, f, { slab: (x, z, n) => planks(MILL.TIMBER, 2303, 6)([x, 0, z], n) ?? MILL.TIMBER[2] }, fieldstone);
  // THE UPPER FLOOR, framed, its loft door over the door
  F.box(-56, -64, 46, -4, 56, 102, upper, (w, n) => n[1] > 0.5 && Math.abs(w[0]) < 9 && w[2] > 64 && w[2] < 94);
  F.face([[-9, -6, 64], [9, -6, 64], [9, -6, 94], [-9, -6, 94]], () => '#16120e');
  F.face([[9, -6, 64], [9, 4, 64], [9, 4, 94], [9, -6, 94]], planks(MILL.TIMBER, 2304, 5));
  // its slate roof, its gable to the right; the hoist-beam out over the loft door, its pulley, its sack
  F.face([[-60, 2, 100], [50, 2, 100], [50, -34, 138], [-60, -34, 138]], roofing(MILL.SLATE, 2305, 0, 5, 7));
  F.face([[50, 2, 100], [50, -70, 100], [50, -70, 100], [50, -34, 138]], framed(plaster(MILL.LIME, 2306), MILL.TIMBER, 14, 0.5, 100, 138));
  F.box(-3, -20, 3, 18, 104, 110, plain(MILL.TIMBER, 0));
  F.ball([0, 16, 102], 2.4, MILL.TIMBER, 0.2);
  F.rod([0, 16, 100], [0, 16, 74], 0.5, MILL.RAG);
  F.egg([0, 16, 68], [4.6, 4, 6.4], (n) => lit(n as V3, MILL.RAG, 0));
  // THE WATER-WHEEL on its right, in the race
  wheel(F, 48, -32, 36, 32, MILL.TIMBER, 8, 7);
  F.face([[46, 16, 0.6], [60, 16, 0.6], [60, -80, 0.6], [46, -80, 0.6]], (w) => (fr(w[1] * 0.12 + w[0] * 0.05 + f * 0.25) < 0.14 ? MILL.FOAM[2] : MILL.RACE[w[1] > -40 && w[1] < -24 ? 3 : 2]));
  // the cult's banners, its pink fire
  banner(F, -42, -32, 8, 48, -6, IRON_Q);
  banner(F, 24, 34, 8, 48, -6, IRON_Q);
  sconce(F, -22, -6, 40, f, IRON_Q);
  sconce(F, 22, -6, 40, f, IRON_Q);
  return F.finish();
}

// =================================================================================================
// FLOOR 14, THE HOUSE OF QUIET: THE PHYSICIAN'S THEATRE (art/floor14.ts, art/housequiet.ts)
//
// THE HOSPICE'S DOOR taken by the cult: walls of the house's pale green-white limewash over a dado of boards in the infirmary's
// green, a porch of two marble pillars under a flat canopy, marble steps, its mahogany double doors in a round arch, a lunette over
// them faintly lit by the house's lamps; the cult's banners on the walls either side, its pink fire, its mark burning on the doors.

const HQ_WASH5: Ramp = ['#474d46', '#767c6c', '#949a88', '#b2b7a4', '#c2c6b4'];

function hospiceFront(open: boolean, f: number): Sprite {
  const F = new Front();
  const wash = plaster(HQ_WASH5, 2401);
  const dado: Paint = (w, n) => (w[2] > 30 ? wash(w, n) : w[2] > 28 ? lit(n, CASTI, 1) : planks(QUIET.GREENPAINT, 2402, 4)(w, n));
  const DOOR: Arch = { half: 13, spring: 46, shape: 'round' };
  F.box(-62, -58, 62, -6, 0, 108, dado, (w, n) => n[1] > 0.5 && inArch(DOOR, w[0], w[2]));
  F.box(-64, -60, 64, -4, 108, 114, { front: plain(QUIET.MARBLE, 1, 0.05), side: plain(QUIET.MARBLE, 0), top: plain(QUIET.MARBLE, -1) });
  // its parapet, a slate roof rising behind it
  F.box(-64, -10, 64, -4, 114, 124, { front: plain(QUIET.MARBLE, 0, 0.05), side: plain(QUIET.MARBLE, 0), top: plain(QUIET.MARBLE, 1) });
  F.face([[-64, -10, 118], [64, -10, 118], [64, -34, 140], [-64, -34, 140]], roofing(MILL.SLATE, 2403, 0, 5, 7));
  F.face([[64, -10, 118], [64, -60, 118], [64, -34, 140], [64, -34, 140]], plain(HQ_WASH5, -1));
  voussoirs(F, DOOR, -6, 4, QUIET.MARBLE, '#3a3c36');
  door(F, DOOR, -6, 4, open, f, { slab: (x, z, n) => (Math.abs(x) < 0.7 ? QUIET.MAHOGANY[0] : (Math.abs(fr(z / 14) - 0.5) > 0.44 || Math.abs(Math.abs(x) - 6.5) > 5.2) ? lit(n, QUIET.MAHOGANY, 1) : lit(n, QUIET.MAHOGANY, 0)) }, wash);
  // the lunette over the door, faintly lit within
  F.face([[-10, -5.9, 72], [10, -5.9, 72], [10, -5.9, 82], [-10, -5.9, 82]], (w) => (Math.hypot(w[0], w[2] - 72) < 10 ? (Math.abs(w[0] % 5) < 0.7 || Math.hypot(w[0], w[2] - 72) > 9 ? QUIET.MAHOGANY[1] : QUIET.LAMPLIT[1]) : null));
  F.light([0, -4, 76], 14, QUIET.LAMPLIT[2], 0.2);
  // its windows either side, shuttered dark
  for (const x of [-48, 48]) {
    window(F, x - 5, x + 5, -6, 50, 82, '#1a1e18', true);
    F.box(x - 7, -6, x + 7, -2, 46, 50, plain(QUIET.MARBLE, 1, 0.1));
  }
  // THE PORCH: two pillars, a flat canopy, the steps
  for (const x of [-34, 34]) {
    F.box(x - 3, 0, x + 3, 6, 6, 72, plain(QUIET.MARBLE, 0, 0.05));
    F.box(x - 4, -1, x + 4, 7, 6, 10, plain(QUIET.MARBLE, 1, 0.05));
  }
  F.box(-40, -6, 40, 8, 72, 77, plain(QUIET.MARBLE, 1, 0.05));
  F.box(-42, -6, 42, 10, 77, 81, plain(QUIET.MARBLE, 0, 0.05));
  F.box(-40, -6, 40, 12, 0, 3, plain(QUIET.MARBLE, 0, 0.1));
  F.box(-38, -6, 38, 7, 3, 6, plain(QUIET.MARBLE, 1, 0.1));
  // the cult's banners on the walls, its pink fire in the porch
  banner(F, -61, -55, 34, 98, -6, IRON_Q);
  banner(F, 55, 61, 34, 98, -6, IRON_Q);
  sconce(F, -22, -6, 54, f, IRON_Q);
  sconce(F, 22, -6, 54, f, IRON_Q);
  return F.finish();
}
const CASTI: Ramp = ['#121316', '#1d1f23', '#2a2d32', '#3a3e44', '#50555c'];

// =================================================================================================
// FLOOR 15, THE GREAT LIBRARY: THE READING ROOM (art/floor15.ts, art/library.ts)
//
// THE LIBRARY'S GREAT DOOR taken by the cult: a wall of the library's shelves to the ceiling either side, walnut pilasters between
// them, a carved cornice touched with gilt, its tall walnut double doors in a round arch with an open book carved over it (the
// cult's mark painted across its pages), a ladder against the shelves; the cult's banners hung from the cornice, its pink fire.

const LB_LEATHERS: readonly Ramp[] = [
  ['#2e1612', '#46211d', '#622e27', '#7c3d33', '#94503e'],
  ['#1c2618', '#2d3926', '#3f4e34', '#536444', '#667a52'],
  ['#1a2030', '#262e40', '#343f57', '#45526e', '#5a6884'],
  ['#3a2c1e', '#5c482f', '#7e6242', '#9c7c54', '#b8986a'],
  ['#141113', '#1e1a1c', '#2c2729', '#3e383a', '#524a4c'],
  ['#5e5644', '#887b5c', '#aa9c78', '#c4b690', '#d8cca8'],
  ['#2a3036', '#3a4148', '#4c555e', '#5f6973', '#76808a'],
  ['#221c28', '#312a38', '#433a4c', '#55495f', '#6a5c76'],
];
const LB_GILT5: Ramp = ['#3a2e18', '#5e4d2b', '#8c733f', '#b39552', '#d0b46c'];

function libraryFront(open: boolean, f: number): Sprite {
  const F = new Front();
  const shelves = books(LB_LEATHERS, LIBRARY.WALNUT, '#140e0a', LB_GILT5[2], 2501, 15);
  const walnut = planks(LIBRARY.WALNUT, 2502, 8);
  const DOOR: Arch = { half: 16, spring: 60, shape: 'round' };
  // THE WALL OF SHELVES, either side of the door's bay; the door's bay of panelled walnut
  F.box(-72, -40, 72, -10, 0, 136, (w, n) => (Math.abs(w[0]) < 30 || fr((w[0] + 72) / 21) < 0.14 || w[2] < 6 ? walnut(w, n) : shelves(w, n)), (w, n) => n[1] > 0.5 && inArch(DOOR, w[0], w[2]));
  for (const x of [-30, 30, -72, 72]) F.box(x - 3, -12, x + 3, -6, 0, 136, plain(LIBRARY.WALNUT, 1));
  // the cornice, carved, gilt along it
  F.box(-76, -44, 76, -4, 136, 142, { front: plain(LIBRARY.WALNUT, 1), side: plain(LIBRARY.WALNUT, 0), top: plain(LIBRARY.WALNUT, -1) });
  F.box(-78, -46, 78, -2, 142, 146, { front: (w, n) => (fr(w[0] / 6) < 0.3 ? lit(n, LB_GILT5, 0) : lit(n, LIBRARY.WALNUT, 1)), side: plain(LIBRARY.WALNUT, 0), top: plain(LIBRARY.WALNUT, -2) });
  voussoirs(F, DOOR, -10, 5, LIBRARY.WALNUT, '#140e0a', 0, (w, n) => lit(n, LB_GILT5, 0));
  door(F, DOOR, -10, 4, open, f, { slab: (x, z, n) => (Math.abs(x) < 0.7 ? LIBRARY.WALNUT[0] : Math.abs(fr(z / 18) - 0.5) > 0.42 || Math.abs(Math.abs(x) - 8) > 6 ? lit(n, LIBRARY.WALNUT, 1) : lit(n, LIBRARY.WALNUT, 0)) }, walnut);
  // THE OPEN BOOK carved over it, the cult's mark across its pages
  F.face([[-20, -9.9, 104], [20, -9.9, 104], [20, -9.9, 126], [-20, -9.9, 126]], (w, n) => {
    const x = w[0];
    const z = w[2] - 104 - Math.abs(x) * 0.16;
    if (z < 0 || z > 18) return null;
    const m = shriekAt(x / 7.5, (w[2] - 116) / 7.5);
    if (m === 'bone') return CULT_PAINT;
    if (m === 'dark') return LIBRARY.PAGES[0];
    if (Math.abs(x) < 0.8) return LIBRARY.WALNUT[0];
    return lit(n, LIBRARY.PAGES, fr(z / 3) < 0.15 ? -1 : 0);
  });
  // a ladder against the shelves on the left
  const lid = F.id();
  F.rod([-62, -6, 0], [-54, -8, 120], 1.3, LIBRARY.WALNUT, 1.3, lid);
  F.rod([-50, -6, 0], [-42, -8, 120], 1.3, LIBRARY.WALNUT, 1.3, lid);
  for (let z = 10; z < 118; z += 12) F.rod([-62 + (8 * z) / 120, -6.5, z], [-50 + (8 * z) / 120, -6.5, z], 0.8, LIBRARY.WALNUT, 0.8, lid);
  // the cult's banners from the cornice, its pink fire
  banner(F, -28, -18, 70, 134, -9.8, IRON_Q);
  banner(F, 18, 28, 70, 134, -9.8, IRON_Q);
  sconce(F, -23, -10, 58, f, IRON_Q);
  sconce(F, 23, -10, 58, f, IRON_Q);
  return F.finish();
}

// =================================================================================================
// FLOOR 16, THE SWAN GARDENS: THE SWAN PAVILION (art/floor16.ts)
//
// THE GARDEN FOLLY taken by the cult: an arch of the gardens' pale limestone set in a tall clipped yew hedge, a swan carved on each
// pier, a balustrade and urns of lead on its top, clipped balls of box on plinths either side, roses climbing the stone; its door
// sheeted in lead; the cult's banners hung from the arch, its pink fire, its mark burning in the lead.


/** A carved SWAN sitting on a plinth's top at (x, y, z): its body, its neck curved up, its head, facing `dir` (1: to the right). */
function swan(F: Front, x: number, y: number, z: number, dir: number, stone: Ramp): void {
  const id = F.id();
  F.egg([x, y, z + 4], [6, 3.6, 3.8], (n) => lit(n as V3, stone, 1), id);
  F.egg([x - dir * 4.5, y, z + 6.5], [2.8, 2.4, 2.6], (n) => lit(n as V3, stone, 1), id);
  F.rod([x + dir * 3.6, y, z + 6], [x + dir * 4.4, y, z + 11], 1.3, stone, 1.1, id);
  F.rod([x + dir * 4.4, y, z + 11], [x + dir * 3, y, z + 14], 1.1, stone, 1, id);
  F.egg([x + dir * 2.6, y, z + 14.4], [1.8, 1.3, 1.3], (n) => lit(n as V3, stone, 1), id);
  F.rod([x + dir * 1.4, y, z + 14.2], [x + dir * 0.2, y, z + 13.6], 0.6, SWAN.ROSE, 0.4, id);
}

function follyFront(open: boolean, f: number): Sprite {
  const F = new Front();
  const yew = leaves(SWAN.YEW, 2601, 1.6);
  const lime = ashlar(SWAN.LIMESTONE, SWAN.LIMESTONE[0], 2602, 10, 18);
  // THE HEDGE either side, tall and clipped square
  F.box(-98, -40, -30, -12, 0, 96, { all: yew, top: leaves(SWAN.YEW, 2603, 1.6) });
  F.box(30, -40, 98, -12, 0, 96, { all: yew, top: leaves(SWAN.YEW, 2604, 1.6) });
  // THE ARCH of limestone between, its piers standing out a little, a swan on each
  const DOOR: Arch = { half: 15, spring: 50, shape: 'round' };
  F.box(-32, -24, 32, -6, 0, 104, lime, (w, n) => n[1] > 0.5 && inArch(DOOR, w[0], w[2]));
  voussoirs(F, DOOR, -6, 5, SWAN.LIMESTONE, SWAN.LIMESTONE[0], 0, (w, n) => lit(n, SWAN.LIMESTONE, 1));
  door(F, DOOR, -6, 5, open, f, { slab: (x, z, n) => (fr(x / 7) < 0.1 || fr(z / 12) < 0.07 ? SWAN.LEAD[0] : lit(n, SWAN.LEAD, 0)) }, lime);
  for (const x of [-30, 22]) {
    F.box(x, -8, x + 8, 0, 0, 92, lime);
    F.box(x - 1, -9, x + 9, 1, 92, 96, plain(SWAN.LIMESTONE, 1, 0.1));
    swan(F, x + 4, -4, 96, x < 0 ? 1 : -1, SWAN.SWANW);
  }
  // its balustrade and urns on top
  F.box(-34, -26, 34, -4, 104, 108, plain(SWAN.LIMESTONE, 1, 0.1));
  for (let x = -30; x <= 30; x += 5) F.column(x, -6, 108, 118, 1.5, SWAN.LIMESTONE, 1.1);
  F.box(-34, -26, 34, -4, 118, 122, plain(SWAN.LIMESTONE, 1, 0.1));
  for (const x of [-30, 0, 30]) {
    F.egg([x, -6, 128], [4.4, 4.4, 5.2], (n) => lit(n as V3, SWAN.LEAD, 0));
    F.box(x - 2, -8, x + 2, -4, 122, 124, plain(SWAN.LEAD, 0));
    F.box(x - 4, -10, x + 4, -2, 132, 134, plain(SWAN.LEAD, 1));
  }
  // THE BOX either side, clipped round on plinths
  for (const x of [-46, 46]) {
    F.box(x - 6, 2, x + 6, 14, 0, 12, plain(SWAN.LIMESTONE, 0, 0.05));
    F.egg([x, 8, 22], [9, 9, 10], (n, w) => lit(n as V3, SWAN.BOX, hash(Math.floor(w[0] / 2), Math.floor(w[2] / 2), 2605) > 0.7 ? -1 : 0));
  }
  // ROSES climbing the left pier
  const rid = F.id();
  for (let k = 0; k < 9; k++) {
    const z = 10 + k * 9;
    F.rod([-26 + Math.sin(k) * 3, -0.5, z], [-26 + Math.sin(k + 1) * 3, -0.5, z + 9], 0.7, SWAN.BOX, 0.7, rid);
    if (k % 2) F.ball([-26 + Math.sin(k) * 3 + 1.5, 0, z + 3], 1.6, SWAN.ROSE, 0.2);
  }
  // the cult's banners hung under the arch's piers, its pink fire
  banner(F, -29, -23, 30, 88, 0.1, IRON_Q);
  banner(F, 23, 29, 30, 88, 0.1, IRON_Q);
  sconce(F, -21, -6, 60, f, IRON_Q);
  sconce(F, 21, -6, 60, f, IRON_Q);
  return F.finish();
}

// =================================================================================================
// FLOOR 17, THE MASQUE: THE BLACK ROOM (art/floor17.ts)
//
// THE STAGE DOOR taken by the cult: a proscenium front of ebony and gilt, its walls hung with the masque's dark damask, pilasters
// either side gilt at their heads, a gilt cornice with a mask at its middle, velvet curtains drawn back and tied either side of
// the door, the door black lacquer in a gilt moulding; the cult's banners hung from the cornice, its pink fire.


function stageFront(open: boolean, f: number): Sprite {
  const F = new Front();
  const damask: Paint = (w, n) => {
    const a = along(w, n);
    const u = fr(a / 10) - 0.5;
    const v = fr(w[2] / 14) - 0.5;
    const d = Math.abs(u) * 1.4 + Math.abs(v);
    return lit(n, MASQUE.WINEVELVET, d < 0.22 ? 0 : d < 0.3 ? -1 : -1, d < 0.22 ? 0.2 : 0);
  };
  const ebony = plain(MASQUE.EBONY, 1);
  const DOOR: Arch = { half: 15, spring: 56, shape: 'flat' };
  F.box(-66, -46, 66, -8, 0, 124, (w, n) => (w[2] < 22 ? planks(MASQUE.EBONY, 2701, 8)(w, n) : damask(w, n)), (w, n) => n[1] > 0.5 && inArch(DOOR, w[0], w[2]));
  F.box(-66, -46, 66, -6, 20, 23, plain(MASQUE.GILT, 0));
  // the door's gilt moulding and its lacquer
  F.box(-19, -8, 19, -5, 0, 60, plain(MASQUE.GILT, 0), (w, n) => n[1] > 0.5 && inArch(DOOR, w[0], w[2]));
  door(F, DOOR, -5, 6, open, f, { slab: (x, z, n) => (Math.abs(x) < 0.6 ? MASQUE.GILT[1] : Math.abs(Math.abs(x) - 7.5) > 5.5 || Math.abs(fr(z / 18) - 0.5) > 0.42 ? lit(n, MASQUE.EBONY, 2) : lit(n, MASQUE.EBONY, 1)) }, ebony);
  // THE PILASTERS of ebony, gilt at their heads and feet
  for (const x of [-56, -32, 26, 50]) {
    F.box(x, -10, x + 6, -4, 0, 112, ebony);
    F.box(x - 1, -11, x + 7, -3, 104, 112, plain(MASQUE.GILT, 1));
    F.box(x - 1, -11, x + 7, -3, 0, 6, plain(MASQUE.GILT, 0));
  }
  // THE CORNICE, gilt, a mask at its middle
  F.box(-70, -50, 70, -2, 112, 120, { front: (w, n) => (fr(w[0] / 5) < 0.35 ? lit(n, MASQUE.GILT, 1) : lit(n, MASQUE.GILT, 0)), side: plain(MASQUE.GILT, -1), top: plain(MASQUE.EBONY, 0) });
  F.box(-70, -50, 70, -4, 120, 126, { front: ebony, side: ebony, top: plain(MASQUE.EBONY, -1) });
  F.egg([0, -1, 100], [8, 2.6, 9], (n, w) => {
    const u = w[0];
    const v = w[2] - 100;
    if (Math.hypot(Math.abs(u) - 3.2, v - 2) < 1.6) return MASQUE.EBONY[0];
    if (v < -3 && v > -5 && Math.abs(u) < 3.6 - (v + 4) * 0.8) return MASQUE.EBONY[0];
    return lit(n as V3, MASQUE.GILT, 1);
  });
  // THE CURTAINS, velvet, drawn back and tied either side of the door
  for (const s of [-1, 1]) {
    const x0 = s * 18;
    const x1 = s * 30;
    F.face([[Math.min(x0, x1), -4, 0], [Math.max(x0, x1), -4, 0], [Math.max(x0, x1), -4, 110], [Math.min(x0, x1), -4, 110]], (w, n) => {
      const u = (w[0] - x0) / (x1 - x0);
      const z = w[2];
      // (gathered at its tie, 40 up: narrow there, full above and below)
      const tie = Math.abs(z - 40) / 70;
      const edge = 0.35 + 0.65 * Math.min(1, tie * 1.6);
      if (u < 1 - edge) return null;
      if (Math.abs(z - 40) < 1.6) return lit(n, MASQUE.GILT, 1);
      const fold = Math.sin(u * 14 + z * 0.02);
      return MASQUE.WINEVELVET[fold > 0.4 ? 3 : fold < -0.4 ? 1 : 2];
    });
  }
  // the cult's banners hung from the cornice, its pink fire
  banner(F, -48, -38, 50, 110, -4, IRON_Q);
  banner(F, 38, 48, 50, 110, -4, IRON_Q);
  sconce(F, -24, -8, 76, f, IRON_Q);
  sconce(F, 24, -8, 76, f, IRON_Q);
  return F.finish();
}

// =================================================================================================
// FLOOR 18, THE GLASS GALLERY: THE MIRROR HALL (art/floor18.ts)
//
// THE MIRROR DOOR taken by the cult: a wall of the gallery's violet silk between pilasters of grey stone, a great mirror in a gilt
// frame either side, a glazed fanlight over the door, the door itself of mirror-glass in a gilt frame (the cult's mark burning in
// it), a gilt cornice; the cult's banners, its pink fire.


function mirrorFront(open: boolean, f: number): Sprite {
  const F = new Front();
  const silk: Paint = (w, n) => lit(n, GALLERY.SILK, fr(along(w, n) / 8) < 0.12 ? -1 : 0);
  const stone = plain(GALLERY.CSTONE, 0, 0.05);
  const DOOR: Arch = { half: 14, spring: 60, shape: 'flat' };
  F.box(-70, -44, 70, -8, 0, 126, (w, n) => (w[2] < 18 ? stone(w, n) : silk(w, n)), (w, n) => n[1] > 0.5 && (inArch(DOOR, w[0], w[2]) || (Math.abs(w[0]) < 14 && w[2] > 64 && w[2] < 82)));
  F.box(-70, -44, 70, -7, 17, 19, plain(GALLERY.GILT, 1));
  // the door's frame of gilt, the door of mirror-glass
  F.box(-18, -9, 18, -5, 0, 86, plain(GALLERY.GILT, 0), (w, n) => n[1] > 0.5 && (inArch(DOOR, w[0], w[2]) || (Math.abs(w[0]) < 14 && w[2] > 64 && w[2] < 82)));
  door(F, DOOR, -5, 5, open, f, { slab: (x, z, n) => {
    const sheen = (x * 0.6 - z * 0.35) % 18;
    return lit(n, GALLERY.MIRROR, Math.abs(sheen) < 2 ? 2 : Math.abs(x) < 0.6 ? -1 : 0);
  } }, plain(GALLERY.GILT, -1));
  // the fanlight over it, glazed, the gallery's dark beyond
  F.face([[-14, -6, 64], [14, -6, 64], [14, -6, 82], [-14, -6, 82]], panes(GALLERY.PANE, GALLERY.GILT[1], 5, 6));
  // THE PILASTERS and the two great mirrors in their frames
  for (const x of [-62, -30, 26, 58]) F.box(x - 2, -10, x + 4, -6, 0, 118, stone);
  for (const x of [-46, 42]) {
    F.box(x - 11, -10, x + 11, -6, 26, 104, plain(GALLERY.GILT, 1), (w, n) => n[1] > 0.5 && Math.abs(w[0] - x) < 8 && w[2] > 30 && w[2] < 100);
    F.face([[x - 8, -8, 30], [x + 8, -8, 30], [x + 8, -8, 100], [x - 8, -8, 100]], (w, n) => {
      const d = (w[0] - x) * 0.7 - (w[2] - 65) * 0.3;
      return lit(n, GALLERY.MIRROR, Math.abs(d - 3) < 1.6 || Math.abs(d + 5) < 0.8 ? 2 : (w[2] > 80 ? 1 : 0));
    });
    F.egg([x, -6, 108], [5, 2, 4], (n) => lit(n as V3, GALLERY.GILT, 1));
  }
  // THE CORNICE, gilt
  F.box(-74, -48, 74, -4, 118, 126, { front: (w, n) => (fr(w[0] / 4) < 0.3 ? lit(n, GALLERY.GILT, 1) : lit(n, GALLERY.GILT, 0)), side: plain(GALLERY.GILT, -1), top: plain(GALLERY.VIOLET, 0) });
  // the cult's banners, its pink fire
  banner(F, -26, -18, 40, 112, -6, IRON_Q);
  banner(F, 18, 26, 40, 112, -6, IRON_Q);
  sconce(F, -23, -8, 52, f, IRON_Q);
  sconce(F, 23, -8, 52, f, IRON_Q);
  return F.finish();
}

// =================================================================================================
// FLOOR 19, THE KEEP: THE THRONE HALL (art/floor19.ts)
//
// THE INNER GATEHOUSE taken by the cult: two square towers of the keep's cold blue-grey stone with their battlements, the gate
// wall between, its portcullis drawn up into the arch over a door of black oak bound in steel, the king's arms over it in gold
// with the cult's skull painted across them; the cult's banners hung where the king's were, its pink fire either side.


function keepFront(open: boolean, f: number): Sprite {
  const F = new Front();
  const stone = ashlar(KEEP.COLD, KEEP.COLD[0], 2901, 12, 24);
  const DOOR: Arch = { half: 16, spring: 52, shape: 'round' };
  // THE GATE WALL, its battlements
  F.box(-32, -30, 32, -4, 0, 108, stone, (w, n) => n[1] > 0.5 && inArch(DOOR, w[0], w[2]));
  F.merlons(-32, -30, 32, -4, 108, stone);
  voussoirs(F, DOOR, -4, 6, KEEP.COLD, KEEP.COLD[0]);
  door(F, DOOR, -4, 8, open, f, { slab: (x, z, n) => (Math.abs(z - 10) < 1.5 || Math.abs(z - 44) < 1.5 ? lit(n, KEEP.STEEL, 1) : lit(n, KEEP.PITCH, fr(x / 6) < 0.12 ? -1 : 1)) }, stone);
  // THE PORTCULLIS, drawn up: its bars' feet showing under the arch's crown
  const pid = F.id();
  for (let x = -12; x <= 12; x += 6) F.rod([x, -6, 58], [x, -6, 70], 1.1, KEEP.STEEL, 1.1, pid);
  for (let x = -12; x <= 12; x += 6) F.rod([x, -6, 58], [x, -6, 55], 1.1, KEEP.STEEL, 0.2, pid);
  F.rod([-14, -6, 62], [14, -6, 62], 0.9, KEEP.STEEL, 0.9, pid);
  // THE KING'S ARMS over it, gold, the cult's skull painted across them
  F.face([[-9, -3.9, 76], [9, -3.9, 76], [9, -3.9, 98], [-9, -3.9, 98]], (w, n) => {
    const x = w[0];
    const z = w[2] - 76;
    const shield = z > 4 ? Math.abs(x) < 9 : Math.abs(x) < 9 * Math.sqrt(Math.max(0, z / 4)) && z > 0;
    if (!shield) return null;
    const m = shriekAt(x / 6, (z - 11) / 6);
    if (m === 'bone') return CULT_PAINT;
    if (m === 'dark') return KEEP.ROYAL[0];
    if (Math.abs(x) > 7.6 || z > 20.6) return lit(n, KEEP.GOLD, 1);
    return lit(n, KEEP.ROYAL, 1);
  });
  // THE TOWERS either side, their battlements, their slits
  for (const [x0, x1] of [[-66, -30], [30, 66]] as const) {
    F.box(x0, -36, x1, 6, 0, 148, stone, (w, n) => {
      const along2 = Math.abs(n[1]) > 0.5 ? w[0] - (x0 + x1) / 2 : w[1] + 15;
      return Math.abs(along2) < 1.4 && ((w[2] > 104 && w[2] < 122) || (w[2] > 40 && w[2] < 56));
    });
    F.face([[(x0 + x1) / 2 - 1.4, 5.9, 104], [(x0 + x1) / 2 + 1.4, 5.9, 104], [(x0 + x1) / 2 + 1.4, 5.9, 122], [(x0 + x1) / 2 - 1.4, 5.9, 122]], () => '#0c0e16');
    F.merlons(x0, -36, x1, 6, 148, stone);
    banner(F, x0 + 7, x1 - 7, 56, 138, 6, KEEP.STEEL);
  }
  // THE PINK FIRE either side of the gate
  sconce(F, -24, -4, 60, f, KEEP.STEEL);
  sconce(F, 24, -4, 60, f, KEEP.STEEL);
  return F.finish();
}

// =================================================================================================
// FLOOR 20, THE QUIET TOWER: THE TOWER TOP (art/floor20.ts)
//
// THE BELL-DOOR OF THE TOWER taken by the cult: the base of a round tower of the tower's grey stone, its narrow pointed door in a
// porch standing out from it, buttresses either side, slit windows up it, a little bell hung in an arch of grey oak over the porch,
// loose pages caught against its foot; the cult's banners on the porch, its pink fire, its mark burning in the oak.


function towerFront(open: boolean, f: number): Sprite {
  const F = new Front();
  const stone = ashlar(QUIETTOWER.TSTONE, QUIETTOWER.TSTONE[0], 3001, 10, 16);
  // THE TOWER, round, rising behind its porch
  tower(F, 0, -62, 50, 0, 160, stone, roofing(QUIETTOWER.BELLOAK, 3002, 0, 5, 6), 216, 18, 5);
  for (const [a, z] of [[0.9, 60], [1.4, 104], [0.6, 132], [2.0, 70]] as const) {
    const x = Math.cos(a) * 50.2;
    const y = -62 + Math.sin(a) * 50.2;
    F.face([[x - 1.2, y + 0.4, z], [x + 1.2, y - 0.4, z], [x + 1.2, y - 0.4, z + 16], [x - 1.2, y + 0.4, z + 16]], () => '#121214');
  }
  // THE PORCH, standing out, its gable
  const DOOR: Arch = { half: 11, spring: 44, shape: 'pointed' };
  F.box(-22, -14, 22, 4, 0, 84, stone, (w, n) => n[1] > 0.5 && inArch(DOOR, w[0], w[2]));
  F.tri([-24, 4.1, 84], [24, 4.1, 84], [0, 4.1, 106], stone);
  F.face([[-26, 8, 82], [0, 8, 108], [0, -16, 108], [-26, -16, 82]], roofing(QUIETTOWER.BELLOAK, 3003, 1, 4, 5));
  F.face([[26, 8, 82], [0, 8, 108], [0, -16, 108], [26, -16, 82]], roofing(QUIETTOWER.BELLOAK, 3004, 1, 4, 5));
  voussoirs(F, DOOR, 4, 4, QUIETTOWER.TSTONE, QUIETTOWER.TSTONE[0]);
  door(F, DOOR, 4, 5, open, f, { slab: (x, z, n) => (Math.abs(z - 9) < 1.2 || Math.abs(z - 34) < 1.2 ? lit(n, QUIETTOWER.GIRON, 1) : planks(QUIETTOWER.GREYOAK, 3005, 5)([x, 0, z], n) ?? QUIETTOWER.GREYOAK[2]) }, stone);
  // its buttresses
  for (const x of [-34, 26]) {
    F.box(x, -10, x + 8, 12, 0, 70, stone);
    F.face([[x, 12, 70], [x + 8, 12, 70], [x + 8, -10, 92], [x, -10, 92]], plain(QUIETTOWER.TSTONE, 1, 0.1));
  }
  // THE LITTLE BELL in its arch of grey oak over the porch
  F.rod([-6, -4, 106], [-6, -4, 128], 1.2, QUIETTOWER.BELLOAK);
  F.rod([6, -4, 106], [6, -4, 128], 1.2, QUIETTOWER.BELLOAK);
  F.rod([-8, -4, 128], [8, -4, 128], 1.4, QUIETTOWER.BELLOAK);
  F.egg([0, -4, 118], [4.2, 4.2, 5.2], (n, w) => (w[2] > 122 ? lit(n as V3, QUIETTOWER.GIRON, 1) : lit(n as V3, QUIETTOWER.GIRON, 0)));
  // loose pages against its foot
  for (let k = 0; k < 6; k++) {
    const x = -30 + hash(k, 1, 3006) * 60;
    const y = 6 + hash(k, 2, 3006) * 10;
    if (Math.abs(x) < 12) continue;
    F.face([[x, y, 0.6], [x + 5, y - 1, 0.6], [x + 5.6, y - 4.6, 0.6], [x + 0.6, y - 3.6, 0.6]], (_w, n) => lit(n, QUIETTOWER.PAPER, 1));
  }
  // the cult's banners on the porch, its pink fire
  banner(F, -20, -14, 26, 76, 4, QUIETTOWER.GIRON);
  banner(F, 14, 20, 26, 76, 4, QUIETTOWER.GIRON);
  sconce(F, -16, 4, 52, f, QUIETTOWER.GIRON);
  sconce(F, 16, 4, 52, f, QUIETTOWER.GIRON);
  return F.finish();
}

// =================================================================================================

/** Every floor's stronghold front, by its floor. */
export const HOLD_FRONTS: readonly HoldFront[] = [
  { floor: 1, name: FRONT_NAMES[1], make: tombFront },
  { floor: 2, name: FRONT_NAMES[2], make: blockFront },
  { floor: 3, name: FRONT_NAMES[3], make: vaultFront },
  { floor: 4, name: FRONT_NAMES[4], make: boneFront },
  { floor: 5, name: FRONT_NAMES[5], make: mineFront },
  { floor: 7, name: FRONT_NAMES[7], make: ledgeFront },
  { floor: 9, name: FRONT_NAMES[9], make: stockadeFront },
  { floor: 10, name: FRONT_NAMES[10], make: shrineFront },
  { floor: 11, name: FRONT_NAMES[11], make: watchFront },
  { floor: 12, name: FRONT_NAMES[12], make: sluiceFront },
  { floor: 13, name: FRONT_NAMES[13], make: millFront },
  { floor: 14, name: FRONT_NAMES[14], make: hospiceFront },
  { floor: 15, name: FRONT_NAMES[15], make: libraryFront },
  { floor: 16, name: FRONT_NAMES[16], make: follyFront },
  { floor: 17, name: FRONT_NAMES[17], make: stageFront },
  { floor: 18, name: FRONT_NAMES[18], make: mirrorFront },
  { floor: 19, name: FRONT_NAMES[19], make: keepFront },
  { floor: 20, name: FRONT_NAMES[20], make: towerFront },
];

/** (OWN_FRONTS) The court before a stronghold in the Wilds, its floor's own stone (game/act1_dress.ts COURT_NAMES): the Ledge's grey rock, the Pinewood's granite, the Fen's ruin-stone, each laid as the Quarry's flagstones are. */
const COURT_STONE: Readonly<Record<number, Ramp>> = {
  7: ['#3d3648', '#6e6680', '#8c8494', '#a39ca8', '#bdb6c0'],
  9: ['#3c3e3c', '#6e726c', '#8a8e86', '#a6a89e', '#bcbeb4'],
  10: ['#29272e', '#4e4a56', '#64606c', '#7c7884', '#96929c'],
};
/** Floor `n`'s court as a floor tile's piece (three frames), or null where it keeps the Quarry's. */
export function holdCourtOf(n: number): { name: string; kind: 'floor tile'; frames: Sprite[] } | null {
  const r = COURT_STONE[n];
  return r && COURT_NAMES[n] ? { name: COURT_NAMES[n], kind: 'floor tile', frames: courtTiles(r, 3100 + n * 7) } : null;
}

/** Floor `n`'s front as a piece (its five frames), or null where it has none of its own. */
export function holdFrontOf(n: number): { name: string; kind: 'gate'; frames: Sprite[]; shadow: number } | null {
  const h = HOLD_FRONTS.find((q) => q.floor === n);
  return h ? { name: h.name, kind: 'gate', frames: frames(h.make), shadow: 1.2 } : null;
}

