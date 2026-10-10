// THE HEADSMAN'S FLOOR: the Crypt's second floor, themed after its boss (a mock-up; nothing of the
// game imports it).
//
// The owner, 10 Oct 2026: by 07:29, "I’d also like each floor to be themed after the boss.  Add this
// to the ruleset.  We need somewhere between 40-50 unique assets on each floor for each boss.  That
// can include wall tiles, floor tiles, breakables, stuff on the walls, on the floor, obstacles, the
// looks of doors and gates, traps, and quests." (His art rulebook, Places 7.) By 07:41, offered the
// four floors' themes, floor 2 the Headsman's: the place of execution. By 12:00, to floor 1's pieces
// and moments: "Yes, on to floor 2 (Recommended)", offered as "Floor 1 goes to the main chat to build
// in, and I start the Headsman's floor."
//
// THE THEME, from the Headsman as he is painted (art/bosses3.ts, on mockup/bosses): "A giant
// executioner, the Warden's height: AN EMPTY HOOD on a body of leather and iron. His hood is the old
// executioner's, tall and pointed, of a red so dark it is nearly black ... HIS GREAT AXE: a long haft
// of dark wood bound in iron, and a broad crescent of black steel, its edge bright"; his sound, his
// pick, "A tolling bell". So floor 2 is THE PLACE OF EXECUTION: the block and the scaffold, the
// gallows and the gibbet, the stocks; the great bell that tolls for the condemned; his hoods, his
// axes, the tools of his trade, the condemned's chains; sawdust and old stains; ravens. It stands on
// the Crypt's second floor as he said yes to it (art/crypt.ts, CRYPT_FLOORS[1]: here and there a
// flagstone gone, a few of the walls' stones fallen out to the rock behind).
//
// THE RULES IT KEEPS (his art rulebook): crisp pixels, two to a game pixel, light from the upper
// left, three tones a material, the indigo seam between parts; turned to the grid; a step quieter
// than the figures (his red a red so dark it is nearly black, his steel black, stains a dull wine);
// no glow but an honest fire's orange (no cyan; pink only his embers on his own gate: Colour 3);
// old, broken and grim but never gory (Places 6); no carved words (Words in the world 3): the empty
// hood and the axe's crescent are his marks, never letters.
//
// Measures as the game's (art/isokit.ts): picture pixels, two to a game pixel; a tile 64 x 32 on
// the screen; along +x 32 right and 16 down, along +y 32 left and 16 down; heights up.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { CRYPT_FLOORS, OLD_IRON, OLD_RUST, TIMBER } from './crypt';
import type { Theme } from './ground';
import { makeGateArt } from './gates';
import type { GateArt, Mark } from './gates';
import { Iso } from './isokit';
import { GRAIN, INK, ball, compose, hash, limb, lit, mix } from './kit';
import type { Ramp } from './kit';
import { COAL, EMBER, GOLD, column, hoop, stoneOf, tongue, trunk } from './props';
import { FLAME } from './mkit';
import type { TrunkLook } from './props';
import {
  DEEP, LCX, LCY, PCX, PFOOT, PH, PW, block, box, fillWith, flame, flat, fx, fy, lying, mid, quadUV, recolor, relief, shadeSide, shaded, spotsFrom, sunk, tilesOf, wallSet, litSide, dustCloud, fastBlit, painted,
} from './floorkit';
import type { Moment, Piece, PieceKind, Spot, Track } from './floorkit';

// =================================================================================================
// The colours

const THEME: Theme = CRYPT_FLOORS[1];
/** The dressed stone of the floor's blocks and steps (the walls' own, from their shade to a lit edge). */
const STONE: Ramp = stoneOf(THEME);
/** The stone of a wall's face turned to the light: its joint, its low tone, its usual, its high, and a lit edge. */
const FACE: Ramp = [THEME.lit[0], THEME.lit[1], THEME.lit[2], THEME.lit[4], THEME.lit[4]];
const SLAB = THEME.slab;
/** His hood's red, as a place has it: a red so dark it is nearly black, a step under his own. */
export const HOOD: Ramp = ['#12040b', '#12040b', '#2e0a1a', '#4a1228', '#5a1a32'];
/** Black leather, old. */
const LEATHER: Ramp = ['#100c18', '#100c18', '#211a2e', '#352c46', '#433856'];
/** Black steel, its edge the one bright line on it. */
const BLADE: Ramp = ['#16132e', '#16132e', '#2e2a5a', '#4c4888', '#6a66a8'];
const EDGE = '#a4a0d4';
/** Iron, with a glint for its edge. */
const IRONS: Ramp = OLD_IRON;
/** Small iron things (hooks, chains, brands): a little brighter, so they read against stone at a phone's size. */
const SMALL_IRON: Ramp = ['#1c1a3a', '#1c1a3a', '#4c4884', '#8480bc', '#a8a4dc'];
/** Iron set in the walls and the floor, a step quieter than what stands (his Colour 4: the places darker than any word). */
const DIM_IRON: Ramp = ['#16142c', '#16142c', '#34305e', '#4c4880', '#4c4880'];
const GLINT = '#9a96c8';
/** Hemp rope, grey with age (never a straw yellow: his Colour 5). */
const ROPE: Ramp = ['#1e1820', '#1e1820', '#4a3e48', '#6a5c64', '#7e7078'];
/** Sawdust and straw, gone grey: its dark, its body, its lit grains. */
const SAWDUST = ['#2e2a3a', '#433e52', '#5a546a'] as const;
/** Old stains, dried: dull and dark, darker than any word, and never red (his Places 6: grim, never gory; the second look found the first, a dull wine, reading as blood). */
const STAIN = ['#110f17', '#19161f', '#221e29'] as const;
/** Bone, in the light; and in the wall's dark, a step under it. */
const OLD_BONE: Ramp = ['#26203e', '#26203e', '#6a6294', '#a29ac6', '#c2bae2'];
const DARK_BONE: Ramp = ['#1e1a34', '#1e1a34', '#3e3862', '#5a5484', '#5a5484'];
/** Wicker, plum with age. */
const WICKER: Ramp = ['#1e1626', '#1e1626', '#3c2e3c', '#58465a', '#6a5868'];
/** Black candles' wax. */
const BLACK_WAX: Ramp = ['#100c18', '#100c18', '#262036', '#3c3452', '#4e4666'];
/** A raven: black, an indigo sheen along its lit edge, its beak and feet dark grey. */
export const RAVEN: Ramp = ['#06050c', '#0e0c1a', '#201d36', '#3a3664', '#56518c'];
const BEAK = '#3a3648';

/** A shade of a ramp on a face turned away from the light. */
function darkened(r: Ramp): Ramp {
  return r.map(shaded) as unknown as Ramp;
}

const { tileOf, onTile, around } = tilesOf(THEME);

// =================================================================================================
// HIS MARKS: the empty hood, and the crescent of his axe's blade

/**
 * HIS HOOD, as his mark (on the wall, in the floor, on his gate, slumped on the floor as the quest's):
 * the executioner's tall pointed hood over his shoulders, its two eye-holes dark, as a bust. (s, t)
 * across and up, each -1 to 1. (The second look found the first, a pointed shape round a dark oval,
 * reading as an eye in a triangle.)
 */
function hoodAt(s: number, t: number): 'hood' | 'dark' | null {
  if (t > 1 || t < -1) return null;
  let half: number;
  if (t > -0.12) half = 0.46 * ((1 - t) / 1.12) ** 0.65;
  else if (t > -0.28) half = 0.42;
  else half = 0.42 + 0.54 * Math.sqrt(Math.min(1, (-0.28 - t) / 0.45));
  if (Math.abs(s) > half) return null;
  // its eye-holes: two slits, a third of the way down
  for (const e of [-0.15, 0.15]) if (((s - e) / 0.1) ** 2 + ((t - 0.22) / 0.075) ** 2 <= 1) return 'dark';
  return 'hood';
}

/** Is (s, t) in the crescent of his axe's blade, from the middle of its box, both in half its height? The blade's edge (the outer curve) to the right. */
function crescentAt(s: number, t: number): 'blade' | 'edge' | null {
  const out = Math.hypot(s + 0.55, t) <= 1.25;
  const cut = Math.hypot(s + 1.05, t) <= 1.08;
  if (!out || cut || Math.abs(t) > 0.92) return null;
  return Math.hypot(s + 0.55, t) > 1.12 ? 'edge' : 'blade';
}

// =================================================================================================
// WALL TILES: cut into a wall's face

/** THE CONDEMNED'S HATCH: a low iron door in the wall, strapped and riveted, a barred slot in it, a ring to pull it, rust run down from its foot. */
function hatch(p: Px): void {
  const door = (u: number, v: number): boolean => u >= -8 && u <= 7 && v >= 3 && v <= 26;
  // its frame of dressed stone, proud of the face
  relief(p, FACE, (u, v) => u >= -10 && u <= 9 && v >= 1 && v <= 28 && !door(u, v), -11, 10, 0, 29);
  for (let v = 3; v <= 26; v++) {
    for (let u = -8; u <= 7; u++) {
      const c = u === -8 || v === 26 ? DIM_IRON[3] : u === 7 || v === 3 ? DIM_IRON[0] : DIM_IRON[2];
      p.set(fx(u), fy(v), c);
    }
  }
  // two straps across it, riveted
  for (const v of [8, 21]) {
    for (let u = -8; u <= 7; u++) p.set(fx(u), fy(v + 1), DIM_IRON[3]).set(fx(u), fy(v), DIM_IRON[2]).set(fx(u), fy(v - 1), DIM_IRON[0]);
    p.set(fx(-1), fy(v), GLINT);
  }
  // the slot, barred, dark behind
  for (let v = 13; v <= 18; v++) for (let u = -5; u <= 4; u++) p.set(fx(u), fy(v), v === 18 ? DIM_IRON[0] : DEEP);
  for (const u of [-3, 0, 3]) for (let v = 13; v <= 17; v++) p.set(fx(u), fy(v), DIM_IRON[3]);
  // the ring
  for (let a = 0; a < Math.PI * 2; a += 0.3) p.set(fx(Math.round(5 + Math.cos(a) * 1.6)), fy(Math.round(11 + Math.sin(a) * 1.6)), Math.cos(a) < 0 ? DIM_IRON[3] : DIM_IRON[0]);
  // rust run down the stone from its foot
  for (const u of [-6, 2, 5]) for (let v = 0; v <= 2; v++) if (hash(u, v, 201) < 0.75) p.set(fx(u), fy(v), OLD_RUST[2]);
}

/** WHERE HIS AXE BIT THE WALL: three deep crescent bites in the stone, each at its own slant, the stone fresh and pale in them, chips round them. */
function axeScars(p: Px): void {
  const bites: ReadonlyArray<readonly [number, number, number, number]> = [
    [-4, 38, 9, 0.5],
    [5, 26, 8, -0.6],
    [-3, 13, 7.5, 0.25],
  ];
  for (const [cu, cv, R, ang] of bites) {
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    const local = (u: number, v: number): [number, number] => [(u + 0.5 - cu) * ca + (v - cv) * sa, -(u + 0.5 - cu) * sa + (v - cv) * ca];
    const bite = (u: number, v: number): boolean => {
      const [x, y] = local(u, v);
      return Math.hypot(x, y) <= R && Math.hypot(x - 3.6, y) > R - 0.4 && Math.abs(y) < R * 0.88;
    };
    for (let v = Math.floor(cv - R - 2); v <= cv + R + 2; v++) {
      for (let u = Math.floor(cu - R - 2); u <= cu + R + 2; u++) {
        if (!bite(u, v)) continue;
        const [x, y] = local(u, v);
        // the deep of the cut along its middle; its face toward the light in shade, the far face fresh and pale
        const depth = Math.hypot(x, y) - (R - 2.2);
        const c = depth > 0 && depth < 1.2 ? DEEP : x + y < 0 ? FACE[0] : FACE[4];
        p.set(fx(u), fy(v), c);
      }
    }
    // chips knocked off round it
    for (let i = 0; i < 6; i++) {
      const a = hash(i, cu, 202) * Math.PI * 2;
      const r = R + 1.5 + hash(i, cv, 203) * 2.5;
      const u = Math.round(cu + Math.cos(a) * r);
      const v = Math.round(cv + Math.sin(a) * r);
      p.set(fx(u), fy(v), FACE[4]).set(fx(u + 1), fy(v), FACE[0]);
    }
  }
}

function bellNiche(p: Px): void {
  const inArch = (u: number, v: number): boolean => Math.abs(u + 0.5) <= 10 && v >= 13 && (v <= 33 || (u + 0.5) ** 2 + ((v - 33) * 1.1) ** 2 <= 100);
  const rim = (u: number, v: number): boolean => Math.abs(u + 0.5) <= 12 && v >= 11 && (v <= 33 || (u + 0.5) ** 2 + ((v - 33) * 1.1) ** 2 <= 144);
  relief(p, FACE, (u, v) => rim(u, v) && !inArch(u, v), -13, 12, 10, 46);
  for (let u = -12; u <= 11; u++) p.set(fx(u), fy(12), FACE[4]).set(fx(u), fy(11), FACE[2]).set(fx(u), fy(10), FACE[0]);
  sunk(p, FACE, inArch, -11, 10, 13, 43, DEEP);
  // the bar across the arch, and the bell hung from it close: broad, flared, its lip lit, its mouth
  // dark, its clapper showing (the second look found the first, small on a long rope, reading as a 4)
  for (let u = -10; u <= 9; u++) p.set(fx(u), fy(40), IRONS[3]).set(fx(u), fy(39), IRONS[0]);
  const b = flat();
  for (let v = 21; v <= 38; v++) {
    const t = (38 - v) / 17;
    const half = 3 + 5.6 * t ** 1.7;
    for (let u = Math.round(-half); u < Math.round(half); u++) {
      const d = (u + 0.5) / half;
      b.set(fx(u), fy(v), d < -0.45 ? IRONS[3] : d > 0.55 ? IRONS[1] : IRONS[2]);
    }
  }
  // its crown on the bar; its lip, a lit band; the mouth dark under it; the clapper
  for (let u = -2; u <= 1; u++) b.set(fx(u), fy(39), IRONS[3]);
  for (let u = -9; u <= 8; u++) b.set(fx(u), fy(23), u < -3 ? IRONS[4] : IRONS[3]).set(fx(u), fy(22), u < -3 ? IRONS[3] : IRONS[2]);
  for (let u = -7; u <= 6; u++) b.set(fx(u), fy(21), DEEP);
  ball(b, fx(0), fy(20), 1.8, 1.8, SMALL_IRON);
  // a short rope from the clapper, knotted
  for (let v = 15; v <= 18; v++) b.set(fx(0), fy(v), ROPE[3]).set(fx(1), fy(v), ROPE[1]);
  b.set(fx(-1), fy(15), ROPE[2]).set(fx(2), fy(15), ROPE[1]);
  b.set(fx(-4), fy(30), GLINT);
  p.blit(compose(null, [b], null), 0, 0);
}

/** A LEDGE OF SKULLS: a stone ledge out of the wall, three skulls set along it in the wall's dark, each turned its own way. */
function skullLedge(p: Px): void {
  for (let u = -14; u <= 13; u++) {
    p.set(fx(u), fy(25), FACE[4]).set(fx(u), fy(24), FACE[3]);
    for (let v = 21; v <= 23; v++) p.set(fx(u), fy(v), u === -14 ? FACE[3] : FACE[2]);
    p.set(fx(u), fy(20), FACE[0]);
  }
  for (const u of [-13, 12]) for (let v = 15; v <= 20; v++) p.set(fx(u), fy(v), FACE[1]).set(fx(u + 1), fy(v), FACE[0]);
  const s = flat();
  for (const [u, look] of [[-9, -1], [0, 0], [9, 1]] as const) {
    // the cranium, broad; the jaw under it, narrower
    ball(s, fx(u), fy(31), 4.6, 4.4, DARK_BONE);
    s.rect(fx(u - 3), fy(27), 6, 2, DARK_BONE[2]);
    s.rect(fx(u - 3), fy(26), 6, 1, DARK_BONE[1]);
    // the sockets, the nose, the teeth
    s.rect(fx(u - 3 + look), fy(32), 2, 2, DEEP).rect(fx(u + 1 + look), fy(32), 2, 2, DEEP);
    s.set(fx(u + look), fy(29), DEEP);
    for (let k = -2; k <= 2; k++) if (k % 2 === 0) s.set(fx(u + k + look), fy(27), DARK_BONE[0]);
    s.set(fx(u - 2), fy(35), DARK_BONE[4]);
  }
  p.blit(compose(null, [s], null), 0, 0);
}

/**
 * HIS HOOD ON THE WALL, as his mark: his hood cut into the stone and painted his near-black red, its
 * eye-holes black, and his axe's crescent standing out of the stone beside it. (The second look found
 * a pale pointed hood with eye-holes, raised out of pale stone, at risk of reading as another, hateful
 * hood: so it is dark, his own red, and has his axe by it.)
 */
function hoodCarved(p: Px): void {
  const at = (u: number, v: number): ReturnType<typeof hoodAt> => hoodAt((u + 4.5) / 10, (v - 32) / 13);
  // the hood, cut back into the stone, its hollow painted his red
  for (let v = 19; v <= 45; v++) {
    for (let u = -15; u <= 6; u++) {
      const h = at(u, v);
      if (!h) continue;
      const edgeLit = !at(u - 1, v) || !at(u, v + 1);
      const edgeDark = !at(u + 1, v) || !at(u, v - 1);
      p.set(fx(u), fy(v), h === 'dark' ? DEEP : edgeLit ? FACE[0] : edgeDark ? HOOD[3] : (u + 4.5) / 10 < -0.15 ? HOOD[3] : HOOD[2]);
    }
  }
  // his axe's crescent beside it, out of the stone, its edge to the left
  relief(p, FACE, (u, v) => crescentAt((u - 8.5) / -6, (v - 32) / 6) !== null, 2, 14, 25, 39);
}

/** THE LONG STAIN, the wall's height: old damp run straight down the stone from up in the dark, dark and dull (never red: the second look found the first reading as blood), a few flecks of rust from an iron up there, a crust at its foot. */
function longStain(p: Px): void {
  const streaks: ReadonlyArray<readonly [number, number, number]> = [[-5, 3, 79], [0, 2, 72], [5, 1, 60]];
  for (const [u0, w, top] of streaks) {
    for (let v = 1; v <= top; v++) {
      // (run straight down, as a stain runs: a pixel's step aside now and then)
      const step = Math.round((hash(Math.floor(v / 9), u0, 204) - 0.5) * 1.6);
      const ww = Math.max(1, w + (v < 14 ? 1 : 0) - (v > top - 10 ? 1 : 0));
      for (let k = 0; k < ww; k++) p.set(fx(u0 + step + k), fy(v), k === 0 ? STAIN[2] : k === ww - 1 ? STAIN[0] : STAIN[1]);
      // a fleck of rust carried down it, here and there
      if (hash(v, u0, 205) < 0.025) p.set(fx(u0 + step), fy(v), OLD_RUST[1]);
    }
  }
  // the crust at its foot
  for (let u = -11; u <= 9; u++) {
    const h = Math.round(2.4 - ((u + 1) / 10) ** 2 * 2);
    for (let v = 0; v <= h; v++) p.set(fx(u), fy(v), v === h ? STAIN[2] : STAIN[1]);
  }
}

/** THE CHUTE: a mouth low in the wall, a stone lip and lintel, its slope going back up into the dark: what comes down it lies heaped on the floor before it (chuteHeap). */
function chute(p: Px): void {
  const mouth = (u: number, v: number): boolean => Math.abs(u + 0.5) <= 10 && v >= 0 && v <= 15;
  // the lintel and jambs: heavy dressed stone, proud of the face
  relief(p, FACE, (u, v) => Math.abs(u + 0.5) <= 13 && v >= 0 && v <= 20 && !mouth(u, v), -14, 13, 0, 21);
  // inside: the slope, lit low where it comes out, going up and back into the dark
  for (let v = 0; v <= 15; v++) {
    for (let u = -10; u <= 9; u++) {
      const c = v <= 1 ? FACE[3] : v <= 4 ? FACE[1] : v <= 7 ? (hash(u, v, 205) < 0.5 ? FACE[0] : DEEP) : DEEP;
      p.set(fx(u), fy(v), c);
    }
  }
  // old stains run over its lip
  for (const u of [-6, -1, 4, 7]) for (let v = 0; v <= 3 + (u % 3); v++) p.set(fx(u), fy(v), STAIN[v > 2 ? 0 : 1]);
}

/** WHAT CAME DOWN THE CHUTE, heaped on the floor before it: grey sawdust spilled in a fan, old bones in it, a skull rolled out, a stain under it. At the middle of the tile in front of the wall. */
function chuteHeap(): Sprite {
  const W = 72;
  const H = 52;
  const cx = 36;
  const cy = 30;
  const p = new Px(W, H);
  const under = new Px(W, H);
  // the sawdust: grain by grain in a fan out from the wall, thick near it, thinning toward us
  for (let i = 0; i < 520; i++) {
    const a = hash(i, 1, 206) * Math.PI;
    const r = Math.sqrt(hash(i, 2, 206)) * 20;
    const x = Math.round(cx - 4 + Math.cos(a) * r * 1.2);
    const y = Math.round(cy - 6 + Math.sin(a) * r * 0.5);
    const lit_ = Math.cos(a) < -0.2 || hash(i, 3, 206) < 0.2;
    under.set(x, y, lit_ ? SAWDUST[2] : r > 14 ? SAWDUST[0] : SAWDUST[1]);
  }
  // the bones, along the floor's lines; a skull rolled out to the front
  limb(p, cx - 14, cy - 2, cx - 2, cy + 4, 1.3, 1.2, DARK_BONE);
  limb(p, cx + 2, cy - 4, cx + 14, cy + 2, 1.3, 1.2, DARK_BONE);
  limb(p, cx - 6, cy + 6, cx + 6, cy + 2, 1.1, 1, DARK_BONE);
  ball(p, cx + 10, cy + 6, 4.6, 4.2, DARK_BONE);
  p.rect(cx + 7, cy + 5, 2, 2, DEEP).rect(cx + 11, cy + 5, 2, 2, DEEP);
  p.set(cx + 10, cy + 8, DEEP);
  return compose(under, [p], null).sprite(cx, cy, GRAIN);
}

// =================================================================================================
// ON THE WALLS: hung on a face

/** HIS SPARE HOODS on pegs: two of them, hung by their points, well apart, the cloth falling in folds to a hem, their eye-holes dark, the pegs showing. (The second look found three, close and cut in points, reading as a fringe of teeth.) */
function hoodsOnPegs(p: Px): void {
  for (let u = -14; u <= 13; u++) p.set(fx(u), fy(49), TIMBER[3]).set(fx(u), fy(48), TIMBER[2]).set(fx(u), fy(47), TIMBER[0]);
  const h = flat();
  for (const [u0, drop, long] of [[-7, 0, 27], [7, 2, 24]] as const) {
    const top = 46 - drop;
    // the peg, standing out of the rail
    h.set(fx(u0), fy(48), TIMBER[4]).set(fx(u0 - 1), fy(48), TIMBER[4]).set(fx(u0), fy(47), TIMBER[2]).set(fx(u0 - 1), fy(47), TIMBER[2]);
    for (let v = top - long; v <= top; v++) {
      const t = (top - v) / long;
      // its point at the peg, its head swelling, then the cloth falling straight in folds to a soft hem
      const half = t < 0.5 ? 1 + 3.2 * Math.sin((t / 0.5) * (Math.PI / 2)) : 4.2 + 1.2 * (t - 0.5);
      const hem = t > 0.9 ? Math.round(Math.sin((u0 + v) * 1.7) * 0.6) : 0;
      for (let u = Math.round(u0 - half); u < Math.round(u0 + half); u++) {
        if (t > 0.94 && (u + hem) % 3 === 0) continue;
        const d = (u + 0.5 - u0) / half;
        // (folds: dark creases down the cloth below the head)
        const fold = t > 0.55 && Math.abs(((u - u0 + 40) % 3) - 1) < 0.5;
        h.set(fx(u), fy(v), fold ? HOOD[1] : d < -0.45 ? HOOD[3] : d > 0.5 ? HOOD[1] : HOOD[2]);
      }
    }
    // the eye-holes
    const ev = top - 10;
    for (const s of [-2, 1]) h.set(fx(u0 + s), fy(ev), DEEP).set(fx(u0 + s + 1), fy(ev), DEEP);
  }
  p.blit(compose(null, [h], null), 0, 0);
}

/** AN AXE ON TWO HOOKS: one of his great axes laid along the wall, its crescent blade at one end, its edge catching the light. */
function axeOnHooks(p: Px): void {
  const a = flat();
  // the haft along the wall, a little slanted, bound in iron at its end
  for (let u = -14; u <= 9; u++) {
    const v = 35 + Math.round((u + 14) * 0.08);
    a.set(fx(u), fy(v + 1), TIMBER[3]).set(fx(u), fy(v), TIMBER[2]).set(fx(u), fy(v - 1), TIMBER[0]);
    if (u >= -14 && u <= -12) a.set(fx(u), fy(v + 1), IRONS[3]).set(fx(u), fy(v), IRONS[2]);
  }
  // the head: the crescent, its edge to the right and bright
  for (let v = 26; v <= 48; v++) {
    for (let u = 4; u <= 15; u++) {
      const c = crescentAt((u + 0.5 - 9) / 11, (v - 37) / 11);
      if (!c) continue;
      a.set(fx(u), fy(v), c === 'edge' ? EDGE : v > 41 ? BLADE[3] : v < 31 ? BLADE[1] : BLADE[2]);
    }
  }
  p.blit(compose(null, [a], null), 0, 0);
  // the hooks, over the haft
  for (const u of [-8, 2]) p.set(fx(u), fy(38), SMALL_IRON[3]).set(fx(u), fy(37), SMALL_IRON[2]).set(fx(u + 1), fy(36), SMALL_IRON[2]).set(fx(u), fy(33), SMALL_IRON[0]);
}

/** A NOOSE ON A PEG: the rope hung from the wall, its knot wound round and round, the loop hanging open. */
function noose(p: Px): void {
  const r = flat();
  for (let u = -1; u <= 1; u++) r.set(fx(u), fy(50), TIMBER[3]).set(fx(u), fy(49), TIMBER[1]);
  // the rope down to the knot
  for (let v = 41; v <= 49; v++) r.set(fx(0), fy(v), ROPE[3]).set(fx(1), fy(v), ROPE[1]);
  // the knot: coils wound round the rope, each lit on its top
  for (let v = 33; v <= 41; v++) for (let u = -2; u <= 3; u++) r.set(fx(u), fy(v), (41 - v) % 2 === 0 ? ROPE[3] : u > 1 ? ROPE[1] : ROPE[2]);
  // the loop, hanging open under it
  for (let a = 0; a < Math.PI * 2; a += 0.08) {
    const u = Math.round(Math.sin(a) * 5);
    const v = Math.round(26 + Math.cos(a) * 7);
    r.set(fx(u), fy(v), Math.sin(a) < 0 ? ROPE[3] : ROPE[2]).set(fx(u + 1), fy(v), ROPE[1]);
  }
  p.blit(compose(null, [r], null), 0, 0);
}

/** A TORCH IN AN IRON CAGE: its head wrapped and burning inside a basket of bars, on a bracket: frame `f` of four. */
function cagedTorch(f: number): (p: Px) => void {
  return (p) => {
    for (let v = 27; v <= 32; v++) p.set(fx(0), fy(v), IRONS[2]);
    p.set(fx(1), fy(29), IRONS[0]);
    for (let v = 33; v <= 42; v++) p.set(fx(-1), fy(v), TIMBER[3]).set(fx(0), fy(v), TIMBER[2]).set(fx(1), fy(v), TIMBER[0]);
    for (let v = 41; v <= 44; v++) for (let u = -2; u <= 2; u++) p.set(fx(u), fy(v), u < 0 ? COAL[3] : COAL[2]);
    const flames: ReadonlyArray<readonly [number, number, number]> = [[12, 3.2, 1], [14, 3, -1], [11, 3.4, 2], [13, 3, -2]];
    const [h, w, lean] = flames[f % 4];
    tongue(p, fx(0), fy(45), h, w, lean, EMBER);
    // the cage over it: bars from the cup up round the fire, a ring at the top
    for (const u of [-4, 4]) for (let v = 40; v <= 52; v++) p.set(fx(u + (v > 48 ? (u < 0 ? 1 : -1) : 0)), fy(v), u < 0 ? IRONS[3] : IRONS[1]);
    for (let u = -4; u <= 4; u++) p.set(fx(u), fy(40), IRONS[3]);
    for (let u = -3; u <= 3; u++) p.set(fx(u), fy(53), IRONS[2]);
    p.set(fx(lean > 0 ? 2 : -2), fy(45 + h + 2), EMBER[3]);
  };
}

/** HIS BANNER: a short swallow-tailed pennant of his near-black red, his axe's crescent on it in old bone, from an iron rod. */
function blackBanner(p: Px): void {
  const top = 53;
  const half = 7;
  const c = flat();
  for (let u = -half; u <= half; u++) {
    // the fork: cut up into its middle
    const foot = 22 + Math.round(Math.max(0, 8 - Math.abs(u + 0.5) * 1.6)) + (Math.abs(u) % 3 === 1 ? 1 : 0);
    for (let v = foot; v <= top; v++) {
      const f = ((u + half + 0.5) / (2 * half + 1)) * 2;
      const fr = f - Math.floor(f);
      c.set(fx(u), fy(v), v === foot ? HOOD[1] : fr < 0.25 ? HOOD[3] : fr > 0.8 ? HOOD[1] : HOOD[2]);
    }
  }
  // the crescent on it
  for (let v = 34; v <= 48; v++) {
    for (let u = -5; u <= 5; u++) {
      const k = crescentAt((u + 0.5) / 6.5, (v - 41) / 6.5);
      if (k) c.set(fx(u), fy(v), k === 'edge' ? OLD_BONE[3] : OLD_BONE[2]);
    }
  }
  p.blit(c, 0, 0);
  for (let u = -half - 3; u <= half + 3; u++) p.set(fx(u), fy(top + 1), IRONS[3]).set(fx(u), fy(top), IRONS[0]);
  for (const u of [-half - 3, half + 3]) p.set(fx(u), fy(top + 2), IRONS[3]).set(fx(u), fy(top - 1), IRONS[0]);
}

/** BRANDING IRONS on a rack: three long irons hung by their wooden handles from pegs, leaning each its own way, their heads at the foot: his crescent, a ring, a bar. (The second look found the first, straight rods under a rail, reading as letters.) */
function brandingIrons(p: Px): void {
  const b = flat();
  // the rack: a board with three pegs
  for (let u = -10; u <= 9; u++) b.set(fx(u), fy(47), TIMBER[3]).set(fx(u), fy(46), TIMBER[2]).set(fx(u), fy(45), TIMBER[0]);
  for (const [u0, lean, len, kind] of [[-6, -0.16, 22, 0], [0, 0.1, 19, 1], [6, 0.2, 24, 2]] as const) {
    b.set(fx(u0), fy(44), TIMBER[4]).set(fx(u0 + 1), fy(44), TIMBER[1]);
    // its handle (wood), then its rod (iron) down, leaning
    const at = (k: number): [number, number] => [u0 + Math.sin(lean) * k, 44 - k];
    let foot: [number, number] = at(0);
    for (let k = 0; k <= len; k += 0.5) {
      const [u, v] = at(k);
      const U = Math.round(u);
      const V = Math.round(v);
      if (k <= 7) b.set(fx(U), fy(V), TIMBER[3]).set(fx(U + 1), fy(V), TIMBER[1]);
      else b.set(fx(U), fy(V), SMALL_IRON[3]);
      foot = [u, v];
    }
    // its head
    const [hu, hv] = [foot[0] + Math.sin(lean) * 3, foot[1] - 3];
    if (kind === 0) {
      for (let v = Math.round(hv) - 4; v <= Math.round(hv) + 4; v++) for (let u = Math.round(hu) - 4; u <= Math.round(hu) + 4; u++) {
        const c = crescentAt((u + 0.5 - hu) / 4, (v - hv) / 4);
        if (c) b.set(fx(u), fy(v), c === 'edge' ? SMALL_IRON[3] : SMALL_IRON[2]);
      }
    } else if (kind === 1) {
      for (let a = 0; a < Math.PI * 2; a += 0.25) b.set(fx(Math.round(hu + Math.cos(a) * 3.2)), fy(Math.round(hv + Math.sin(a) * 3.2)), Math.cos(a) < 0 ? SMALL_IRON[3] : SMALL_IRON[1]);
    } else {
      for (let k = -4; k <= 4; k++) b.set(fx(Math.round(hu + k * Math.cos(lean))), fy(Math.round(hv - 1 - k * Math.sin(lean))), SMALL_IRON[3]).set(fx(Math.round(hu + k * Math.cos(lean))), fy(Math.round(hv - 2 - k * Math.sin(lean))), SMALL_IRON[1]);
    }
  }
  p.blit(compose(null, [b], null), 0, 0);
}

/**
 * THE TOOLS OF HIS TRADE, hung on pegs: a cleaver, a saw and a pair of tongs, each hanging at its own
 * angle by its handle, dark iron and old wood. (The second look found the first, pale outlines on a
 * board, reading as a sign with lettering.)
 */
function tradeTools(p: Px): void {
  const t = flat();
  /** Paint a tool hung from a peg at (u0, v0) at angle `ang`: `shade(a, b)` its colour `a` down along it from the peg and `b` across it. */
  const hang = (u0: number, v0: number, ang: number, shade: (a: number, b: number) => string | null): void => {
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    for (let v = v0 - 26; v <= v0 + 1; v++) {
      for (let u = u0 - 14; u <= u0 + 14; u++) {
        const du = u + 0.5 - u0;
        const dv = v0 - v;
        const a = du * s + dv * c;
        const b = du * c - dv * s;
        const col = shade(a, b);
        if (col) t.set(fx(u), fy(v), col);
      }
    }
  };
  for (const u of [-9, 0, 8]) t.set(fx(u), fy(45), TIMBER[4]).set(fx(u), fy(44), TIMBER[2]);
  // the cleaver: its handle up to the peg, its broad blade below, its edge on the far side
  hang(-9, 44, 0.22, (a, b) => {
    if (a >= 0.5 && a < 7 && Math.abs(b) <= 1) return b < 0 ? TIMBER[3] : TIMBER[1];
    if (a >= 7 && a < 18 && b >= -1.5 && b <= 6) {
      if (Math.hypot(a - 9, b - 3.5) < 1) return DEEP;
      return b > 5.2 ? SMALL_IRON[3] : b < -0.7 ? DIM_IRON[3] : a > 17 ? DIM_IRON[0] : DIM_IRON[2];
    }
    return null;
  });
  // the saw: a wooden grip, a long tapering blade, its teeth along one side
  hang(0, 44, -0.1, (a, b) => {
    if (a >= 0.5 && a < 6 && Math.abs(b) <= 2.2) return Math.hypot(a - 3, b) < 0.9 ? DEEP : b < -1 ? TIMBER[3] : TIMBER[2];
    if (a >= 6 && a < 23) {
      const half = 2 - (a - 6) * 0.05;
      if (b >= -half && b <= half - 0.6) return b < -half + 1 ? (Math.floor(a) % 2 ? DIM_IRON[3] : DIM_IRON[0]) : DIM_IRON[2];
    }
    return null;
  });
  // the tongs: two long arms crossed at a rivet, their jaws bent in at the foot
  hang(8, 44, -0.2, (a, b) => {
    if (a < 0.5 || a > 22) return null;
    for (const side of [-1, 1]) {
      const centre = side * (1.6 - (a / 22) * 3.2) + (a > 19 ? -side * (a - 19) * 0.8 : 0);
      if (Math.abs(b - centre) <= 0.7) return side < 0 ? DIM_IRON[3] : DIM_IRON[2];
    }
    if (Math.hypot(a - 11, b) < 1) return SMALL_IRON[3];
    return null;
  });
  p.blit(compose(null, [t], null), 0, 0);
}

/** A SCONCE OF BLACK CANDLES: an iron bracket and its drip pan, two black candles burning in it: frame `f` of four. */
function sconce(f: number): (p: Px) => void {
  return (p) => {
    // the bracket and its pan
    for (let v = 26; v <= 31; v++) p.set(fx(0), fy(v), IRONS[2]);
    for (let u = -6; u <= 6; u++) p.set(fx(u), fy(32), IRONS[3]).set(fx(u), fy(31), u < 0 ? IRONS[2] : IRONS[0]);
    // the candles, wax run down them, and their flames
    for (const [u, h] of [[-3, 10], [3, 7]] as const) {
      for (let v = 33; v < 33 + h; v++) p.set(fx(u - 1), fy(v), BLACK_WAX[3]).set(fx(u), fy(v), BLACK_WAX[2]).set(fx(u + 1), fy(v), BLACK_WAX[1]);
      p.set(fx(u), fy(33 + h), INK);
      flame(p, fx(u), fy(33 + h + 1), 5 + ((f + (u > 0 ? 1 : 0)) % 2), 1.5, [0, 1, 0, -1][(f + (u > 0 ? 2 : 0)) % 4]);
    }
    p.set(fx(-6), fy(30), BLACK_WAX[2]).set(fx(5), fy(30), BLACK_WAX[2]);
  };
}

/** A CHAIN FROM THE DARK, the wall's height: a heavy chain hung from somewhere up in the dark, down the wall to a great iron hook a little off the floor. */
function chainFromDark(p: Px): void {
  const c = flat();
  // the links: one on its face (a ring, its middle the wall), the next on its edge (a bar)
  for (let v = 15, k = 0; v <= 79; v += 3, k++) {
    const u = Math.round(Math.sin(v * 0.06) * 1.5);
    if (k % 2) {
      c.set(fx(u - 2), fy(v), SMALL_IRON[3]).set(fx(u - 2), fy(v + 1), SMALL_IRON[3]).set(fx(u + 1), fy(v), SMALL_IRON[1]).set(fx(u + 1), fy(v + 1), SMALL_IRON[1]);
      c.set(fx(u - 1), fy(v + 2), SMALL_IRON[3]).set(fx(u), fy(v + 2), SMALL_IRON[2]).set(fx(u - 1), fy(v - 1), SMALL_IRON[2]).set(fx(u), fy(v - 1), SMALL_IRON[1]);
    } else {
      for (let d = -1; d <= 3; d++) c.set(fx(u - 1), fy(v + d), SMALL_IRON[3]).set(fx(u), fy(v + d), SMALL_IRON[2]);
    }
  }
  // the hook: a thick curl of iron, its point up, rust on it
  for (let a = 0; a <= Math.PI * 1.25; a += 0.08) {
    const u = Math.round(Math.sin(a) * -4.5) + 1;
    const v = Math.round(9 - Math.cos(a) * 5);
    c.set(fx(u), fy(v), a < 1.6 ? SMALL_IRON[3] : SMALL_IRON[2]).set(fx(u + 1), fy(v), SMALL_IRON[1]);
  }
  c.set(fx(-1), fy(13), SMALL_IRON[3]).set(fx(0), fy(14), SMALL_IRON[3]);
  c.set(fx(4), fy(7), OLD_RUST[2]).set(fx(-3), fy(6), OLD_RUST[2]);
  p.blit(compose(null, [c], null), 0, 0);
}

/** THE DART WALL'S SLOT: an iron mask of his trade riveted to the wall, its mouth the slot, the darts' points glinting in it. */
function dartMask(p: Px): void {
  const m = flat();
  for (let v = 20; v <= 42; v++) {
    for (let u = -8; u <= 7; u++) {
      const x = (u + 0.5) / 8;
      const y = (v - 31) / 11.5;
      if (x * x + y * y * (y > 0 ? 1 : 0.7) > 1) continue;
      m.set(fx(u), fy(v), x < -0.55 || y > 0.8 ? DIM_IRON[3] : x > 0.55 ? DIM_IRON[1] : DIM_IRON[2]);
    }
  }
  // its eyes: slits, dark; its brow
  for (const s of [-1, 1]) for (let k = 0; k <= 2; k++) m.set(fx(s * 3 + k - 1), fy(34), DEEP);
  for (let u = -6; u <= 5; u++) m.set(fx(u), fy(36), DIM_IRON[3]);
  // the mouth: the slot, the darts' points in it
  for (let u = -4; u <= 3; u++) m.set(fx(u), fy(26), DEEP).set(fx(u), fy(25), DEEP);
  for (const u of [-3, 2]) m.set(fx(u), fy(26), DIM_IRON[3]);
  m.set(fx(0), fy(26), GLINT);
  p.blit(compose(null, [m], null), 0, 0);
}

// =================================================================================================
// FLOOR TILES (a tile's picture, anchored at its top corner, as the floor's own)

/** SAWDUST over an old stain: the floor's own stones, a ragged spread of grey sawdust strewn on them, the stain showing through in patches. */
function sawdustTile(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  const a = Math.atan2(y, x);
  const edge = 0.33 + 0.07 * Math.sin(a * 3 + 1) + 0.04 * Math.sin(a * 7) + (hash(Math.floor(u * 14), Math.floor(v * 14), 211) - 0.5) * 0.06;
  const r = Math.hypot(x, y * 1.05);
  const g = hash(Math.floor(u * 40), Math.floor(v * 40), 212);
  if (r < edge) {
    // the stain showing through where it is thin
    if (hash(Math.floor(u * 9), Math.floor(v * 9), 214) < 0.18) return g < 0.5 ? STAIN[1] : STAIN[2];
    return g < 0.14 ? SAWDUST[2] : g < 0.6 ? SAWDUST[1] : SAWDUST[0];
  }
  // a few grains strewn past it
  if (r < edge + 0.08 && g < 0.25) return SAWDUST[1];
  return null;
}

/** A GUTTER cut along a slab, to carry off what is spilled, to a round iron grate at its end: its two lips, its dark bed, old stain in it. */
function gutter(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  const g = Math.hypot(x - 0.28, y);
  if (g < 0.11) return g > 0.085 ? IRONS[3] : Math.abs(((x - 0.28) * 40) % 1) < 0.35 ? IRONS[2] : DEEP;
  if (Math.abs(y) <= 0.075 && x < 0.28) {
    if (Math.abs(y) > 0.05) return y < 0 ? SLAB[0] : SLAB[3];
    return hash(Math.floor(u * 30), 0, 218) < 0.6 ? STAIN[0] : STAIN[1];
  }
  return hash(Math.floor(u * 3), Math.floor(v * 3), 214) < 0.5 ? SLAB[2] : SLAB[1];
}

/** A TRAPDOOR of old timber let into the floor: planks along y, two iron straps across them, a ring to lift it. */
function trapdoor(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  const plank = Math.floor((x + 0.5) * 5);
  const seam = Math.abs(((x + 0.5) * 5) % 1) < 0.07;
  if (Math.abs(y + 0.22) < 0.04 || Math.abs(y - 0.22) < 0.04) return Math.abs(x) < 0.33 ? (y < 0 ? IRONS[3] : IRONS[2]) : IRONS[2];
  if (Math.hypot(x - 0.18, y) < 0.06 && Math.hypot(x - 0.18, y) > 0.035) return SMALL_IRON[3];
  if (seam) return TIMBER[0];
  return plank % 2 ? TIMBER[2] : mix(TIMBER[2], TIMBER[3], 0.4);
}

/** WHERE HIS SENTENCE SPLIT THE FLOOR: a jagged rent right across the tile, scorched at its edges, the slab on its far side heaved up a little. */
function splitFloor(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  const line = 0.06 * Math.sin(x * 14) + 0.04 * Math.sin(x * 31 + 1) + (hash(Math.floor(x * 12), 0, 215) - 0.5) * 0.05;
  const d = y - line;
  const wide = 0.035 + 0.02 * Math.sin(x * 7 + 2);
  if (Math.abs(d) < wide) return DEEP;
  if (Math.abs(d) < wide + 0.035) return d < 0 ? SLAB[3] : '#160f1c';
  if (Math.abs(d) < wide + 0.09 && hash(Math.floor(u * 30), Math.floor(v * 30), 216) < 0.5) return '#1c1424';
  return around(u, v);
}

function hoodInlay(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  // his hood laid in dark stone, a little to one side; his axe's crescent beside it in pale
  const s = (x - y + 0.12) / 0.34;
  const t = -(x + y) / 0.36 - 0.05;
  const h = hoodAt(s, t);
  if (h === 'dark') return DEEP;
  if (h === 'hood') return hoodAt((x - y + 0.12 + 0.025) / 0.34, -(x + y - 0.035) / 0.36 - 0.05) ? SLAB[0] : SLAB[3];
  const c = crescentAt((x - y - 0.27) / -0.14, -(x + y) / 0.14);
  if (c) return c === 'edge' ? FACE[4] : SLAB[3];
  return SLAB[2];
}

/** A PATCH OF COBBLES where the scaffold stood: rough round stones set close in the earth. */
function cobbles(u: number, v: number): string | null {
  const [x, y] = mid(u, v);
  if (Math.hypot(x, y * 1.1) > 0.42) return null;
  // the nearest of a scatter of stones, and how near the next
  let best = 9;
  let next = 9;
  let k = 0;
  for (let i = 0; i < 26; i++) {
    const cx = hash(i, 1, 217) - 0.5;
    const cy = hash(i, 2, 217) - 0.5;
    const d = Math.hypot(x - cx, y - cy);
    if (d < best) {
      next = best;
      best = d;
      k = i;
    } else if (d < next) next = d;
  }
  if (next - best < 0.03) return '#120d1a';
  const toLight = (x - (hash(k, 1, 217) - 0.5)) + (y - (hash(k, 2, 217) - 0.5));
  return toLight < -0.05 ? SLAB[3] : toLight > 0.06 ? SLAB[0] : k % 3 ? SLAB[2] : SLAB[1];
}

// =================================================================================================
// TRAPS

/**
 * THE SPIKE FLOOR'S TILE, on this floor: an iron plate let into the stone, three long slots across
 * it; with `glint`, the warning, the edges of the blades that will come up through them catching the
 * light. Anchored at the middle, as the game's holes are.
 */
function bladeSlots(glint: boolean): Sprite {
  const t = tileOf(
    (u, v) => {
      const [x, y] = mid(u, v);
      for (const sy of [-0.24, 0, 0.24]) {
        if (Math.abs(y - sy) < 0.035 && Math.abs(x) < 0.34) return glint ? (Math.abs(y - sy) < 0.015 && Math.abs(x + sy * 0.6) < 0.06 ? EDGE : Math.abs(y - sy) < 0.015 ? BLADE[3] : BLADE[2]) : DEEP;
        if (Math.abs(y - sy) < 0.06 && Math.abs(x) < 0.37) return DIM_IRON[0];
      }
      // its rivets at the corners
      if (Math.abs(Math.abs(x) - 0.38) < 0.03 && Math.abs(Math.abs(y) - 0.38) < 0.03) return DIM_IRON[4];
      return x + y < -0.6 ? DIM_IRON[3] : DIM_IRON[2];
    },
    box(0.06, 0.94, 0.06, 0.94),
  ).sprite(32, 0, GRAIN);
  return { ...t, ay: t.ay + 8 };
}

/** THE DART WALL'S PLATE: a square stone with his axe's crescent cut in it, a hair raised in its own gap until it is trodden on; `pressed`, sunk flush. Only the plate is raised. Anchored at the middle. */
function crescentPlate(pressed: boolean): Sprite {
  const up = pressed ? 0 : 2;
  const inside = box(0.12, 0.88, 0.12, 0.88);
  const A = tileOf((u, v) => {
    const [x, y] = mid(u, v);
    const c = crescentAt((x - y) / 0.3, -(x + y) / 0.3);
    if (c) return pressed ? SLAB[0] : THEME.mortar;
    return pressed ? SLAB[1] : SLAB[2];
  }, inside);
  const isPlate = (x: number, y: number): boolean => {
    if (x < 0 || y < 0 || x >= 64 || y >= 32) return false;
    const c = A.get(x, y);
    return !!c && c !== THEME.mortar && inside((x + 0.5 - 32) / 64 + (y + 0.5) / 32, (y + 0.5) / 32 - (x + 0.5 - 32) / 64) && !(A.get(x - 1, y) === THEME.mortar || A.get(x + 1, y) === THEME.mortar);
  };
  const out = new Px(64, 34);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 64; x++) {
    const c = A.get(x, y);
    if (c && !isPlate(x, y)) out.set(x, y + 2, c);
  }
  for (let y = 0; y < 32; y++) for (let x = 0; x < 64; x++) {
    if (!isPlate(x, y)) continue;
    out.set(x, y + 2 - up, A.get(x, y)!);
    if (up && !isPlate(x, y + 1)) for (let k = 1; k <= up; k++) out.set(x, y + 2 - up + k, k === up ? THEME.mortar : SLAB[0]);
  }
  return out.sprite(32, 18, GRAIN);
}

// =================================================================================================
// BREAKABLES (the game's barrel and urn): round, standing at the middle of their foot

/** THE BASKET at the foot of the block: tall, woven of wicker in bands, straw sticking up out of it. 32 x 44 at (16, 38). */
function basket(): Sprite {
  const W = 32;
  const H = 44;
  const cx = 16;
  const foot = 38;
  const top = 14;
  const body = new Px(W, H);
  const straw = new Px(W, H);
  const half = (t: number): number => 9 + 1.6 * Math.sin(t * Math.PI * 0.8) - t * 1.2;
  lit(body, WICKER, [1, 3], [1, 4], (l) => column(l, cx, top, foot - 1, half));
  // the weave: rows of it, each a step off the one over it
  for (let y = top + 2; y < foot - 1; y += 2) {
    for (let x = cx - 11; x <= cx + 11; x++) if (body.has(x, y) && (x + Math.floor(y / 2)) % 3 === 0) body.set(x, y, WICKER[1]);
  }
  hoop(body, cx, top, half(0) + 0.5, 2, 1.4, WICKER);
  body.ellipse(cx, top + 1, 7.5, 1.6, DEEP);
  // straw sticking out of it, grey
  for (let i = 0; i < 9; i++) {
    const x0 = cx - 6 + Math.floor(hash(i, 1, 221) * 12);
    const lean = Math.round((hash(i, 2, 221) - 0.5) * 6);
    straw.line(x0, top + 1, x0 + lean, top - 4 - Math.floor(hash(i, 3, 221) * 4), hash(i, 4, 221) < 0.5 ? SAWDUST[2] : SAWDUST[1]);
  }
  return compose(null, [body, straw], null).sprite(cx, foot, GRAIN);
}

/** A BARREL OF SAWDUST: old staves in two iron hoops, its head off, grey sawdust heaped up in it. 32 x 46 at (16, 40). */
function sawdustBarrel(): Sprite {
  const W = 32;
  const H = 46;
  const cx = 16;
  const foot = 40;
  const top = 10;
  const body = new Px(W, H);
  const iron = new Px(W, H);
  const dust = new Px(W, H);
  const half = (t: number): number => 9.5 + 3 * Math.sin(t * Math.PI);
  lit(body, TIMBER, [1, 4], [1, 5], (l) => {
    column(l, cx, top, foot - 3, half);
    l.ellipse(cx, foot - 3, 9.5, 2.8, INK);
  });
  for (const f of [-0.56, -0.12, 0.34]) {
    for (let y = top + 3; y < foot - 2; y++) {
      const x = Math.round(cx + f * half((y - top) / (foot - 3 - top)) - 0.5);
      if (body.has(x, y)) body.set(x, y, TIMBER[0]);
    }
  }
  body.ellipse(cx, top + 0.5, 9.5, 3.2, TIMBER[0]);
  // the sawdust heaped above its rim, lit on its upper left
  lit(dust, [SAWDUST[0], SAWDUST[0], SAWDUST[1], SAWDUST[2], SAWDUST[2]], [1, 2], [1, 2], (l) => l.ellipse(cx, top - 1, 8.5, 3.6, INK));
  for (const t of [0.2, 0.76]) hoop(iron, cx, Math.round(top + t * (foot - 3 - top)), half(t) + 0.5, 3, 1.6, IRONS);
  return compose(null, [body, iron, dust], null).sprite(cx, foot, GRAIN);
}

/** A PAIL of old staves, iron hoops round it, a rope for a handle. 30 x 36 at (15, 31). */
function pail(): Sprite {
  const W = 30;
  const H = 36;
  const cx = 15;
  const foot = 31;
  const top = 15;
  const body = new Px(W, H);
  const iron = new Px(W, H);
  const half = (t: number): number => 8 - 1.6 * t;
  lit(body, TIMBER, [1, 3], [1, 4], (l) => column(l, cx, top, foot - 1, half));
  for (const f of [-0.5, 0, 0.5]) for (let y = top + 2; y < foot - 1; y++) body.set(Math.round(cx + f * half((y - top) / (foot - 1 - top))), y, TIMBER[0]);
  body.ellipse(cx, top, 8, 2.2, TIMBER[3]);
  body.ellipse(cx, top + 0.4, 6.6, 1.4, STAIN[0]);
  for (const t of [0.25, 0.78]) hoop(iron, cx, Math.round(top + t * (foot - 1 - top)), half(t) + 0.4, 2, 1.2, IRONS);
  // the rope handle, arched over it
  for (let a = 0.15; a < Math.PI - 0.15; a += 0.08) iron.set(Math.round(cx - Math.cos(a) * 8), Math.round(top - Math.sin(a) * 9), a < Math.PI / 2 ? ROPE[3] : ROPE[2]);
  return compose(null, [body, iron], null).sprite(cx, foot, GRAIN);
}

/** A CRATE of rough planks on the grid, a brace across each side, iron at its corners. 56 x 48 at (28, 38). */
function crate(): Sprite {
  const W = 56;
  const H = 48;
  const ox = 28;
  const oy = 38;
  const b = new Px(W, H);
  const iso = new Iso(b, ox, oy);
  const A = 0.26;
  const B = 0.21;
  const planked = (lit_: boolean) => (u: number, v: number, w: number, h: number): string => {
    if (u <= 1 || u >= w - 2) return lit_ ? (u <= 1 ? IRONS[3] : IRONS[2]) : IRONS[1];
    if (v === 0) return lit_ ? TIMBER[3] : TIMBER[2];
    if (v >= h - 1) return lit_ ? TIMBER[1] : TIMBER[0];
    if (Math.abs(v - (u / w) * h) < 1.2) return lit_ ? TIMBER[3] : TIMBER[2];
    if (v % 6 === 0) return lit_ ? TIMBER[1] : TIMBER[0];
    return lit_ ? TIMBER[2] : mix(TIMBER[0], TIMBER[2], 0.4);
  };
  iso.box(-A, -B, A, B, 0, 18, { top: (u, v) => (Math.abs(((u * 4) % 1) - 0.5) > 0.42 ? TIMBER[2] : v < 0.1 || u < 0.08 ? TIMBER[4] : TIMBER[3]), left: planked(true), right: planked(false) });
  return compose(null, [b], null).sprite(ox, oy, GRAIN);
}

/**
 * WHAT A BREAKABLE LEAVES, on the floor where it stood: spread in an oval twice as wide as deep.
 * `kind`: the basket (its wicker crushed and split, straw and a skull rolled out), the barrel
 * (staves, a hoop sprung, its sawdust spilled), the pail (staves, its hoops, what was in it), the
 * crate (planks and a brace split, an iron corner).
 */
function brokenOf(kind: 'basket' | 'barrel' | 'pail' | 'crate'): Sprite {
  const W = 60;
  const H = 36;
  const cx = 30;
  const cy = 20;
  const p = new Px(W, H);
  const under = new Px(W, H);
  const dustHeap = (x: number, y: number, rx: number, ry: number): void => {
    lit(under, [SAWDUST[0], SAWDUST[0], SAWDUST[1], SAWDUST[2], SAWDUST[2]], [1, 2], [1, 2], (l) => l.ellipse(x, y, rx, ry, INK));
    for (let i = 0; i < 14; i++) under.set(x - rx - 3 + Math.floor(hash(i, 1, 222) * (rx * 2 + 6)), y - ry + Math.floor(hash(i, 2, 222) * (ry * 2 + 2)), hash(i, 3, 222) < 0.5 ? SAWDUST[2] : SAWDUST[0]);
  };
  const staves = (list: ReadonlyArray<readonly [number, number, number, 1 | -1]>, r: Ramp): void => {
    for (const [x, y, len, way] of list) {
      for (let k = 0; k < len; k++) {
        const xx = x + (way > 0 ? k : -k);
        const yy = y + Math.floor(k / 2);
        p.set(xx, yy, r[3]).set(xx, yy + 1, r[2]).set(xx, yy + 2, r[0]);
      }
    }
  };
  if (kind === 'basket') {
    // split wicker: curved pieces of its weave, straw out of it, and a skull rolled clear
    for (const [x, y, w] of [[cx - 16, cy - 3, 11], [cx + 2, cy + 1, 12], [cx - 6, cy + 5, 8]] as const) {
      for (let k = 0; k < w; k++) {
        const yy = y + Math.round(Math.sin((k / w) * Math.PI) * -2);
        p.set(x + k, yy, (k + yy) % 3 ? WICKER[3] : WICKER[1]).set(x + k, yy + 1, WICKER[2]).set(x + k, yy + 2, WICKER[0]);
      }
    }
    for (let i = 0; i < 8; i++) {
      const x = cx - 14 + Math.floor(hash(i, 1, 223) * 26);
      const y = cy - 6 + Math.floor(hash(i, 2, 223) * 12);
      p.line(x, y, x + 4 + Math.floor(hash(i, 3, 223) * 3), y + 1, SAWDUST[2]);
    }
    ball(p, cx + 15, cy - 2, 4.4, 4, OLD_BONE);
    p.rect(cx + 12, cy - 3, 2, 2, DEEP).rect(cx + 16, cy - 3, 2, 2, DEEP);
    p.set(cx + 14, cy, DEEP);
  } else if (kind === 'barrel') {
    dustHeap(cx - 2, cy + 1, 12, 4);
    staves([[cx - 18, cy - 4, 12, 1], [cx + 4, cy + 3, 11, 1], [cx + 14, cy - 5, 9, -1]], TIMBER);
    for (let a = 0; a < Math.PI * 1.3; a += 0.1) {
      const x = cx + 10 + Math.cos(a + 2.4) * 6;
      const y = cy - 2 + Math.sin(a + 2.4) * 3;
      p.set(Math.round(x), Math.round(y) + 1, IRONS[2]).set(Math.round(x), Math.round(y), a < 1.5 ? IRONS[3] : IRONS[2]);
    }
  } else if (kind === 'pail') {
    under.ellipse(cx, cy + 2, 13, 4, STAIN[1]);
    under.ellipse(cx - 2, cy + 1, 8, 2.6, STAIN[0]);
    staves([[cx - 14, cy - 3, 8, 1], [cx + 5, cy + 3, 8, 1], [cx + 12, cy - 4, 7, -1]], TIMBER);
    for (const [hx, hy] of [[cx - 4, cy - 4], [cx + 6, cy - 1]] as const) {
      for (let a = 0; a < Math.PI * 2; a += 0.15) p.set(Math.round(hx + Math.cos(a) * 5), Math.round(hy + Math.sin(a) * 2), Math.sin(a) < 0 ? IRONS[3] : IRONS[1]);
    }
  } else {
    staves([[cx - 18, cy - 3, 13, 1], [cx + 2, cy + 2, 13, 1], [cx - 4, cy - 7, 10, -1], [cx + 15, cy - 4, 9, -1]], TIMBER);
    p.rect(cx - 19, cy - 4, 2, 2, IRONS[3]).rect(cx + 14, cy + 6, 2, 2, IRONS[3]);
  }
  return compose(under, [p], null).sprite(cx, cy, GRAIN);
}

// =================================================================================================
// ON THE FLOOR: lying along its lines, at the middle of their floor

/** A STOOL KICKED OVER: three legs up and out, its round seat on its edge. Stands off the floor a little. 44 x 36 at (22, 28). */
function kickedStool(): Sprite {
  const W = 44;
  const H = 36;
  const cx = 22;
  const cy = 28;
  const p = new Px(W, H);
  // the seat on its edge, its top turned to us: an upright oval, its rim lit
  lit(p, TIMBER, [1, 2], [1, 3], (l) => l.ellipse(cx - 7, cy - 8, 4, 8, INK));
  p.ellipse(cx - 6, cy - 8, 2.6, 6.4, TIMBER[2]);
  // its legs, from the seat's underside out along the floor, splayed
  limb(p, cx - 5, cy - 12, cx + 15, cy - 15, 1.6, 1.3, TIMBER);
  limb(p, cx - 5, cy - 6, cx + 16, cy - 4, 1.6, 1.3, TIMBER);
  limb(p, cx - 4, cy - 2, cx + 11, cy + 4, 1.6, 1.3, TIMBER);
  limb(p, cx + 6, cy - 14, cx + 7, cy - 3, 0.8, 0.8, TIMBER);
  return compose(null, [p], null).sprite(cx, cy, GRAIN);
}

/** A BROKEN AXE: his great axe's haft snapped, the head with its stump lying flat along the floor, the rest of the haft by it. */
function brokenAxe(): Sprite {
  const p = lying((l) => {
    // the long piece of haft
    l.line(LCX - 24, LCY + 2, LCX - 2, LCY + 3, TIMBER[3]);
    l.line(LCX - 24, LCY + 3, LCX - 2, LCY + 4, TIMBER[2]);
    l.line(LCX - 24, LCY + 4, LCX - 2, LCY + 5, TIMBER[0]);
    // its splintered end, and the stump's
    for (const [x, y] of [[LCX - 2, LCY + 2], [LCX - 1, LCY + 3], [LCX - 2, LCY + 5], [LCX + 3, LCY - 4], [LCX + 2, LCY - 3]] as const) l.set(x, y, TIMBER[4]);
    // the stump, at a slant, into the head
    l.line(LCX + 3, LCY - 3, LCX + 12, LCY - 6, TIMBER[3]);
    l.line(LCX + 3, LCY - 2, LCX + 12, LCY - 5, TIMBER[0]);
    // the head: the crescent, its edge up, lying flat
    for (let y = LCY - 18; y <= LCY + 2; y++) {
      for (let x = LCX + 8; x <= LCX + 26; x++) {
        const c = crescentAt((x + 0.5 - (LCX + 14)) / 10, (y - (LCY - 8)) / 10);
        if (c) l.set(x, y, c === 'edge' ? EDGE : y < LCY - 12 ? BLADE[3] : BLADE[2]);
      }
    }
  });
  return compose(null, [p], null).sprite(LCX, LCY, GRAIN);
}

/** A COIL OF ROPE on the floor, its end trailing off along the floor's line. */
function ropeCoil(): Sprite {
  const W = 52;
  const H = 32;
  const cx = 22;
  const cy = 16;
  const p = new Px(W, H);
  for (let a = 0; a < Math.PI * 2 * 3.4; a += 0.03) {
    const r = 3 + a * 0.55;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r * 0.5;
    p.set(Math.round(x), Math.round(y), Math.sin(a) < -0.3 ? ROPE[3] : Math.sin(a) > 0.5 ? ROPE[1] : ROPE[2]);
  }
  // its end, out along the floor
  for (let k = 0; k < 18; k++) p.set(cx + 13 + k, cy + 3 + Math.floor(k / 2), ROPE[2]).set(cx + 13 + k, cy + 4 + Math.floor(k / 2), ROPE[0]);
  return compose(null, [p], null).sprite(cx, cy, GRAIN);
}

/** THE CONDEMNED'S BONES IN IRONS: a skeleton lying along the floor, its shins still in the leg irons, the chain between them. */
function chainedBones(): Sprite {
  const p = lying((l) => {
    // the spine and ribs, the skull at its head
    limb(l, LCX - 14, LCY, LCX + 2, LCY + 1, 1.2, 1.1, OLD_BONE);
    for (let k = 0; k < 4; k++) l.line(LCX - 12 + k * 3, LCY - 3, LCX - 11 + k * 3, LCY + 4, OLD_BONE[2]);
    ball(l, LCX - 18, LCY, 4.4, 4, OLD_BONE);
    l.rect(LCX - 21, LCY - 1, 2, 2, DEEP).rect(LCX - 17, LCY - 1, 2, 2, DEEP);
    // the legs: down to the irons
    limb(l, LCX + 2, LCY - 2, LCX + 16, LCY - 4, 1.2, 1, OLD_BONE);
    limb(l, LCX + 2, LCY + 3, LCX + 16, LCY + 5, 1.2, 1, OLD_BONE);
    for (const y of [LCY - 4, LCY + 5]) {
      l.rect(LCX + 14, y - 2, 4, 4, SMALL_IRON[2]);
      l.set(LCX + 14, y - 2, SMALL_IRON[3]).set(LCX + 15, y - 2, SMALL_IRON[3]);
    }
    // the chain between the irons, slack
    for (let k = 0; k <= 8; k++) l.set(LCX + 18 + Math.round(Math.sin((k / 8) * Math.PI) * 4), LCY - 3 + k, k % 2 ? SMALL_IRON[3] : SMALL_IRON[1]);
    // an arm flung out
    limb(l, LCX - 8, LCY - 3, LCX - 2, LCY - 13, 1, 0.9, OLD_BONE);
  });
  return compose(null, [p], null).sprite(LCX, LCY, GRAIN);
}

/** A LANTERN, guttered out: an iron lantern stood on the floor, a peaked cap and a ring on it, its panes dark, a dead candle stub in it. Stands at the middle of its foot. 32 x 48 at (16, 42). */
function droppedLantern(): Sprite {
  const W = 32;
  const H = 48;
  const cx = 16;
  const foot = 42;
  const p = new Px(W, H);
  // its body: four panes in an iron frame, seen at its corner: two panes, its frame between and round them
  for (let y = foot - 18; y <= foot - 2; y++) {
    for (let x = cx - 7; x <= cx + 6; x++) {
      const frame = x === cx - 7 || x === cx + 6 || x === cx || x === cx - 1 || y === foot - 18 || y === foot - 2;
      p.set(x, y, frame ? (x <= cx - 1 ? IRONS[3] : IRONS[1]) : x < cx ? '#1c1a32' : '#131126');
    }
  }
  // the stub inside, and its foot
  p.rect(cx - 4, foot - 7, 2, 5, BLACK_WAX[3]);
  p.set(cx - 4, foot - 8, INK);
  lit(p, IRONS, [1, 2], [1, 2], (l) => l.rect(cx - 8, foot - 2, 16, 2, INK));
  // the cap, peaked; its ring
  lit(p, IRONS, [1, 2], [1, 2], (l) => l.poly([[cx - 8, foot - 18], [cx, foot - 25], [cx + 7, foot - 18]], INK));
  for (let a = 0; a < Math.PI * 2; a += 0.3) p.set(Math.round(cx + Math.cos(a) * 2.4), Math.round(foot - 28 + Math.sin(a) * 2.4), Math.cos(a) < 0 ? SMALL_IRON[3] : SMALL_IRON[1]);
  p.set(cx - 5, foot - 15, GLINT);
  return compose(null, [p], null).sprite(cx, foot, GRAIN);
}

/** SKULLS IN THE SAWDUST: three skulls lying where they rolled, in a scatter of grey sawdust. */
function skullsInSawdust(): Sprite {
  const W = 60;
  const H = 36;
  const cx = 30;
  const cy = 20;
  const p = new Px(W, H);
  const under = new Px(W, H);
  for (let i = 0; i < 30; i++) under.rect(cx - 22 + Math.floor(hash(i, 1, 224) * 44), cy - 5 + Math.floor(hash(i, 2, 224) * 12), 2, 1, hash(i, 3, 224) < 0.4 ? SAWDUST[2] : SAWDUST[1]);
  for (const [x, y, look] of [[cx - 12, cy - 1, 1], [cx + 3, cy - 4, -1], [cx + 13, cy + 4, 0]] as const) {
    ball(p, x, y, 4.6, 4.2, OLD_BONE);
    p.rect(x - 3 + look, y - 1, 2, 2, DEEP).rect(x + 1 + look, y - 1, 2, 2, DEEP);
    p.set(x + look, y + 2, DEEP);
  }
  return compose(under, [p], null).sprite(cx, cy, GRAIN);
}

/** A CART WHEEL lying flat on the floor, cracked across, two spokes gone. */
function brokenWheel(): Sprite {
  const W = 56;
  const H = 34;
  const cx = 28;
  const cy = 17;
  const p = new Px(W, H);
  // the rim: a flat ring, seen from above as an oval, lit on its far edge
  for (let a = 0; a < Math.PI * 2; a += 0.02) {
    if (a > 0.5 && a < 0.62) continue;
    for (let r = 10.5; r <= 13; r += 0.5) {
      const x = cx + Math.cos(a) * r * 1.6;
      const y = cy + Math.sin(a) * r * 0.8;
      p.set(Math.round(x), Math.round(y), Math.sin(a) < -0.3 ? TIMBER[3] : r > 12.2 ? TIMBER[0] : TIMBER[2]);
    }
  }
  // the hub and the spokes left
  lit(p, TIMBER, [1, 2], [1, 2], (l) => l.ellipse(cx, cy, 4, 2.2, INK));
  for (let k = 0; k < 8; k++) {
    if (k === 1 || k === 5) continue;
    const a = (k / 8) * Math.PI * 2;
    p.line(Math.round(cx + Math.cos(a) * 5), Math.round(cy + Math.sin(a) * 2.6), Math.round(cx + Math.cos(a) * 16), Math.round(cy + Math.sin(a) * 8), TIMBER[2]);
  }
  p.set(cx, cy, IRONS[3]);
  return compose(null, [p], null).sprite(cx, cy, GRAIN);
}

// =================================================================================================
// STANDING THINGS, built on the grid; anchored at the middle of their tile

/** THE BLOCK: a squat round block of old timber, its top hacked with old cuts, his axe bitten into it and left standing, a stain down its side, sawdust round its foot. 64 x 92 at (32, 76). */
function theBlock(): Sprite {
  const W = 64;
  const H = 92;
  const cx = 32;
  const foot = 76;
  const top = 58;
  const under = new Px(W, H);
  const wood = new Px(W, H);
  const axe = new Px(W, H);
  // sawdust round its foot
  for (let i = 0; i < 26; i++) under.rect(cx - 20 + Math.floor(hash(i, 1, 231) * 40), foot - 4 + Math.floor(hash(i, 2, 231) * 8), 2, 1, hash(i, 3, 231) < 0.4 ? SAWDUST[2] : SAWDUST[1]);
  lit(wood, TIMBER, [1, 4], [1, 5], (l) => {
    column(l, cx, top, foot - 3, (t) => 13 + 1.2 * t);
    l.ellipse(cx, foot - 3, 14, 3.6, INK);
  });
  // its top: the end grain, rings, old cuts across it
  wood.ellipse(cx, top, 13, 4.4, TIMBER[3]);
  wood.ellipse(cx, top + 0.3, 9, 3, TIMBER[2]);
  wood.ellipse(cx, top + 0.4, 4.5, 1.5, TIMBER[3]);
  for (const [x0, x1, dy] of [[-9, 2, -1], [-3, 8, 1], [-6, 6, 2]] as const) wood.line(cx + x0, top + dy, cx + x1, top + dy - 1, TIMBER[0]);
  // the stain down its side
  for (let y = top + 3; y <= foot - 5; y++) for (let k = 0; k < 3 - Math.floor((y - top) / 7); k++) wood.set(cx + 4 + k + Math.round(Math.sin(y * 0.4)), y, STAIN[1]);
  // the axe, bitten in: its head sunk in the top, the haft up and back to the left
  for (let y = top - 18; y <= top + 2; y++) {
    for (let x = cx - 2; x <= cx + 16; x++) {
      const c = crescentAt((x + 0.5 - (cx + 6)) / 10, (y - (top - 8)) / 10);
      if (!c) continue;
      if (y > top - 1 && x > cx + 1) continue;
      axe.set(x, y, c === 'edge' ? EDGE : y < top - 13 ? BLADE[3] : BLADE[2]);
    }
  }
  limb(axe, cx + 2, top - 9, cx - 20, top - 44, 1.6, 1.4, TIMBER);
  for (let k = 0; k < 3; k++) axe.set(cx - 19 + k, top - 42 - k, IRONS[3]);
  return compose(under, [wood, axe], null).sprite(cx, foot, GRAIN);
}

/** THE SCAFFOLD: a platform of planks, as high as a man's waist, boarded round to the floor, steps up its near side, a block on it and the planks stained round the block. 128 x 112 at (64, 84). */
function scaffold(): Sprite {
  const W = 128;
  const H = 112;
  const ox = 64;
  const oy = 84;
  const deck = new Px(W, H);
  const steps = new Px(W, H);
  const top = new Px(W, H);
  const d = new Iso(deck, ox, oy);
  const boarded = (lit_: boolean) => (u: number, v: number, _w: number, h: number): string => {
    if (v <= 1) return lit_ ? TIMBER[4] : TIMBER[2];
    if (v >= h - 1) return lit_ ? TIMBER[1] : TIMBER[0];
    // upright boards, a rail across them under the deck
    if (v === 5) return lit_ ? TIMBER[1] : TIMBER[0];
    if (u % 7 === 0) return lit_ ? TIMBER[1] : TIMBER[0];
    return lit_ ? TIMBER[2] : mix(TIMBER[0], TIMBER[2], 0.4);
  };
  d.box(-0.5, -0.5, 0.5, 0.5, 0, 26, {
    top: (u, v) => {
      const seam = Math.abs(((u * 7) % 1) - 0.5) > 0.44;
      if (Math.hypot(u - 0.45, v - 0.42) < 0.17 && hash(Math.floor(u * 30), Math.floor(v * 30), 232) < 0.7) return hash(Math.floor(u * 20), Math.floor(v * 20), 233) < 0.5 ? STAIN[1] : STAIN[2];
      return seam ? TIMBER[1] : v < 0.04 || u < 0.03 ? TIMBER[4] : TIMBER[3];
    },
    left: boarded(true),
    right: boarded(false),
  });
  // the steps up its near side (toward +y): three, each a block, the lowest farthest out
  const s = new Iso(steps, ox, oy);
  for (let k = 0; k < 3; k++) {
    const y0 = 0.5 + (2 - k) * 0.12;
    s.box(-0.3, y0, 0.08, y0 + 0.12, 0, 9 + k * 8, { top: () => TIMBER[3], left: (_u, v, _w, h) => (v === 0 ? TIMBER[4] : v >= h - 1 ? TIMBER[1] : TIMBER[2]), right: shadeSide(TIMBER) });
  }
  // a block on it, where the stain is; posts up at its far corners with a rail between them
  const t = new Iso(top, ox, oy);
  t.box(0.0, -0.18, 0.16, -0.04, 26, 34, { top: () => TIMBER[3], left: litSide(TIMBER), right: shadeSide(TIMBER) });
  const back = new Px(W, H);
  const bk = new Iso(back, ox, oy);
  for (const [x, y] of [[-0.5, -0.5], [0.42, -0.5], [-0.5, 0.42]] as const) block(bk, TIMBER, x, y, x + 0.08, y + 0.08, 26, 48);
  block(bk, TIMBER, -0.5, -0.5, 0.5, -0.43, 42, 46);
  block(bk, TIMBER, -0.5, -0.5, -0.43, 0.5, 42, 46);
  const fr = new Px(W, H);
  block(new Iso(fr, ox, oy), TIMBER, 0.42, 0.42, 0.5, 0.5, 26, 48);
  return compose(null, [back, deck, steps, top, fr], null).sprite(ox, oy, GRAIN);
}

/** THE GALLOWS: an upright post on a heavy footing, its beam out along y (to the left, the noose on its lit side), a brace under it, and a noose hanging from the beam's end. 104 x 168 at (40, 150). */
function gallows(): Sprite {
  const W = 104;
  const H = 168;
  const ox = 40;
  const oy = 150;
  const wood = new Px(W, H);
  const rope = new Px(W, H);
  const iso = new Iso(wood, ox, oy);
  block(iso, STONE, -0.16, -0.16, 0.16, 0.16, 0, 8);
  block(iso, TIMBER, -0.06, -0.06, 0.06, 0.06, 8, 112);
  block(iso, TIMBER, -0.06, -0.06, 0.06, 0.78, 104, 114);
  // the brace, from the post to the beam
  const [b0x, b0y] = iso.at(0.06, 0.04, 80);
  const [b1x, b1y] = iso.at(0.06, 0.3, 104);
  limb(wood, b0x, b0y, b1x, b1y, 1.6, 1.6, TIMBER);
  // the noose, from the beam's end
  const [rx, ry] = iso.at(0, 0.66, 104);
  for (let y = Math.round(ry); y <= Math.round(ry) + 26; y++) rope.set(Math.round(rx), y, ROPE[3]).set(Math.round(rx) + 1, y, ROPE[1]);
  for (let y = Math.round(ry) + 26; y <= Math.round(ry) + 32; y++) for (let x = Math.round(rx) - 1; x <= Math.round(rx) + 2; x++) rope.set(x, y, (y - ry) % 2 ? ROPE[3] : ROPE[2]);
  for (let a = 0; a < Math.PI * 2; a += 0.1) rope.set(Math.round(rx + 0.5 + Math.sin(a) * 4), Math.round(ry + 40 + Math.cos(a) * 7), Math.sin(a) < 0 ? ROPE[3] : ROPE[2]);
  return compose(null, [wood, rope], null).sprite(ox, oy, GRAIN);
}

/** Picture pixels to a tile, across the floor (as floor 1's moments): a tile's 32 across on the picture is 40 of them. */
export const KT = 40;
/** A point of the world on the picture, from where it is measured: x and y across the floor and z up, all in picture pixels (KT to a tile). */
export function onPic(x: number, y: number, z: number): [number, number] {
  return [((x - y) * 32) / KT, ((x + y) * 16) / KT - z];
}
/** The way toward the hero, out of the picture: x and y across the floor, z up (for which side of a thing he sees). */
export const TOWARD: readonly [number, number, number] = [0.61, 0.61, 0.5];
/**
 * A point of a thing hung from a point and swung `ang` radians, along y (its foot toward the hero,
 * +y, for more than 0: across a beam along x) or, `alongX`, along x (across an arm along y): `down`
 * picture pixels down it from where it hangs and (`cx`, `cy`) across it, across the way it swings and
 * along it as it hangs straight. In the world, from where it hangs.
 */
export function swungWorld(ang: number, down: number, cx: number, cy: number, alongX = false): [number, number, number] {
  const s = Math.sin(ang);
  const c = Math.cos(ang);
  const w = down * s + cy * c;
  return alongX ? [w, -cx, -down * c + cy * s] : [cx, w, -down * c + cy * s];
}
/** The same on the picture, from where it hangs. */
export function swung(ang: number, down: number, cx: number, cy: number, alongX = false): [number, number] {
  const [x, y, z] = swungWorld(ang, down, cx, cy, alongX);
  return onPic(x, y, z);
}
/** The gibbet's cage swings along x, across its arm. */
const GX = true;

/** How the gibbet's cage hangs: its swing (radians, across x), how far it is turned on its chain, its chain's length, how far its rotten foot has burst open (0 to 1). */
interface Cage { ang: number; spin: number; chain: number; burst: number }
const CAGE_STILL: Cage = { ang: 0, spin: 0.35, chain: 14, burst: 0 };
const CAGE_R = 8.5;
const CAGE_LONG = 52;
/** Its bars' and hoops' half-width along it, `t` down from its top: rounded in at the top and the foot. */
function cageWidth(t: number): number {
  return t < 10 ? Math.sqrt(t / 10) : t > 46 ? Math.sqrt(Math.max(0, (CAGE_LONG - t) / 6)) : 1;
}

/**
 * The gibbet's cage hung from (hx, hy) as `c` says: an iron cage like a man on its chain, eight bars
 * round and three hoops, turned to its swing and its spin; burst open at its foot, its bars splayed
 * and two snapped short. `inside` paints what is in it, between its far bars and its near ones.
 * Painted on `p`.
 */
function gibbetCage(p: Px, hx: number, hy: number, c: Cage, inside?: (q: Px) => void): void {
  const at = (t: number, cx: number, cy: number): [number, number] => {
    const [x, y] = swung(c.ang, c.chain + t, cx, cy, GX);
    return [hx + x, hy + y];
  };
  // the chain
  for (let k = 0; k <= c.chain; k++) {
    const [x, y] = at(k - c.chain, 0, 0);
    p.set(Math.round(x), Math.round(y), k % 4 < 2 ? SMALL_IRON[3] : SMALL_IRON[1]);
  }
  const back = new Px(p.w, p.h);
  const front = new Px(p.w, p.h);
  /** Is a point across the cage on its side toward the hero? */
  const near = (cx: number, cy: number): boolean => {
    const [x, y, z] = swungWorld(c.ang, 0, cx, cy, GX);
    return x * TOWARD[0] + y * TOWARD[1] + z * TOWARD[2] > 0;
  };
  const tone = (cx: number, cy: number): string => {
    const [x, y] = swungWorld(c.ang, 0, cx, cy, GX);
    return !near(cx, cy) ? IRONS[1] : x - y < 0 ? IRONS[3] : IRONS[2];
  };
  for (let k = 0; k < 8; k++) {
    const a = c.spin + (k * Math.PI) / 4;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    // (burst: the bars below its last hoop bent out, two of them snapped short)
    const end = c.burst > 0 ? (k % 4 === 2 ? 41 : 47) : CAGE_LONG;
    for (let t = 2; t <= end; t += 0.5) {
      const w = c.burst > 0 && t > 38 ? 1 + c.burst * ((t - 38) / 9) * 0.9 : cageWidth(t);
      const [x, y] = at(t, CAGE_R * w * ca, CAGE_R * w * sa);
      (near(ca, sa) ? front : back).set(Math.round(x), Math.round(y), tone(ca, sa));
    }
  }
  for (const t of [4, 20, 38]) {
    const r = CAGE_R * (t === 38 ? 1 + c.burst * 0.25 : cageWidth(t));
    for (let a = 0; a < Math.PI * 2; a += 0.08) {
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const [x, y] = at(t, r * ca, r * sa);
      (near(ca, sa) ? front : back).set(Math.round(x), Math.round(y), tone(ca, sa));
    }
  }
  p.blit(back, 0, 0);
  if (inside) inside(p);
  p.blit(front, 0, 0);
}

/** THE GIBBET: a tall post, an arm out along y (to the left: the cage and its bones on its lit side), a man's iron cage hung from it on a chain, his bones in it. 92 x 176 at (60, 158). */
const GIB_W = 92;
const GIB_H = 176;
const GIB_OX = 60;
const GIB_OY = 158;
/** Where the cage's chain hangs from on the gibbet's picture. */
function gibbetHook(): [number, number] {
  const iso = new Iso(new Px(1, 1), GIB_OX, GIB_OY);
  const [x, y] = iso.at(0, 0.62, 118);
  return [Math.round(x), Math.round(y)];
}
function gibbetPost(): Px {
  const wood = new Px(GIB_W, GIB_H);
  const iso = new Iso(wood, GIB_OX, GIB_OY);
  block(iso, STONE, -0.14, -0.14, 0.14, 0.14, 0, 6);
  block(iso, TIMBER, -0.05, -0.05, 0.05, 0.05, 6, 128);
  block(iso, TIMBER, -0.05, -0.05, 0.05, 0.68, 120, 128);
  const [b0x, b0y] = iso.at(0.05, 0.03, 96);
  const [b1x, b1y] = iso.at(0.05, 0.26, 120);
  limb(wood, b0x, b0y, b1x, b1y, 1.4, 1.4, TIMBER);
  return wood;
}
/** What hangs in the cage, each a thing of its own that can fall out: where along the cage its middle is, and how far across from the cage's middle (toward the way the skull looks). */
type CageBone = 'skull' | 'ribs' | 'leg' | 'other leg';
const CAGE_BONES: ReadonlyArray<readonly [CageBone, number, number]> = [['skull', 10, 0], ['ribs', 24, -0.5], ['leg', 40, 2.8], ['other leg', 40, -2.8]];
/** Which way a bone in the cage faces: its length down the cage, its face across it toward where the skull looks, and its side. In the world. */
function boneAxes(c: Cage): [V3, V3, V3] {
  const look = c.spin + 0.5;
  const L = swungWorld(c.ang, 1, 0, 0, GX);
  const U = swungWorld(c.ang, 0, Math.cos(look), Math.sin(look), GX);
  const V = swungWorld(c.ang, 0, -Math.sin(look), Math.cos(look), GX);
  return [L, U, V];
}
type V3 = [number, number, number];
/**
 * One of the bones, painted on `q`: `put(l, u, v)` is where a point of it is on the picture, `l` along
 * it (down the cage, as it hangs), `u` across toward its face, `v` across its side; `face` how far its
 * face is turned toward the hero (the skull's eyes show only when it is).
 */
function paintBone(q: Px, kind: CageBone, put: (l: number, u: number, v: number) => [number, number], face: number): void {
  if (kind === 'skull') {
    const [x, y] = put(0, 0, 0);
    ball(q, x, y, 5.6, 5.2, OLD_BONE);
    // its jaw, hanging open under its face
    const [jx, jy] = put(4.6, 2.6, 0);
    ball(q, jx, jy, 3.4, 2.4, OLD_BONE);
    if (face > 0.1) {
      for (const s of [-2.2, 2.2]) {
        const [ex, ey] = put(-0.8, 4.6, s);
        q.rect(Math.round(ex) - 1, Math.round(ey) - 1, 2, 2, DEEP);
      }
      const [nx, ny] = put(1.6, 5.4, 0);
      q.set(Math.round(nx), Math.round(ny), DEEP);
      for (const s of [-1.2, 0, 1.2]) {
        const [mx, my] = put(3.6, 5, s);
        q.set(Math.round(mx), Math.round(my), DEEP);
      }
    }
    return;
  }
  if (kind === 'ribs') {
    // the spine down its back, the ribs curving round from it
    const [s0x, s0y] = put(-7, -3.4, 0);
    const [s1x, s1y] = put(7, -3.4, 0);
    limb(q, s0x, s0y, s1x, s1y, 1.3, 1.3, OLD_BONE);
    for (let j = 0; j < 5; j++) {
      let prev: [number, number] | null = null;
      for (let a = 0.35; a <= Math.PI * 2 - 0.35; a += 0.14) {
        const [x, y] = put(-6 + 3 * j + 0.8 * (1 - Math.cos(a)), 0.5 - 4 * Math.cos(a), 4.6 * Math.sin(a));
        if (prev) q.line(prev[0], prev[1], x, y, a > 1 && a < Math.PI * 2 - 1 ? OLD_BONE[3] : OLD_BONE[2]);
        prev = [x, y];
      }
    }
    return;
  }
  // a long bone of the leg: its shaft and its knuckled ends
  const [x0, y0] = put(-8, 0, 0);
  const [x1, y1] = put(8, 0, 0);
  limb(q, x0, y0, x1, y1, 1.6, 1.4, OLD_BONE);
  ball(q, x0, y0, 2.5, 2.2, OLD_BONE);
  ball(q, x1, y1, 2.3, 2, OLD_BONE);
}
/** A point of the world (from where `put` is measured) along the bone's own axes. */
function boneAt(o: V3, L: V3, U: V3, V: V3, l: number, u: number, v: number): V3 {
  return [o[0] + L[0] * l + U[0] * u + V[0] * v, o[1] + L[1] * l + U[1] * u + V[1] * v, o[2] + L[2] * l + U[2] * u + V[2] * v];
}
/** The bones still in the cage, each `slide` further down it (falling out through its burst foot), painted on `q` for a cage hung from (hx, hy). */
function cageBones(q: Px, hx: number, hy: number, c: Cage, slide: Partial<Record<CageBone, number | null>> = {}): void {
  const [L, U, V] = boneAxes(c);
  const face = U[0] * TOWARD[0] + U[1] * TOWARD[1] + U[2] * TOWARD[2];
  for (const [kind, t, across] of CAGE_BONES) {
    const s = slide[kind];
    if (s === null) continue;
    const o = swungWorld(c.ang, c.chain + t + (s ?? 0), 0, 0, GX);
    const mid: V3 = [o[0] + V[0] * across, o[1] + V[1] * across, o[2] + V[2] * across];
    paintBone(q, kind, (l, u, v) => {
      const [x, y] = onPic(...boneAt(mid, L, U, V, l, u, v));
      return [hx + x, hy + y];
    }, face);
  }
}
function gibbet(c: Cage = CAGE_STILL): Sprite {
  const wood = gibbetPost();
  const cage = new Px(GIB_W, GIB_H);
  const [hx, hy] = gibbetHook();
  gibbetCage(cage, hx, hy, c, (q) => cageBones(q, hx, hy, c));
  return compose(null, [wood, cage], null).sprite(GIB_OX, GIB_OY, GRAIN);
}

/** THE STOCKS: two posts on a low step of stone, between them two boards one over the other, three holes cut through where they meet. Along x. 96 x 84 at (48, 64). */
function stocks(): Sprite {
  const W = 96;
  const H = 84;
  const ox = 48;
  const oy = 64;
  const base = new Px(W, H);
  const wood = new Px(W, H);
  const b = new Iso(base, ox, oy);
  block(b, STONE, -0.44, -0.14, 0.44, 0.14, 0, 5);
  const w = new Iso(wood, ox, oy);
  for (const x of [-0.4, 0.32]) block(w, TIMBER, x, -0.04, x + 0.08, 0.04, 5, 40);
  w.box(-0.34, -0.03, 0.34, 0.03, 18, 34, {
    top: () => TIMBER[3],
    left: (u, v, wd, h) => {
      // the two boards meet halfway; three holes through them where they meet
      const holes = [0.25, 0.5, 0.75].some((c, i) => Math.hypot((u / wd - c) * wd * (i === 1 ? 0.8 : 1.1), v - h / 2) < (i === 1 ? 4.2 : 3));
      if (holes) return DEEP;
      if (v === Math.floor(h / 2)) return TIMBER[0];
      return v === 0 ? TIMBER[4] : v >= h - 1 ? TIMBER[1] : u === 0 ? TIMBER[3] : TIMBER[2];
    },
    right: shadeSide(TIMBER),
  });
  // the hasp and its lock at one end
  const [lx, ly] = w.at(0.3, 0.03, 26);
  wood.rect(Math.round(lx) - 2, Math.round(ly) - 2, 3, 5, IRONS[2]);
  wood.set(Math.round(lx) - 2, Math.round(ly) - 2, IRONS[3]);
  return compose(base, [wood], null).sprite(ox, oy, GRAIN);
}

/** Where the bell's own measure starts and ends down its axis (from the axle it turns on), its radius at a point down it, and how long its clapper is. */
const BELL_TOP = 6;
const BELL_END = 42;
const BELL_CLAPPER = 30;
/** A church bell's shape (the second look found a long straight cone reading as a horn): a rounded crown, a shoulder, a waist drawn in a little, then the sound-bow flaring out hard to a thick lip. */
function bellRadius(y: number): number {
  const t = Math.max(0, Math.min(1, (y - BELL_TOP) / (BELL_END - BELL_TOP)));
  if (t < 0.1) return 12.5 * Math.sin((Math.PI / 2) * (t / 0.1));
  if (t < 0.55) return 12.5 - 1.6 * ((t - 0.1) / 0.45);
  return 10.9 + 10.6 * ((t - 0.55) / 0.45) ** 2.2;
}
/** Light falling on a face, in the world: from the upper left of the picture, and a little toward us. */
export const LIGHT_W: readonly [number, number, number] = (() => {
  const v = [-0.55, 0.45, 0.7];
  const n = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / n, v[1] / n, v[2] / n] as const;
})();
/** The bell's lip where the light catches it. */
const BELL_LIT = '#7470a8';
/** A picture painted with depth: each pixel keeps whatever of the world is nearest the hero. */
export class Deep {
  readonly z: Float32Array;
  constructor(readonly p: Px) {
    this.z = new Float32Array(p.w * p.h).fill(-Infinity);
  }
  put(x: number, y: number, d: number, c: string): void {
    const X = Math.round(x);
    const Y = Math.round(y);
    if (X < 0 || Y < 0 || X >= this.p.w || Y >= this.p.h) return;
    const i = Y * this.p.w + X;
    if (d <= this.z[i]) return;
    this.z[i] = d;
    this.p.set(X, Y, c);
  }
}
export const dot3 = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * The great bell at its swing `ang` (radians, across its axle: its mouth toward the hero, +y, for
 * more than 0), turning on an axle at (hx, hy): black iron, a lit band at its lip, rust down it, its
 * clapper at `clap` (radians, from the bell's own down, the same way); and the headstock of timber it
 * hangs from, turning with it, its rope's wheel at one end. Painted in depth, round as it is: swung
 * toward the hero he looks up into its dark mouth, swung away he sees its crown and shoulder (the
 * second look found the first, flat, reading as a disc at that end). Painted into `deep`, with what
 * stands about it, so that each hides the other as it should.
 */
function bellAt(deep: Deep, hx: number, hy: number, ang: number, clap: number): void {
  const p = deep.p;
  const W = (down: number, cx: number, cy: number): [number, number, number] => swungWorld(ang, down, cx, cy);
  const put = (w: readonly number[], c: string): void => {
    const [x, y] = onPic(w[0], w[1], w[2]);
    deep.put(hx + x, hy + y, dot3(w, TOWARD), c);
  };
  const D = W(1, 0, 0);
  // THE BELL: its outside, lit as it faces the light; its inside, dark, seen only through its mouth
  for (let y = BELL_TOP; y <= BELL_END; y += 0.35) {
    const r = bellRadius(y);
    const dr = (bellRadius(y + 0.5) - bellRadius(y - 0.5)) / 1;
    for (let a = 0; a < Math.PI * 2; a += 0.35 / r) {
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const n0 = W(0, ca, sa);
      const N = [n0[0] - dr * D[0], n0[1] - dr * D[1], n0[2] - dr * D[2]];
      const nn = Math.hypot(N[0], N[1], N[2]);
      const w = W(y, r * ca, r * sa);
      const out = dot3(N, TOWARD) > 0;
      if (out) {
        const lam = dot3(N, LIGHT_W) / nn;
        const lip = y > BELL_END - 3.2;
        const rim = y > BELL_END - 1.2;
        const crown = y < BELL_TOP + 3.6;
        const band = Math.abs(y - 16) < 0.9;
        const rust = !lip && y > 9 && y < 30 && (Math.abs(a - 1.2) < 0.06 || Math.abs(a - 2.1) < 0.05) && hash(Math.round(y), Math.round(a * 10), 233) < 0.6;
        const c = rust ? OLD_RUST[2]
          : lip ? (rim && lam > 0.35 ? BELL_LIT : lam > 0.2 ? IRONS[3] : lam > -0.1 ? IRONS[2] : IRONS[1])
          : crown ? (lam > 0.5 ? IRONS[2] : IRONS[1])
          : band ? (lam > 0.3 ? IRONS[3] : IRONS[0])
          : lam > 0.6 ? IRONS[3] : lam > 0.12 ? IRONS[2] : IRONS[1];
        put(w, c);
      } else {
        // (inside it: dark, but for its lip's edge)
        put(w, y > BELL_END - 1.5 ? IRONS[1] : DEEP);
      }
    }
  }
  // its lip's rim, a ring catching the light
  for (let a = 0; a < Math.PI * 2; a += 0.02) {
    const r = bellRadius(BELL_END);
    const n0 = W(0, Math.cos(a), Math.sin(a));
    const lam = dot3(n0, LIGHT_W);
    put(W(BELL_END + 0.2, r * Math.cos(a), r * Math.sin(a)), lam > 0.2 ? BELL_LIT : IRONS[0]);
  }
  // THE CLAPPER, inside it: a rod down from its crown, a heavy ball at its end (seen only through its mouth)
  const C = swungWorld(ang + clap, 1, 0, 0);
  const c0 = W(BELL_TOP + 3, 0, 0);
  for (let k = 0; k <= BELL_CLAPPER; k += 0.4) {
    for (const [ox, oy] of [[0, 0], [1, 0], [0, 1]] as const) {
      const w = [c0[0] + C[0] * k + ox * 0.9, c0[1] + C[1] * k, c0[2] + C[2] * k - oy * 0.9];
      put(w, ox ? IRONS[1] : IRONS[2]);
    }
  }
  const bc = [c0[0] + C[0] * BELL_CLAPPER, c0[1] + C[1] * BELL_CLAPPER, c0[2] + C[2] * BELL_CLAPPER];
  {
    const [bx, by] = onPic(bc[0], bc[1], bc[2]);
    const tmp = new Px(p.w, p.h);
    ball(tmp, hx + bx, hy + by, 5, 5, IRONS);
    const d0 = dot3(bc, TOWARD);
    for (let y = Math.floor(hy + by - 6); y <= hy + by + 6; y++) {
      for (let x = Math.floor(hx + bx - 6); x <= hx + bx + 6; x++) {
        const c = tmp.get(x, y);
        if (c) deep.put(x, y, d0 + 4 - Math.hypot(x - hx - bx, y - hy - by) * 0.5, c);
      }
    }
  }
  // THE HEADSTOCK it hangs from: a baulk of timber along the axle, turning with it; its rope's wheel at one end
  for (let cx = -27; cx <= 27; cx += 0.4) {
    for (let k = -4.5; k <= 4.5; k += 0.4) {
      // its four long faces: under, over, toward the hero and away (in its own turning measure)
      const sides: ReadonlyArray<readonly [number, number]> = [[6, k], [-4, k], [1 + k * 1.1, 4.5], [1 + k * 1.1, -4.5]];
      for (const [down, cy] of sides) {
        const w = W(down, cx, cy);
        // (its face's way out: under, over, or to one side, turned with the swing)
        const nrm = down === 6 ? D : down === -4 ? [-D[0], -D[1], -D[2]] : W(0, 0, Math.sign(cy));
        if (dot3(nrm, TOWARD) <= 0) continue;
        const lam = dot3(nrm, LIGHT_W);
        put(w, Math.abs(cx) > 26.5 ? TIMBER[0] : lam > 0.5 ? TIMBER[3] : lam > 0 ? TIMBER[2] : TIMBER[1]);
      }
    }
  }
  // its ends, square
  for (const cx of [-27, 27]) {
    for (let down = -4; down <= 6; down += 0.4) for (let cy = -4.5; cy <= 4.5; cy += 0.4) put(W(down, cx, cy), cx < 0 ? TIMBER[3] : TIMBER[1]);
  }
  // the wheel at its far end, a ring of spokes turning with it
  for (let a = 0; a < Math.PI * 2; a += 0.03) {
    const R = 15;
    put(W(1 + Math.cos(a) * R, 24, Math.sin(a) * R), Math.cos(a + ang) < -0.3 ? TIMBER[3] : TIMBER[1]);
    put(W(1 + Math.cos(a) * (R - 1), 24, Math.sin(a) * (R - 1)), TIMBER[2]);
  }
  for (const s0 of [0, Math.PI / 3, (2 * Math.PI) / 3]) {
    for (let k = -14; k <= 14; k += 0.5) put(W(1 + Math.cos(s0) * k, 24, Math.sin(s0) * k), TIMBER[2]);
  }
}
/** THE GREAT BELL'S FRAME: two A's of heavy timber legs, the bell's axle turning in iron bearings where each A's legs meet, a brace between them. 150 x 178 at (75, 152). */
const BELL_W = 150;
const BELL_H = 178;
const BELL_OX = 75;
const BELL_OY = 152;
/** How high its axle is. */
const BELL_AXLE = 94;
function bellHook(): [number, number] {
  const iso = new Iso(new Px(1, 1), BELL_OX, BELL_OY);
  const [x, y] = iso.at(0, 0, BELL_AXLE);
  return [Math.round(x), Math.round(y)];
}
/** The bell's frame, `front` the half before the bell or not: at each end an A of two heavy timber legs (bellLegs, painted with the bell) on footings of stone, meeting at the axle's bearing; a brace low between the far legs. (The headstock, turning with the bell, spans between them: bellAt.) */
function bellFrame(front: boolean): Px {
  const p = new Px(BELL_W, BELL_H);
  const iso = new Iso(p, BELL_OX, BELL_OY);
  const X = 0.74;
  if (!front) {
    for (const x of [-X, X]) block(iso, STONE, x - 0.09, -0.4, x + 0.09, -0.22, 0, 5);
    // the cross brace between the far legs
    const [a0x, a0y] = iso.at(-X + 0.02, -0.24, 16);
    const [a1x, a1y] = iso.at(X - 0.02, -0.24, 40);
    limb(p, a0x, a0y, a1x, a1y, 1.8, 1.8, darkened(TIMBER));
  } else {
    for (const x of [-X, X]) {
      block(iso, STONE, x - 0.09, 0.22, x + 0.09, 0.4, 0, 5);
      // the bearing the axle turns in, an iron strap over the legs' meeting
      block(iso, IRONS, x - 0.06, -0.07, x + 0.06, 0.07, BELL_AXLE - 2, BELL_AXLE + 6);
    }
  }
  return p;
}
/** The frame's four legs, painted into `deep` (from the axle's place on the picture, (hx, hy)), each pixel as near the hero as that part of the leg is: the bell swung right up passes behind the far legs and in front of the near ones. */
function bellLegs(deep: Deep, hx: number, hy: number): void {
  const X = 0.74;
  for (const x of [-X, X]) {
    for (const y of [-0.31, 0.31]) {
      const A: V3 = [x * KT, y * KT, -BELL_AXLE];
      const B: V3 = [x * KT, y * 0.08 * KT, 4];
      const [ax_, ay_] = onPic(A[0], A[1], A[2]);
      const [bx, by] = onPic(B[0], B[1], B[2]);
      const tmp = new Px(deep.p.w, deep.p.h);
      limb(tmp, hx + ax_, hy + ay_, hx + bx, hy + by, 3.6, 3, TIMBER);
      const dA = dot3(A, TOWARD);
      const dB = dot3(B, TOWARD);
      const L2 = (bx - ax_) ** 2 + (by - ay_) ** 2;
      const b = tmp.bounds()!;
      for (let py = b.y; py < b.y + b.h; py++) {
        for (let px = b.x; px < b.x + b.w; px++) {
          const c = tmp.get(px, py);
          if (!c) continue;
          const t = Math.max(0, Math.min(1, ((px - hx - ax_) * (bx - ax_) + (py - hy - ay_) * (by - ay_)) / L2));
          deep.put(px, py, dA + (dB - dA) * t, c);
        }
      }
    }
  }
}
/** The great bell's picture on its own canvas: its frame, the bell at its swing and its clapper, its rope off the wheel pulled aside `ropeX(s)` picture pixels at `s` of the way down it (0 where it leaves the wheel, 1 its end). */
function bellPx(ang = 0, clap = 0, ropeX: (s: number) => number = () => 0): Px {
  const back = bellFrame(false);
  const bell = new Px(BELL_W, BELL_H);
  const deep = new Deep(bell);
  const [hx, hy] = bellHook();
  bellAt(deep, hx, hy, ang, clap);
  bellLegs(deep, hx, hy);
  // the rope off the wheel's rim (going round with it) down to the floor, by the near leg
  const top = swungWorld(ang, 16, 24, 0);
  const [tx, ty] = onPic(top[0], top[1], top[2]);
  const x0 = hx + tx;
  const y0 = hy + ty;
  const y1 = BELL_OY - 8;
  let prev: [number, number] | null = null;
  const rope = new Px(BELL_W, BELL_H);
  for (let y = Math.round(y0); y <= y1; y++) {
    const s = Math.max(0, (y - y0) / Math.max(1, y1 - y0));
    const x = Math.round(x0 + Math.sin(y * 0.05) * 1 + ropeX(s));
    if (prev) rope.line(prev[0], prev[1], x, y, ROPE[2]);
    else rope.set(x, y, ROPE[2]);
    prev = [x, y];
  }
  // (as near the hero as the wheel it hangs from, less as it goes down)
  const b = rope.bounds();
  if (b) for (let py = b.y; py < b.y + b.h; py++) for (let px = b.x; px < b.x + b.w; px++) {
    const c = rope.get(px, py);
    if (c) deep.put(px, py, dot3(top, TOWARD) - (py - y0) * TOWARD[2], c);
  }
  return compose(back, [bell, bellFrame(true)], null);
}
function greatBell(ang = 0, clap = 0): Sprite {
  return bellPx(ang, clap).sprite(BELL_OX, BELL_OY, GRAIN);
}

/** THE GRINDSTONE where he hones his axes: a wheel of stone stood on its edge along x in a timber trestle, its axle through the posts, a crank at one end, a trough of water under it. 88 x 84 at (44, 66). */
function grindstone(): Sprite {
  const W = 88;
  const H = 84;
  const ox = 44;
  const oy = 66;
  const back = new Px(W, H);
  const wheel = new Px(W, H);
  const front = new Px(W, H);
  const f = new Iso(back, ox, oy);
  f.box(-0.3, -0.12, 0.3, 0.12, 0, 8, { top: (u, v) => (u > 0.08 && u < 0.92 && v > 0.15 && v < 0.85 ? '#100e20' : TIMBER[3]), left: litSide(TIMBER), right: shadeSide(TIMBER) });
  block(f, TIMBER, -0.36, -0.14, -0.28, -0.06, 0, 34);
  block(f, TIMBER, 0.28, -0.14, 0.36, -0.06, 0, 34);
  // the wheel: a disc in the plane along x (its face turned to screen-left, lit), a little thick: its rim seen beyond its face
  const R = 15;
  const wi = new Iso(wheel, ox, oy);
  for (const [y, face] of [[-0.06, false], [0.0, true]] as const) {
    for (let a = 0; a < Math.PI * 2; a += 0.01) {
      for (let r = 0; r <= R; r += 0.5) {
        const [px, py] = wi.at((Math.cos(a) * r) / 32, y, 26 + Math.sin(a) * r);
        const toLight = Math.sin(a) * r - Math.cos(a) * r;
        wheel.set(Math.round(px), Math.round(py), !face ? STONE[0] : r > R - 1.5 ? (toLight > 0 ? STONE[4] : STONE[1]) : toLight > 6 ? STONE[3] : toLight < -6 ? STONE[1] : STONE[2]);
      }
    }
  }
  const [ax, ay] = wi.at(0, 0, 26);
  ball(wheel, ax, ay, 1.8, 1.8, IRONS);
  // the posts in front and the axle through them; the crank
  const fr = new Iso(front, ox, oy);
  block(fr, TIMBER, -0.36, 0.06, -0.28, 0.14, 0, 34);
  block(fr, TIMBER, 0.28, 0.06, 0.36, 0.14, 0, 34);
  block(fr, IRONS, -0.02, -0.16, 0.02, 0.2, 25, 27);
  const [cx0, cy0] = fr.at(0, 0.2, 26);
  limb(front, cx0, cy0, cx0 - 1, cy0 + 8, 1, 1, IRONS);
  limb(front, cx0 - 1, cy0 + 8, cx0 - 6, cy0 + 11, 1.2, 1.2, TIMBER);
  return compose(back, [wheel, front], null).sprite(ox, oy, GRAIN);
}

/** THE BRAZIER OF IRONS: an iron bowl of coals on three legs, the branding irons thrust into it, the coals glowing: frame `f` of four. 56 x 84 at (28, 74). */
function brandingBrazier(f: number): Sprite {
  const W = 56;
  const H = 84;
  const cx = 28;
  const foot = 74;
  const iron = new Px(W, H);
  const fire = new Px(W, H);
  limb(iron, cx - 2, foot - 16, cx - 12, foot - 1, 1.4, 1.2, IRONS);
  limb(iron, cx + 2, foot - 16, cx + 12, foot - 1, 1.4, 1.2, IRONS);
  limb(iron, cx, foot - 15, cx + 2, foot - 4, 1.2, 1, IRONS);
  // the bowl, its rim, its coals
  lit(iron, IRONS, [1, 2], [1, 3], (l) => column(l, cx, foot - 28, foot - 16, (t) => 14 - 7 * t ** 1.4));
  iron.ellipse(cx, foot - 28, 14, 3.4, IRONS[3]);
  iron.ellipse(cx, foot - 28, 12.4, 2.6, COAL[0]);
  for (let x = cx - 11; x <= cx + 11; x++) for (let dy = -2; dy <= 2; dy++) if (iron.get(x, foot - 28 + dy) === COAL[0] && hash(x, dy + f * 7, 234) < 0.55) fire.set(x, foot - 28 + dy, hash(x, dy + f, 235) < 0.35 ? EMBER[3] : EMBER[2]);
  // the irons, out of the coals at a slant
  for (const [x0, x1, y1] of [[cx - 4, cx - 18, foot - 52], [cx + 3, cx + 16, foot - 50], [cx, cx + 2, foot - 56]] as const) {
    iron.line(x0, foot - 28, x1, y1, SMALL_IRON[3]);
    iron.line(x0 + 1, foot - 28, x1 + 1, y1, SMALL_IRON[1]);
    iron.rect(x1 - 1, y1 - 3, 3, 3, SMALL_IRON[2]);
  }
  // little flames over the coals
  for (const [dx, h, lean] of [[[-5, 6, 1], [2, 8, -1], [7, 5, 1]], [[-4, 7, -1], [3, 6, 1], [8, 6, -1]], [[-6, 5, 1], [1, 9, 1], [6, 6, -1]], [[-3, 8, -1], [4, 7, -1], [8, 5, 1]]][f % 4]) tongue(fire, cx + dx, foot - 29, h, 2.2, lean, EMBER);
  const s = compose(null, [iron], fire).sprite(cx, foot, GRAIN);
  s.lights = [{ x: cx / GRAIN, y: (foot - 34) / GRAIN, r: 13 + (f % 2), color: EMBER[2], a: 0.46 }];
  return s;
}

/** HIS STRONGBOX (the game's chest): old timber covered in black leather, bound and studded in iron. */
const STRONGBOX: TrunkLook = { a: 0.38, b: 0.25, rim: 14, rise: 7, wood: TIMBER, lid: LEATHER, metal: IRONS, stone: null, planks: [7] };
function strongbox(open: boolean): Sprite {
  return trunk(56, 64, 28, 48, STRONGBOX, open).sprite(28, 48, GRAIN);
}

// =================================================================================================
// DOORS AND GATES

/**
 * THE DOOR'S LEAF on this floor: black oak planks, three heavy straps of iron across it, a small
 * barred window high in it, a great ring. As the game's leaf (art/gates.ts, makeDoorLeaf): from its
 * hinge (the anchor, on the floor) to its free end, (ex, ey) picture pixels away along the floor.
 */
export function blockDoorLeaf(ex: number, ey: number, high = 56, inShade = false): Sprite {
  const pad = 6;
  const w = Math.abs(ex) + pad * 2;
  const h = high + Math.abs(ey) + pad * 2;
  const p = new Px(w, h);
  const ox = ex >= 0 ? pad : pad - ex;
  const oy = high + pad + (ey < 0 ? -ey : 0);
  const at = (t: number, up: number): [number, number] => [Math.round(ox + ex * t), Math.round(oy + ey * t - up)];
  const steps = Math.max(Math.abs(ex), 1);
  const OAK: Ramp = LEATHER;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const [x, y] = at(t, 0);
    const joint = Math.abs((t * 4) % 1) < (1 / steps) * 1.2 && t > 0.05 && t < 0.95;
    for (let up = 0; up < high; up++) {
      let c = joint ? OAK[1] : t < 0.04 ? OAK[3] : OAK[2];
      const band = [8, Math.round(high * 0.5), high - 12].some((b) => up >= b && up <= b + 3);
      if (band) c = [8, Math.round(high * 0.5), high - 12].includes(up) ? IRONS[3] : IRONS[2];
      if (band && i % 5 === 2 && [9, Math.round(high * 0.5) + 1, high - 11].includes(up)) c = GLINT;
      // the little window, barred
      if (t > 0.38 && t < 0.62 && up >= high - 24 && up <= high - 15) c = Math.abs(((t - 0.38) * 20) % 1 - 0.5) < 0.18 ? IRONS[3] : DEEP;
      if (up === high - 1) c = OAK[3];
      if (up === 0) c = OAK[0];
      p.set(x, y - up, c);
    }
  }
  // the ring, on the free end
  const [lx, ly] = at(0.84, Math.round(high * 0.42));
  for (let a = 0; a < Math.PI * 2; a += 0.25) p.set(Math.round(lx + Math.cos(a) * 2.6), Math.round(ly + Math.sin(a) * 2.6), Math.cos(a) < 0 ? IRONS[3] : IRONS[1]);
  return (inShade ? recolor(p, shaded) : p).sprite(ox, oy, GRAIN);
}
function leafOf(ex: number, ey: number): Sprite {
  const dx = (ex / 32 + ey / 16) / 2;
  const dy = (ey / 16 - ex / 32) / 2;
  return blockDoorLeaf(ex, ey, 56, Math.abs(dy) > Math.abs(dx));
}

/** THE MARK OVER THIS FLOOR'S GATES (art/gates.ts, a Mark): his axe's crescent cut in a roundel on the keystone, in stone, giving off no light. */
const crescentMark: Mark = (x, y, st, _lit, lightLow) => {
  const d = Math.hypot(x, y);
  if (d > 12.4) return null;
  const toLight = y - (lightLow ? x : -x);
  if (d > 11.4) return st.joint;
  if (d > 9.4) return toLight > 5 ? st.light : toLight < -6 ? st.dark : st.body;
  const c = crescentAt(x / 7.5, y / 7.5);
  if (c) return crescentAt((x + (lightLow ? -1 : 1)) / 7.5, (y + 1) / 7.5) ? st.body : st.light;
  return st.dark;
};
/** OVER HIS OWN GATE: his empty hood cut in the stone, the dark inside it burning with his embers (pink: the enemy's, as the game's boss gate has the Warden's). */
const hoodMark: Mark = (x, y, st, lit_, lightLow) => {
  const d = Math.hypot(x, y);
  if (d > 12.4) return null;
  const toLight = y - (lightLow ? x : -x);
  if (d > 11.4) return st.joint;
  if (d > 9.4) return toLight > 5 ? st.light : toLight < -6 ? st.dark : st.body;
  const h = hoodAt(x / 8.6, y / 8.6);
  if (h === 'dark') return lit_ ? (Math.hypot(x / 2, (y - 1) / 3) < 1 ? FLAME[4] : FLAME[3]) : Math.hypot(x / 2, (y - 1) / 3) < 1 ? FLAME[2] : FLAME[1];
  if (h === 'hood') return hoodAt((x + (lightLow ? -1 : 1)) / 8.6, (y + 1) / 8.6) ? st.body : st.light;
  return st.dark;
};

let gates: GateArt | null = null;
/** THIS FLOOR'S DOORS AND GATES, as the game's (art/gates.ts): its stone, his crescent over its gates, his hood over his own, its doors of black oak bound in iron. */
export function headsmanGates(): GateArt {
  return gates ?? (gates = makeGateArt(THEME, { gateMark: crescentMark, bossMark: hoodMark, leaf: leafOf }));
}

// =================================================================================================
// QUESTS

/** HIS HOOD, fallen empty where he fell: the trophy the armourer asked for. The tall pointed hood of his red slumped on its cape on the floor, its point flopped over, its opening dark all the way in; a glint on it, so it reads as a thing to take. 48 x 44 at (24, 38). */
function hisHood(): Sprite {
  const W = 48;
  const H = 44;
  const cx = 24;
  const foot = 38;
  const p = new Px(W, H);
  const over = new Px(W, H);
  const S = 16;
  const tilt = 0.32;
  for (let y = foot - 34; y <= foot; y++) {
    for (let x = cx - 18; x <= cx + 18; x++) {
      // turned back from its tilt: (s, t) in the hood's own measure
      const dx = x + 0.5 - cx;
      const dy = foot - S - (y + 0.5);
      const s = (dx * Math.cos(tilt) - dy * Math.sin(tilt)) / S;
      // (slumped: its upper half pressed down, so its point leans over)
      let t = (dx * Math.sin(tilt) + dy * Math.cos(tilt)) / S;
      t = t > 0 ? t * 1.15 : t;
      const h = hoodAt(s, t);
      if (!h) continue;
      p.set(x, y, h === 'dark' ? DEEP : s < -0.22 ? HOOD[3] : s > 0.28 ? HOOD[1] : HOOD[2]);
    }
  }
  // a fold down it
  for (let k = 0; k < 9; k++) p.set(cx + 6 + Math.round(k * 0.3), foot - 18 + k, HOOD[1]);
  over.set(cx + 10, foot - 30, GOLD[3]).set(cx + 11, foot - 30, GOLD[2]);
  return compose(null, [p], over).sprite(cx, foot, GRAIN);
}

// =================================================================================================
// THE SET

/**
 * WHERE EACH WALL PIECE MAY BE SET: its first spot, then others, (across, up) in picture pixels: low,
 * middle and high on the wall, and across it, each within its own tile's face and below where the
 * wall fades into the dark (his note on floor 1's: "I don’t like the wall panels all being in the
 * exact same spot").
 */
const SPOTS: Record<string, ReadonlyArray<readonly [number, number]>> = {
  hatch: [[6, 0], [-2, 17], [-6, 27]],
  'axe-scarred stone': [[0, -2], [0, 3], [0, 8]],
  'bell niche': [[3, -8], [2, 3], [-4, 12]],
  'skull ledge': [[1, -15], [0, -5], [-1, 19]],
  'the hood carved': [[5, -19], [1, -9], [-2, 11]],
  'the long stain': [[0, 0], [-5, 0], [5, 0]],
  'the chute': [[0, 0]],
  'hoods on pegs': [[0, -15], [2, -2], [-1, 6]],
  'axe on hooks': [[-1, -26], [-1, -11], [-1, 2]],
  noose: [[1, -18], [-7, -4], [-10, 4]],
  torch: [[10, -27], [-12, -5], [-7, 2]],
  'his banner': [[5, -22], [3, -15], [-6, 0]],
  'branding irons': [[-4, -13], [-1, -6], [-4, 5]],
  'tools of the trade': [[5, -21], [4, -4], [-5, 9]],
  'black candles': [[-9, 5], [8, -26], [3, 12]],
  'chain from the dark': [[0, 0], [-6, 0], [6, 0]],
  'dart mask': [[0, 0]],
};
const spotsOf = spotsFrom(SPOTS);

let made: Piece[] | null = null;
/** THE HEADSMAN'S FLOOR, every piece, painted the first time they are asked for and kept. */
export function headsmanPieces(): Piece[] {
  if (made) return made;
  const w = (name: string, kind: PieceKind, paint: (p: Px) => void): Piece => ({ name, kind, ...spotsOf(name, paint) });
  const fireLight = (h: number) => (f: number, du: number, dv: number) => (alongX: boolean): Light[] => [{ x: (PCX + du) / GRAIN, y: (PFOOT - h - dv) / GRAIN, r: 14 + (f % 2), color: EMBER[2], a: alongX ? 0.5 : 0.42 }];
  const G = headsmanGates();
  made = [
    // wall tiles
    w('hatch', 'wall tile', hatch),
    w('axe-scarred stone', 'wall tile', axeScars),
    w('bell niche', 'wall tile', bellNiche),
    w('skull ledge', 'wall tile', skullLedge),
    w('the hood carved', 'wall tile', hoodCarved),
    w('the long stain', 'wall tile', longStain),
    { name: 'the chute', kind: 'wall tile', ...spotsOf('the chute', chute), frames: [chuteHeap()], shadow: 0.42 },
    // on the walls
    w('hoods on pegs', 'on the wall', hoodsOnPegs),
    w('axe on hooks', 'on the wall', axeOnHooks),
    w('noose', 'on the wall', noose),
    { name: 'torch', kind: 'on the wall', ...spotsOf('torch', cagedTorch as unknown as (p: Px) => void, 4, fireLight(52)) },
    w('his banner', 'on the wall', blackBanner),
    w('branding irons', 'on the wall', brandingIrons),
    w('tools of the trade', 'on the wall', tradeTools),
    { name: 'black candles', kind: 'on the wall', ...spotsOf('black candles', sconce as unknown as (p: Px) => void, 4, fireLight(44)) },
    w('chain from the dark', 'on the wall', chainFromDark),
    // floor tiles
    { name: 'sawdust', kind: 'floor tile', frames: [onTile(sawdustTile)] },
    { name: 'gutter', kind: 'floor tile', frames: [onTile(gutter, box(0.06, 0.94, 0.12, 0.88))] },
    { name: 'trapdoor', kind: 'floor tile', frames: [onTile(trapdoor, box(0.12, 0.88, 0.12, 0.88))] },
    { name: 'the split floor', kind: 'floor tile', frames: [onTile(splitFloor)] },
    { name: 'the hood in the floor', kind: 'floor tile', frames: [onTile(hoodInlay, box(0.1, 0.9, 0.1, 0.9))] },
    { name: 'cobbles', kind: 'floor tile', frames: [onTile(cobbles)] },
    // traps
    { name: 'blade slots', kind: 'trap', frames: [bladeSlots(false), bladeSlots(true)] },
    { name: 'crescent plate', kind: 'trap', frames: [crescentPlate(false), crescentPlate(true)] },
    w('dart mask', 'trap', dartMask),
    // breakables: whole, and what each leaves broken
    { name: 'basket', kind: 'breakable', frames: [basket(), brokenOf('basket')], shadow: 0.22 },
    { name: 'sawdust barrel', kind: 'breakable', frames: [sawdustBarrel(), brokenOf('barrel')], shadow: 0.24 },
    { name: 'pail', kind: 'breakable', frames: [pail(), brokenOf('pail')], shadow: 0.18 },
    { name: 'crate', kind: 'breakable', frames: [crate(), brokenOf('crate')], shadow: 0.3 },
    // on the floor
    { name: 'kicked-over stool', kind: 'on the floor', frames: [kickedStool()], shadow: 0.24 },
    { name: 'broken axe', kind: 'on the floor', frames: [brokenAxe()] },
    { name: 'coil of rope', kind: 'on the floor', frames: [ropeCoil()] },
    { name: 'bones in irons', kind: 'on the floor', frames: [chainedBones()] },
    { name: 'dropped lantern', kind: 'on the floor', frames: [droppedLantern()], shadow: 0.2 },
    { name: 'skulls in the sawdust', kind: 'on the floor', frames: [skullsInSawdust()] },
    { name: 'broken wheel', kind: 'on the floor', frames: [brokenWheel()] },
    // obstacles
    { name: 'the block', kind: 'obstacle', frames: [theBlock()], shadow: 0.36 },
    { name: 'the scaffold', kind: 'obstacle', frames: [scaffold()], shadow: 0.7 },
    { name: 'the gallows', kind: 'obstacle', frames: [gallows()], shadow: 0.24 },
    { name: 'the gibbet', kind: 'obstacle', frames: [gibbet()], shadow: 0.24 },
    { name: 'the stocks', kind: 'obstacle', frames: [stocks()], shadow: 0.5 },
    { name: 'the great bell', kind: 'obstacle', frames: [greatBell()], shadow: 0.6 },
    { name: 'the grindstone', kind: 'obstacle', frames: [grindstone()], shadow: 0.42 },
    { name: 'brazier of irons', kind: 'obstacle', frames: [0, 1, 2, 3].map(brandingBrazier), shadow: 0.34 },
    { name: "the headsman's strongbox", kind: 'obstacle', frames: [strongbox(false), strongbox(true)], shadow: 0.38 },
    // doors and gates
    { name: 'the door', kind: 'door', gates: G, frames: [G.leaf(32, 16), G.leaf(-32, 16), G.post] },
    { name: 'the gate', kind: 'gate', gates: G, frames: [...G.arch(true, false, false).map((q) => q.s), G.pillar(false)] },
    { name: "the boss's gate", kind: 'gate', gates: G, frames: [...G.arch(true, true, false).map((q) => q.s), G.pillar(true)] },
    // quests
    { name: "the Headsman's hood", kind: 'quest', frames: [hisHood()], shadow: 0.24 },
  ];
  return made;
}

// =================================================================================================
// THE MOMENTS AROUND THE HERO. His idea, 10 Oct, 07:52: “I’d also like a couple environmental things
// happening around you for immersion unique for each floor.  Something shifts above you and dust comes
// down, you spook a pack of birds and they fly off,  a root shrivels as you walk by.  That sort of
// stuff”. Each checked against his rulebook's Animations 1 before he sees it: “as big and wild and
// kinetic and weighty as possible.  I’d rather it be a notch too high than a notch too low.”

/** The floor's dust: its rim, its middle, its edge to the light (as floor 1's). */
export const FLOOR_DUST = ['#3e3a52', '#4a4660', '#58526a'] as const;

/** A puff of dust thrown out along the floor from where something struck it: clouds that swell, fly out and up, and shrink away. */
export interface Puff { f0: number; x: number; y: number; z: number; ang: number; v: number; r0: number; grow: number; rise: number; life: number; seed: number }
/** A ring of `n` puffs born on frame `f0` at (x, y, z) in the world (picture pixels), thrown out `v` (picture pixels a frame at first), each at most `big` across. */
export function puffRing(f0: number, x: number, y: number, z: number, n: number, v: number, big: number, seed: number): Puff[] {
  return Array.from({ length: n }, (_, i) => ({
    f0, x, y, z,
    ang: (i / n) * Math.PI * 2 + hash(i, seed, 401) * 0.5,
    v: v * (0.7 + 0.6 * hash(i, seed, 402)),
    r0: 1.4 + hash(i, seed, 403),
    grow: big * (0.7 + 0.5 * hash(i, seed, 404)),
    rise: 0.15 + 0.3 * hash(i, seed, 405),
    life: 14 + Math.floor(hash(i, seed, 406) * 8),
    seed: seed * 16 + i,
  }));
}
/**
 * The puffs on frame `f`, painted on `over` (those toward the hero of `split`, a line across the
 * floor through the world's (0, 0), or all of them) and `under` (those behind it), from (ax, ay).
 */
export function paintPuffs(puffs: readonly Puff[], f: number, ax: number, ay: number, over: Px, under: Px | null, light: readonly [string, string]): void {
  for (const d of puffs) {
    const k = f - d.f0;
    if (k < 0 || k >= d.life) continue;
    const go = (d.v * (1 - 0.86 ** k)) / (1 - 0.86);
    const x = d.x + Math.cos(d.ang) * go;
    const y = d.y + Math.sin(d.ang) * go;
    const z = d.z + 3 * (1 - Math.exp(-k / 5)) + d.rise * k;
    const r = (d.r0 + d.grow * (1 - Math.exp(-k / 4))) * (1 - (k / d.life) ** 2);
    if (r < 1.2) continue;
    const [px, py] = onPic(x, y, z);
    dustCloud(under && x + y < 0 ? under : over, ax + px, ay + py, r, light[0], light[1], d.seed);
  }
}

/**
 * Grains falling from `z0` picture pixels up and gone where they meet the floor, one loosed every
 * other frame from `from` and the last of them meeting the floor on frame `last` (so that something
 * is always moving, to the end), and more in bursts. Each: [the frame it is loosed, x, y, z0, how
 * fast across (x, y a frame), how hard it falls].
 */
export type Grain = [number, number, number, number, number, number, number];
export function grainStream(from: number, last: number, g: number, at: (i: number) => [number, number, number]): Grain[] {
  const out: Grain[] = [];
  for (let i = 0; ; i++) {
    const [x, y, z0] = at(i);
    const fall = Math.ceil(Math.sqrt((2 * z0) / g));
    const f0 = last - fall - 2 * i;
    if (f0 < from) break;
    out.push([f0, x, y, z0, 0, 0, g]);
  }
  return out;
}
/** The grains on frame `f`, two picture pixels across, painted on `p` from (ax, ay); those that have met the floor are gone. */
export function paintGrains(p: Px, grains: readonly Grain[], f: number, ax: number, ay: number, tones: readonly [string, string], wobble = 0): void {
  for (const [f0, x0, y0, z0, vx, vy, g] of grains) {
    const k = f - f0;
    if (k < 0) continue;
    const z = z0 - 0.5 * g * k * k;
    if (z <= 0) continue;
    const [px, py] = onPic(x0 + vx * k, y0 + vy * k, z);
    const X = Math.round(ax + px + (wobble ? Math.sin(k * 0.6 + f0 + x0) * wobble : 0));
    const Y = Math.round(ay + py);
    p.set(X, Y, tones[0]).set(X + 1, Y, tones[0]).set(X, Y + 1, tones[1]).set(X + 1, Y + 1, tones[1]);
  }
}

/** The short way round from one heading to another, `k` of the way. */
export function turnToward(from: number, to: number, k: number): number {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return from + d * k;
}

const BEAK_R: Ramp = [RAVEN[1], RAVEN[1], '#2a2738', BEAK, '#4e4a64'];
const RAVEN_EYE = '#6a66a0';
/** A raven's feather, shed: its vane lit along its edge, so that it shows on the floor (the second look found the first unseen). */
const FEATHER: Ramp = [RAVEN[2], RAVEN[2], RAVEN[3], RAVEN[4], '#6e6aa6'];

/**
 * THE RAVENS TAKE FLIGHT. Five ravens, big black birds of the gallows, peck at a skull and bones on
 * the floor (`before`, a loop). Something startles them: every head snaps up at once, two of them
 * cawing, one hopping; then all five burst off the floor within a sixth of a second, each crouching,
 * flinging its wings up and beating down so hard the dust blows out from under it in a ring and
 * feathers fly, and a bone is flung end over end; one swoops low and fast straight out toward the
 * hero before it climbs; the rest climb on deep, fast wingbeats, wheeling away every way, darker as
 * they go up into the dark, and fly clean out of the picture (never fading away in a speckle: the
 * second look). Black feathers shaken loose rock down after them and settle on the floor, where they
 * stay (`after`: the bones and the feathers). Built in the world (picture pixels, KT to a tile);
 * anchored at the skull; its frames tall and wide, for the birds to fly out of them, and each cut
 * down to what is painted in it.
 */
function ravensTakeFlight(): Moment {
  const W = 560;
  const H = 540;
  const ax = 280;
  const ay = 400;
  const STARTLE = 5;
  interface Bird { x: number; y: number; h: number; T: number; fly: number; climb: number; caw: boolean; hop: boolean; swoop: boolean }
  // (where each stands, in picture pixels about the skull, spread round the bones; which way it faces; the frame it leaps; the way it flies)
  const BIRDS: Bird[] = [
    { x: -34, y: 8, h: 0.3, T: 9, fly: -2.55, climb: 1, caw: true, hop: false, swoop: false },
    { x: 32, y: -28, h: 2.4, T: 10, fly: -1.6, climb: 1.1, caw: false, hop: false, swoop: false },
    { x: 30, y: 34, h: 3.7, T: 11, fly: 1, climb: 1, caw: true, hop: false, swoop: true },
    { x: -16, y: 54, h: 5.2, T: 12, fly: -3.4, climb: 0.95, caw: false, hop: true, swoop: false },
    { x: -60, y: -32, h: 1.0, T: 13, fly: -2.1, climb: 1.05, caw: false, hop: false, swoop: false },
  ];
  /** Its climb t frames after it leaps: how far along its way, how high (picture pixels); the one that swoops skims low and fast first. */
  const flight = (t: number, B: Bird): [number, number] => {
    if (B.swoop) return [5 * t + 0.08 * t * t, t < 14 ? 6 + 1.2 * t : 22.8 + 4 * (t - 14) + 0.2 * (t - 14) ** 2];
    // (faster as it climbs, to a steady beat: never so fast that it is out of the picture in a frame or two)
    const rise = t < 18 ? 3.6 * t + 0.1 * t * t : 97.2 + 7.2 * (t - 18);
    const go = t < 16 ? 1.4 * t + 0.07 * t * t : 40.3 + 3.6 * (t - 16);
    return [go, B.climb * (12 * (1 - Math.exp(-t / 3)) + rise)];
  };
  interface Pose { x: number; y: number; z: number; h: number; pitch: number; wing: number; whip: number; span: number; head: number; beak: number; legs: number; shown: number }
  const lookOf = (B: Bird, i: number, f: number): number => B.h + Math.sin((f - STARTLE) * 1.1 + i * 2) * 0.35;
  const LAST = 110;
  const poses: Pose[][] = BIRDS.map((B, i) => {
    const out: Pose[] = [];
    let x = B.x;
    let y = B.y;
    let s0 = 0;
    const h0 = turnToward(lookOf(B, i, B.T - 4), B.fly, 0.45);
    for (let f = 0; f < LAST; f++) {
      const P: Pose = { x: B.x, y: B.y, z: 0, h: B.h, pitch: 0, wing: 0, whip: 0, span: 0, head: 0, beak: 0, legs: 1, shown: 1 };
      if (f < STARTLE) {
        // pecking, each to its own beat
        P.head = -[0, 3, 7, 3][(f + i) % 4];
      } else if (f < B.T - 3) {
        // startled: head up and stock still but for a quick look round; two caw, one hops
        const k = f - STARTLE;
        P.head = 2;
        P.h = lookOf(B, i, f);
        if (B.caw) P.beak = [1, 2, 2, 2, 1][k] ?? 0;
        if (B.hop) P.z = [3, 6, 5, 2][k] ?? 0;
      } else if (f < B.T) {
        // the crouch: down on its legs, turning for where it will go, its wings flung open and up
        const k = (f - (B.T - 3) + 1) / 3;
        P.z = -2.5 * k;
        P.h = turnToward(lookOf(B, i, B.T - 4), B.fly, 0.45 * k);
        P.wing = 0.3 + 0.9 * k;
        P.span = 0.35 + 0.65 * k;
        P.head = 2 - 3 * k;
        P.pitch = 0.15 * k;
      } else {
        // up: a deep stroke down off the floor, and climbing on fast, deep beats, turning onto its way
        const t = f - B.T;
        const [s, z] = flight(t, B);
        P.h = turnToward(h0, B.fly, Math.min(1, (t + 1) / 6));
        x += Math.cos(P.h) * (s - s0);
        y += Math.sin(P.h) * (s - s0);
        s0 = s;
        P.x = x;
        P.y = y;
        const ph = (2 * Math.PI * t) / 7;
        P.wing = Math.cos(ph) * (t < 8 ? 1.2 : 0.95);
        // (the hand lags the arm: the wing whips at the ends of its stroke)
        P.whip = 0.45 * Math.sin(ph);
        P.span = 1;
        P.z = z + 2 * Math.sin(ph);
        P.pitch = 0.08 + 0.22 * Math.exp(-t / 5);
        P.legs = Math.max(0, 1 - t / 5);
        // (near the top of the picture it rides up on its wings held high, so that it goes out of it bit by bit)
        if (ay + onPic(x, y, z + 13)[1] < 90) {
          P.wing = 1 + 0.08 * Math.sin(ph);
          P.whip = 0.15;
        }
      }
      out.push(P);
    }
    return out;
  });

  /** A raven as it is, painted on `q` from the picture's anchor: its body, folded wings or spread, its head and great beak. */
  const SC = 1.5;
  /** (ox, oy): where the picture's anchor is on `q`. */
  const paintBird = (q: Px, P: Pose, ox: number, oy: number): void => {
    const ch = Math.cos(P.h);
    const sh = Math.sin(P.h);
    const cp = Math.cos(P.pitch);
    const sp = Math.sin(P.pitch);
    const F: V3 = [ch * cp, sh * cp, sp];
    const L: V3 = [-sh, ch, 0];
    const U: V3 = [-ch * sp, -sh * sp, cp];
    const bodyZ = 9 * SC + P.z;
    /** A point of it: f forward, l to its left, u up, in its own measure (SC picture pixels each). */
    const at = (f: number, l: number, u: number): [number, number] => {
      const k = SC;
      const [x, y] = onPic(P.x + k * (f * F[0] + l * L[0] + u * U[0]), P.y + k * (f * F[1] + l * L[1] + u * U[1]), bodyZ + k * (f * F[2] + l * L[2] + u * U[2]));
      return [ox + x, oy + y];
    };
    const nearSide = L[0] + L[1] > 0 ? 1 : -1;
    const wing = (side: number): void => {
      // (a span, tip to tip, about the hero's height: the second look found the first half as big again)
      const span = 20 * P.span;
      // the arm out to the wrist, the hand on out from it, each at its own angle up from level
      const arm = P.wing;
      const hand = P.wing + P.whip;
      const out = (from: [number, number, number], al: number, len: number, f: number): [number, number, number] => [f, from[1] + Math.cos(al) * side * len, from[2] + Math.sin(al) * len];
      const sho: [number, number, number] = [0, side * 3.4, 1.5];
      const wrist = out(sho, arm, span * 0.45, 3);
      const wristT = out(sho, arm, span * 0.42, -13);
      const tip = out(wrist, hand, span * 0.55, -1);
      const pt = (q3: [number, number, number]): [number, number] => at(q3[0], q3[1], q3[2]);
      // which of its faces he sees: its back, or under it
      const nUp: V3 = [-Math.sin(arm) * side * L[0] + Math.cos(arm) * U[0], -Math.sin(arm) * side * L[1] + Math.cos(arm) * U[1], Math.cos(arm) * U[2]];
      const top = nUp[0] * TOWARD[0] + nUp[1] * TOWARD[1] + nUp[2] * TOWARD[2] > 0;
      // (black: its back raven-dark, under it darker; only its leading edge catches the light)
      const fill = top ? RAVEN[2] : RAVEN[1];
      // the long feathers of its hand, splayed like fingers out past its tip
      const fingers: [number, number][] = [];
      for (let k = 0; k < 5; k++) {
        const s0 = 0.3 + 0.16 * k;
        const base: [number, number, number] = [-10 + 1.5 * k, wrist[1] + (tip[1] - wrist[1]) * s0, wrist[2] + (tip[2] - wrist[2]) * s0];
        const end = out(base, hand, 6 + k * 1.1, -13 + 2.2 * k);
        const [x0, y0] = pt(base);
        const [x1, y1] = pt(end);
        limb(q, x0, y0, x1, y1, 1.1, 0.6, [fill, fill, fill, fill, fill]);
        fingers.push([x1, y1]);
      }
      q.poly([pt([5, sho[1], sho[2]]), pt(wrist), pt(tip), pt([-9, wristT[1] + (tip[1] - wristT[1]) * 0.6, wristT[2] + (tip[2] - wristT[2]) * 0.6]), pt(wristT), pt([-11, sho[1], sho[2]])], fill);
      // its leading edge to the light, and a line of coverts across it
      const [a0x, a0y] = pt([5, sho[1], sho[2]]);
      const [a1x, a1y] = pt(wrist);
      const [a2x, a2y] = pt(tip);
      q.line(a0x, a0y, a1x, a1y, top ? RAVEN[3] : RAVEN[2]);
      q.line(a1x, a1y, a2x, a2y, top ? RAVEN[3] : RAVEN[2]);
      if (top) {
        const [c0x, c0y] = pt([-2, sho[1] + (wrist[1] - sho[1]) * 0.5, sho[2] + (wrist[2] - sho[2]) * 0.5]);
        const [c1x, c1y] = pt([-5, wrist[1], wrist[2]]);
        q.line(c0x, c0y, c1x, c1y, RAVEN[1]);
      }
    };
    if (P.span > 0) wing(-nearSide);
    // legs: down to the floor where it stands; dangling as it leaps
    if (P.legs > 0) {
      for (const side of [-1, 1]) {
        const [x0, y0] = at(0.5, side * 1.6, -3.5);
        let x1: number;
        let y1: number;
        if (P.span === 0 || P.legs >= 1) {
          [x1, y1] = onPic(P.x + SC * (ch * 1.5 + L[0] * side * 2), P.y + SC * (sh * 1.5 + L[1] * side * 2), Math.max(0, P.z));
          x1 += ox;
          y1 += oy;
        } else [x1, y1] = at(-2.5, side * 1.6, -3.5 - 5 * P.legs);
        limb(q, x0, y0, x1, y1, 0.8, 0.6, BEAK_R);
        // its toes
        const [tx, ty] = [x1 + (ch - sh) * 2, y1 + (ch + sh) * 0.8];
        q.line(x1, y1, tx, ty, BEAK);
      }
    }
    // its tail, a wedge back from its rump
    const [t0x, t0y] = at(-6, 0, 0);
    const [t1x, t1y] = at(-15, -3.4, -1.4);
    const [t2x, t2y] = at(-16, 0, -1.6);
    const [t3x, t3y] = at(-15, 3.4, -1.4);
    q.poly([[t0x - 2.5, t0y - 1.5], [t1x, t1y], [t2x, t2y + 1], [t3x, t3y], [t0x + 2.5, t0y + 1.5]], RAVEN[2]);
    q.line(t0x, t0y, t2x, t2y, RAVEN[3]);
    // its body, one long rounded form from rump to breast
    const [r0x, r0y] = at(-5.5, 0, 0.2);
    const [r1x, r1y] = at(3, 0, 0.8);
    limb(q, r0x, r0y, r1x, r1y, 4.6 * SC, 5.4 * SC, RAVEN);
    // its wing folded along its side, its top edge catching the light
    if (P.span === 0) {
      const [w0x, w0y] = at(3.5, nearSide * 2.6, 2.2);
      const [w1x, w1y] = at(-11, nearSide * 2, -0.2);
      limb(q, w0x, w0y, w1x, w1y, 3 * SC, 1.4 * SC, RAVEN);
      const [e0x, e0y] = at(3, nearSide * 2.4, 4.6);
      const [e1x, e1y] = at(-10, nearSide * 2, 1);
      q.line(e0x, e0y, e1x, e1y, RAVEN[4]);
    }
    // its neck and head, low as it pecks, up as it looks; its great beak, open as it caws
    const fw = Math.max(0, -P.head) * 0.5;
    const hu = 4.6 + P.head;
    const [n0x, n0y] = at(4.5 + fw * 0.5, 0, 2.2 + P.head * 0.5);
    const [hx_, hy_] = at(7.4 + fw, 0, hu);
    limb(q, n0x, n0y, hx_, hy_, 3.6 * SC * 0.8, 3.2 * SC * 0.8, RAVEN);
    ball(q, hx_, hy_, 3.3 * SC * 0.8, 3.1 * SC * 0.8, RAVEN);
    const [b0x, b0y] = at(9.6 + fw, 0, hu - 0.2);
    const [b1x, b1y] = at(15 + fw, 0, hu - 1.4 + P.beak);
    limb(q, b0x, b0y, b1x, b1y, 1.7, 0.6, BEAK_R);
    if (P.beak > 0) {
      const [l1x, l1y] = at(14 + fw, 0, hu - 2.2 - P.beak * 1.2);
      limb(q, b0x, b0y + 1, l1x, l1y, 1.2, 0.5, BEAK_R);
    }
    const [ex, ey] = at(8.2 + fw, nearSide * 1.8, hu + 0.9);
    q.set(Math.round(ex), Math.round(ey), RAVEN_EYE).set(Math.round(ex) + 1, Math.round(ey), RAVEN_EYE);
    if (P.span > 0) wing(nearSide);
  };

  // THE BONES they peck at: a skull, its jaw, long bones; one of them flung over as the second raven leaps
  const FLUNG = BIRDS[1].T;
  const BONES: ReadonlyArray<readonly [number, number, number, number]> = [[-9, 10, 4, 14], [-20, -2, -12, 6], [10, 6, 22, 2]];
  const flungAt = (f: number): { x: number; y: number; z: number; h: number; b: number } => {
    const k = Math.max(0, Math.min(9, f - FLUNG));
    const s = k / 9;
    return { x: 4 - 11 * s, y: -12 - 2 * s, z: 11 * Math.sin(Math.PI * s), h: 0.5 + 1.4 * s, b: Math.PI * s };
  };
  const paintBones = (q: Px, f: number): void => {
    for (const [x0, y0, x1, y1] of BONES) {
      const [p0x, p0y] = onPic(x0, y0, 1);
      const [p1x, p1y] = onPic(x1, y1, 1);
      limb(q, ax + p0x, ay + p0y, ax + p1x, ay + p1y, 1.1, 1.1, OLD_BONE);
      ball(q, ax + p0x, ay + p0y, 1.7, 1.5, OLD_BONE);
      ball(q, ax + p1x, ay + p1y, 1.7, 1.5, OLD_BONE);
    }
    // the flung bone, end over end
    const fb = flungAt(f);
    const hx = Math.cos(fb.h) * 6;
    const hy = Math.sin(fb.h) * 6;
    const [a0x, a0y] = onPic(fb.x - hx * Math.cos(fb.b), fb.y - hy * Math.cos(fb.b), 1 + fb.z - 6 * Math.sin(fb.b));
    const [a1x, a1y] = onPic(fb.x + hx * Math.cos(fb.b), fb.y + hy * Math.cos(fb.b), 1 + fb.z + 6 * Math.sin(fb.b));
    limb(q, ax + a0x, ay + a0y, ax + a1x, ay + a1y, 1.1, 1.1, OLD_BONE);
    ball(q, ax + a0x, ay + a0y, 1.7, 1.5, OLD_BONE);
    ball(q, ax + a1x, ay + a1y, 1.7, 1.5, OLD_BONE);
    // the skull, its jaw beside it
    const [sx, sy] = onPic(0, 0, 4);
    ball(q, ax + sx, ay + sy, 4.4, 4, OLD_BONE);
    q.set(Math.round(ax + sx) - 2, Math.round(ay + sy), DEEP).set(Math.round(ax + sx) - 1, Math.round(ay + sy), DEEP);
    q.set(Math.round(ax + sx) + 1, Math.round(ay + sy), DEEP).set(Math.round(ax + sx) + 2, Math.round(ay + sy), DEEP);
    q.set(Math.round(ax + sx), Math.round(ay + sy) + 2, DEEP);
    const [jx, jy] = onPic(6, 5, 1.5);
    ball(q, ax + jx, ay + jy, 2.6, 1.6, OLD_BONE);
  };

  // FEATHERS shaken loose: a puff of three from each as it beats up off the floor, rocking down and settling
  interface Feather { f0: number; x: number; y: number; z0: number; ang: number; seed: number }
  const feathers: Feather[] = [];
  for (let i = 0; i < BIRDS.length; i++) for (const k of [0, 1, 3]) {
    const P = poses[i][BIRDS[i].T + k];
    feathers.push({ f0: BIRDS[i].T + k, x: P.x + (hash(i, k, 412) - 0.5) * 10, y: P.y + (hash(i, k, 413) - 0.5) * 10, z0: P.z + 16, ang: hash(i, k, 411) * Math.PI, seed: i * 4 + k });
  }
  /** Where a feather is k frames after it is loosed: across, up, and the way it lies on the picture; and whether it has settled. */
  const featherAt = (fe: Feather, k: number): { x: number; y: number; z: number; a: number; down: boolean } => {
    // (flung up a little by the beat, then rocking down; settled where it meets the floor)
    const zOf = (t: number): number => fe.z0 - 1.25 * t + 14 * (1 - Math.exp(-t / 3));
    let t = k;
    let down = false;
    if (zOf(k) <= 0) {
      down = true;
      t = 0;
      while (zOf(t + 1) > 0) t++;
      t++;
    }
    const sway = Math.sin(0.3 * t + fe.seed) * 5;
    return { x: fe.x + Math.cos(fe.ang) * sway + 0.4 * t, y: fe.y + Math.sin(fe.ang) * sway, z: Math.max(0, zOf(t)), a: fe.ang + 0.9 * Math.sin(0.3 * t + fe.seed + 1.2), down };
  };

  // THE DUST blown out from under each as it beats up off the floor
  // (a low cloud spreading out from under its wings, thick at its heart: the second look found a hollow ring)
  const puffs: Puff[] = BIRDS.flatMap((B, i) => [
    ...puffRing(B.T, B.x, B.y, 0, 12, 0.9, 5, 30 + i),
    { f0: B.T, x: B.x, y: B.y, z: 0, ang: 0, v: 0, r0: 4, grow: 6, rise: 0.25, life: 16, seed: 200 + i },
  ]);

  const tracks: Track[] = [
    ...BIRDS.map((_, i) => ({ name: `raven ${i + 1}`, at: [] as Track['at'] })),
    { name: 'the flung bone', at: [] },
    ...feathers.map((_, i) => ({ name: `feather ${i + 1}`, at: [] as Track['at'] })),
  ];
  const paint = (f: number, loop: number, record: boolean): Sprite => {
    const bones = new Px(W, H);
    paintBones(bones, f);
    const out = compose(null, [bones], null);
    const birds = new Px(W, H);
    // nearest last
    const order = BIRDS.map((_, i) => i).sort((m, n) => poses[m][f].x + poses[m][f].y - (poses[n][f].x + poses[n][f].y));
    for (const i of order) {
      const P = { ...poses[i][f] };
      if (f < STARTLE) P.head = -[0, 3, 7, 3][(loop + i) % 4];
      const [bx, by] = onPic(P.x, P.y, P.z + 13);
      const BX = Math.round(bx);
      const BY = Math.round(by);
      const q = new Px(200, 200);
      paintBird(q, P, 100 - BX, 100 - BY);
      // (darker as it climbs up into the dark: a step at a time)
      const dim = P.z > 300 ? 0.5 : P.z > 160 ? 0.28 : 0;
      const seamed = compose(null, [q], null);
      const all = painted(seamed);
      const kept = fastBlit(birds, seamed, ax + BX - 100, ay + BY - 100, dim);
      if (record) tracks[i].at.push({ x: bx, y: by, shown: all ? kept / all : 0, size: 26 });
    }
    // the feathers: in the air, and settled
    const fl = new Px(W, H);
    feathers.forEach((fe, j) => {
      const k = f - fe.f0;
      if (k < 0) {
        if (record) tracks[BIRDS.length + 1 + j].at.push(null);
        return;
      }
      const s = featherAt(fe, k);
      const [x, y] = onPic(s.x, s.y, s.z);
      // (a long feather: its quill, its vane tapering to its tip)
      const dx = Math.cos(s.a) * 4.5;
      const dy = Math.sin(s.a) * (s.down ? 2.2 : 4.5);
      limb(fl, ax + x - dx, ay + y - dy, ax + x + dx, ay + y + dy, 0.6, 1.5, FEATHER);
      if (record) tracks[BIRDS.length + 1 + j].at.push({ x, y, shown: 1, size: 7 });
    });
    if (record) {
      const fb = flungAt(f);
      const [x, y] = onPic(fb.x, fb.y, fb.z + 1);
      tracks[BIRDS.length].at.push({ x, y, shown: 1, size: 12 });
    }
    fastBlit(out, compose(null, [fl], null), 0, 0);
    fastBlit(out, birds, 0, 0);
    paintPuffs(puffs, f, ax, ay, out, null, [FLOOR_DUST[1], FLOOR_DUST[2]]);
    // (cut down to what is painted: most of its tall frame is empty)
    const bb = out.bounds(GRAIN)!;
    const cut = new Px(bb.w, bb.h);
    fastBlit(cut, out, -bb.x, -bb.y);
    return cut.sprite(ax - bb.x, ay - bb.y, GRAIN);
  };
  // it is over on the frame the last of them is out of the picture, every feather settled
  const frames: Sprite[] = [];
  for (let f = 0; f < LAST; f++) {
    frames.push(paint(f, f, true));
    if (f > STARTLE && BIRDS.every((_, i) => tracks[i].at[f]!.shown === 0) && feathers.every((fe) => featherAt(fe, f - fe.f0).down)) break;
  }
  const N = frames.length;
  if (N === LAST) throw new Error('the ravens are still in the picture at the end');
  for (const fe of feathers) if (!featherAt(fe, N - 1 - fe.f0).down) throw new Error('a feather is still falling at the end');
  const before = [0, 1, 2, 3].map((k) => paint(0, k, false));
  return { name: 'the ravens take flight', frames, fps: 30, before, after: [frames[N - 1]], tracks, jolts: [], holds: [] };
}

/**
 * THE BELL TOLLS. The great bell hangs still (`before`). Grit sifts down off its beam and its rope
 * twitches, as if a hand were on it; then, with no hand on it, it begins to swing across its beam,
 * each swing wider, its rope whipping after it, until it is heeling over a third of the way to the
 * beam and its clapper strikes: the whole frame jumps on its feet, dust bursts off the beam and rains
 * down, a ring of dust blows out across the floor from under it. It tolls so at every swing while it
 * swings that wide; then the strokes die away, slower and slower, the clapper rolling loose inside
 * it, until it hangs still again (`after`, as it was). Its strikes are its `jolts`, for the screen's
 * kick and the sound. On the bell's own anchor, its frames wider and taller for the dust.
 */
function bellTolls(): Moment {
  const PAD = 56;
  const MW = BELL_W + PAD * 2;
  const MH = BELL_H + 28;
  const ax = BELL_OX + PAD;
  const ay = BELL_OY;
  const [hx, hy] = bellHook();
  const F0 = 6;
  // (a swing there and back nearly two seconds: a great bell is slow and heavy; the second look found 1.2 s quick)
  const PER = 56;
  const AMAX = 1.15;
  const HOLD = 84;
  const FADE = 56;
  // (still again on its last frame: a whole number of half swings)
  const N = F0 + HOLD + FADE + 1;
  const ampOf = (t: number): number => {
    if (t < F0) return 0;
    const up = AMAX * (1 - Math.exp(-Math.min(t - F0, HOLD) / 14));
    return t - F0 <= HOLD ? up : up * Math.cos((Math.PI / 2) * Math.min(1, (t - F0 - HOLD) / FADE)) ** 2;
  };
  /** Where it is in its swing: hanging at the top of each, slow, and fast through the bottom. */
  const phaseOf = (t: number): number => {
    const u = (t - F0) / PER;
    return 2 * Math.PI * u + 0.25 * Math.sin(4 * Math.PI * u);
  };
  const swingOf = (t: number): number => ampOf(t) * Math.sin(phaseOf(t));
  // THE STROKES: at the top of every swing that heels it over far enough. THE CLAPPER hangs plumb
  // inside it while it swings low, lying against its lip once it heels over past LIP; swinging high,
  // it flies higher than the bell, across to the high lip at the top of every swing: the stroke.
  const LIP = 0.36;
  const strikes: number[] = [];
  for (let f = 1; f < N - 1; f++) {
    const a = Math.abs(swingOf(f));
    if (a > 0.9 && a >= Math.abs(swingOf(f - 1)) && a > Math.abs(swingOf(f + 1))) strikes.push(f);
  }
  const clapRel: number[] = [];
  for (let f = 0; f < N; f++) {
    const th = swingOf(f);
    const plumb = -Math.max(-LIP, Math.min(LIP, th));
    const flying = Math.max(0, Math.min(1, (ampOf(f) - 0.3) / 0.3));
    clapRel.push(flying * 0.86 * LIP * Math.sin(phaseOf(f)) + (1 - flying) * plumb);
  }
  /** Frames from the end, for the last things to come to rest on its last frame. */
  const settle = (f: number): number => Math.min(1, (N - 1 - f) / 20);
  // (the whole frame jumps off its feet at the stroke, and shudders down)
  const SHUDDER: ReadonlyArray<readonly [number, number]> = [[3, -4], [-2, -1], [2, 0], [-1, 0], [1, 0]];
  const shake = (f: number): [number, number] => {
    for (const s of strikes) if (f >= s && f - s < SHUDDER.length) return [SHUDDER[f - s][0], SHUDDER[f - s][1]];
    return [0, 0];
  };
  /** How far the rope is pulled aside, `s` of the way down it, on frame f: dragged after the bell and whipping; a twitch as it begins. */
  const ropeOf = (f: number) => (s: number): number => {
    const lag = swingOf(f - 1 - 7 * s);
    const twitch = f >= 2 && f <= 7 ? 5 * s * s * Math.sin((Math.PI * (f - 2)) / 5) : 0;
    return (-18 * s ** 1.2 * Math.sin(lag) + twitch) * settle(f);
  };
  // GRIT sifting off the frame's tops all the while, by its bearings clear of the bell; more at every stroke
  const BEAM_Z = BELL_AXLE - 2;
  const grit: Grain[] = grainStream(1, N - 1, 0.45, (i) => [(hash(i, 1, 421) < 0.5 ? -1 : 1) * (19 + hash(i, 2, 421) * 7), (hash(i, 3, 421) - 0.5) * 3, BEAM_Z]);
  for (let i = 0; i < 4; i++) grit.push([1 + i, (i % 2 ? -1 : 1) * (20 + 3 * i), 1, BEAM_Z, 0, 0, 0.45]);
  for (const [j, s] of strikes.entries()) {
    for (let i = 0; i < 24; i++) {
      const side = i % 2 ? -1 : 1;
      grit.push([s, side * (20 + hash(i, j, 422) * 12), (hash(i, j, 423) - 0.5) * 6, BEAM_Z + 4, side * (0.3 + 0.8 * hash(i, j, 424)), (hash(i, j, 425) - 0.5) * 1.2, 0.8 + 0.5 * hash(i, j, 426)]);
    }
  }
  // AT EVERY STROKE: dust bursting off the frame's tops, out and down fast (the second look found it
  // hanging there like wool), and a ring of it blown out wide across the floor
  const beamDust: Puff[] = [];
  const ring: Puff[] = [];
  for (const [j, s] of strikes.entries()) {
    for (let i = 0; i < 9; i++) {
      const side = i % 2 ? -1 : 1;
      const x = side * (22 + 2 * Math.floor(i / 2));
      beamDust.push({ f0: s, x, y: (hash(i, j, 435) - 0.5) * 8, z: BEAM_Z + 6, ang: (side < 0 ? Math.PI : 0) + (hash(i, j, 436) - 0.5) * 1.6, v: 1 + 0.6 * hash(i, j, 431), r0: 2.4, grow: 4.2 + 1.4 * hash(i, j, 432), rise: -2.6 - 0.8 * hash(i, j, 433), life: 10 + Math.floor(hash(i, j, 434) * 4), seed: 60 + j * 9 + i });
    }
    ring.push(...puffRing(s, 0, 0, 0, 24, 11, 6, 70 + j));
  }
  const tracks: Track[] = [{ name: 'the bell', at: [] }, { name: 'its clapper', at: [] }];
  const frames: Sprite[] = [];
  for (let f = 0; f < N; f++) {
    const th = swingOf(f);
    const clap = clapRel[f] * settle(f);
    const out = new Px(MW, MH);
    const under = new Px(MW, MH);
    const over = new Px(MW, MH);
    paintPuffs(ring, f, ax, ay, over, under, [FLOOR_DUST[1], FLOOR_DUST[2]]);
    paintPuffs(beamDust, f, ax, ay, over, null, [FLOOR_DUST[2], '#6a6480']);
    fastBlit(out, under, 0, 0);
    const [dx, dy] = shake(f);
    fastBlit(out, bellPx(th, clap, ropeOf(f)), PAD + dx, dy);
    fastBlit(out, over, 0, 0);
    paintGrains(out, grit, f, ax, ay, ['#6a6480', FLOOR_DUST[0]]);
    frames.push(out.sprite(ax, ay, GRAIN));
    // where its lip and its clapper are
    const [Ax, Ay] = swung(th, 1, 0, 0);
    const [Cx, Cy] = swung(th + clap, BELL_CLAPPER, 0, 0);
    tracks[0].at.push({ x: hx + Ax * BELL_END + dx - BELL_OX, y: hy + Ay * BELL_END + dy - BELL_OY, shown: 1, size: 30 });
    tracks[1].at.push({ x: hx + Ax * (BELL_TOP + 3) + Cx + dx - BELL_OX, y: hy + Ay * (BELL_TOP + 3) + Cy + dy - BELL_OY, shown: 1, size: 10 });
  }
  const still = greatBell(0, 0);
  return { name: 'the bell tolls', frames, fps: 30, before: [still], after: [still], tracks, jolts: strikes, holds: [] };
}

/**
 * THE GIBBET SWINGS. The gibbet's cage hangs still with its dead man's bones in it (`before`). Its
 * chain slips a link with a jerk and catches, rust bursting off it, and the cage is flung swinging
 * across under its arm, wide and wild, turning on its chain as it goes; at the top of its first swing
 * its rotten foot bursts open, its bars splaying, and the bones pour out of it: the long bones of the
 * legs first, then the ribs, then the skull, tumbling down; they strike the floor and bounce, the
 * skull hardest, and it rolls on toward the hero, turning over, and comes to rest. The cage swings
 * on, the swings dying away, empty, rust sifting off its chain (`after`: the empty cage, the bones
 * where they lie). The chain catching, the foot bursting and the skull striking are its `jolts`.
 * On the gibbet's own anchor, its frames wider and deeper for where the bones go.
 */
function gibbetSwings(): Moment {
  const PADL = 24;
  const PADR = 60;
  const PADB = 64;
  const MW = GIB_W + PADL + PADR;
  const MH = GIB_H + PADB;
  const ax = GIB_OX + PADL;
  const ay = GIB_OY;
  const [hx, hy] = gibbetHook();
  /** Where the cage hangs from, in the world from the anchor. */
  const HOOK: V3 = [0, 0.62 * KT, 118];
  const SLIP = [14, 16, 19.5, 17, 18.8, 17.6, 18.3, 17.9, 18];
  const CATCH = 2;
  const PER = 30;
  const AMP = 0.78;
  const TAU = 42;
  // (still again, at the bottom of its swing, on its last frame)
  const N = CATCH + 6 * (PER / 2) + 1;
  const BURST = CATCH + 8;
  const swingOf = (t: number): number => (t < CATCH ? 0 : AMP * Math.exp(-(t - CATCH) / TAU) * Math.sin((2 * Math.PI * (t - CATCH)) / PER));
  const spins: number[] = [];
  for (let f = 0, s = CAGE_STILL.spin; f < N; f++) {
    if (f >= CATCH) s += 0.16 * Math.exp(-(f - CATCH) / 35);
    spins.push(s);
  }
  const cageOf = (f: number): Cage => ({ ang: swingOf(f), spin: spins[f], chain: SLIP[Math.min(f, SLIP.length - 1)], burst: f < BURST ? 0 : Math.min(1, (f - BURST + 1) / 3) });
  // THE BONES: each let go in turn, slides down out of the burst foot, then falls free
  interface Fall { kind: CageBone; let: number; t: number; across: number }
  const FALLS: Fall[] = CAGE_BONES.map(([kind, t, across]) => ({ kind, t, across, let: BURST + (kind === 'skull' ? 3 : kind === 'ribs' ? 1 : kind === 'leg' ? 0 : 1) }));
  const G = 1.2;
  interface State { slide: number | null; o: V3; L: V3; U: V3; V: V3; v: V3; ground: boolean; still: boolean }
  const states: State[][] = FALLS.map(() => []);
  const landings: { f: number; kind: CageBone; o: V3 }[] = [];
  const rot = (a: V3, k: V3, ang: number): V3 => {
    // (Rodrigues: `a` turned about the unit axis `k`)
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    const d = a[0] * k[0] + a[1] * k[1] + a[2] * k[2];
    const x: V3 = [k[1] * a[2] - k[2] * a[1], k[2] * a[0] - k[0] * a[2], k[0] * a[1] - k[1] * a[0]];
    return [a[0] * c + x[0] * s + k[0] * d * (1 - c), a[1] * c + x[1] * s + k[1] * d * (1 - c), a[2] * c + x[2] * s + k[2] * d * (1 - c)];
  };
  const norm = (a: V3): V3 => {
    const n = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / n, a[1] / n, a[2] / n];
  };
  const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const REST: Record<CageBone, number> = { skull: 5.8, ribs: 4.2, leg: 2.2, 'other leg': 2.2 };
  FALLS.forEach((fl, i) => {
    let st: State | null = null;
    for (let f = 0; f < N; f++) {
      const c = cageOf(f);
      const [L, U, V] = boneAxes(c);
      const k = f - fl.let;
      const slide = k <= 0 ? 0 : 2.4 * k * k;
      if (!st || st.slide !== null) {
        const o0 = swungWorld(c.ang, c.chain + fl.t + slide, 0, 0, GX);
        const o: V3 = [HOOK[0] + o0[0] + V[0] * fl.across, HOOK[1] + o0[1] + V[1] * fl.across, HOOK[2] + o0[2] + V[2] * fl.across];
        if (fl.t + slide <= CAGE_LONG + 4) {
          const prev: V3 = st ? st.o : o;
          st = { slide, o, L, U, V, v: [o[0] - prev[0], o[1] - prev[1], o[2] - prev[2]], ground: false, still: false };
          states[i].push({ ...st });
          continue;
        }
        // out: free, dropping as fast as it was going (a little of the swing's way with it), tumbling
        const prev: V3 = st!.o;
        // (and flung out wide, each its own way, by the cage's lurch as it bursts)
        const KICK: Record<CageBone, readonly [number, number]> = { skull: [0.6, 0.9], ribs: [0.8, 1.1], leg: [2, -1.4], 'other leg': [-1.2, 1.9] };
        st = { slide: null, o, L, U, V, v: [(o[0] - prev[0]) * 0.35 + KICK[fl.kind][0], (o[1] - prev[1]) * 0.35 + KICK[fl.kind][1], o[2] - prev[2]], ground: false, still: false };
        states[i].push({ ...st });
        continue;
      }
      const s = st;
      if (!s.ground) {
        s.v = [s.v[0], s.v[1], s.v[2] - G];
        s.o = [s.o[0] + s.v[0], s.o[1] + s.v[1], s.o[2] + s.v[2]];
        const axis = norm(cross([s.v[0], s.v[1], 0], [0, 0, 1]));
        const spinRate = fl.kind === 'skull' ? 0.32 : fl.kind === 'ribs' ? 0.2 : 0.45;
        s.L = rot(s.L, axis, -spinRate);
        s.U = rot(s.U, axis, -spinRate);
        s.V = rot(s.V, axis, -spinRate);
        if (s.o[2] <= REST[fl.kind]) {
          s.o = [s.o[0], s.o[1], REST[fl.kind]];
          const first = !landings.some((l) => l.kind === fl.kind);
          landings.push({ f, kind: fl.kind, o: [...s.o] as V3 });
          // (the skull strikes on its jaw and is thrown on, toward the hero)
          if (first && fl.kind === 'skull') s.v = [1.3, 2.1, s.v[2]];
          if (s.v[2] < -2.2) {
            s.v = [s.v[0] * 0.6, s.v[1] * 0.6, -s.v[2] * (fl.kind === 'skull' ? 0.42 : 0.3)];
          } else {
            s.v = [s.v[0], s.v[1], 0];
            s.ground = true;
          }
          // (bones lie down flat where they strike: along the floor)
          if (fl.kind !== 'skull') {
            s.L = norm([s.L[0], s.L[1], 0]);
            s.V = [0, 0, 1];
            s.U = cross(s.V, s.L);
          }
        }
      } else if (!s.still) {
        // on the floor: the skull rolls on, turning over; the others slide to a stop
        s.v = [s.v[0] * (fl.kind === 'skull' ? 0.93 : 0.7), s.v[1] * (fl.kind === 'skull' ? 0.93 : 0.7), 0];
        s.o = [s.o[0] + s.v[0], s.o[1] + s.v[1], s.o[2]];
        const sp = Math.hypot(s.v[0], s.v[1]);
        if (fl.kind === 'skull' && sp > 0) {
          const axis = norm(cross([0, 0, 1], [s.v[0], s.v[1], 0]));
          s.L = rot(s.L, axis, sp / 4.5);
          s.U = rot(s.U, axis, sp / 4.5);
          s.V = rot(s.V, axis, sp / 4.5);
        }
        if (sp < 0.06) s.still = true;
      }
      states[i].push({ ...s, o: [...s.o] as V3, v: [...s.v] as V3 });
    }
  });
  const skullStrike = landings.find((l) => l.kind === 'skull')?.f ?? -1;
  const jolts = [CATCH, BURST, skullStrike].filter((f) => f > 0);
  // the dust where each strikes the floor
  const puffs: Puff[] = landings.map((l, j) => puffRing(l.f, l.o[0], l.o[1], 0, l.kind === 'skull' ? 10 : 6, l.kind === 'skull' ? 1.6 : 1.1, l.kind === 'skull' ? 3.6 : 2.6, 90 + j)).flat();
  // RUST off the chain: sifting all the while, a burst as it slips and as the cage bursts
  const rust: Grain[] = grainStream(1, N - 1, 0.32, (i) => [HOOK[0] + (hash(i, 1, 441) - 0.5) * 4, HOOK[1] + (hash(i, 2, 441) - 0.5) * 4, HOOK[2] - 2 - hash(i, 3, 441) * 10]);
  for (let i = 0; i < 10; i++) rust.push([CATCH, HOOK[0] + (hash(i, 1, 442) - 0.5) * 6, HOOK[1], HOOK[2] - 4, (hash(i, 2, 442) - 0.5) * 1.6, (hash(i, 3, 442) - 0.5) * 1.6, 0.4]);
  {
    const c = cageOf(BURST);
    const o = swungWorld(c.ang, c.chain + CAGE_LONG - 4, 0, 0, GX);
    for (let i = 0; i < 24; i++) rust.push([BURST, HOOK[0] + o[0] + (hash(i, 1, 443) - 0.5) * 14, HOOK[1] + o[1] + (hash(i, 4, 443) - 0.5) * 8, HOOK[2] + o[2], 0.6 + 1.6 * hash(i, 2, 443), (hash(i, 3, 443) - 0.5) * 2, 0.5]);
  }
  // AS IT BURSTS: a snapped bar and its rivets flung out of its foot, clattering down and lying there
  interface Bit { o: V3; v: V3; spin: number; a: number; down: boolean }
  const flung = (seed: number, o0: V3, v0: V3, spin: number): Bit[] => {
    const out: Bit[] = [];
    let b: Bit = { o: o0, v: v0, spin, a: hash(seed, 1, 451) * Math.PI, down: false };
    for (let f = 0; f < N; f++) {
      if (f > BURST && !b.down) {
        const v: V3 = [b.v[0], b.v[1], b.v[2] - G];
        let o: V3 = [b.o[0] + v[0], b.o[1] + v[1], b.o[2] + v[2]];
        let a = b.a + b.spin;
        let spin = b.spin;
        let down = false;
        if (o[2] <= 1) {
          o = [o[0], o[1], 1];
          if (v[2] < -2.5) {
            v[0] *= 0.55;
            v[1] *= 0.55;
            v[2] = -v[2] * 0.35;
            spin *= 0.5;
          } else {
            down = true;
            // (lying flat where it comes to rest)
            a = Math.round(a / Math.PI) * Math.PI + (b.a % 1);
          }
        }
        b = { o, v, spin, a, down };
      }
      out.push({ ...b });
    }
    return out;
  };
  const foot = (() => {
    const c = cageOf(BURST);
    return swungWorld(c.ang, c.chain + CAGE_LONG - 6, 0, 0, GX);
  })();
  const at0: V3 = [HOOK[0] + foot[0], HOOK[1] + foot[1], HOOK[2] + foot[2]];
  const bar = flung(1, at0, [2.6, -1.2, 4], 0.45);
  const rivets = [0, 1, 2, 3].map((k) => flung(10 + k, [at0[0] + (k - 1.5) * 3, at0[1], at0[2]], [1 + 2.5 * hash(k, 2, 452), (hash(k, 3, 452) - 0.5) * 4, 2 + 3 * hash(k, 4, 452)], 0));
  const tracks: Track[] = [{ name: 'the cage', at: [] }, ...FALLS.map((fl) => ({ name: `the ${fl.kind}`, at: [] as Track['at'] })), { name: 'a snapped bar', at: [] }];
  const frames: Sprite[] = [];
  const prevPic: ([number, number] | null)[] = FALLS.map(() => null);
  let barPrev: [number, number] | null = null;
  for (let f = 0; f < N; f++) {
    const c = cageOf(f);
    const scene = new Px(GIB_W, GIB_H);
    const cage = new Px(GIB_W, GIB_H);
    // the bones still in it (sliding out)
    const slide: Partial<Record<CageBone, number | null>> = {};
    FALLS.forEach((fl, i) => (slide[fl.kind] = states[i][f].slide));
    gibbetCage(cage, hx, hy, c, (q) => cageBones(q, hx, hy, c, slide));
    fastBlit(scene, compose(null, [gibbetPost(), cage], null), 0, 0);
    const out = new Px(MW, MH);
    const under = new Px(MW, MH);
    const over = new Px(MW, MH);
    paintPuffs(puffs, f, ax, ay, over, under, [FLOOR_DUST[1], FLOOR_DUST[2]]);
    fastBlit(out, under, 0, 0);
    fastBlit(out, scene, PADL, 0);
    // the bones falling free and lying where they came to rest, a streak behind each as it falls fast
    const free = new Px(MW, MH);
    FALLS.forEach((fl, i) => {
      const s = states[i][f];
      const [px, py] = onPic(s.o[0], s.o[1], s.o[2]);
      const here: [number, number] = [ax + px, ay + py];
      const before_ = prevPic[i];
      const speed = before_ ? Math.hypot(here[0] - before_[0], here[1] - before_[1]) : 0;
      if (s.slide === null) {
        if (before_ && speed > 4 && !s.ground) limb(free, before_[0], before_[1], here[0], here[1], 1, fl.kind === 'skull' ? 2.6 : 1.6, OLD_BONE);
        const face = s.U[0] * TOWARD[0] + s.U[1] * TOWARD[1] + s.U[2] * TOWARD[2];
        paintBone(free, fl.kind, (l, u, v) => {
          const [x, y] = onPic(...boneAt(s.o, s.L, s.U, s.V, l, u, v));
          return [ax + x, ay + y];
        }, face);
      }
      tracks[1 + i].at.push({ x: px, y: py, shown: 1, size: (fl.kind === 'skull' ? 8 : 12) + speed });
      prevPic[i] = here;
    });
    // the snapped bar, end over end, and its rivets
    if (f >= BURST) {
      const b = bar[f];
      const L = 7;
      const e: V3 = [Math.cos(b.a) * L, 0, Math.sin(b.a) * L * (b.down ? 0 : 1)];
      const [x0, y0] = onPic(b.o[0] - e[0], b.o[1] - e[1], b.o[2] - e[2]);
      const [x1, y1] = onPic(b.o[0] + e[0], b.o[1] + e[1], b.o[2] + e[2]);
      limb(free, ax + x0, ay + y0, ax + x1, ay + y1, 1, 1, IRONS);
      free.set(Math.round(ax + x0), Math.round(ay + y0), IRONS[3]);
      for (const rv of rivets) {
        const [rx, ry] = onPic(rv[f].o[0], rv[f].o[1], rv[f].o[2]);
        free.rect(Math.round(ax + rx), Math.round(ay + ry), 2, 2, IRONS[3]).set(Math.round(ax + rx) + 1, Math.round(ay + ry) + 1, IRONS[1]);
      }
      const [bx_, by_] = onPic(b.o[0], b.o[1], b.o[2]);
      const sp = barPrev ? Math.hypot(ax + bx_ - barPrev[0], ay + by_ - barPrev[1]) : 0;
      tracks[1 + FALLS.length].at.push({ x: bx_, y: by_, shown: 1, size: 14 + sp });
      barPrev = [ax + bx_, ay + by_];
    } else tracks[1 + FALLS.length].at.push(null);
    fastBlit(out, compose(null, [free], null), 0, 0);
    fastBlit(out, over, 0, 0);
    // (grey-brown flakes: the second look found the crypt's mauve rust, by the bones, reading as spatter)
    paintGrains(out, rust, f, ax, ay, ['#4a4250', '#2c2632'], 1.5);
    frames.push(out.sprite(ax, ay, GRAIN));
    const [bx, by] = swung(c.ang, c.chain + CAGE_LONG - 2, 0, 0, GX);
    tracks[0].at.push({ x: hx + bx - GIB_OX, y: hy + by - GIB_OY, shown: 1, size: 30 });
  }
  if (states.some((s) => !s[N - 1].still && !s[N - 1].ground)) throw new Error('a bone is still falling at the end');
  return { name: 'the gibbet swings', frames, fps: 30, before: [gibbet()], after: [frames[N - 1]], tracks, jolts, holds: [] };
}

let moments: Moment[] | null = null;
/** Floor 2's moments around the hero, made the first time they are asked for and kept. */
export function headsmanMoments(): Moment[] {
  if (moments) return moments;
  return (moments = [ravensTakeFlight(), bellTolls(), gibbetSwings()]);
}
