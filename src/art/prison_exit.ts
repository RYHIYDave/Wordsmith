// FLOOR 3, THE BLACK IRON PRISON: THE WAY OUT OF HIS HALL, A DOOR OUT THE BACK (the art chat, 2 Nov 2026). Behind the switch
// PRISON_EXIT, off; nothing of the game imports it until the main chat puts it in (with PRISON, art/prison.ts).
//
// His words, shown floor 3 built for the game, 2 Nov 2026: “Love it, but let’s not have stairs down from his arena cause if
// under it is fire, going down to something else is gonna be weird”. Asked how to leave floor 3 instead, his pick: “Door out
// the back (Recommended)”, offered as: when he falls, a heavy iron door in his hall's back wall grinds open onto a passage
// leading away from the fire, down to floor 4.
//
// WHAT IS PAINTED HERE (picture pixels, two to a game pixel; a tile 32 along a wall's face; look B's colours and the game's
// light, as art/prison.ts):
//   THE DOOR, SHUT (the fight): two tiles of a back wall of his hall taken by a heavy doorcase of black riveted iron (two
//     jambs, a lintel, a head plate with a row of short spikes over it, standing whole over the wall's fading top as his gate
//     does); in it a single leaf of riveted iron plate, set back in the frame, hung on two strap hinges; TWO BARS across it in
//     staples on both jambs; A GREAT LOCK, a hasp from the leaf's lock plate over a staple on the jamb, a padlock hanging in it;
//     and HIS MARK, the iron face-cage he wore, cast in the leaf's head, the enemy's embers dull behind its eye-slits.
//   ITS OPENING (`exitFilm`, EXIT_FRAMES at 30 a second from the moment he falls; Movement 9, a held build-up and a quick
//     release): his mark goes out; the door shudders; the upper bar draws back into the hinge jamb (a clank), then the lower
//     (a clank); the padlock's shackle springs (a clank) and it drops to the floor, the hasp falling to hang; HELD a beat, grit
//     sifting down; then the leaf lurches, grinding, sparks off the hinge, catches, and swings in, fast, away into the passage
//     (smeared); it hits the passage wall (the stop: soot burst out of the doorway and down off the lintel, sparks), rebounds,
//     and settles; the soot rolls out over the hall's floor and thins.
//   THE PASSAGE BEHIND (`under`): through the doorway, the iron sill and the flags going back between the doorway's iron
//     reveals; beyond the wall, the passage two tiles wide going straight back, away from the hall and its grate, its left wall
//     the prison's (80 high, fading into the dark as the game's walls), two of floor 3's own fire baskets on it; far down it a
//     flight of steps going DOWN, away from the fire, into the dark. Laid as the game lays a corridor seen beyond a back wall
//     (the walls toward the eye not drawn): the hall's back wall hides its first tiles, it shows over the wall from there on.
//
// FOR THE GAME, IN TWO LAYERS, anchored at the foot of the wall's face under the middle of the door (the joint of its two
// tiles: as floor 4's cave, art/cave4.ts, is anchored under its middle tile):
//   `frames[f]` (and `shut`, `open`) THE DOOR in the wall, stood at the wall's face in place of its two tiles' faces;
//   `under[k]` THE PASSAGE (four frames: its baskets flicker), drawn with the floor, under everything that stands.
// Where it stands, when it is open, and which tiles take him on: EXIT_TAKES, EXIT_OPEN_SECS below, and
// docs/mockups/floor3_look/README.md ("The door out the back").
//
// His art rulebook kept: crisp pixels; light from the upper left (the face along x lit, along y in shade); seams dark, never
// black; nothing glowing cyan (the friend's); the enemy's fire only in his mark, and it goes out as he falls; fire an honest
// orange (sparks, the baskets); real shapes.

import { Px } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import { GRAIN, hash } from './kit';
import { EMBER } from './props';
import { FLAME } from './mkit';
import { FADE_STEPS, PRISON_FADE, PRISON_LIGHTS, PRISON_WALL, STONE, RUST, floorAt, makePrisonArt, stoneFace } from './prison';

/** THE SWITCH: off until the main chat puts it in, on his yes. */
export const PRISON_EXIT = { on: false };

// =================================================================================================
// MEASURES: u along the wall's face over its two tiles (0 to 64, from the end the eye looks past: along x the screen's
// left, along y its right); b out of the wall toward the hall (+), back into the passage (-); z up. Picture pixels, 32 to a
// tile along the floor.

/** How many tiles of the wall it takes. */
export const EXIT_TILES = 2;
/** The film: frames a second, how many in all (from the moment he falls). */
export const EXIT_FPS = 30;
export const EXIT_FRAMES = 90;
/** From his fall until the doorway is open to walk into, in seconds: the film's end (the soot settled), as floor 4's cave (art/cave4.ts CAVE_OPEN_SECS). */
export const EXIT_OPEN_SECS = EXIT_FRAMES / EXIT_FPS;
/** Its jolts (frames): the upper bar home, the lower bar home, the lock's shackle springing, the leaf's lurch, the leaf hitting the stop. */
export const EXIT_JOLTS = { upperBar: 16, lowerBar: 22, lock: 26, lurch: 44, stop: 53 } as const;
/** How strong each jolt is (a shake in game pixels, as the cave's and the gate's: render.ts). */
export const EXIT_KICKS = { upperBar: 1, lowerBar: 1, lock: 1, lurch: 2, stop: 3 } as const;
/** His mark goes out over the first frames, as he falls. */
export const MARK_OUT = 8;
/**
 * THE DOORWAY (u along the face, z up): the way through between the jambs and under the lintel; the jambs, the lintel, the
 * head plate, its spikes. A hero is 56 high.
 */
export const EXIT_DOOR = { u0: 12, u1: 52, high: 70, lintel: 82, head: 96, spikes: 103 } as const;
const JAMB_L0 = 4;
const JAMB_R1 = 60;
/** How far the leaf is set back in its frame, and its size. */
const RECESS = 4;
const LEAF_W = EXIT_DOOR.u1 - EXIT_DOOR.u0;
const LEAF_H = EXIT_DOOR.high - 1;
/** The wall's row: a tile deep. */
const ROW = 32;
/**
 * THE PASSAGE (b back from the wall's face): two tiles wide; level from the wall's row to `stepsAt`, then `steps` steps down,
 * each `tread` deep and `rise` down, then on into the dark to `end`; its fire baskets on its left wall at `baskets` (the
 * middles of its tiles).
 */
export const EXIT_PASSAGE = { wide: 64, stepsAt: -128, steps: 7, tread: 16, rise: 8, end: -280, baskets: [-80, -144] } as const;

/**
 * WHERE IT STANDS AND WHAT TAKES HIM ON, for the rules (in the door's own frame: `a` the two tiles along the wall from the
 * first, `row` 0 the wall's row; as the ways in a wall of floors 12, 14 and 15 count theirs, art/act2_ways.ts):
 *   a back wall of his hall, the one farthest from his gate (so the passage leads away from the hall and its grate), two of
 *   its tiles side by side in the middle of its run, with the dark behind them for the passage (EXIT_PASSAGE: 9 tiles back,
 *   two across: nothing of the level drawn there) and nothing standing on the two rows of the hall's floor before them;
 *   the doorway: its two tiles in the wall's row, cut to floor once it is open (as `openGate` cuts a gate's three);
 *   walking onto either of them once open (EXIT_OPEN_SECS after his fall) takes him on, down to floor 4.
 */
export const EXIT_TAKES: readonly (readonly [number, number])[] = [[0, 0], [1, 0]];

// =================================================================================================
// COLOURS: his gate's black iron (art/prison_gate.ts: the prison's a tone lifted, the way on seen from across the dark)

const IRON = ['#0e0e12', '#222128', '#302e37', '#43404b', '#6a6473'] as const;
const SEAM = '#08080c';
const BEYOND = '#040406';
/** The passage's firelight on stone, seen from the hall (a dull warm dark, not the fire's own colours). */
const WARM = '#3c2116';
const SOOT_DUST = ['#1c1a20', '#2c2830', '#3e3640', '#5a4840'] as const;
const FIRE = new Set<string>([...EMBER, ...FLAME]);

function hexOf(c: string): [number, number, number] {
  const n = parseInt(c.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mixC(a: string, b: string, k: number): string {
  const [r0, g0, b0] = hexOf(a);
  const [r1, g1, b1] = hexOf(b);
  const f = (v: number): string => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${f(r0 + (r1 - r0) * k)}${f(g0 + (g1 - g0) * k)}${f(b0 + (b1 - b0) * k)}`;
}
/** A face turned to screen-right, in shade (as art/floorkit.ts `shaded`). */
const shaded = (c: string): string => mixC(c, '#06051a', 0.32);
const iron = (k: number): string => IRON[Math.max(0, Math.min(4, Math.round(k)))];
const clamp01 = (t: number): number => Math.max(0, Math.min(1, t));

// =================================================================================================
// THE MOTION, frame by frame (Movement 9: the build-up big and held, the release quick)

/** The leaf's swing (degrees, into the passage) at each frame: still; the lurch, grinding; the catch; the swing; the stop; the rebound; at rest. */
const SWING: Record<number, number> = { 44: 3, 45: 5, 46: 5, 47: 7, 48: 16, 49: 31, 50: 50, 51: 72, 52: 90, 53: 97, 54: 93, 55: 88, 56: 89 };
export function exitSwing(f: number): number {
  if (f < 44) return 0;
  return SWING[f] ?? 90;
}
/** How far each bar has slid back into the hinge jamb (picture pixels): the upper first, then the lower; juddering, then home with a clank. */
const BAR_SLIDE = [2, 1, 9, 26, 56];
export function exitBar(which: 'upper' | 'lower', f: number): number {
  const at = which === 'upper' ? EXIT_JOLTS.upperBar - 4 : EXIT_JOLTS.lowerBar - 4;
  if (f < at) return 0;
  return BAR_SLIDE[Math.min(BAR_SLIDE.length - 1, f - at)];
}
/** The shudder before the bars go (a pixel either way), and a give at each clank. */
function shudder(f: number): number {
  if (f >= 6 && f < 12) return [1, -1, 0, 1, -1, 0][f - 6];
  if (f === EXIT_JOLTS.upperBar || f === EXIT_JOLTS.lowerBar || f === EXIT_JOLTS.lock) return 1;
  return 0;
}
/** His mark's embers: 1 (dull, while he lives) to 0 (out), as he falls. */
function markLife(f: number): number {
  return clamp01(1 - f / MARK_OUT);
}

// =================================================================================================
// THE DOORCASE, on the face (us across it from the screen's left, 0 to 63; z up): 'open' in the doorway, a colour, or null

/** The doorcase and the wall about it at a point of the face; `hr` the hinges on the screen's right (along x). */
function caseAt(us: number, z: number, lit: boolean, hr: boolean): string | 'open' | null {
  const D = EXIT_DOOR;
  const sh = (c: string): string => (lit ? c : shaded(c));
  if (us >= D.u0 && us < D.u1 && z < D.high) return 'open';
  // THE SPIKES over the head plate: five, short, set out from the middle
  if (z >= D.head) {
    if (z >= D.spikes + 6) return null;
    const s = (((us + 0.5 - 32) % 10) + 15) % 10;
    const h = z - D.head;
    const half = 2.6 * (1 - h / 8);
    if (Math.abs(us + 0.5 - 32) < 22 && h < 8 && Math.abs(s - 5) <= half) return sh(s < 5 ? iron(3) : iron(1));
    return null;
  }
  // THE HEAD PLATE over the lintel: riveted, its top edge lit
  if (z >= D.lintel) {
    if (us < 7 || us > 56) return null;
    if (z === D.head - 1) return sh(iron(4));
    if (z === D.lintel) return sh(iron(0));
    if (us === 7 || us === 56) return sh(us === 7 ? iron(3) : iron(0));
    if ((z === D.lintel + 7) && (us - 10) % 9 === 0) return sh(iron(4));
    if ((z === D.lintel + 6) && (us - 10) % 9 === 1) return sh(iron(1));
    return sh(iron(2));
  }
  // THE LINTEL: a heavy beam across the doorway and the jambs, its underside dark, its top lit; rivets
  if (z >= D.high) {
    if (us < 2 || us > 61) return stone(us, z, lit);
    if (z === D.high) return sh(iron(0));
    if (z === D.lintel - 1) return sh(iron(4));
    if (us === 2) return sh(iron(3));
    if (us === 61) return sh(iron(0));
    if (z === D.high + 5 && us % 8 === 4) return sh(iron(4));
    if (z === D.high + 4 && us % 8 === 5) return sh(iron(1));
    return sh(iron(z >= D.lintel - 3 ? 3 : 2));
  }
  // THE JAMBS: posts of riveted iron, lit on the side toward the light; the hinges' pins on the jamb by the hinges
  const inL = us >= JAMB_L0 && us < D.u0;
  const inR = us >= D.u1 && us < JAMB_R1;
  if (inL || inR) {
    const x = inL ? us - JAMB_L0 : us - D.u1;
    const w = inL ? D.u0 - JAMB_L0 : JAMB_R1 - D.u1;
    const hingeSide = inR === hr;
    // (the pins: the knuckles of the two strap hinges, on the jamb's edge by the doorway)
    const edge = inL ? x >= w - 2 : x <= 1;
    if (hingeSide && edge && (Math.abs(z - 8) <= 3 || Math.abs(z - 58) <= 3)) {
      const top = Math.abs(z - 8) === 3 || Math.abs(z - 58) === 3;
      return sh(top ? iron(0) : (inL ? x === w - 2 : x === 0) ? iron(4) : iron(2));
    }
    if (x === 0) return sh(iron(inL ? 4 : 3));
    if (x === w - 1) return sh(iron(inL ? 1 : 0));
    if (z % 12 === 6 && x === 3) return sh(iron(4));
    if (z % 12 === 5 && x === 4) return sh(iron(1));
    if (z < 3) return sh(iron(1));
    return sh(iron(2));
  }
  return stone(us, z, lit);
}
/** The prison's wall about the doorcase (art/prison.ts), its top fading as the game's; a colour with its fade as `#rrggbbaa`. */
function stone(us: number, z: number, lit: boolean): string | null {
  if (z >= PRISON_WALL) return null;
  const c = stoneFace(lit, us, z, 431, false);
  const k = PRISON_WALL - 1 - z;
  if (k >= PRISON_FADE || FIRE.has(c)) return c;
  const a = Math.round(255 * FADE_STEPS[Math.floor((k * 4) / PRISON_FADE)]);
  return c + a.toString(16).padStart(2, '0');
}

// =================================================================================================
// THE LEAF, as if shut (us across it from the screen's left, z up): riveted plates, its rim, the strap hinges, the lock plate
// and the hasp hanging (once the lock is off), his mark; a tone 0..4 of the iron, or a colour

function leafAt(us: number, z: number, f: number, hr: boolean): number | string {
  const D = EXIT_DOOR;
  const x = us - D.u0;
  const fx = hr ? x : LEAF_W - 1 - x; // (from the free edge)
  // the rim, lit toward the light; a shadow under the lintel along its head
  if (z >= LEAF_H - 3) return z === LEAF_H - 3 ? 2 : 0;
  if (x <= 2) return x === 0 ? 0 : x === 1 ? 3 : 2;
  if (x >= LEAF_W - 2) return x === LEAF_W - 1 ? 0 : 1;
  if (z <= 5) return z === 5 ? 3 : z === 0 ? 0 : (x % 9 === 4 && z === 3) ? 4 : 2;
  // HIS MARK, the iron face-cage, cast in the leaf's head; the enemy's embers dull in its eye-slits, out once he has fallen
  {
    const dx = us + 0.5 - 32;
    const dz = z + 0.5 - 59;
    const e = Math.hypot(dx / 8, dz / 9.5);
    if (e < 1) {
      if (e > 0.8) return dx < 0 ? 4 : 1;
      const eye = Math.abs(dz - 2.5) <= 1.1 && Math.abs(Math.abs(dx) - 3.2) <= 1.7;
      const life = markLife(f);
      if (eye) return life > 0.66 ? (Math.abs(dz - 2.5) < 0.6 ? FLAME[1] : FLAME[0]) : life > 0.2 ? FLAME[0] : 0;
      if (Math.abs(dx) % 4 < 1.2 || Math.abs(dz + 4) < 1) return Math.abs(dx) % 4 < 0.6 ? 3 : 2;
      return 0;
    }
  }
  // the strap hinges: from the hinge edge, tapering to a round end, riveted
  for (const hz of [8, 58]) {
    const fromHinge = LEAF_W - 1 - fx;
    if (fromHinge < 13 && Math.abs(z - hz) <= (fromHinge > 10 ? 1 : 2)) {
      if ((fromHinge === 4 || fromHinge === 9) && z === hz) return 4;
      return z === hz + 2 || (fromHinge > 10 && z === hz + 1) ? 3 : z === hz - 2 ? 1 : 2;
    }
  }
  // the lock plate at the free edge, its keyhole; the hasp hanging from it once the lock is off
  if (fx >= 2 && fx <= 10 && z >= 28 && z <= 42) {
    if (fx === 6 && z >= 32 && z <= 35) return -1;
    if (z === 42 || (hr ? fx === 2 : fx === 10)) return 4;
    if (z === 28 || (hr ? fx === 10 : fx === 2)) return 1;
    if ((z === 30 || z === 40) && (fx === 4 || fx === 8)) return 4;
    if (f >= EXIT_JOLTS.lock && Math.abs(fx - 6) <= 1 && z >= 29 && z <= 31) return 3;
    return 3;
  }
  if (f >= EXIT_JOLTS.lock && Math.abs(fx - 6) <= 1 && z >= 16 && z < 28) return Math.abs(fx - 6) === 1 && (hr ? fx === 5 : fx === 7) ? 4 : z === 16 ? 1 : 3;
  // the straps the bars bear on: across the leaf, riveted
  for (const [z0, z1] of [[12, 17], [44, 49]] as const) {
    if (z >= z0 - 1 && z <= z1 + 1) {
      if (z === z1 + 1) return 4;
      if (z === z0 - 1) return 1;
      if (x % 7 === 3 && z === z1 - 1) return 4;
      return 2;
    }
  }
  // the plates: two, their seam down the middle; rust run down from the rivets, soot toward the foot
  if (x === 19) return 0;
  if (x === 20) return 2;
  let k = 1;
  if (hash(x >> 1, z >> 2, 441) < 0.1) k = 2;
  if (z < 12 && hash(x, z, 443) < 0.3) k = 0;
  // (in the shadow of the lintel over it)
  if (z >= LEAF_H - 5) k = 0;
  if (hash(x, 7, 445) < 0.22 && z > 18 && z < 42 && (z + x) % 3 !== 0) return RUST[0];
  return k;
}

// =================================================================================================
// THE BARS, THE HASP AND THE PADLOCK, before the leaf: little pictures (lit from the screen's left), set on the face

/** A bar: a flat iron bar across the doorway, `len` long, 6 high: its top lit, its foot in shadow, its ends square. */
function barPx(len: number): Px {
  const p = new Px(len, 9);
  for (let x = 0; x < len; x++) for (let y = 0; y < 9; y++) {
    // (its last two rows the shadow it throws on the leaf)
    const c = y >= 7 ? (y === 7 ? IRON[0] : SEAM) : y === 0 ? IRON[4] : y === 6 ? IRON[1] : x === 0 ? IRON[4] : x === len - 1 ? IRON[1] : y <= 2 ? IRON[4] : IRON[3];
    if (y < 7 && y > 0 && y < 6 && (x + 3) % 13 === 0) p.set(x, y, IRON[2]);
    else p.set(x, y, c);
  }
  return p;
}
/** A staple holding a bar to a jamb: an iron strap over the bar, its ends into the jamb. */
function staplePx(): Px {
  const p = new Px(8, 10);
  for (let x = 0; x < 8; x++) {
    p.set(x, 0, IRON[4]).set(x, 1, IRON[2]).set(x, 8, IRON[2]).set(x, 9, IRON[0]);
  }
  for (let y = 0; y < 10; y++) p.set(0, y, IRON[3]).set(7, y, IRON[0]);
  return p;
}
/** The hasp shut over its staple: a strap 14 long from the lock plate over the jamb, its slot over the staple's ring. */
function haspPx(): Px {
  const p = new Px(14, 5);
  for (let x = 0; x < 14; x++) for (let y = 0; y < 5; y++) p.set(x, y, y === 0 ? IRON[4] : y === 4 ? IRON[0] : x === 0 ? IRON[3] : IRON[2]);
  p.set(3, 2, IRON[0]).set(4, 2, IRON[0]).set(2, 2, IRON[4]);
  return p;
}
/** THE GREAT LOCK: a padlock, its body 11 by 12 and its shackle over it (`open`: one leg sprung out of the body). */
function padlockPx(open: boolean): Px {
  const p = new Px(16, 25);
  // the shackle: a thick hoop over the body
  for (let y = 1; y < 10; y++) {
    p.set(3, y, IRON[4]).set(4, y, IRON[2]);
    p.set(11, y, IRON[3]).set(12, y, IRON[1]);
  }
  for (let x = 4; x <= 11; x++) p.set(x, 0, x < 8 ? IRON[4] : IRON[3]).set(x, 1, IRON[1]);
  if (open) for (let y = 6; y < 10; y++) p.erase(11, y).erase(12, y);
  // the body: heavy, rounded at its foot, lit on its left, a keyhole
  for (let y = 10; y < 25; y++) for (let x = 0; x < 16; x++) {
    const foot = y >= 22 ? y - 21 : 0;
    if (x < foot || x > 15 - foot) continue;
    let c: string = x === 0 || y === 24 ? IRON[0] : x <= 2 ? IRON[4] : x >= 13 ? IRON[1] : y === 10 ? IRON[4] : y >= 22 ? IRON[1] : IRON[3];
    if (x === 15) c = IRON[0];
    if (x === 8 && y >= 15 && y <= 19) c = BEYOND;
    if (x >= 7 && x <= 9 && y === 15) c = BEYOND;
    if ((x === 4 || x === 11) && y === 12) c = IRON[4];
    if (x >= 9 && x <= 12 && y >= 18 && y <= 21 && hash(x, y, 451) < 0.5) c = RUST[1];
    p.set(x, y, c);
  }
  return p;
}
/** The padlock lying on the floor where it fell: on its side, foreshortened. */
function padlockDownPx(): Px {
  const p = new Px(14, 7);
  for (let y = 0; y < 7; y++) for (let x = 0; x < 14; x++) {
    const r = Math.hypot((x - 8) / 6, (y - 3.5) / 3.6);
    if (x >= 3 && r < 1) p.set(x, y, y <= 1 ? IRON[4] : y >= 5 ? IRON[0] : x === 3 ? IRON[3] : IRON[2]);
  }
  for (let x = 0; x < 4; x++) p.set(x, 1, IRON[3]).set(x, 4, IRON[1]);
  p.set(0, 2, IRON[3]).set(0, 3, IRON[3]);
  p.set(9, 3, BEYOND);
  return p;
}

// =================================================================================================
// THE PICTURES' FRAME: where a point of the door's world is in a picture (anchored at the foot of the face under the door's
// middle, at (AX, AY)): along x the face is turned to screen-left and its u runs left to right; along y it is turned to
// screen-right and its u runs right to left (the eye looks past its right end)

interface Frame { alongX: boolean; AX: number; AY: number }
/** The picture's column and row of the point (u, b, z). */
function proj(F: Frame, u: number, b: number, z: number): [number, number] {
  const c = F.alongX ? F.AX - 32 + u - b : F.AX + 32 - u + b;
  return [c, F.AY + (u - 32 + b) / 2 - z];
}
/** The face's u at a column, and the row of its foot there (as the game's walls: a pixel down for every two across). */
function faceU(F: Frame, c: number): number {
  return F.alongX ? c - (F.AX - 32) : F.AX + 31 - c;
}
function footRow(F: Frame, c: number): number {
  return F.alongX ? F.AY + Math.floor((c - F.AX - 1) / 2) : F.AY - 1 + Math.floor((F.AX - c) / 2);
}
/** A point of the face (us across it from the screen's left) as a column. */
const faceCol = (F: Frame, us: number): number => F.AX - 32 + us;

/** Set a colour that may carry its own alpha (#rrggbbaa). */
function put(p: Px, x: number, y: number, c: string): void {
  if (!p.inside(x, y)) return;
  p.set(x, y, c.slice(0, 7));
  if (c.length === 9) p.d[(y * p.w + x) * 4 + 3] = parseInt(c.slice(7, 9), 16);
}

// =================================================================================================
// LOOKING IN: what the eye meets along its line through a point of the face (u0, z0): it goes back (u0 - s, -s, z0 - s)

type Hit = { s: number; kind: 'sill' | 'reveal' | 'leaf' | 'floor' | 'wall' | 'tread'; u: number; b: number; z: number; t?: number; k?: number };

/** The floor's height at b (the passage's steps going down). */
function floorZ(b: number): number {
  const P = EXIT_PASSAGE;
  if (b >= P.stepsAt) return 0;
  const k = Math.floor((P.stepsAt - b) / P.tread);
  return -P.rise * Math.min(P.steps, k + 1);
}
/** Through the doorway and the wall's row: the sill, the reveal toward the eye's side, the threshold's flags; null past it. */
function inRow(u0: number, z0: number): Hit | null {
  const D = EXIT_DOOR;
  let best: Hit | null = null;
  const take = (h: Hit): void => {
    if (!best || h.s < best.s) best = h;
  };
  // the reveal (the jamb's inner side, facing along the wall: the eye sees the one it looks past)
  const sr = u0 - D.u0;
  if (sr >= 0 && sr <= ROW && z0 - sr >= 0 && z0 - sr < D.high) take({ s: sr, kind: 'reveal', u: D.u0, b: -sr, z: z0 - sr });
  // the threshold: the floor of the doorway (the sill under the leaf)
  if (z0 >= 0 && z0 <= ROW && u0 - z0 >= D.u0 && u0 - z0 <= D.u1) take({ s: z0, kind: z0 <= RECESS + 4 ? 'sill' : 'floor', u: u0 - z0, b: -z0, z: 0 });
  return best;
}
/** The leaf swung `deg` into the passage (hinged at the reveal on the far side, set back RECESS): where the eye meets it, or null. */
function onLeaf(u0: number, z0: number, deg: number): Hit | null {
  const D = EXIT_DOOR;
  const th = (deg * Math.PI) / 180;
  const den = Math.cos(th) - Math.sin(th);
  if (den <= 1e-6) return null;
  const t = (D.u1 + RECESS - u0) / den;
  if (t < 0 || t > LEAF_W) return null;
  const s = RECESS + t * Math.sin(th);
  const z = z0 - s;
  if (z < 0 || z >= LEAF_H) return null;
  return { s, kind: 'leaf', u: D.u1 - t * Math.cos(th), b: -s, z, t };
}
/** Beyond the wall's row, the passage: its floor and steps, its left wall; null where the eye goes on into the dark. */
function inPassage(u0: number, z0: number): Hit | null {
  const P = EXIT_PASSAGE;
  let best: Hit | null = null;
  // the floor and the treads: where the line first meets the floor (it falls a pixel for each back)
  const segs: [number, number, number][] = [[ROW, -P.stepsAt, 0]];
  for (let k = 0; k < P.steps; k++) segs.push([-P.stepsAt + k * P.tread, -P.stepsAt + (k + 1) * P.tread, -P.rise * (k + 1)]);
  segs.push([-P.stepsAt + P.steps * P.tread, -P.end, -P.rise * P.steps]);
  for (let i = 0; i < segs.length; i++) {
    const [s0, s1, fz] = segs[i];
    const s = z0 - fz;
    if (s >= s0 && s < s1) {
      const u = u0 - s;
      if (u >= 0 && u < P.wide) best = { s, kind: i === 0 ? 'floor' : 'tread', u, b: -s, z: fz, k: i - 1 };
      break;
    }
    if (z0 - s0 < fz) break;
  }
  // the left wall (u = 0, facing along the wall toward the eye's side), as high as the walls over the floor at its foot
  const sw = u0;
  if (sw > ROW && sw < -P.end && (!best || sw < best.s)) {
    const z = z0 - sw;
    const fz = floorZ(-sw);
    if (z >= fz && z < fz + PRISON_WALL) best = { s: sw, kind: 'wall', u: 0, b: -sw, z };
  }
  return best;
}

// =================================================================================================
// THE PASSAGE AS THE EYE SEES IT (the layer under): a colour for a hit

/** How far into the dark a point of the passage is: 0 near, toward 1 far down the steps. */
function darkAt(b: number, z: number): number {
  const P = EXIT_PASSAGE;
  const into = Math.max(0, (P.stepsAt - 24 - b) / ((P.steps + 1) * P.tread));
  return clamp01(into * 0.95 + Math.max(0, -z - 16) / 140);
}
function passageColour(h: Hit, lit: boolean): string | null {
  const P = EXIT_PASSAGE;
  let c: string;
  if ((h.kind === 'floor' || h.kind === 'sill') && h.b > -ROW) {
    // the doorway's floor: the iron sill under the leaf, then the flags
    c = h.b > -(RECESS + 6) ? iron(h.b > -2 ? 3 : 2) : mixC(floorAt(h.u / 32 + 9, -h.b / 32 + 5), WARM, clamp01(-h.b / ROW - 0.3) * 0.5);
  } else if (h.kind === 'floor') {
    c = floorAt(h.u / 32 + 9, -h.b / 32 + 5);
  } else if (h.kind === 'tread') {
    const k = h.k ?? 0;
    if (k >= P.steps) return null;
    // a step's tread: dressed stone, its far edge (the nosing) catching the light, the line where the next drops away dark
    const into = (P.stepsAt - h.b) - k * P.tread; // 0 at its near edge, tread at its far
    const rest = P.tread - into;
    const kk = rest < 1.5 ? 0 : rest < 3.5 ? 4 : hash(Math.floor(h.u / 7), k, 461) < 0.2 ? 1 : 2;
    c = STONE[kk];
    if (Math.floor(h.u) % 21 === 0 && rest >= 3.5) c = STONE[0];
  } else if (h.kind === 'wall') {
    const along = -h.b;
    const tile = Math.floor(along / 32);
    const up = Math.floor(h.z - floorZ(h.b));
    c = stoneFace(!lit, Math.floor(along) % 32, up, 470 + tile * 7, tile % 2 === 0);
    // its top fading into the dark, as the game's walls
    const k = PRISON_WALL - 1 - up;
    if (k < PRISON_FADE) {
      const a = Math.round(255 * FADE_STEPS[Math.floor((k * 4) / PRISON_FADE)]);
      c = mixC(c, BEYOND, darkAt(h.b, h.z));
      return c + a.toString(16).padStart(2, '0');
    }
  } else if (h.kind === 'reveal') {
    // the jamb's inner side, the doorway's depth: dark stone going back into the dark, its front corner an iron edge
    if (-h.b < 2) return lit ? shaded(iron(3)) : iron(3);
    const course = Math.floor(h.z) % 12 === 0 || Math.floor(-h.b) % 22 === 0;
    c = course ? SEAM : STONE[hash(Math.floor(-h.b / 22), Math.floor(h.z / 12), 467) < 0.3 ? 0 : 1];
    if (!lit) c = mixC(c, STONE[2], 0.25);
    c = mixC(c, BEYOND, clamp01(-h.b / ROW) * 0.7);
    // (low and far in, the passage's firelight coming round the corner)
    return mixC(c, WARM, clamp01(-h.b / ROW - 0.35) * clamp01(1 - h.z / 40) * 0.8);
  } else {
    c = iron(2);
  }
  return mixC(c, BEYOND, darkAt(h.b, h.z));
}

// =================================================================================================
// THE SOOT, THE GRIT AND THE SPARKS (in the door's world: u, b, z)

/** Soot puffs at frame f: from the lurch, a little off the head of the leaf; from the stop, a burst out of the doorway along the floor, billowing and thinning. */
function sootPuffs(f: number): { u: number; b: number; h: number; rx: number; ry: number; k: number; thin: number }[] {
  const out: { u: number; b: number; h: number; rx: number; ry: number; k: number; thin: number }[] = [];
  const burst = (t0: number, n: number, reach: number, seed: number, life: number): void => {
    const t = f - t0;
    if (t < 0 || t >= life) return;
    for (let i = 0; i < n; i++) {
      const t1 = Math.max(0, t + 1 - Math.floor(hash(i, 2, seed) * 2));
      const go = 1 - Math.pow(1 - Math.min(1, t1 / (life * 0.45)), 2.4);
      const u = EXIT_DOOR.u0 + 4 + hash(i, 1, seed) * (LEAF_W - 8) + (hash(i, 3, seed) - 0.5) * 30 * go;
      const b = 2 + (6 + hash(i, 4, seed) * reach) * go;
      const size = 3 + (4 + hash(i, 5, seed) * 7) * go;
      const rise = Math.min(1, t1 / 8);
      out.push({ u, b, h: size * (0.4 + 0.45 * rise) + t1 * (0.15 + hash(i, 6, seed) * 0.4) * rise, rx: size * (1.6 - 0.35 * rise), ry: size * (0.4 + 0.45 * rise), k: seed + i, thin: Math.max(0, (t - 4) / (life - 4)) });
    }
  };
  burst(EXIT_JOLTS.lurch, 6, 10, 811, 22);
  burst(EXIT_JOLTS.stop, 26, 40, 821, EXIT_FRAMES - 6 - EXIT_JOLTS.stop);
  out.sort((m, n) => m.b - n.b);
  return out;
}
/** Grit sifting down off the lintel: while the bars go, and pouring after the stop. Each a fleck: u, b, z. */
function grit(f: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  const pour = (from: number, to: number, perFrame: number, seed: number): void => {
    for (let t0 = from; t0 <= Math.min(f, to); t0++) {
      for (let i = 0; i < perFrame; i++) {
        const t = f - t0;
        const z = EXIT_DOOR.high + 1 - 0.7 * t * t - t;
        if (z < 0) continue;
        out.push([EXIT_DOOR.u0 + 2 + hash(t0, i, seed) * (LEAF_W - 4), 2 + hash(t0, i + 9, seed) * 4, z]);
      }
    }
  };
  pour(6, 30, 1, 831);
  pour(EXIT_JOLTS.lurch, EXIT_JOLTS.lurch + 3, 2, 833);
  pour(EXIT_JOLTS.stop, EXIT_JOLTS.stop + 14, 3, 835);
  return out;
}
/** Sparks off the hinge: while the leaf grinds, and a burst at the stop; each a streak from its last place to its place now. */
function sparks(f: number): { from: [number, number, number]; to: [number, number, number]; hot: boolean }[] {
  const out: { from: [number, number, number]; to: [number, number, number]; hot: boolean }[] = [];
  const born: [number, number][] = [];
  for (let t0 = EXIT_JOLTS.lurch; t0 <= EXIT_JOLTS.lurch + 4; t0++) for (let i = 0; i < 3; i++) born.push([t0, i]);
  for (let t0 = EXIT_JOLTS.lurch + 5; t0 < EXIT_JOLTS.stop; t0++) born.push([t0, 0]);
  for (let i = 0; i < 9; i++) born.push([EXIT_JOLTS.stop, i]);
  for (let i = 0; i < 3; i++) born.push([EXIT_JOLTS.stop + 1, i]);
  for (const [t0, i] of born) {
    const key = t0 * 13 + i;
    const life = 5 + Math.floor(hash(key, 1, 841) * 6);
    const t = f - t0;
    if (t < 0 || t > life) continue;
    const hz = hash(key, 2, 842) < 0.5 ? 8 : 58;
    const du = -0.3 - hash(key, 3, 843) * 1.6;
    const db = 1.8 + hash(key, 4, 844) * 3.2;
    const dz = 0.5 + hash(key, 5, 845) * 3.5;
    const at = (tt: number): [number, number, number] => [EXIT_DOOR.u1 + du * tt, 2 + db * tt, Math.max(0, hz + dz * tt - 0.45 * tt * tt)];
    out.push({ from: at(Math.max(0, t - 0.8)), to: at(t + 0.4), hot: t < life * 0.5 });
  }
  return out;
}

// =================================================================================================
// THE PICTURES

const OW = 220;
const OH = 190;
const OAX = 110;
const OAY = 136;
const UW = 370;
const UH = 230;
const UAY = 214;

/** THE DOOR IN THE WALL at frame f of its opening (0: shut, as in the fight; EXIT_FRAMES - 1: open, the soot gone). */
function doorFrame(alongX: boolean, f: number): Sprite {
  const F: Frame = { alongX, AX: OAX, AY: OAY };
  const p = new Px(OW, OH);
  const lit = alongX;
  const hr = alongX;
  const sh = (c: string): string => (lit ? c : shaded(c));
  const deg = exitSwing(f);
  const prev = f >= 48 && f <= 52 ? exitSwing(f - 1) : -1;
  const jig = shudder(f);
  const darker = deg > 20 ? 1 : 0;
  for (let c = 0; c < OW; c++) {
    const us = faceU(F, c);
    const scr = c - faceCol(F, 0);
    // (the columns the two tiles' faces take, as the game's walls: along x the first of a tile's is the last of the one before)
    if (alongX ? scr < 1 || scr > 64 : scr < 0 || scr > 62) continue;
    const foot = footRow(F, c);
    for (let y = 0; y < OH; y++) {
      const z0 = foot - y;
      if (z0 < 0) continue;
      const cs = caseAt(scr, z0, lit, hr);
      if (cs === null) continue;
      if (cs !== 'open') {
        put(p, c, y, cs);
        continue;
      }
      // THE DOORWAY: the eye goes in: the sill, the reveal, the leaf; past them the layer under shows
      const u0 = us + 0.5;
      const row = inRow(u0, z0);
      const leaf = onLeaf(u0 - (deg === 0 ? jig : 0) * (alongX ? 1 : -1), z0, deg);
      const near = (h: Hit | null): h is Hit => !!h;
      let best: Hit | null = null;
      for (const h of [row, leaf]) if (near(h) && (!best || h.s < best.s)) best = h;
      if (!best) continue;
      if (best.kind === 'leaf') {
        const t = best.t ?? 0;
        const lu = hr ? EXIT_DOOR.u1 - 1 - Math.floor(t) : EXIT_DOOR.u0 + Math.floor(t);
        const k = leafAt(Math.max(EXIT_DOOR.u0, Math.min(EXIT_DOOR.u1 - 1, lu)), Math.floor(best.z), f, hr);
        if (typeof k === 'string') put(p, c, y, FIRE.has(k) ? k : sh(k));
        else put(p, c, y, sh(k < 0 ? BEYOND : iron(k - darker)));
        continue;
      }
      if (best.s <= RECESS + 1) {
        put(p, c, y, passageColour(best, lit) ?? BEYOND);
        continue;
      }
      // (the swing smeared: where the leaf was a frame ago, a ghost of it, every other pixel)
      if (prev >= 0 && (c + y) % 2 === 0 && onLeaf(u0, z0, prev)) put(p, c, y, sh(IRON[1]));
    }
  }
  // THE BARS before the leaf, in their staples; drawn back into the hinge jamb (hidden in it past its outer edge)
  const bars: [number, 'upper' | 'lower'][] = [[43, 'upper'], [11, 'lower']];
  for (const [z0, which] of bars) {
    const slide = exitBar(which, f);
    const bar = barPx(52);
    const startUs = 6 + (hr ? slide : -slide) + (slide === 0 ? jig : 0);
    for (let x = 0; x < bar.w; x++) {
      const us = startUs + x;
      if (us < 1 || us > 62) continue;
      // (hidden in the hinge jamb's slot past the doorway's edge on that side, once sliding)
      if (slide > 0 && (hr ? us >= JAMB_R1 - 1 : us <= JAMB_L0)) continue;
      for (let y = 0; y < bar.h; y++) {
        const col = bar.get(x, y);
        if (!col) continue;
        const cc = faceCol(F, us);
        put(p, cc, footRow(F, cc) - (z0 + 6 - y), sh(col));
      }
    }
    const st = staplePx();
    for (const sx of [JAMB_L0, EXIT_DOOR.u1]) {
      for (let x = 0; x < st.w; x++) for (let y = 0; y < st.h; y++) {
        const col = st.get(x, y);
        if (!col) continue;
        if (y > 1 && y < 8 && x > 0 && x < 7) continue;
        const cc = faceCol(F, sx + x);
        put(p, cc, footRow(F, cc) - (z0 + 7 - y), sh(col));
      }
    }
  }
  // THE GREAT LOCK: the hasp over the staple on the free jamb, the padlock in it; it springs, drops and lies on the floor
  const freeUs = (x: number, w: number): number => (hr ? x : 63 - x - (w - 1));
  if (f < EXIT_JOLTS.lock) {
    const h = haspPx();
    const x0 = freeUs(8, h.w);
    for (let x = 0; x < h.w; x++) for (let y = 0; y < h.h; y++) {
      const col = h.get(hr ? x : h.w - 1 - x, y);
      if (!col) continue;
      const cc = faceCol(F, x0 + x + jig);
      put(p, cc, footRow(F, cc) - (40 - y), sh(col));
    }
  }
  const PL_X = 2;
  const drop = (t: number): number => (t <= 0 ? 0 : Math.min(17, 1.6 * t * t + 1.5 * t));
  const tFall = f - EXIT_JOLTS.lock - 1;
  if (drop(tFall) < 17) {
    const pl = padlockPx(f >= EXIT_JOLTS.lock);
    const x0 = freeUs(PL_X, pl.w);
    const z0 = 41 - drop(tFall) + (f === EXIT_JOLTS.lock ? -1 : 0);
    for (let x = 0; x < pl.w; x++) for (let y = 0; y < pl.h; y++) {
      const col = pl.get(x, y);
      if (!col) continue;
      if (f >= EXIT_JOLTS.lock && y < 3 && f > EXIT_JOLTS.lock + 1) continue;
      const cc = faceCol(F, x0 + x + (f < EXIT_JOLTS.lock ? jig : 0));
      put(p, cc, footRow(F, cc) - Math.round(z0 - y), sh(col));
    }
  } else {
    // lying where it fell, at the foot of the free jamb, a little out on the floor (a bounce as it lands)
    const pd = padlockDownPx();
    const bounce = tFall - 4 === 0 ? 2 : 0;
    const [cx, cy] = proj(F, hr ? 9 : 55, 7, bounce);
    for (let x = 0; x < pd.w; x++) for (let y = 0; y < pd.h; y++) {
      const col = pd.get(hr ? x : pd.w - 1 - x, y);
      if (col) put(p, Math.round(cx - 7 + x), Math.round(cy - 6 + y), sh(col));
    }
  }
  // THE GRIT, THE SOOT, THE SPARKS
  for (const [u, b, z] of grit(f)) {
    const [x, y] = proj(F, u, b, z);
    const X = Math.round(x);
    const Y = Math.round(y);
    put(p, X, Y, SOOT_DUST[(X + Y) % 3 === 0 ? 3 : 2]);
    put(p, X, Y + 1, SOOT_DUST[1]);
  }
  const puffs = sootPuffs(f);
  const cloud = new Px(OW, OH);
  for (const pf of puffs) {
    const [cx0, cy0] = proj(F, pf.u, pf.b, pf.h);
    const cx = Math.round(cx0);
    const cy = Math.round(cy0);
    const rx = Math.max(2, Math.round(pf.rx));
    const ry = Math.max(1, Math.round(pf.ry));
    for (let y = -ry - 2; y <= ry + 2; y++) for (let x = -rx - 2; x <= rx + 2; x++) {
      const gx = (cx + x) >> 1;
      const gy = (cy + y) >> 1;
      const lump = (hash((cx + x) >> 2, (cy + y) >> 2, 851 + pf.k) - 0.5) * 0.3 + (hash(gx, gy, 852 + pf.k) - 0.5) * 0.16;
      const d = Math.hypot(x / rx, y / ry) + lump;
      if (d > 1) continue;
      if (d > 0.72 - pf.thin * 0.3 && (gx + gy) % 2 === 0) continue;
      if (hash(gx, gy, 861 + f) < pf.thin * (0.4 + d * 0.9)) continue;
      const lightUp = -y / ry - (x / rx) * 0.5;
      cloud.set(cx + x, cy + y, lightUp > 0.5 && d < 0.8 ? SOOT_DUST[3] : lightUp < -0.4 ? SOOT_DUST[1] : SOOT_DUST[2]);
    }
  }
  for (let y = 0; y < OH; y++) for (let x = 0; x < OW; x++) {
    const col = cloud.get(x, y);
    if (!col) continue;
    let nb = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && cloud.has(x + dx, y + dy)) nb++;
    if (nb > 0) p.set(x, y, col);
  }
  for (const sp of sparks(f)) {
    const [x0, y0] = proj(F, ...sp.from);
    const [x1, y1] = proj(F, ...sp.to);
    p.line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), sp.hot ? EMBER[3] : EMBER[2]);
    p.set(Math.round(x1), Math.round(y1), sp.hot ? EMBER[4] : EMBER[3]);
  }
  const s = p.sprite(OAX, OAY, GRAIN);
  // (the doorway lit from the passage once the leaf is moving: the light the main chat places, EXIT_LIGHTS.spill, carried as
  // the sprite's own glow; a flash of the sparks at the lurch and the stop)
  const lights: Light[] = [];
  const spill = exitSpill(f);
  if (spill > 0) {
    const [lx, ly] = proj(F, 32, -12, 18);
    lights.push({ x: lx / GRAIN, y: ly / GRAIN, r: EXIT_LIGHTS.spill.glow.r, color: EXIT_LIGHTS.spill.glow.color, a: EXIT_LIGHTS.spill.glow.a * spill } as Light);
  }
  for (const j of [EXIT_JOLTS.lurch, EXIT_JOLTS.stop]) {
    const t = f - j;
    if (t >= 0 && t < 5) {
      const [lx, ly] = proj(F, EXIT_DOOR.u1, 2, 30);
      lights.push({ x: lx / GRAIN, y: ly / GRAIN, r: 26 - t * 3, color: EMBER[2], a: 0.3 - t * 0.05 } as Light);
    }
  }
  if (lights.length) s.lights = lights;
  return s;
}

/** THE PASSAGE BEHIND THE DOOR (the layer under), its baskets' frame k of four. */
function passage(alongX: boolean, k: number): Sprite {
  const AX = alongX ? 40 : UW - 40;
  const F: Frame = { alongX, AX, AY: UAY };
  const p = new Px(UW, UH);
  const lit = alongX;
  for (let c = 0; c < UW; c++) {
    const u = faceU(F, c);
    const foot = footRow(F, c);
    for (let y = 0; y < UH; y++) {
      const z0 = foot - y;
      const u0 = u + 0.5;
      let hit: Hit | null = null;
      if (u >= EXIT_DOOR.u0 && u < EXIT_DOOR.u1 && z0 >= 0 && z0 < EXIT_DOOR.high) {
        // through the doorway: the wall's row, then on
        hit = inRow(u0, z0);
        if (!hit) hit = inPassage(u0, z0);
      } else if (z0 >= 0 && u >= 0 && u < 64 && z0 < EXIT_DOOR.spikes + 6) {
        continue; // (the door's own face is over it)
      } else {
        // over the wall (or past its ends): the wall's row is solid up to its top, so only a line that clears it goes on
        const clears = z0 - ROW >= PRISON_WALL;
        if (!clears) continue;
        hit = inPassage(u0, z0);
      }
      if (!hit) continue;
      const col = passageColour(hit, lit);
      if (col) put(p, c, y, col);
    }
  }
  // THE FIRE BASKETS on its left wall (floor 3's own, in look B's colours): as the game sets a wall piece, at the foot of the
  // face under its tile's middle; the face turned to screen-right along x, to screen-left along y
  const basket = makePrisonArt().pieces.find((q) => q.name === 'fire basket');
  const lights: Light[] = [];
  if (basket) {
    const list = alongX ? basket.right! : basket.left!;
    const s = list[k % list.length];
    const src = pixelsOf(s);
    const d = s.density ?? 1;
    for (const b of EXIT_PASSAGE.baskets) {
      const [fx, fy] = proj(F, 0, b, floorZ(b));
      const X0 = Math.round(fx - s.ax * d);
      const Y0 = Math.round(fy - s.ay * d);
      const dark = darkAt(b, 0);
      for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
        const col = src.get(x, y);
        if (!col) continue;
        put(p, X0 + x, Y0 + y, FIRE.has(col) ? col : mixC(col, BEYOND, dark));
      }
      for (const l of s.lights ?? []) lights.push({ ...l, x: (X0 + l.x * d) / GRAIN, y: (Y0 + l.y * d) / GRAIN });
    }
  }
  const out = p.sprite(AX, UAY, GRAIN);
  if (lights.length) out.lights = lights;
  return out;
}
/** A sprite's pixels, whether it was painted under the game's canvas or the tests'. */
function pixelsOf(s: Sprite): Px {
  const img = s.img as unknown;
  if (img instanceof Px) return img;
  const cv = s.img;
  const q = cv.getContext('2d') as CanvasRenderingContext2D;
  const d = q.getImageData(0, 0, cv.width, cv.height).data;
  const p = new Px(cv.width, cv.height);
  p.d.set(d);
  return p;
}

// =================================================================================================
// THE LIGHT, for the main chat to place (render.ts: a hole cut in the dark, `spot`, and a glow drawn over it). In game pixels
// from the door's anchor (the foot of the face under its middle), along x; along y mirror the x.

/** How much of the doorway's light there is at frame f: none while it is shut; up as the leaf swings; full once open. */
export function exitSpill(f: number): number {
  if (f < EXIT_JOLTS.lurch) return 0;
  return clamp01((exitSwing(f) + 10) / 70);
}
export const EXIT_LIGHTS = {
  /** Each of the passage's fire baskets (`baskets`, from the anchor): a hole and a glow as a fire basket's on the hall's walls (PRISON_LIGHTS.basket). Lit all the while: the passage is there beyond the wall, its way barred. */
  basket: PRISON_LIGHTS.basket,
  baskets: EXIT_PASSAGE.baskets.map((b) => {
    const [x, y] = proj({ alongX: true, AX: 0, AY: 0 }, 0, b, floorZ(b) + PRISON_LIGHTS.basket.up * GRAIN);
    return { x: x / GRAIN, y: y / GRAIN };
  }),
  /** The passage's floor lit by its baskets, dimmer as it goes down the steps: holes down its middle (no glow), lit all the while. */
  path: [[-64, 0.7], [-112, 0.65], [-160, 0.5], [-208, 0.35]].map(([b, strength]) => {
    const [x, y] = proj({ alongX: true, AX: 0, AY: 0 }, 32, b, floorZ(b));
    return { x: x / GRAIN, y: y / GRAIN, r: 46, strength };
  }),
  /** The doorway once the leaf moves (strength times exitSpill(f)): a hole in the doorway, the passage's firelight coming through, and a low glow. */
  spill: { x: 0, y: -10, r: 40, strength: 0.75, glow: { r: 30, color: EMBER[1], a: 0.3 } },
} as const;

// =================================================================================================
// ALL OF IT

export interface ExitArt {
  /** The door in the wall at each frame of its opening (EXIT_FRAMES, at EXIT_FPS from his fall). */
  frames: Sprite[];
  /** Shut (the fight), and open (at rest, the soot gone): its first frame and its last. */
  shut: Sprite;
  open: Sprite;
  /** The passage behind it, four frames (its baskets flicker, about 6 a second as the game's fires): drawn with the floor. */
  under: Sprite[];
  /** Its jolts (frames), for a kick and a sound each. */
  jolts: number[];
}
const made = new Map<boolean, ExitArt>();
/** The door out the back of his hall, in a wall along x (its face turned to screen-left, lit) or along y (to screen-right, in shade); made the first time it is asked for and kept. */
export function exitArt(alongX: boolean): ExitArt {
  let a = made.get(alongX);
  if (!a) {
    const frames: Sprite[] = [];
    for (let f = 0; f < EXIT_FRAMES; f++) frames.push(doorFrame(alongX, f));
    a = {
      frames,
      shut: frames[0],
      open: frames[EXIT_FRAMES - 1],
      under: [0, 1, 2, 3].map((k) => passage(alongX, k)),
      jolts: [EXIT_JOLTS.upperBar, EXIT_JOLTS.lowerBar, EXIT_JOLTS.lock, EXIT_JOLTS.lurch, EXIT_JOLTS.stop],
    };
    made.set(alongX, a);
  }
  return a;
}
/** One frame of the door alone (for a page that wants only a few). */
export function exitDoorAt(alongX: boolean, f: number): Sprite {
  return doorFrame(alongX, Math.max(0, Math.min(EXIT_FRAMES - 1, Math.floor(f))));
}
