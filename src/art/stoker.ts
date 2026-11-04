// FLOOR 3'S SIDE BOSS, THE STOKER (the art chat, 4 Nov 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the game imports this file;
// `STOKER_ON` is off. His moves are art/stoker_moves.ts; what his fire does on the floor (the coals' marks and their fires, the
// rake's sheet of fire, the furnace's burst) art/stoker_fx.ts; his furnace room (the furnace, the forge crank, the gear, the fire
// in the Chained One's way) art/stoker_room.ts.
//
// His words to the main chat, 4 Nov 2026, 00:27: “I want a quest given to go to the chained one’s area and turn off the furnace.
// Maybe by the armorer when you turn in the first runestone quest.  You go down to level 3, and there will be a side area you go
// into, it can be pretty short, then a flamey boss guy who drops a missing gear to the forge crank to turn it off, allowing you
// access to the chained one’s boss area which was blocked by fire, and then you get a reward from the armorer.” Read back to him:
// “Yes, that's it (Recommended)”; who draws it: “The art chat, pictures to you first (Recommended)”. To the art chat, 4 Nov, which
// look for the flamey boss: “The Stoker (Recommended)”, offered as: the prison's huge fire-stoker, fused with the furnace: an iron
// firebox for a chest, coals glowing through its grate, a great shovel. Hurls burning coal, rakes fire across the floor.
//
// WHAT HE IS, AS PAINTED (on the heroes' bones, art/skeleton.ts, so every check the bosses have holds for him): a hulking figure
// twice the knight's height, FUSED WITH THE FURNACE. His trunk is a great pot-bellied firebox of soot-black cast iron (`ST_IRON`),
// banded and riveted, its FIRE-DOOR on its front a grate of iron bars with his coals glowing through it (`ST_COALS`, an honest
// orange; brighter, to white, as he winds up); the iron about the door glowing a dull red with the heat. Its domed top between his
// shoulders, a collar of iron round his neck; great riveted pauldrons. From his back a FLUE, a stove-pipe rising behind his left
// shoulder, venting smoke and sparks. His arms huge, the upper arms wrapped in scorched leather (`ST_LEATHER`), iron bracers, fists
// of iron. His head a squat iron FURNACE MASK, a GRILLE for a mouth with fire behind it, two slits for eyes where the enemy's pink
// burns (gold as he winds up). A heavy skirt of scorched leather over his thighs, iron at his knees, iron-shod boots. In his right
// fist THE GREAT SHOVEL: an iron haft, a D-grip, a broad iron scoop with walls, its lip glowing from the fire. The dark seam where
// one part ends before another; the enemy's pink rim round him while he lives. Nothing cyan.

import type { Px } from '../engine/px';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { EMBER } from './props';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, PanelSkin, Put } from './new_mobs3';
import type { Ring, Skin, Stage } from './skin';
import { about, add, buildOf, cross, dot, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const STOKER_ON = { on: false };

const TAU = Math.PI * 2;
const D = Math.PI / 180;
const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const tone5 = (v: number): number => Math.max(0, Math.min(4, Math.round(v)));

// =============================================================================================
// HIS COLOURS: floor 3's (torchlit dark, black iron, ember orange, soot and rust); fire an honest orange; the enemy's pink and gold
// only in his eyes and his rim

/** Soot-black cast iron, warm in its lit edges (his firebox, his mask, his pauldrons, his bracers, the shovel). */
export const ST_IRON: Ramp = ['#0e0b0e', '#211b1e', '#372e2f', '#574a4a', '#8c7b72'];
/** The iron about his fire-door, hot: a dull red glowing through the soot. */
export const ST_HOT: Ramp = ['#2a0c08', '#4a160c', '#76260f', '#a63a14', '#d25a1e'];
/** Scorched leather (his skirt, the wraps on his arms). */
export const ST_LEATHER: Ramp = ['#150d0b', '#26170f', '#3b2416', '#563420', '#77492b'];
/** His coals: the props' own embers (the game's fire, an honest orange), dark to white-hot. */
export const ST_COALS: Ramp = EMBER;
/** A coal's black crust, and the dark red deep in a bed of coals. */
export const ST_CRUST = ['#140a08', '#2a100a', '#4a1a0c'] as const;
/** The inside of his firebox, beyond the coals. */
export const ST_DEEP = '#120604';
/** His eyes: the enemy's pink, gold when he winds up (the glows that are the enemy's). */
export const ST_EYE = FLAME[2];
export const ST_EYE_HOT = FLAME[3];
/** Smoke from his flue and his door: a warm grey, the palest first. */
export const ST_SMOKE = ['#8a827c', '#6a625e', '#4e4846', '#383432'] as const;
/** Sparks: the embers' brightest. */
export const ST_SPARK = [EMBER[4], EMBER[3], EMBER[2]] as const;
/** His smear (a lightning strike's after-images): used for nothing else. */
export const ST_SMEAR = ['#6a2c12', '#c2662a', '#f6b468'] as const;
/** Cold iron and ash, as his fire goes out. */
export const ST_COLD: Ramp = ['#141416', '#252427', '#39373a', '#545154', '#77736f'];
export const ST_ASH = ['#8e8a86', '#6c6866', '#4c4948'] as const;

// =============================================================================================
// HIS BODY: on the heroes' bones; twice the knight's height (his crown 114 to the knight's 58)

export const ST_BODY: Build = buildOf(126, 1.15, { shoulders: 1.7, chest: 1.9, depth: 1.25, waist: 1.7, hips: 1.3, legs: 0.84, arms: 1.15, trunk: 1.0, limbs: 1.6, pad: 3.2 });
const B = ST_BODY;
/**
 * His picture: room above him for his flue's smoke and the shovel raised over his head, before him for the shovel thrown out at
 * full reach and the fire thrown from his door (in every frame of every move both ways round: tests/stoker.test.ts keeps a margin).
 */
export const ST_CANVAS: MobCanvas = { w: 560, h: 440, ax: 272, ay: 316 };

/** HIS REST: heavy on bent knees, feet wide and turned out, leaning a little into his belly; his shovel's blade on the floor at his right, its grip in his right fist at his hip; his left fist hanging. */
const REST0: Bones = {
  ...standing(B),
  pz: -3.2, px: 0, py: 0, yaw: 0, pitch: 4, roll: 0, twist: 0, bend: 3, side: 0, hunch: 12, shrug: 0.25,
  faceTurn: 0, faceUp: 2, faceTilt: 0,
  lhIn: 2, lhx: 4, lhy: 36, lhz: 46, le: 0,
  rhIn: 2, rhx: 8, rhy: -36, rhz: 46, re: 0,
  wAz: -18, wEl: -36, wRoll: 0,
  lfx: 1.5, lfy: 4.5, lfz: 0, lfp: 0, lft: 14, rfx: -1, rfy: -4.5, rfz: 0, rfp: 0, rft: -14, lk: 14, rk: -14,
};
export const ST_REST: Bones = REST0;

// =============================================================================================
// THE SHOVEL: an iron haft from a D-grip in his right fist; a broad scoop with walls on three sides, bent up off the haft

/** From his right fist (the D-grip) along the haft to the scoop's socket; the scoop's length and half-width, its walls' height; how far the scoop is bent up off the haft (degrees). */
export const SHOVEL = { haft: 56, blade: 27, half: 11.5, wall: 4.5, lift: 22, grip: 4 } as const;

export interface ShovelAt {
  /** The D-grip's top, his fist, the socket, the scoop's heel (its back wall) and its lip's middle. */
  top: V3;
  grip: V3;
  socket: V3;
  heel: V3;
  lip: V3;
  /** The way the haft runs (from his fist to the scoop), the way the scoop runs, the way its floor faces (where the coals sit), and across it (to the haft's left). */
  haftWay: V3;
  bladeWay: V3;
  face: V3;
  across: V3;
}
/** Where the shovel is: from his right fist, `hold` down the haft from its top (at the D-grip, 4; choked up toward the scoop, more), the haft's way (the bones' `point`), and the way its scoop's floor faces (as a move says it). */
export function shovelOf(s: Skeleton, faceHint: V3, hold: number = SHOVEL.grip): ShovelAt {
  const p = s.point;
  let f = sub(faceHint, mul(p, dot(faceHint, p)));
  f = len(f) > 1e-4 ? norm(f) : norm(cross(p, [0, 1, 0]), [0, 0, 1]);
  const across = norm(cross(f, p), [0, 1, 0]);
  const grip = s.handR;
  const top = add(grip, mul(p, -hold));
  const socket = add(top, mul(p, SHOVEL.haft + SHOVEL.grip));
  const bladeWay = about(p, across, -SHOVEL.lift);
  const face = norm(cross(bladeWay, across));
  const heel = add(socket, mul(bladeWay, 1.5));
  const lip = add(heel, mul(bladeWay, SHOVEL.blade));
  return { top, grip, socket, heel, lip, haftWay: p, bladeWay, face, across };
}

// =============================================================================================
// WHAT A MOMENT OF A MOVE SAYS OVER AND ABOVE THE BONES (art/stoker_moves.ts says it)

export interface StokerSay {
  /** His fire: 0 out; 0.6 or so as he breathes; 1 roaring as he winds up; 1.5 white-hot. */
  heat: (m: Moment) => number;
  /** His fire-door: 0 shut, 1 flung wide (110 degrees). */
  door: (m: Moment) => number;
  /** The way the shovel's scoop faces at this moment (its floor's way), and how far down its haft his right fist holds it (from its top). */
  face: (m: Moment) => V3;
  hold: (m: Moment) => number;
  /** Coals heaped on the scoop: 0 none, 1 heaped; and how hot (1 white). */
  load: (m: Moment) => { n: number; hot: number };
  /** Whether the shovel is still in his fist (dropped as he dies). */
  held: (m: Moment) => boolean;
  /** How cold he has gone (0 alive, 1 black iron and ash). */
  cold: (m: Moment) => number;
  /** Sparks bursting from his door (0 none, 1 the most) and how long since (seconds); smoke from his flue (1 as he breathes). */
  burst: (m: Moment) => { k: number; since: number } | null;
  smoke: (m: Moment) => number;
  /** The fire belching out of his open door (the furnace burst): 0 none, 1 a full gout, and how far it reaches (his own lengths). */
  gout: (m: Moment) => { k: number; reach: number };
  /** His feet coming down (a puff of soot under the foot): which foot, and how long since it came down. */
  stamp: (m: Moment) => { L: number; R: number };
  /** The scoop scraping the floor: 0 not, 1 scraping (sparks off it). */
  scrape: (m: Moment) => number;
  /** THE GEAR as he falls: where it is (its middle, the way its face points, how far it has turned) or null. */
  gear: (m: Moment) => { c: V3; up: V3; spin: number } | null;
  /** THE SMEAR of a lightning strike: after-images along the way it has just come, each a line of points, the oldest first. */
  smear: (m: Moment) => V3[][] | null;
}

// =============================================================================================
// HIS SOLIDS, worked out from his bones (what the painter paints and the checks hold to)

/** His firebox: a great pot belly of cast iron from his hips to his chest, wider than deep, a little forward. */
export function bellyOf(s: Skeleton): { c: V3; ax: [V3, V3, V3]; r: V3 } {
  const [bf, bl, bu] = s.belly;
  const c = add(add(lerp3(s.waist, s.ribs, 0.55), mul(bf, 3.4)), mul(bu, -1.5));
  const r: V3 = [B.ribDeep + 4.6, B.ribHalf + 4.0, 22.5];
  return { c, ax: [mul(bf, r[0]), mul(bl, r[1]), mul(bu, r[2])], r };
}
/** The firebox's domed top between his shoulders, under his collar. */
export function domeOf(s: Skeleton): { c: V3; ax: [V3, V3, V3] } {
  const [cf, cl, cu] = s.chest;
  const c = add(add(lerp3(s.ribs, s.neck, 0.62), mul(cf, 1.6)), mul(cu, -1.0));
  return { c, ax: [mul(cf, B.ribDeep + 1.8), mul(cl, B.ribHalf + 1.2), mul(cu, 9.5)] };
}
/** A pauldron over a shoulder. */
export function pauldronOf(s: Skeleton, side: 'L' | 'R'): { c: V3; ax: [V3, V3, V3] } {
  const [uf, ul, uu] = s.upper;
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const out = mul(ul, side === 'L' ? 1 : -1);
  const c = add(add(sh, mul(uu, 2.6)), mul(out, 1.4));
  return { c, ax: [mul(uf, 10.5), mul(out, 9.5), mul(uu, 7.4)] };
}
/** His fire-door: its middle as it lies shut, the way out of it (the firebox's forward), across it (to his left) and up; its half-width and half-height. */
export const DOOR = { half: 10, high: 10.5, down: 3.0, proud: 1.6, open: 112 } as const;
export function doorFrameOf(s: Skeleton): { c: V3; f: V3; l: V3; u: V3 } {
  const b = bellyOf(s);
  const [bf, bl, bu] = s.belly;
  // (on the belly's front, a little below its middle, standing proud of its curve)
  const c = add(add(b.c, mul(bf, b.r[0] + DOOR.proud)), mul(bu, -DOOR.down));
  return { c, f: bf, l: bl, u: bu };
}
/** The door as it is, opened `k` of the way: its middle, and its half-across (from its hinge, on his left, to its free edge) and half-up. */
export function doorOf(s: Skeleton, k: number): { c: V3; u: V3; v: V3; hinge: V3; handle: V3 } {
  const d = doorFrameOf(s);
  const hinge = add(d.c, mul(d.l, DOOR.half));
  const a = DOOR.open * D * clamp01(k);
  const way = add(mul(d.l, -Math.cos(a)), mul(d.f, Math.sin(a)));
  const c = add(hinge, mul(way, DOOR.half));
  // (its v down its face, so that the panel's own front is the side that faces out of him)
  return { c, u: mul(way, DOOR.half), v: mul(d.u, -DOOR.high), hinge, handle: add(add(hinge, mul(way, DOOR.half * 1.82)), mul(d.f, 1.2)) };
}
/** Where the fire comes out of him (the end he strikes with in the burst): the middle of his door's frame. */
export function mouthOf(s: Skeleton): V3 {
  return doorFrameOf(s).c;
}
/** His flue: a stove-pipe out of his back behind his left shoulder, up past his head, bent back at an elbow; its points, foot to cap. */
export function flueOf(s: Skeleton): V3[] {
  const [uf, ul, uu] = s.upper;
  const foot = add(add(add(lerp3(s.back, s.neck, 0.45), mul(uf, -(B.ribDeep + 2.0))), mul(ul, 9.5)), mul(uu, 0));
  const a = add(foot, add(mul(uf, -6.5), mul(uu, 2.5)));
  const b = add(a, add(add(mul(uu, 26), mul(uf, -3)), mul(ul, 2.5)));
  const c = add(b, add(mul(uu, 9), mul(uf, -4)));
  return [foot, a, b, c];
}
export const FLUE_R = 4.4;

// =============================================================================================
// HIS SKINS

/** Smooth noise, for soot and grime and the churn of his coals. */
export function noise2(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const s = (v: number): number => v * v * (3 - 2 * v);
  const h = (i: number, j: number): number => hash(xi + i, yi + j, seed);
  const a = h(0, 0) + (h(1, 0) - h(0, 0)) * s(fx);
  const b = h(0, 1) + (h(1, 1) - h(0, 1)) * s(fx);
  return a + (b - a) * s(fy);
}
/** Iron as it is at this moment: soot-black, or going cold to grey as he dies. */
const ironOf = (cold: number): Ramp => (cold > 0.55 ? ST_COLD : ST_IRON);
/** A coal at this heat (0 dark to 1.5 white), its spot on it `n` (0 to 1: its crust to its heart). */
export function coalAt(heat: number, n: number): string {
  const v = 0.6 + heat * 2.4 + (n - 0.5) * 2.4;
  if (v < 0.4) return ST_CRUST[1];
  if (v < 0.9) return ST_CRUST[2];
  return ST_COALS[Math.max(0, Math.min(4, Math.floor(v - 0.9)))];
}

/** HIS FIREBOX: cast iron, two riveted bands round it, a seam down its front and its back, soot streaked up it; the iron about the door glowing red with the heat; within the door's frame (when it is open) the fire. */
function bellySkin(s: Skeleton, heat: number, door: number, cold: number, t: number): Skin {
  const b = bellyOf(s);
  const iron = ironOf(cold);
  return (u, tone) => {
    const [x, y, z] = u;
    // (where on him: across, up, in his own lengths)
    const across = y * b.r[1];
    const up = z * b.r[2];
    // THE MOUTH, where the door stands: when it is open, the fire within
    if (door > 0.06 && x > 0.5 && Math.abs(across) < DOOR.half - 0.6 && Math.abs(up + DOOR.down) < DOOR.high - 0.6) {
      const a = across / DOOR.half;
      const h = (up + DOOR.down) / DOOR.high;
      const n = noise2(a * 3 + t * 2.4, h * 3 - t * 4, 31);
      // (a bed of coals in the bottom of it, flames licking up from it, white at their hearts when he roars)
      const bed = h < -0.25 + 0.15 * n;
      if (bed) return coalAt(heat, n);
      const flame = n - (h + 0.2) * 0.9 + heat * 0.45;
      if (flame > 0.55) return ST_COALS[Math.min(4, Math.floor(1 + heat * 1.8 + (flame - 0.55) * 2))];
      if (flame > 0.3) return ST_COALS[Math.max(0, Math.min(4, Math.floor(heat * 1.6)))];
      return heat > 0.3 ? ST_CRUST[2] : ST_DEEP;
    }
    // the door's frame: a raised rim of iron round it
    const fx = Math.abs(across) - DOOR.half;
    const fy = Math.abs(up + DOOR.down) - DOOR.high;
    if (x > 0.4 && fx < 2.2 && fy < 2.2 && (fx > -0.6 || fy > -0.6)) return iron[tone5(tone + 1)];
    // the bands: at a third up and a third down, riveted
    const band = Math.abs(Math.abs(up) - 9.5) < 1.6;
    if (band) {
      const ang = Math.atan2(y, x);
      const rivet = Math.abs(fr(ang / (TAU / 22)) - 0.5) < 0.12 && Math.abs(Math.abs(up) - 9.5) < 0.8;
      return rivet ? iron[tone5(tone + 2)] : iron[tone5(tone - 1)];
    }
    if (Math.abs(Math.abs(up) - 9.5) < 2.3) return INK;
    // a seam down the front and the back
    if (Math.abs(y) < 0.025 && x < 0.2 && Math.abs(up) < 9) return iron[tone5(tone - 1)];
    // the heat: the iron about the door glowing a dull red
    const dd = Math.hypot(Math.max(0, fx), Math.max(0, fy));
    const glow = cold > 0.4 ? 0 : heat * (x > 0.2 ? Math.max(0, 1 - dd / (5 + 4 * heat)) : 0);
    // soot streaked up it, rust bled down from the bands
    const soot = noise2(across * 0.22, up * 0.08 + 3, 41);
    const rust = cold < 0.5 && noise2(across * 0.5, up * 0.3, 43) > 0.78 && up < 8 && up > -8;
    if (glow > 0.35 && noise2(across * 0.6, up * 0.6 - t * 2, 47) < glow) return ST_HOT[tone5(tone + glow * 2 - 0.5)];
    if (rust) return ['#2e160e', '#4a2412', '#683417'][Math.max(0, Math.min(2, tone - 1))];
    if (cold > 0.55 && noise2(across * 0.7, up * 0.7, 49) > 0.72) return ST_ASH[Math.max(0, Math.min(2, 3 - tone))];
    return iron[tone5(tone - (soot > 0.66 ? 1 : 0))];
  };
}
/** Plain riveted iron: plates, their seams dark, a rivet at their corners; soot. */
function plateSkin(seed: number, cold: number, k = 2.2): Skin {
  const iron = ironOf(cold);
  return (u, tone) => {
    const a = u[0] * k + 7;
    const b = u[1] * k + 7;
    const c = u[2] * k + 7;
    const ex = Math.min(fr(a), 1 - fr(a), fr(b), 1 - fr(b), fr(c), 1 - fr(c));
    if (ex < 0.05) return iron[tone5(tone - 1)];
    if (ex < 0.14 && hash(Math.floor(a) + 3 * Math.floor(c), Math.floor(b), seed) > 0.6) return iron[tone5(tone + 1)];
    if (cold > 0.55 && noise2(u[0] * 4 + seed, u[2] * 4, 53) > 0.74) return ST_ASH[Math.max(0, Math.min(2, 3 - tone))];
    return iron[tone5(tone - (noise2(u[0] * 3 + seed, u[2] * 3 + u[1], 55) > 0.7 ? 1 : 0))];
  };
}
/** The firebox's domed top: plain cast iron, a ring of rivets round its foot, soot. */
function domeSkin(cold: number): Skin {
  const iron = ironOf(cold);
  return (u, tone) => {
    if (Math.abs(u[2] - 0.22) < 0.07) return fr(Math.atan2(u[1], u[0]) / (TAU / 26)) < 0.3 ? iron[tone5(tone + 1)] : iron[tone5(tone - 1)];
    if (cold > 0.55 && noise2(u[0] * 4, u[1] * 4, 57) > 0.74) return ST_ASH[Math.max(0, Math.min(2, 3 - tone))];
    return iron[tone5(tone - (noise2(u[0] * 2.5 + 3, u[1] * 2.5, 59) > 0.7 ? 1 : 0))];
  };
}
/** Scorched leather: its grain, burns dark across it. */
function leatherSkin(seed: number, cold: number): Skin {
  return (u, tone) => {
    const burn = noise2(u[0] * 3 + seed, u[2] * 3 + u[1] * 2, 61) > 0.7;
    if (cold > 0.55 && noise2(u[0] * 5, u[2] * 5 + seed, 63) > 0.75) return ST_ASH[Math.max(0, Math.min(2, 3 - tone))];
    return ST_LEATHER[tone5(tone - (burn ? 1 : 0))];
  };
}

/**
 * HIS FURNACE MASK: a squat iron head, riveted; a GRILLE for a mouth, bars across it and the fire behind them; two slits for eyes,
 * the enemy's pink deep in them (dots: art/new_mobs3 `dot`, laid by the painter), gold as he winds up. From behind, iron only.
 */
function headSkin(s: Skeleton, heat: number, cold: number, t: number): Skin {
  const [ff, fl, fu] = s.face;
  const iron = ironOf(cold);
  return (u, tone) => {
    const n = norm(u, [1, 0, 0]);
    const w = add(add(mul(ff, n[0]), mul(fl, n[1])), mul(fu, n[2]));
    const f = dot(w, ff);
    const a = dot(w, fl);
    const b = dot(w, fu);
    if (f > 0.42) {
      // the grille: four slots across the mouth, the fire behind them
      if (b < -0.06 && b > -0.66 && Math.abs(a) < 0.5) {
        const row = fr((b + 0.66) / 0.15);
        if (row > 0.45) {
          const flick = noise2(a * 6 + t * 5, b * 4, 71);
          return cold > 0.6 ? ST_DEEP : coalAt(Math.max(0.2, heat), 0.5 + 0.5 * flick);
        }
        return iron[tone5(tone + 1)];
      }
      // the slits for eyes: the enemy's pink burning in them (gold as he winds up), the eyes laid in them
      if (b > 0.14 && b < 0.34 && Math.abs(a) > 0.1 && Math.abs(a) < 0.56) return cold > 0.5 ? INK : Math.abs(b - 0.24) < 0.05 ? (heat > 0.95 ? FLAME[3] : FLAME[2]) : FLAME[1];
      // a brow ridge over them
      if (b >= 0.34 && b < 0.46 && Math.abs(a) < 0.62) return iron[tone5(tone + 1)];
    }
    // rivets in a ring round the face, a ridge over the crown
    if (Math.abs(a) < 0.08 && b > 0.5 && f < 0.6) return iron[tone5(tone + 1)];
    const ring = Math.abs(f - 0.3) < 0.05;
    if (ring && fr(Math.atan2(b, a) / (TAU / 14)) < 0.3) return iron[tone5(tone + 2)];
    return iron[tone5(tone - (noise2(n[0] * 3, n[2] * 3 + n[1], 73) > 0.72 ? 1 : 0))];
  };
}
/** THE DOOR: a frame of iron, bars across it upright, the coals glowing between them (white-hot as he roars); a latch on its free edge. */
function doorSkin(heat: number, cold: number, t: number): PanelSkin {
  const iron = ironOf(cold);
  return (a, b, front, tone) => {
    const across = a;
    const up = -b;
    const edge = Math.min(DOOR.half - Math.abs(across), DOOR.high - Math.abs(up));
    if (!front) return iron[tone5(tone - 1)];
    if (edge < 1.7) return iron[tone5(tone + (edge < 0.7 ? -1 : 0))];
    // bars every 3 of his lengths, a cross-bar half way
    const bar = Math.abs(fr((across + DOOR.half) / 3.1) - 0.5) > 0.32 || Math.abs(up) < 0.8;
    if (bar) return iron[tone5(tone + 1)];
    if (cold > 0.6) return ST_DEEP;
    const n = noise2(across * 0.7 + t * 1.6, up * 0.5 - t * 2.6, 81);
    return coalAt(heat, 0.25 + 0.6 * n - (up / DOOR.high) * 0.25);
  };
}
/** The scoop's iron: its floor (where the coals lie) and its walls; its lip glowing from the fire. */
function scoopSkin(cold: number, glowLip: number, length: number): PanelSkin {
  const iron = ironOf(cold);
  return (a, b, front, tone) => {
    // (b runs from the heel, -length, to the lip, +length)
    const lip = (b + length) / (2 * length);
    if (glowLip > 0.05 && lip > 0.9 && cold < 0.4) return ST_HOT[tone5(1 + glowLip * 3)];
    if (Math.abs(Math.abs(a) - 0) < 0.4 && lip < 0.3) return iron[tone5(tone - 1)];
    return iron[tone5(tone + (front ? 0 : -1) - (noise2(a * 0.5, b * 0.4, 91) > 0.75 ? 1 : 0))];
  };
}

// =============================================================================================
// PAINTING HIM

/** What a moment paints over and above its solids (laid after his edge): sparks, smoke, soot, his smear. */
const MORE = new WeakMap<Moment, [V3, string, number][]>();

function stokerBits(st: Stage, m: Moment, say: StokerSay): Bit[] {
  const { s } = m;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const t = m.t;
  const heat = Math.max(0, say.heat(m));
  const door = clamp01(say.door(m));
  const cold = clamp01(say.cold(m));
  const iron = ironOf(cold);
  // HIS LEGS: thick, in scorched leather, iron at the knees, iron-shod boots
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    const hip = L ? s.hipL : s.hipR;
    const knee = L ? s.kneeL : s.kneeR;
    const ankle = L ? s.ankleL : s.ankleR;
    const heel = L ? s.heelL : s.heelR;
    const toe = L ? s.toeL : s.toeR;
    const [r0, r1, r2] = B.legR;
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: r0 * 1.06, rb: Math.min(r1 * 1.08, knee[2] - 0.3), ramp: ST_LEATHER });
    // (a shin kneeling on the floor rests on it, not in it)
    const shinB = lerp3(knee, ankle, 0.85);
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: knee, b: shinB, ra: Math.min(r1 * 1.08, knee[2] - 0.3), rb: Math.min(r2 * 1.0, shinB[2] - 0.3), ramp: ST_LEATHER });
    // (the iron at the knee: a cop over its front, riveted)
    const kf = norm(sub(lerp3(hip, ankle, 0.5), knee), [1, 0, 0]);
    const out = norm(sub(knee, mul(kf, -1)), [1, 0, 0]);
    void out;
    const shin = norm(sub(ankle, knee), [0, 0, -1]);
    const fwdK = norm(sub(mul(add(norm(sub(hip, knee)), shin), -1), [0, 0, 0]), [1, 0, 0]);
    {
      const kax: [V3, V3, V3] = [mul(fwdK, r1 * 0.75), mul(norm(cross(shin, fwdK), [0, 1, 0]), r1 * 1.05), mul(norm(sub(hip, ankle)), r1 * 1.0)];
      const kc0 = add(knee, mul(fwdK, r1 * 0.55));
      const kc = add(kc0, [0, 0, Math.max(0, Math.hypot(kax[0][2], kax[1][2], kax[2][2]) + 0.1 - kc0[2])]);
      put(`leg${side}`, `knee${side}`, { k: 'ball', c: kc, ax: kax, skin: plateSkin(L ? 11 : 13, cold, 1.6) });
    }
    // (the greave down the shin's front)
    const ga = add(lerp3(knee, ankle, 0.22), mul(fwdK, r1 * 0.45));
    const gb = add(lerp3(knee, ankle, 0.9), mul(fwdK, r2 * 0.5));
    put(`leg${side}`, `greave${side}`, { k: 'rod', a: ga, b: gb, ra: Math.min(r1 * 0.78, ga[2] - 0.3), rb: Math.min(r2 * 0.9, gb[2] - 0.3), ramp: iron });
    // THE BOOT: iron-shod, broad, its sole on the floor
    const along = norm(sub(toe, heel), [1, 0, 0]);
    const across = norm(cross([0, 0, 1], along), [0, 1, 0]);
    const up = norm(cross(along, across), [0, 0, 1]);
    const footLen = len(sub(toe, heel));
    const bc0 = add(lerp3(heel, toe, 0.5), add(mul(up, 3.6), mul(along, 1.2)));
    const bax: [V3, V3, V3] = [mul(along, footLen * 0.5 + 3.2), mul(across, r2 * 1.45), mul(up, 3.6)];
    // (on its toe, tipped up, the boot held up off the floor by its own lowest point)
    const low = Math.hypot(bax[0][2], bax[1][2], bax[2][2]);
    const lift = Math.max(0, low + 0.1 - bc0[2]);
    const bc = add(bc0, [0, 0, lift]);
    put(`boot${side}`, `boot${side}`, { k: 'ball', c: bc, ax: bax, skin: plateSkin(L ? 15 : 17, cold, 1.4) });
    const sa = add(ankle, add(mul(up, 1.6), [0, 0, lift]));
    const sb = add(lerp3(heel, toe, 0.4), add(mul(up, 7.4), [0, 0, lift]));
    put(`boot${side}`, `boot${side}`, { k: 'rod', a: sa, b: sb, ra: Math.min(6.2, sa[2] - 0.2), rb: Math.min(6.8, sb[2] - 0.2), ramp: iron });
  }
  // HIS SKIRT of scorched leather, from under his belly over his thighs to above his knees, its hem burnt ragged
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  {
    const top = add(s.pelvis, mul(s.hips[2], 3));
    const knees = add(lerp3(s.kneeL, s.kneeR, 0.5), [0, 0, 7]);
    const apart = Math.abs(dot(sub(s.kneeL, s.kneeR), f));
    const levels: [number, V3][] = [[1, knees], [0.55, lerp3(top, knees, 0.55)], [0, top]];
    const rings: Ring[] = levels.map(([k, c], i) => {
      const deep = B.pelvisDeep + 5 + 4 * k + 0.5 * apart * k;
      const wide = B.pelvisHalf + 5.5 + 4.5 * k;
      const pts: V3[] = [];
      for (let j = 0; j < 20; j++) {
        const a = (j / 20) * TAU;
        const drop = i === 0 ? 1.6 * noise2(j * 1.3, 2, 101) : 0;
        pts.push(add(c, add(add(mul(f, Math.cos(a) * deep), mul(l, Math.sin(a) * wide)), [0, 0, -drop])));
      }
      return { c, u: mul(f, deep), v: mul(l, wide), pts };
    });
    put('skirt', 'skirt', { k: 'cloth', rings, ramp: ST_LEATHER, look: { folds: [0, 30, -30, 70, -70, 115, -115, 160, -160], lift: 0.02 } });
  }
  // HIS FIREBOX: the great iron belly; its domed top; the collar round his neck
  const bl = bellyOf(s);
  put('belly', 'belly', { k: 'ball', c: bl.c, ax: bl.ax, skin: bellySkin(s, heat, door, cold, t) });
  const dm = domeOf(s);
  put('belly', 'dome', { k: 'ball', c: dm.c, ax: dm.ax, skin: domeSkin(cold) });
  put('collar', 'collar', { k: 'rod', a: add(s.neck, mul(s.upper[2], -2.5)), b: add(s.neck, mul(s.upper[2], 3.2)), ra: 7.6, rb: 6.6, ramp: iron });
  // THE FIRE-DOOR, its grate glowing; hinged on his left
  const dr = doorOf(s, door);
  put('door', 'door', { k: 'panel', c: dr.c, u: dr.u, v: dr.v, skin: doorSkin(heat, cold, t) });
  put('door', 'latch', { k: 'rod', a: add(dr.handle, mul(dr.v, -0.25)), b: add(dr.handle, mul(dr.v, 0.25)), ra: 1.2, rb: 1.2, ramp: iron });
  if (cold < 0.5 && heat > 0.05) put('glow', 'glow', { k: 'glow', p: add(doorFrameOf(s).c, mul(s.belly[0], 6)), c: EMBER[2], r: 30 + 30 * Math.min(1.5, heat) + 24 * door, a: Math.min(0.5, 0.18 + 0.22 * heat + 0.1 * door) });
  // HIS FLUE out of his back
  const fl = flueOf(s);
  for (let i = 1; i < fl.length; i++) put('flue', 'flue', { k: 'rod', a: fl[i - 1], b: fl[i], ra: i === 1 ? FLUE_R + 0.8 : FLUE_R, rb: FLUE_R, ramp: iron });
  for (let i = 1; i < fl.length; i++) put('flue', 'flueband', { k: 'band', ring: { c: fl[i], u: mul(norm(cross(sub(fl[i], fl[i - 1]), [0, 1, 0]), [1, 0, 0]), FLUE_R + 0.7), v: mul(norm(cross(sub(fl[i], fl[i - 1]), [1, 0, 0]), [0, 1, 0]), FLUE_R + 0.7) }, ramp: iron, rows: 2 });
  const capA = fl[fl.length - 1];
  const capWay = norm(sub(fl[fl.length - 1], fl[fl.length - 2]));
  put('flue', 'cap', { k: 'rod', a: add(capA, mul(capWay, 1.5)), b: add(capA, mul(capWay, 4.5)), ra: FLUE_R + 2.6, rb: 1.2, ramp: iron });
  // HIS PAULDRONS, HIS ARMS: leather-wrapped upper arms, iron bracers, iron fists
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    const sh = L ? s.shoulderL : s.shoulderR;
    const el = L ? s.elbowL : s.elbowR;
    const hand = L ? s.handL : s.handR;
    const [r0, r1, r2] = B.armR;
    const part = `arm${side}`;
    put(part, part, { k: 'rod', a: sh, b: el, ra: r0 * 1.05, rb: r1 * 1.0, ramp: ST_LEATHER });
    {
      // (the bulge of his upper arm, under the wraps)
      const w = norm(sub(el, sh));
      const e1 = norm(cross(w, [0, 0, 1]), [1, 0, 0]);
      const e2 = norm(cross(w, e1));
      put(part, part, { k: 'ball', c: lerp3(sh, el, 0.45), ax: [mul(w, len(sub(el, sh)) * 0.36), mul(e1, r0 * 1.22), mul(e2, r0 * 1.28)], skin: leatherSkin(L ? 3 : 5, cold) });
    }
    // (wraps of leather round it: bands)
    for (const k of [0.38, 0.62, 0.84]) {
      const at = lerp3(sh, el, k);
      const w = norm(sub(el, sh));
      const e1 = norm(cross(w, [0, 0, 1]), [1, 0, 0]);
      const e2 = norm(cross(w, e1));
      const r = r0 * (1.05 - 0.1 * k) + 0.6;
      put(part, `${part}wrap`, { k: 'band', ring: { c: at, u: mul(e1, r), v: mul(e2, r) }, ramp: ST_LEATHER, rows: 2 });
    }
    put(part, part, { k: 'ball', c: el, ax: sphere(r1 * 1.08), skin: plateSkin(L ? 31 : 33, cold, 1.5) });
    const wrist = lerp3(el, hand, 0.86);
    put(part, `${part}bracer`, { k: 'rod', a: lerp3(el, hand, 0.12), b: wrist, ra: r1 * 1.12, rb: r2 * 1.32, ramp: iron });
    const fore = norm(sub(hand, el), [0, 0, -1]);
    const e1 = norm(cross(fore, [0, 0, 1]), [1, 0, 0]);
    const e2 = norm(cross(fore, e1));
    put(part, `${part}fist`, { k: 'ball', c: add(hand, mul(fore, 1.4)), ax: [mul(fore, r2 * 1.35), mul(e1, r2 * 1.35), mul(e2, r2 * 1.2)], skin: plateSkin(L ? 35 : 37, cold, 1.3) });
    const pd = pauldronOf(s, side);
    put(part, `${part}pauldron`, { k: 'ball', c: pd.c, ax: pd.ax, skin: plateSkin(L ? 41 : 43, cold, 1.2) });
  }
  // HIS HEAD: the furnace mask
  {
    const [ff, fl2, fu] = s.face;
    const hr = B.headR;
    const c = add(s.head, mul(fu, -0.8));
    put('head', 'head', { k: 'ball', c, ax: [mul(ff, hr[0] * 1.22), mul(fl2, hr[1] * 1.42), mul(fu, hr[2] * 1.08)], skin: headSkin(s, heat, cold, t) });
    if (cold < 0.5) {
      const eye = heat > 0.95 ? ST_EYE_HOT : ST_EYE;
      for (const k of [-1, 1]) {
        const p = add(add(c, mul(ff, hr[0] * 1.21)), add(mul(fl2, k * hr[1] * 1.42 * 0.34), mul(fu, hr[2] * 1.08 * 0.24)));
        put('head', 'eye', { k: 'dot', p, c: eye, facing: ff, c2: eye });
      }
      if (heat > 0.9) put('glint', 'glint', { k: 'glow', p: add(c, mul(ff, hr[0] * 1.4)), c: FLAME[3], r: 8 + 6 * (heat - 0.9), a: 0.3 });
    }
  }
  // THE GREAT SHOVEL, in his right fist (dropped as he dies: its own piece, `shovel`, falls as the game's dying monsters' pieces
  // fall, new_mobs3 `fallApart`, which lets the piece go from the moment it falls and lays it on the floor)
  const grains: [V3, string, number][] = [];
  {
    const sv = shovelOf(s, say.face(m), say.hold(m));
    const ld = say.load(m);
    put('shovel', 'shovel', { k: 'rod', a: sv.top, b: sv.socket, ra: 1.7, rb: 1.9, ramp: iron });
    // (the D-grip: a bar across the top, two cheeks down to the haft)
    const dTop = add(sv.top, mul(sv.haftWay, -5.5));
    put('shovel', 'shovel', { k: 'rod', a: add(dTop, mul(sv.across, 3.2)), b: add(dTop, mul(sv.across, -3.2)), ra: 1.3, rb: 1.3, ramp: iron });
    for (const k of [-1, 1]) put('shovel', 'shovel', { k: 'rod', a: add(dTop, mul(sv.across, 3.2 * k)), b: sv.top, ra: 1.0, rb: 1.2, ramp: iron });
    // (the socket, wrapping the haft's end onto the scoop)
    put('shovel', 'shovel', { k: 'rod', a: add(sv.socket, mul(sv.haftWay, -6)), b: sv.heel, ra: 2.3, rb: 2.8, ramp: iron });
    // THE SCOOP: its floor, its two side walls and its heel's wall
    const half = SHOVEL.blade / 2;
    const mid = add(sv.heel, mul(sv.bladeWay, half));
    const lipGlow = Math.min(1, 0.3 + 0.5 * heat + 0.6 * ld.n * ld.hot);
    put('shovel', 'shovel', { k: 'panel', c: mid, u: mul(sv.across, SHOVEL.half), v: mul(sv.bladeWay, half), skin: scoopSkin(cold, lipGlow, half) });
    for (const k of [-1, 1]) {
      const wallC = add(add(mid, mul(sv.across, SHOVEL.half * k)), mul(sv.face, SHOVEL.wall / 2));
      put('shovel', 'shovel', { k: 'panel', c: add(wallC, mul(sv.bladeWay, -half * 0.12)), u: mul(sv.bladeWay, half * 0.88), v: mul(sv.face, SHOVEL.wall / 2), skin: scoopSkin(cold, 0, half) });
    }
    put('shovel', 'shovel', { k: 'panel', c: add(sv.heel, mul(sv.face, SHOVEL.wall / 2)), u: mul(sv.across, SHOVEL.half), v: mul(sv.face, SHOVEL.wall / 2), skin: scoopSkin(cold, 0, half) });
    // COALS heaped on it
    if (ld.n > 0.02) {
      const n = Math.round(14 * ld.n);
      for (let i = 0; i < n; i++) {
        const a = (hash(i, 1, 111) - 0.5) * 2 * SHOVEL.half * 0.7;
        const b = (0.15 + 0.7 * hash(i, 2, 111)) * SHOVEL.blade;
        const hgt = 1.6 + 3.4 * (1 - Math.abs(a) / SHOVEL.half) * Math.sin(Math.PI * (b / SHOVEL.blade)) * ld.n;
        const r = 1.8 + 1.4 * hash(i, 3, 111);
        const c = add(add(add(sv.heel, mul(sv.bladeWay, b)), mul(sv.across, a)), mul(sv.face, hgt));
        const hot = ld.hot;
        put('coals', 'coals', { k: 'ball', c, ax: sphere(r), skin: (u, tone) => coalAt(0.4 + 0.9 * hot, clamp01(0.5 + 0.35 * u[2] + 0.2 * (tone - 2) / 2 + 0.25 * noise2(u[0] * 2 + i, u[1] * 2, 113))) });
      }
      // sparks and heat shimmering up off them
      for (let i = 0; i < 6; i++) {
        const life = fr(t * 2.2 + i / 6);
        const p = add(add(mid, mul(sv.face, 4 + 14 * life)), mul(sv.across, (hash(i, 4, 111) - 0.5) * 16));
        grains.push([p, ST_SPARK[Math.min(2, Math.floor(life * 3))], 1]);
      }
    }
    // scraping the floor: sparks thrown off the lip
    const scr = say.scrape(m);
    if (scr > 0.02) {
      for (let i = 0; i < Math.round(8 * scr); i++) {
        const life = fr(t * 3 + i / 8 + 0.3 * hash(i, 5, 113));
        const a = (hash(i, 6, 113) - 0.5) * 2.4;
        const p = add(sv.lip, [Math.cos(a) * -9 * life - 3 * life, Math.sin(a) * 9 * life, 1 + 8 * life * (1 - life)]);
        if (life < 0.7) grains.push([p, ST_SPARK[Math.min(2, Math.floor(life * 4))], 1]);
      }
    }
  }
  // THE GEAR as he falls (its own piece, `gear`): a cog of black iron tumbling out of his grate
  const gr = say.gear(m);
  if (gr) gearBits(put, gr.c, gr.up, gr.spin, cold);
  // SMOKE out of his flue, SPARKS with it; soot puffed up where a foot comes down; sparks burst out of his door
  {
    const smoke = Math.max(0, say.smoke(m));
    const top = add(capA, mul(capWay, 4));
    const n = Math.round(10 * Math.min(2.2, smoke));
    for (let i = 0; i < n; i++) {
      const life = fr(t * 0.45 + i / Math.max(1, n) + 0.3 * hash(i, 7, 121));
      if (life > 0.86) continue;
      const a = hash(i, 8, 121) * TAU;
      const r = 1.5 + 6 * life;
      const p = add(top, [Math.cos(a) * r - 10 * life, Math.sin(a) * r + 3 * life, 3 + 30 * life]);
      const k = Math.min(3, Math.floor(life * 4));
      grains.push([p, ST_SMOKE[k], life < 0.5 ? 2 : 1]);
      if (life < 0.5) grains.push([add(p, [1.2, 0.8, 0.6]), ST_SMOKE[Math.min(3, k + 1)], 2]);
    }
    if (cold < 0.6) {
      for (let i = 0; i < Math.round(3 + 3 * heat); i++) {
        const life = fr(t * 0.9 + i / 5 + 0.37 * hash(i, 9, 121));
        if (life > 0.6) continue;
        const a = hash(i, 10, 121) * TAU;
        grains.push([add(top, [Math.cos(a) * 3 * life - 6 * life, Math.sin(a) * 3 * life, 4 + 26 * life]), ST_SPARK[Math.min(2, Math.floor(life * 5))], 1]);
      }
    }
    const sp = say.stamp(m);
    for (const [side, since] of [['L', sp.L], ['R', sp.R]] as const) {
      if (since < 0 || since > 0.4) continue;
      const toe = side === 'L' ? s.toeL : s.toeR;
      const heel = side === 'L' ? s.heelL : s.heelR;
      const c = lerp3(toe, heel, 0.5);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU + hash(i, side === 'L' ? 1 : 2, 123);
        const r = 6 + 20 * since * (0.7 + 0.3 * hash(i, 3, 123));
        const p: V3 = [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * 0.9, 0.8 + 5 * since * (1 - since * 2)];
        grains.push([p, ST_ASH[Math.min(2, Math.floor(since * 7))], since < 0.2 ? 2 : 1]);
      }
    }
    const bu = say.burst(m);
    if (bu && bu.k > 0.01) {
      const from = doorFrameOf(s);
      for (let i = 0; i < Math.round(26 * bu.k); i++) {
        const a = (hash(i, 11, 125) - 0.5) * 2.2;
        const e = (hash(i, 12, 125) - 0.3) * 1.2;
        const sp2 = 40 + 50 * hash(i, 13, 125);
        const T = bu.since * (0.7 + 0.5 * hash(i, 14, 125));
        const way = add(add(mul(from.f, Math.cos(a) * Math.cos(e)), mul(from.l, Math.sin(a) * Math.cos(e))), [0, 0, Math.sin(e)]);
        const p = add(add(from.c, mul(way, sp2 * T)), [0, 0, -90 * T * T]);
        if (p[2] < 1 || T > 0.55) continue;
        grains.push([p, ST_SPARK[i % 3], T < 0.2 ? 2 : 1]);
      }
    }
    // (the gout of fire out of his open door: the burst)
    const go = say.gout(m);
    if (go.k > 0.02) {
      const from = doorFrameOf(s);
      for (let i = 0; i < Math.round(90 * go.k); i++) {
        const u = fr(t * 3 + i / 90 + 0.21 * hash(i, 15, 127));
        const spread = 3 + 16 * u;
        const a = hash(i, 16, 127) * TAU;
        const r = Math.sqrt(hash(i, 17, 127));
        const c = add(from.c, mul(from.f, go.reach * u));
        const p = add(add(c, mul(from.l, Math.cos(a) * spread * r)), [0, 0, Math.sin(a) * spread * r * 0.8 + 4 * u]);
        grains.push([[p[0], p[1], Math.max(0.6, p[2])], ST_COALS[Math.max(1, 4 - Math.floor(u * 4))], u < 0.6 ? 2 : 1]);
      }
    }
    // (as he goes cold: thin smoke rising off him, ash drifting down)
    if (cold > 0.2) {
      const ups: V3[] = [bl.c, dm.c, s.head, doorFrameOf(s).c];
      ups.forEach((at, j) => {
        for (let i = 0; i < 5; i++) {
          const life = fr(t * 0.35 + i / 5 + 0.3 * hash(i, j, 129));
          if (life > 0.8) continue;
          const p = add(at, [Math.sin(life * 6 + i) * 3 - 6 * life, Math.cos(life * 5 + j) * 3, 6 + 26 * life]);
          grains.push([p, ST_SMOKE[Math.min(3, 1 + Math.floor(life * 3))], 1]);
        }
      });
    }
  }
  // THE SMEAR of a lightning strike: its after-images (laid after his edge, so no rim of their own), the oldest thinned
  const sm = say.smear(m);
  if (sm) {
    sm.forEach((line, j) => {
      const k = j / Math.max(1, sm.length - 1);
      for (let i = 1; i < line.length; i++) {
        const [x0, y0] = st.at(line[i - 1]);
        const [x1, y1] = st.at(line[i]);
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2));
        for (let e = 0; e < n; e++) {
          if (k < 0.5 && (e + i) % 2) continue;
          grains.push([lerp3(line[i - 1], line[i], e / n), k > 0.7 ? ST_SMEAR[2] : k > 0.35 ? ST_SMEAR[1] : ST_SMEAR[0], 2]);
        }
      }
    });
  }
  MORE.set(m, grains);
  return bits;
}

/** THE GEAR: a cog of black iron, sixteen teeth, a hub and four spokes; `up` the way its face points, turned `spin` degrees about it. */
export const GEAR = { r: 9.5, teeth: 14, hub: 2.6, thick: 2.2 } as const;
/** The gear's iron: the crank's, worked and worn bright at its teeth (not his soot). */
export const GEAR_IRON: Ramp = ['#1c1719', '#3c3436', '#625858', '#90847c', '#c6b8a8'];
export function gearSkin(cold: number, spin: number, glint = false): PanelSkin {
  void cold;
  const iron = GEAR_IRON;
  return (a, b, front, tone) => {
    const r = Math.hypot(a, b);
    const ang = Math.atan2(b, a) - spin * D;
    const tooth = fr((ang / TAU) * GEAR.teeth) < 0.5;
    const rim = GEAR.r - 2.2;
    if (r > GEAR.r || (r > rim && !tooth)) return null;
    if (r < 1.1) return null;
    if (r < GEAR.hub) return iron[tone5(tone + 1)];
    // (between the hub and the rim: four spokes, the gaps between them open)
    if (r < rim - 1.6) {
      const sp = Math.abs(fr((ang / TAU) * 4) - 0.5) > 0.36;
      if (!sp) return null;
    }
    if (r > rim - 1.6 && r < rim - 0.7) return iron[tone5(tone - 1)];
    if (glint && r > rim && Math.abs(fr((ang / TAU) * 3 + 0.1) - 0.5) < 0.04) return '#f2e2c8';
    return iron[tone5(tone + (front ? (r > rim ? 1 : 0) : -1))];
  };
}
function gearBits(put: Put, c: V3, up: V3, spin: number, cold: number): void {
  const u0 = norm(cross(up, Math.abs(up[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
  const v0 = norm(cross(up, u0));
  put('gear', 'gear', { k: 'panel', c: add(c, mul(up, GEAR.thick / 2)), u: mul(u0, GEAR.r), v: mul(v0, GEAR.r), skin: gearSkin(cold, spin, true) });
  put('gear', 'gear', { k: 'panel', c: add(c, mul(up, -GEAR.thick / 2)), u: mul(u0, GEAR.r), v: mul(v0, -GEAR.r), skin: gearSkin(cold, -spin) });
}

/** HIM AS THE PAINTER TAKES HIM. */
export function stokerPainter(say: StokerSay): {
  bits: (st: Stage, m: Moment) => Bit[];
  grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]>;
  finish: (px: Px, st: Stage, m: Moment, partAt: (k: number) => string | null) => void;
} {
  return {
    bits: (st, m) => stokerBits(st, m, say),
    grains: (_st, m) => MORE.get(m) ?? [],
    finish: () => undefined,
  };
}
