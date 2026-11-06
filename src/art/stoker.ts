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
import type { Bit, MobCanvas, Moment, PanelSkin, Put, Shape } from './new_mobs3';
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
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};

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

/**
 * HIS DEATH: THE FURNACE EXPLODES (his pick of 6 Nov 2026, “Furnace explodes (Recommended)”). Struck, he staggers and STIFFENS
 * UPRIGHT as his firebox overloads (`build`: held and readable: his grate and every seam glowing orange to white-hot, his plates
 * bulging, rivets popping off in sparks, steam and smoke jetting from his flue and his joints, his shovel let fall from his fist
 * at `drop`, his body shaking); then THE BURST in two frames (`strike`, landing at `hit`: his rulebook's Movement 9): a blast of
 * fire and smoke, a shockwave over the floor (art/stoker_fx.ts `BLAST`), his plates, his pauldrons' lames, his helm, his shovel and
 * chunks of his firebox flung out spinning, every one a real piece of him, bouncing and clattering down to lie scattered and
 * smoking by `down`; THE GEAR spinning out of the fireball, clanging down and lying glinting at `GEAR_REST` by `gearStill`. Nothing
 * of his body is left standing. Seconds; the game shows his death at 20 frames a second.
 */
export const ST_DEATH = {
  long: 4.2,
  jolt: 0.1,
  stiff: 0.6,
  drop: 0.4,
  build: [0.3, 1.45] as const,
  strike: [1.45, 1.55] as const,
  hit: 1.55,
  fire: 1.15,
  down: 2.9,
  gear: 1.55,
  gearStill: 2.85,
} as const;
/** How hard he shakes as his firebox overloads (his lengths), and how fast. */
export const ST_SHAKE_DEATH = { amp: 1.1, hz: 15 } as const;

export interface StokerSay {
  /** His bones at a moment of his death (for the pieces he flies apart into, cut from him as he is at the burst). */
  bonesAt?: (t: number) => Skeleton;
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
/** A pauldron over a shoulder: its cop, laid round the deltoid (art/stoker.ts `armBody`, `PAULDRON`). */
export function pauldronOf(s: Skeleton, side: 'L' | 'R'): { c: V3; ax: [V3, V3, V3] } {
  const d = armBody(s, side).deltoid;
  const k = PAULDRON.cop.k;
  return { c: d.c, ax: [mul(d.ax[0], k), mul(d.ax[1], k), mul(d.ax[2], k)] };
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
/**
 * His flue: a stove-pipe out of his back behind his left shoulder, up past his head, bent back at an elbow; its points, foot to
 * cap. IT IS PART OF HIS FIREBOX: every point of it is fixed in the firebox's own frame (its domed top's middle, the chest's
 * forward, left and up), so that it never comes away from his back, and tilts and sinks with him as he slumps and kneels. Its foot
 * is set in the dome (`FLUE[0]`, inside its skin: the pipe comes up out of the iron); the rest are where his standing flue always
 * was (his standing pose's own, worked out once: 6 Nov 2026, after the flue was seen floating clear of him as he slumped in his
 * death, its foot having been set off the curl of his back rather than on the firebox).
 */
export const FLUE: ReadonlyArray<V3> = [
  [-13.9, 5.9, 4.4],
  [-28.42, 9.5, 10.94],
  [-25.95, 12.0, 37.0],
  [-27.99, 12.0, 46.64],
];
export function flueOf(s: Skeleton): V3[] {
  const [cf, cl, cu] = s.chest;
  const c = domeOf(s).c;
  return FLUE.map(([f, l, u]) => add(add(add(c, mul(cf, f)), mul(cl, l)), mul(cu, u)));
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
function bellySkin(s: Skeleton, heat: number, door: number, cold: number, t: number, seams = 0): Skin {
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
    // (overloading as he dies: every seam and band glowing, orange to white-hot)
    if (seams > 0.02 && (band || Math.abs(Math.abs(up) - 9.5) < 2.3 || (Math.abs(y) < 0.04 && x < 0.2)) && noise2(across * 0.4 + t * 6, up * 0.4, 151) < 0.25 + seams) return EMBER[Math.min(4, 1 + Math.floor(seams * 3.4))];
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
/** The firebox's domed top: plain cast iron, a ring of rivets round its foot, soot. */
function domeSkin(cold: number, seams = 0, t = 0): Skin {
  const iron = ironOf(cold);
  return (u, tone) => {
    if (Math.abs(u[2] - 0.22) < 0.07) return seams > 0.02 && noise2(u[0] * 5 + t * 6, u[1] * 5, 153) < 0.25 + seams ? EMBER[Math.min(4, 1 + Math.floor(seams * 3.4))] : fr(Math.atan2(u[1], u[0]) / (TAU / 26)) < 0.3 ? iron[tone5(tone + 1)] : iron[tone5(tone - 1)];
    if (cold > 0.55 && noise2(u[0] * 4, u[1] * 4, 57) > 0.74) return ST_ASH[Math.max(0, Math.min(2, 3 - tone))];
    return iron[tone5(tone - (noise2(u[0] * 2.5 + 3, u[1] * 2.5, 59) > 0.7 ? 1 : 0))];
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
// HIS BODY, SCULPTED. His pick of 6 Nov 2026, shown the Stoker and told his arms and legs read like pipes with ball joints:
// “Reshape his body first (Recommended)”, offered as sculpted arms and legs: forged iron plates over real muscle and joints, his
// shoulders and knees shaped, not balls. So no limb is a tube and no joint a ball: each limb is MUSCLE (eggs of scorched leather
// laid along the bone, swelling and tapering as a body does, all of one part, so that they melt into one another with no seam
// between them), and over it IRON PLATES SHAPED TO IT: each plate is laid round the muscle under it, worked out from that muscle
// (`outFrom`), so that it follows its curve and nothing of the limb comes through it (tests/stoker.test.ts, the coverage check).

/** A muscle (or anything shaped as an egg): its middle and its three half-lengths, each along its own line. */
export interface Egg {
  c: V3;
  ax: [V3, V3, V3];
}
/** A limb's own frame: from `a` to `b` (`L` long), `d` along it, `f` its front (the way given, made square to it), `o` its outside (away from his middle). */
export interface LimbFrame {
  a: V3;
  b: V3;
  L: number;
  d: V3;
  f: V3;
  o: V3;
}
/** A limb's frame; `left`: his left arm or leg (its outside is to his left), so that its outside never flips over however it turns. */
export function limbFrame(a: V3, b: V3, front: V3, left: boolean): LimbFrame {
  const L = len(sub(b, a));
  const d = norm(sub(b, a), [0, 0, -1]);
  const f0 = sub(front, mul(d, dot(front, d)));
  const f = len(f0) > 1e-3 ? norm(f0) : norm(cross(d, Math.abs(d[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
  return { a, b, L, d, f, o: mul(norm(cross(d, f)), left ? -1 : 1) };
}
/** A point of a limb: `t` of the way along it, `f` to its front and `o` to its outside. */
export const onLimb = (k: LimbFrame, t: number, f: number, o: number): V3 => add(add(add(k.a, mul(k.d, t * k.L)), mul(k.f, f)), mul(k.o, o));
/** A muscle on a limb: its middle `t` along it, `f` to the front and `o` out; its half-lengths to the front, out and along. */
export const eggOn = (k: LimbFrame, t: number, f: number, o: number, rf: number, ro: number, rd: number): Egg => ({ c: onLimb(k, t, f, o), ax: [mul(k.f, rf), mul(k.o, ro), mul(k.d, rd)] });
/** An egg made `k` times as big about its own middle. */
const grown = (e: Egg, k: number): Egg => ({ c: e.c, ax: [mul(e.ax[0], k), mul(e.ax[1], k), mul(e.ax[2], k)] });
/** Where on an egg a point is, in its own half-lengths (inside it if the three together are under 1). */
export function inEgg(e: Egg, p: V3): V3 {
  const q = sub(p, e.c);
  return [dot(q, e.ax[0]) / dot(e.ax[0], e.ax[0]), dot(q, e.ax[1]) / dot(e.ax[1], e.ax[1]), dot(q, e.ax[2]) / dot(e.ax[2], e.ax[2])];
}
/** The lowest point of an egg, above the floor. */
const lowOf = (e: Egg): number => e.c[2] - Math.hypot(e.ax[0][2], e.ax[1][2], e.ax[2][2]);
/** An egg kept out of the floor (a knee kneeling on it rests on it, not in it). */
const offFloor = (e: Egg): Egg => (lowOf(e) < 0.15 ? { c: add(e.c, [0, 0, 0.15 - lowOf(e)]), ax: e.ax } : e);

/** How far out from `o` along `dir` (a unit) the outside of these muscles is: where a ray from within them last leaves them (0 if it leaves none). */
export function outFrom(eggs: ReadonlyArray<Egg>, o: V3, dir: V3): number {
  let best = 0;
  for (const e of eggs) {
    const q = sub(o, e.c);
    let A = 0;
    let Bq = 0;
    let C = -1;
    for (const a of e.ax) {
      const l2 = dot(a, a);
      const dq = dot(q, a) / l2;
      const dd = dot(dir, a) / l2;
      A += dd * dd;
      Bq += 2 * dq * dd;
      C += dq * dq;
    }
    const disc = Bq * Bq - 4 * A * C;
    if (disc < 0) continue;
    best = Math.max(best, (-Bq + Math.sqrt(disc)) / (2 * A));
  }
  return best;
}
/** A ring laid round muscles at `c` (square to `f` and `o`), `off` outside their skin all the way round, never closer in than `min`: a band of iron, a cuff, a plate's edge, following the muscle under it. */
export function ringOver(eggs: ReadonlyArray<Egg>, c: V3, f: V3, o: V3, off: number, min = 0, n = 20): Ring {
  const pts: V3[] = [];
  const rs: number[] = [];
  let rf = 0;
  let ro = 0;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const dir = add(mul(f, Math.cos(a)), mul(o, Math.sin(a)));
    const r = Math.max(min, outFrom(eggs, c, dir)) + off;
    const p = add(c, mul(dir, r));
    pts.push([p[0], p[1], Math.max(0.2, p[2])]);
    rf = Math.max(rf, Math.abs(r * Math.cos(a)));
    ro = Math.max(ro, Math.abs(r * Math.sin(a)));
    rs.push(r);
  }
  // (its oval, which says how near the eye each of its points is, made as big as all of them: so that it is never painted behind the muscle it lies over)
  const k = Math.max(1, ...rs.map((r, i) => r / Math.hypot(rf * Math.cos((i / n) * TAU), ro * Math.sin((i / n) * TAU))));
  return { c, u: mul(f, rf * k), v: mul(o, ro * k), pts };
}

/** HIS ARMS AND SHOULDERS, as worked out from his bones: the frames of his upper arm and forearm, the shoulder's (which his pauldron rides on), and his muscles. */
export interface ArmBody {
  up: LimbFrame;
  fore: LimbFrame;
  /** The shoulder's frame: `d` down over the shoulder (the arm's way, a little of the chest's down, a little out: the pauldron rides up with the arm as it is raised), `f` forward, `o` out. */
  sh: LimbFrame;
  /** Which way the elbow's point is. */
  pole: V3;
  deltoid: Egg;
  /** The upper arm's muscles (biceps, triceps, the brachialis, above the elbow), the forearm's (thick at the top, narrowing to the wrist). */
  upper: Egg[];
  forearm: Egg[];
  /** The fist: its grip's line (the haft's, when it holds it), the way the forearm comes into it, and the back of the hand. */
  grip: { at: V3; g: V3; w: V3; n: V3 };
}
/**
 * THE PAULDRON: its COP, a shell laid round the top of the deltoid (`k` times as big as it, from its top down to `to` of its own
 * half-lengths, and round to `inside` toward his neck), riveted, a ridge over it; and its LAMES, three bands of iron round the
 * shoulder and the top of the arm, each laid round the muscle under it (`ringOver`), flaring at its foot, and each over the top of
 * the next (shingled down the arm): where each is (from and to, the deltoid's own half-lengths down), how far off the muscle at its
 * top and at its flared foot.
 */
export const PAULDRON = {
  cop: { k: 1.2, to: -0.02, inside: -0.55 },
  lames: [
    { from: -0.24, to: 0.22, top: 1.0, foot: 2.6 },
    { from: 0.04, to: 0.5, top: 0.9, foot: 2.3 },
    { from: 0.32, to: 0.74, top: 0.8, foot: 2.0 },
  ],
} as const;
export function armBody(s: Skeleton, side: 'L' | 'R', haft?: { top: V3; way: V3 }): ArmBody {
  const L = side === 'L';
  const sh = L ? s.shoulderL : s.shoulderR;
  const el = L ? s.elbowL : s.elbowR;
  const hand = L ? s.handL : s.handR;
  const [uf, ul, uu] = s.upper;
  const out = mul(ul, L ? 1 : -1);
  // (the elbow's point: the way the pose put it, in the chest's own space)
  const pole0 = L ? s.poleL : s.poleR;
  const pole = norm(add(add(mul(s.chest[0], pole0[0]), mul(s.chest[1], pole0[1])), mul(s.chest[2], pole0[2])), mul(uf, -1));
  const up = limbFrame(sh, el, mul(pole, -1), L);
  const fore = limbFrame(el, hand, mul(pole, -1), L);
  // THE SHOULDER: the pauldron rides on it, between the chest and the arm
  const shDown = norm(add(add(mul(uu, -0.45), up.d), mul(out, 0.4)));
  const shF = limbFrame(sh, add(sh, shDown), uf, L);
  const deltoid: Egg = { c: add(add(sh, mul(shDown, 1.2)), mul(shF.o, 2.4)), ax: [mul(shF.f, 9.6), mul(shF.o, 8.8), mul(shF.d, 12.2)] };
  // THE UPPER ARM: a swelling biceps before, the great triceps behind, the brachialis out, all running down into the elbow
  const upper = [
    eggOn(up, 0.52, 2.8, 0.3, 5.2, 5.8, 9.4),
    eggOn(up, 0.47, -2.5, 0.9, 5.8, 6.4, 10.6),
    eggOn(up, 0.7, 0.4, 2.2, 5.0, 4.6, 7.2),
    eggOn(up, 0.88, 0.2, 0, 5.6, 6.0, 5.0),
  ];
  // THE FOREARM: thick at the top (the extensors over its back and out, the flexors before), narrowing to the wrist
  const forearm = [
    eggOn(fore, 0.12, 0, 0, 5.8, 6.0, 4.6),
    eggOn(fore, 0.24, -1.4, 1.5, 6.2, 6.4, 8.4),
    eggOn(fore, 0.28, 1.6, -0.7, 5.6, 5.6, 8.6),
    eggOn(fore, 0.58, 0, 0, 4.8, 5.0, 8.8),
  ];
  // THE FIST: round the haft when it holds it (the haft's line), or closed on nothing, its knuckles across the forearm
  let g = norm(cross(fore.d, fore.o), [0, 0, 1]);
  if (haft) {
    const ab = haft.way;
    const k = dot(sub(hand, haft.top), ab);
    const off = len(sub(hand, add(haft.top, mul(ab, k))));
    const on = clamp01((7 - off) / 5);
    const h = dot(g, ab) < 0 ? mul(ab, -1) : ab;
    g = norm(add(mul(g, 1 - on), mul(h, on)), g);
  }
  const w = norm(sub(fore.d, mul(g, dot(fore.d, g))), fore.d);
  const n = mul(norm(cross(g, w)), L ? -1 : 1);
  return { up, fore, sh: shF, pole, deltoid, upper, forearm, grip: { at: hand, g, w, n } };
}

/** HIS LEGS, as worked out from his bones: the thigh's and the shin's frames (their front the knee's), and his muscles. */
export interface LegBody {
  thigh: LimbFrame;
  shin: LimbFrame;
  /** The knee's front, and across it (out). */
  kf: V3;
  ko: V3;
  upper: Egg[];
  lower: Egg[];
}
export function legBody(s: Skeleton, side: 'L' | 'R'): LegBody {
  const L = side === 'L';
  const hip = L ? s.hipL : s.hipR;
  const knee = L ? s.kneeL : s.kneeR;
  const ankle = L ? s.ankleL : s.ankleR;
  const heel = L ? s.heelL : s.heelR;
  const toe = L ? s.toeL : s.toeR;
  // (the knee's front: the way it is bent, and where the foot points while it is all but straight)
  const ab = sub(ankle, hip);
  const kk = dot(sub(knee, hip), ab) / Math.max(1e-6, dot(ab, ab));
  const bend = sub(knee, add(hip, mul(ab, kk)));
  const foot = norm([toe[0] - heel[0], toe[1] - heel[1], 0], s.hips[0]);
  const front = norm(add(bend, mul(foot, 5)), s.hips[0]);
  const thigh = limbFrame(hip, knee, front, L);
  const shin = limbFrame(knee, ankle, front, L);
  const kf = norm(add(thigh.f, shin.f), thigh.f);
  const ko = norm(add(thigh.o, shin.o), thigh.o);
  // THE THIGH: thick, the quadriceps before, the hamstrings behind; above the knee the two heads of the quadriceps swelling either side
  const upper = [
    eggOn(thigh, 0.42, 2.2, 0.4, 7.0, 8.6, 12.4),
    eggOn(thigh, 0.42, -2.0, 0, 6.4, 8.2, 11.4),
    eggOn(thigh, 0.74, 1.2, 3.0, 5.6, 5.0, 8.0),
    eggOn(thigh, 0.8, 2.0, -2.6, 5.4, 4.8, 6.4),
    eggOn(thigh, 0.92, 0.3, 0, 6.6, 7.6, 5.0),
  ].map(offFloor);
  // THE SHIN: the calf's two heads swelling behind, the shin's muscle before, tapering into the boot
  const lower = [
    eggOn(shin, 0.07, 0, 0, 6.6, 7.4, 5.0),
    eggOn(shin, 0.28, -3.3, 1.9, 5.0, 4.6, 9.0),
    eggOn(shin, 0.3, -3.1, -2.1, 5.2, 4.8, 9.6),
    eggOn(shin, 0.34, 1.5, 0.5, 4.9, 5.3, 10.6),
    eggOn(shin, 0.62, -0.6, 0, 5.0, 5.2, 9.0),
  ].map(offFloor);
  return { thigh, shin, kf, ko, upper, lower };
}
/** Where the boot's cuff comes up to on the shin; the vambrace's top and foot on the forearm; the upper arm's band. */
export const BOOT_TOP = 0.56;
export const VAMBRACE = [0.42, 0.86] as const;
export const ARM_BAND = 0.62;

/** SCORCHED LEATHER WRAPPED ROUND A LIMB: strips wound round it, their edges dark, a lit edge beside, burns across them; `pitch` how far down the limb each turn goes. */
function wrapSkin(k: LimbFrame, e: Egg, seed: number, cold: number, pitch = 4.6, under = Infinity): Skin {
  return (u, tone) => {
    const p = add(add(add(e.c, mul(e.ax[0], u[0])), mul(e.ax[1], u[1])), mul(e.ax[2], u[2]));
    // (what is under his skirt is not painted: so nothing of his thighs can show through it)
    if (p[2] > under) return null;
    const q = sub(p, k.a);
    const along = dot(q, k.d);
    const ang = Math.atan2(dot(q, k.o), dot(q, k.f));
    const ph = fr(along / pitch + ang / TAU + 0.37 * seed);
    if (cold > 0.55 && noise2(along * 0.5 + seed, ang * 2, 63) > 0.75) return ST_ASH[Math.max(0, Math.min(2, 3 - tone))];
    if (ph < 0.11) return ST_LEATHER[Math.max(0, tone - 2)];
    if (ph < 0.22 && tone >= 2) return ST_LEATHER[Math.min(4, tone + 1)];
    const burn = noise2(along * 0.35 + seed, ang * 1.6 + along * 0.1, 61) > 0.7;
    return ST_LEATHER[tone5(tone - (burn ? 1 : 0))];
  };
}
/** FORGED IRON: soot, a hammer's dints, going grey as he dies. */
function forgedSkin(seed: number, cold: number): Skin {
  const iron = ironOf(cold);
  return (u, tone) => {
    if (cold > 0.55 && noise2(u[0] * 4 + seed, u[2] * 4, 53) > 0.74) return ST_ASH[Math.max(0, Math.min(2, 3 - tone))];
    return iron[tone5(tone - (noise2(u[0] * 3 + seed, u[2] * 3 + u[1], 55) > 0.7 ? 1 : 0))];
  };
}
/** THE FAN of a couter or a poleyn, out over the side of the joint: a shell of iron fluted from its root. */
function fanSkin(cold: number): Skin {
  const iron = ironOf(cold);
  return (u, tone) => {
    const r = Math.hypot(u[0], u[2]);
    if (r > 0.86) return iron[0];
    const flute = Math.abs(fr((Math.atan2(u[2], u[0]) / TAU) * 9) - 0.5) < 0.12;
    return iron[tone5(tone + (flute ? -1 : u[1] > 0 ? 0 : -1))];
  };
}
/** THE GAUNTLET'S FIST: the back of the hand a plate, riveted; the fingers four plates curled round what it holds (their seams across it), the knuckles a ridge. */
function fistSkin(at: V3, g: V3, w: V3, n: V3, e: Egg, cold: number): Skin {
  const iron = ironOf(cold);
  return (u, tone) => {
    const p = add(add(add(e.c, mul(e.ax[0], u[0])), mul(e.ax[1], u[1])), mul(e.ax[2], u[2]));
    const q = sub(p, at);
    const across = dot(q, g);
    const fwd = dot(q, w);
    const back = dot(q, n);
    if (fwd > -1.6) {
      // the fingers: four, their seams across the fist (dark), each lit along its knuckle
      const f4 = (across + 6.2) / 3.1;
      if (f4 > 0.2 && f4 < 3.8 && Math.abs(fr(f4) - 0) < 0.13) return iron[0];
      if (back > 1.2 && fwd > -0.6 && fwd < 1.4) return iron[Math.min(4, tone + 1)];
      return iron[tone5(tone - (fr(f4) > 0.6 ? 1 : 0))];
    }
    // the back of the hand: a plate, rivets at its corners
    if (back > 0 && Math.abs(Math.abs(across) - 3.2) < 0.7 && Math.abs(fwd + 3.6) < 0.7) return iron[4];
    return iron[tone5(tone - (noise2(across * 0.6, fwd * 0.6, 57) > 0.72 ? 1 : 0))];
  };
}

/** A LAME OF THE PAULDRON: a band cut from an egg laid round the muscle under it, its foot the egg's widest (so that it flares), its top `LAME_TOP` of the way up the egg (u[2]), as big as it must be to go round the muscle at its top, its middle and its foot. */
export const LAME_TOP = -0.6;
export function lameOf(A: ArmBody, l: { from: number; to: number; top: number; foot: number }): Egg {
  const under = [A.deltoid, ...A.upper];
  const dl = len(A.deltoid.ax[2]);
  const at = (w: number): V3 => add(A.deltoid.c, mul(A.sh.d, dl * w));
  const top = ringOver(under, at(l.from), A.sh.f, A.sh.o, l.top);
  const mid = ringOver(under, at((l.from + l.to) / 2), A.sh.f, A.sh.o, (l.top + l.foot) / 2);
  const foot = ringOver(under, at(l.to), A.sh.f, A.sh.o, l.foot);
  const k = Math.sqrt(1 - LAME_TOP * LAME_TOP);
  const km = Math.sqrt(1 - (LAME_TOP / 2) * (LAME_TOP / 2));
  const rf = Math.max(len(top.u) / k, len(mid.u) / km, len(foot.u));
  const ro = Math.max(len(top.v) / k, len(mid.v) / km, len(foot.v));
  return { c: foot.c, ax: [mul(A.sh.f, rf), mul(A.sh.o, ro), mul(A.sh.d, ((l.to - l.from) * dl) / -LAME_TOP)] };
}

// =============================================================================================
// HIS PLATES, AS TRUE SOLIDS. Every plate is cut from an egg (painted as a ball, so that every pixel of it is as near the eye as
// it truly is), laid round the muscle under it and then made big enough that the muscle is inside it wherever it is iron
// (`enclosing`: rays from its middle over all its iron, each a little past the muscle). So nothing of him comes through a plate,
// from any side: the muscle seen inside a plate is seen through its open end, never through the iron (tests/stoker.test.ts 11).

/** A PLATE: its egg, the muscle under it, and the part of the egg that is iron, in its own half-lengths: along its third line from `lo` to `hi`, along its first above `open`, along its second above `inside`; `kind`, how it is finished. */
export interface Plate {
  name: string;
  part: string;
  e: Egg;
  under: Egg[];
  lo: number;
  hi: number;
  open: number;
  inside: number;
  kind: 'cop' | 'lame' | 'band' | 'cup' | 'cuff';
  seed: number;
}
/** Whether a point of a plate's egg (in its own half-lengths, on its skin) is iron; `m` keeps it that far inside the edges. */
export const inPlate = (pl: Plate, u: V3, m = 0): boolean => (pl.lo <= -1 || u[2] >= pl.lo + m) && (pl.hi >= 1 || u[2] <= pl.hi - m) && (pl.open <= -1 || u[0] >= pl.open + m) && (pl.inside <= -1 || u[1] >= pl.inside + m);
/** A plate made big enough that the muscle under it is inside it, `pad` past its skin, wherever the plate is iron (and a little past its edges). */
function enclosing(pl: Plate, pad: number): Plate {
  let k = 1;
  const NZ = 16;
  const NA = 36;
  for (let i = 0; i <= NZ; i++) {
    const z = Math.max(-1, Math.min(1, pl.lo - 0.05 + ((pl.hi - pl.lo + 0.1) * i) / NZ));
    const r = Math.sqrt(Math.max(0, 1 - z * z));
    for (let j = 0; j < NA; j++) {
      const a = (j / NA) * TAU;
      const u: V3 = [r * Math.cos(a), r * Math.sin(a), z];
      if (!inPlate(pl, u, -0.05)) continue;
      const v = add(add(mul(pl.e.ax[0], u[0]), mul(pl.e.ax[1], u[1])), mul(pl.e.ax[2], u[2]));
      const L = len(v);
      if (L < 1e-6) continue;
      k = Math.max(k, (outFrom(pl.under, pl.e.c, mul(v, 1 / L)) + pad) / L);
    }
  }
  return { ...pl, e: grown(pl.e, k) };
}
const ANY = -2;
/** A band round a limb at `t` of it, `half` of his lengths either side, laid round the muscle under it (`off` past it); `open` its front only. */
function bandOn(name: string, part: string, k: LimbFrame, t: number, under: Egg[], off: number, half: number, seed: number, open = ANY, min = 0): Plate {
  const c = onLimb(k, t, 0, 0);
  const r = ringOver(under, c, k.f, k.o, off, min);
  const H = 0.45;
  return enclosing({ name, part, e: { c, ax: [mul(k.f, len(r.u) / Math.sqrt(1 - H * H)), mul(k.o, len(r.v) / Math.sqrt(1 - H * H)), mul(k.d, half / H)] }, under, lo: -H, hi: H, open, inside: ANY, kind: 'band', seed }, 0.9);
}
/** A cuff down a limb from `t0` (its top, flared: the egg's widest) to `t1`, laid round the muscle under it. */
function cuffOn(name: string, part: string, k: LimbFrame, t0: number, t1: number, under: Egg[], off: number, seed: number, min = 0): Plate {
  const c = onLimb(k, t0, 0, 0);
  const r = ringOver(under, c, k.f, k.o, off, min);
  const H = 0.72;
  return enclosing({ name, part, e: { c, ax: [mul(k.f, len(r.u)), mul(k.o, len(r.v)), mul(k.d, ((t1 - t0) * k.L) / H)] }, under, lo: 0, hi: H, open: ANY, inside: ANY, kind: 'cuff', seed }, 0.9);
}
/** HIS ARM'S PLATES: the pauldron's cop and its three lames, the band round the upper arm, the couter's cup, the vambrace. */
export function armPlates(A: ArmBody, side: 'L' | 'R'): Plate[] {
  const seed = side === 'L' ? 3 : 5;
  const shoulder = [A.deltoid, ...A.upper];
  const out: Plate[] = [];
  out.push(enclosing({ name: 'the pauldron', part: `paul${side}`, e: grown(A.deltoid, PAULDRON.cop.k), under: shoulder, lo: -1, hi: PAULDRON.cop.to, open: ANY, inside: PAULDRON.cop.inside, kind: 'cop', seed }, 0.9));
  PAULDRON.lames.forEach((l, i) => out.push(enclosing({ name: 'the pauldron', part: `lame${side}${i}`, e: lameOf(A, l), under: shoulder, lo: LAME_TOP, hi: 0.05, open: ANY, inside: ANY, kind: 'lame', seed: seed + i }, 0.9)));
  out.push(bandOn('the band', `band${side}`, A.up, ARM_BAND, shoulder, 1.4, 1.2, seed));
  {
    const el = A.up.b;
    const along0 = norm(add(A.up.d, A.fore.d), A.up.d);
    const along = norm(sub(along0, mul(A.pole, dot(along0, A.pole))), A.up.d);
    const across = norm(cross(A.pole, along), A.up.o);
    out.push(enclosing({ name: 'the couter', part: `couter${side}`, e: { c: add(el, mul(A.pole, 2.6)), ax: [mul(A.pole, 5.6), mul(across, 6.6), mul(along, 7.6)] }, under: [A.upper[2], A.upper[3], ...A.forearm.slice(0, 3)], lo: -0.8, hi: 0.8, open: -0.12, inside: ANY, kind: 'cup', seed }, 0.8));
  }
  out.push(cuffOn('the vambrace', `vam${side}`, A.fore, VAMBRACE[0], VAMBRACE[1], A.forearm, 1.8, seed, 4.6));
  return out;
}
/** HIS LEG'S PLATES: the poleyn's cup and its lames above and below, the boot's cuff in two (its top flared). */
export function legPlates(G: LegBody, side: 'L' | 'R'): Plate[] {
  const seed = side === 'L' ? 7 : 9;
  const out: Plate[] = [];
  const knee = G.thigh.b;
  const along = norm(cross(G.ko, G.kf), [0, 0, 1]);
  const near = [...G.upper.slice(2), ...G.lower.slice(0, 4)];
  const cup = enclosing({ name: 'the poleyn', part: `knee${side}`, e: { c: add(knee, mul(G.kf, 2.4)), ax: [mul(G.kf, 6.0), mul(G.ko, 8.8), mul(along, 8.8)] }, under: near, lo: -0.8, hi: 0.8, open: -0.1, inside: ANY, kind: 'cup', seed }, 0.8);
  out.push({ ...cup, e: offFloor(cup.e) });
  out.push(bandOn('the poleyn', `kneeA${side}`, G.thigh, 0.83, G.upper, 1.0, 1.2, seed, -0.4));
  out.push(bandOn('the poleyn', `kneeB${side}`, G.shin, 0.15, G.lower, 1.0, 1.2, seed + 1, -0.4));
  out.push(cuffOn('the boot', `boot${side}`, G.shin, BOOT_TOP, 0.78, G.lower, 2.2, seed));
  out.push(bandOn('the boot', `bootB${side}`, G.shin, 0.86, G.lower, 1.6, 3.6, seed + 2, ANY, 5.6));
  return out.map((q) => ({ ...q, e: offFloor(q.e) }));
}
/** Which plate a ball of him is (so that what is painted of it, not the whole egg it is cut from, is what lies on the floor). */
const PLATE_OF = new WeakMap<object, Plate>();
/** The dark of a plate's open end (the inside of a boot's shaft, of a vambrace, of a pauldron), as it lies: an oval, not its square. */
const CAPS = new WeakSet<object>();
const HOLLOW = '#120e10';
/** The hollow of a plate seen through its open end (an oval `lu` by `lv`): the inside of its wall in a ring round it, dark iron
 * lit on one side, going down into the dark of it; never a flat black lid. */
function hollowSkin(lu: number, lv: number): PanelSkin {
  return (a, b) => {
    const q = (a / lu) ** 2 + (b / lv) ** 2;
    if (q > 1) return null;
    const side = b / lv;
    if (q > 0.62) return side > 0.25 ? ST_IRON[2] : side > -0.3 ? ST_IRON[1] : ST_IRON[0];
    if (q > 0.3 && side > 0.2) return ST_IRON[1];
    return HOLLOW;
  };
}
/** The dark mouths of a plate as it flies and lies, so that it reads as the hollow iron it is: its hollow across each open end. */
function mouthsOf(sh: Extract<Shape, { k: 'ball' }>, pl: Plate): Shape[] {
  const out: Shape[] = [];
  const oval = (c: V3, u: V3, v: V3): void => {
    const lu = len(u);
    const lv = len(v);
    const cap: Shape = { k: 'panel', c, u, v, skin: hollowSkin(lu, lv) };
    CAPS.add(cap);
    out.push(cap);
  };
  // (a band or a lame is a narrow ring of iron: the floor is seen through it, as through a ring; a cup, a cop or a cuff is deep)
  if (pl.kind === 'band' || pl.kind === 'lame') return out;
  for (const z of [pl.lo, pl.hi]) {
    if (z <= -0.98 || z >= 0.98 || pl.kind === 'cup') continue;
    const k = Math.sqrt(1 - z * z) * 0.96;
    oval(add(sh.c, mul(sh.ax[2], z)), mul(sh.ax[0], k), mul(sh.ax[1], k));
  }
  if (pl.kind === 'cup') {
    const k = Math.sqrt(1 - pl.open * pl.open) * 0.96;
    oval(add(sh.c, mul(sh.ax[0], pl.open)), mul(sh.ax[1], k), mul(sh.ax[2], Math.min(k, 0.8)));
  }
  return out;
}
/** A plate's ball (remembered as that plate). */
function plateBall(pl: Plate, skin: Skin): Shape {
  const sh: Shape = { k: 'ball', c: pl.e.c, ax: pl.e.ax, skin };
  PLATE_OF.set(sh, pl);
  return sh;
}
/** The lowest point of what is painted of a solid (of a plate, its iron only; of anything else, all of it); Infinity for what has no body. */
export function lowestPainted(sh: Shape): number {
  if (sh.k === 'panel' && CAPS.has(sh)) return sh.c[2] - Math.hypot(sh.u[2], sh.v[2]);
  const cut = SHARD_OF.get(sh);
  if (cut && sh.k === 'ball') return shardLowest(sh, cut);
  const pl = PLATE_OF.get(sh);
  if (!pl || sh.k !== 'ball') return lowestOf(sh);
  let low = Infinity;
  for (let i = 0; i <= 16; i++) {
    const z = Math.max(-1, Math.min(1, pl.lo + ((pl.hi - pl.lo) * i) / 16));
    const r = Math.sqrt(Math.max(0, 1 - z * z));
    for (let j = 0; j < 32; j++) {
      const a = (j / 32) * TAU;
      const u: V3 = [r * Math.cos(a), r * Math.sin(a), z];
      if (!inPlate(pl, u)) continue;
      low = Math.min(low, sh.c[2] + sh.ax[0][2] * u[0] + sh.ax[1][2] * u[1] + sh.ax[2][2] * u[2]);
    }
  }
  return Number.isFinite(low) ? low : lowestOf(sh);
}
/** A plate's iron: cut to its iron (null elsewhere: the plate is open there), its edges rolled (dark under, lit over), rivets, the cop's ridge, the cup's. */
function plateSkin(pl: Plate, cold: number): Skin {
  const iron = ironOf(cold);
  const lit = (tone: number): string => iron[Math.min(4, tone + 1)];
  return (u, tone) => {
    if (!inPlate(pl, u)) return null;
    const ang = Math.atan2(u[1], u[0]);
    const toHi = pl.hi - u[2];
    const toLo = u[2] - pl.lo;
    const toOpen = u[0] - pl.open;
    const toIn = u[1] - pl.inside;
    if (pl.kind === 'cop' || pl.kind === 'lame') {
      if (toHi < 0.05 || toIn < 0.05) return iron[0];
      if (toHi < 0.11) return lit(tone);
      if (pl.kind === 'lame' && toLo < 0.16 && toLo > 0.06 && fr(ang / (TAU / 12) + pl.seed * 0.21) < 0.22) return iron[4];
      if (pl.kind === 'cop' && Math.abs(u[0]) < 0.07 && u[1] > 0) return lit(tone);
    } else if (pl.kind === 'band') {
      if (toHi < 0.07 || toLo < 0.07 || toOpen < 0.06) return iron[0];
      if (toHi < 0.13 || toLo < 0.13) return lit(tone);
      if (Math.abs(u[2] - (pl.lo + pl.hi) / 2) < 0.08 && fr(ang / (TAU / 10) + pl.seed * 0.17) < 0.2) return iron[4];
    } else if (pl.kind === 'cup') {
      if (toOpen < 0.08 || toHi < 0.06 || toLo < 0.06) return iron[0];
      if (toOpen < 0.16) return lit(tone);
      if (Math.abs(u[1]) < 0.09 && u[0] > 0.45) return lit(tone);
      if (Math.abs(Math.abs(u[1]) - 0.62) < 0.1 && Math.abs(u[2]) < 0.12) return iron[4];
    } else {
      if (toLo < 0.06 || toHi < 0.05) return iron[0];
      if (toLo < 0.14) return lit(tone);
      if (Math.abs(toLo - 0.24) < 0.05 && fr(ang / (TAU / 10) + pl.seed * 0.23) < 0.2) return iron[4];
    }
    if (cold > 0.55 && noise2(u[0] * 4 + pl.seed, u[2] * 4, 53) > 0.74) return ST_ASH[Math.max(0, Math.min(2, 3 - tone))];
    return iron[tone5(tone - (noise2(u[0] * 2.6 + pl.seed, u[1] * 2.6 + u[2], 55) > 0.72 ? 1 : 0))];
  };
}

/**
 * NOTHING OF HIM THROUGH WHAT HE WEARS (his rulebook: nothing passing through the body; plates and cloth over what they cover, no
 * limb poking through a plate). What a point of his muscle comes through (`p`, on his arm or his leg, `side`, as he is posed), or
 * null: the point is put on the muscle it is on (the nearest skin of his eggs there), and each plate laid over that muscle asked
 * whether the point is outside its iron (it would come through it); and his skirt, whether it is a point of his thigh above its
 * hem. tests/stoker.test.ts puts every pixel of his muscle that is seen back where it is on him and asks this, from in front, from
 * behind and from either side: none may.
 */
export function coverOf(s: Skeleton): (limb: 'arm' | 'leg', side: 'L' | 'R', p: V3) => string | null {
  // (his muscles and his plates as he is posed, worked out once)
  const made = new Map<string, { eggs: Egg[]; plates: Plate[]; thighs: Egg[] }>();
  const of = (limb: 'arm' | 'leg', side: 'L' | 'R'): { eggs: Egg[]; plates: Plate[]; thighs: Egg[] } => {
    const key = limb + side;
    let m = made.get(key);
    if (!m) {
      if (limb === 'arm') {
        const A = armBody(s, side);
        m = { eggs: [A.deltoid, ...A.upper, ...A.forearm], plates: armPlates(A, side), thighs: [] };
      } else {
        const G = legBody(s, side);
        m = { eggs: [...G.upper, ...G.lower], plates: legPlates(G, side), thighs: G.upper };
      }
      made.set(key, m);
    }
    return m;
  };
  const hem = hemOf(s) + 1.0;
  return (limb, side, p) => {
    const muscles = of(limb, side);
    // (which muscle the point is on: the egg whose skin it is nearest)
    let on: Egg | null = null;
    let best = Infinity;
    for (const e of muscles.eggs) {
      const u = inEgg(e, p);
      const d = Math.abs(Math.hypot(u[0], u[1], u[2]) - 1) * Math.min(len(e.ax[0]), len(e.ax[1]), len(e.ax[2]));
      if (d < best) {
        best = d;
        on = e;
      }
    }
    if (!on) return null;
    for (const pl of muscles.plates) {
      if (!pl.under.includes(on)) continue;
      const u = inEgg(pl.e, p);
      const r = Math.hypot(u[0], u[1], u[2]);
      if (r > 1.0 && inPlate(pl, [u[0] / r, u[1] / r, u[2] / r], 0.04)) return pl.name;
    }
    if (limb === 'leg' && muscles.thighs.includes(on) && p[2] > hem) return 'the skirt';
    return null;
  };
}

/** How high his skirt's hem is (its ragged points hang a little below): 7 of his lengths above his knees, between them. */
export const hemOf = (s: Skeleton): number => (s.kneeL[2] + s.kneeR[2]) / 2 + 7;

/** HIS ARM, PAINTED: the muscle (one part, melted), the pauldron's plates over the shoulder, a band shaped to the upper arm, the couter, the vambrace, the gauntlet. */
function armBits(put: Put, s: Skeleton, side: 'L' | 'R', haft: { top: V3; way: V3 } | undefined, cold: number): void {
  const L = side === 'L';
  const A = armBody(s, side, haft);
  const iron = ironOf(cold);
  const flesh = `arm${side}`;
  const seed = L ? 3 : 5;
  // THE MUSCLE: the deltoid, the upper arm, the forearm, all of one part
  put(flesh, flesh, { k: 'ball', c: A.deltoid.c, ax: A.deltoid.ax, skin: wrapSkin(A.sh, A.deltoid, seed, cold, 5.2) });
  for (const e of A.upper) put(flesh, flesh, { k: 'ball', c: e.c, ax: e.ax, skin: wrapSkin(A.up, e, seed, cold) });
  for (const e of A.forearm) put(flesh, flesh, { k: 'ball', c: e.c, ax: e.ax, skin: wrapSkin(A.fore, e, seed + 1, cold, 4.2) });
  // THE PLATES, each laid round the muscle under it: the pauldron (its cop over the shoulder, riveted, its three lames shingled
  // down the arm), the band round the upper arm, the couter's cup over the elbow, the vambrace narrowing to the wrist
  for (const pl of armPlates(A, side)) put(pl.part, pl.part, plateBall(pl, plateSkin(pl, cold)));
  // (the couter's fan, out over the side of the elbow)
  {
    const el = A.up.b;
    const along0 = norm(add(A.up.d, A.fore.d), A.up.d);
    const along = norm(sub(along0, mul(A.pole, dot(along0, A.pole))), A.up.d);
    const o = norm(add(A.up.o, A.fore.o), A.up.o);
    const fan: Egg = { c: add(add(el, mul(o, 6.8)), mul(A.pole, 1.4)), ax: [mul(A.pole, 4.0), mul(o, 1.2), mul(along, 4.8)] };
    put(`couter${side}`, `couter${side}`, { k: 'ball', c: fan.c, ax: fan.ax, skin: fanSkin(cold) });
  }
  // THE GAUNTLET: a flared cuff over the wrist, the fist closed (round the haft, when it holds it): the back of the hand a plate, four fingers curled, the knuckles a ridge, the thumb over them
  {
    const { at, g, w, n } = A.grip;
    const wrist = add(at, mul(A.fore.d, -6.2));
    put(`hand${side}`, `hand${side}`, { k: 'rod', a: add(wrist, mul(A.fore.d, -5.0)), b: wrist, ra: 6.6, rb: 5.6, ramp: iron });
    put(`hand${side}`, `hand${side}`, { k: 'band', ring: { c: add(wrist, mul(A.fore.d, -4.4)), u: mul(A.fore.f, 6.7), v: mul(A.fore.o, 6.7) }, ramp: iron, rows: 2 });
    const fist: Egg = { c: add(add(at, mul(w, -0.8)), mul(n, 0.6)), ax: [mul(g, 6.6), mul(w, 6.2), mul(n, 5.6)] };
    put(`hand${side}`, `hand${side}`, { k: 'ball', c: fist.c, ax: fist.ax, skin: fistSkin(at, g, w, n, fist, cold) });
    put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(add(at, mul(w, 1.8)), mul(n, 4.0)), ax: [mul(g, 6.4), mul(w, 2.2), mul(n, 2.0)], skin: forgedSkin(seed + 7, cold) });
    const th0 = add(add(add(at, mul(w, -3.4)), mul(n, -3.2)), mul(g, 3.6));
    const th1 = add(add(add(at, mul(w, 1.4)), mul(n, -4.4)), mul(g, 2.2));
    put(`hand${side}`, `hand${side}`, { k: 'rod', a: th0, b: th1, ra: 2.2, rb: 1.7, ramp: iron });
  }
}

/** HIS LEG, PAINTED: the muscle (thigh and calf, one part), the poleyn over the knee with its fan and its lames, the iron boot with its toe and its heel. */
function legBits(put: Put, s: Skeleton, side: 'L' | 'R', cold: number): void {
  const L = side === 'L';
  const G = legBody(s, side);
  const iron = ironOf(cold);
  const seed = L ? 7 : 9;
  const flesh = `leg${side}`;
  // (his thighs under his skirt: painted only below its hem, and a little up under it)
  for (const e of G.upper) put(flesh, flesh, { k: 'ball', c: e.c, ax: e.ax, skin: wrapSkin(G.thigh, e, seed, cold, 5.4, hemOf(s) + 0.5) });
  for (const e of G.lower) put(flesh, flesh, { k: 'ball', c: e.c, ax: e.ax, skin: wrapSkin(G.shin, e, seed + 1, cold, 4.8) });
  // THE PLATES: the poleyn (a cup fitting the front of the knee, a lame above it on the thigh and one below on the shin), the boot's cuff up the calf, flared at its top
  for (const pl of legPlates(G, side)) put(pl.part, pl.part, plateBall(pl, plateSkin(pl, cold)));
  {
    const knee = G.thigh.b;
    const along = norm(cross(G.ko, G.kf), [0, 0, 1]);
    const fan = offFloor({ c: add(add(knee, mul(G.ko, 8.6)), mul(G.kf, 1.0)), ax: [mul(G.kf, 5.4), mul(G.ko, 1.4), mul(along, 6.6)] });
    put(`knee${side}`, `knee${side}`, { k: 'ball', c: fan.c, ax: fan.ax, skin: fanSkin(cold) });
  }
  // THE FOOT: shaped from behind its heel to its toe, lames across the instep, a sole under it
  {
    const heel = L ? s.heelL : s.heelR;
    const toe = L ? s.toeL : s.toeR;
    const along = norm(sub(toe, heel), [1, 0, 0]);
    const across = norm(cross([0, 0, 1], along), [0, 1, 0]);
    const up = norm(cross(along, across), [0, 0, 1]);
    // (the foot's rings, from behind the heel to the toe's tip: where along it from the heel, how high its middle, half its height and its width)
    const FOOT: [number, number, number, number][] = [[-2.6, 3.4, 3.1, 4.4], [0.4, 4.6, 4.6, 5.8], [5.0, 5.0, 5.0, 6.4], [11.0, 3.8, 3.8, 6.8], [16.0, 2.9, 2.9, 6.0], [19.4, 2.4, 2.2, 4.2], [20.6, 2.2, 1.2, 2.4]];
    const ring = (x: number, z: number, hh: number, hw: number): Ring => ({ c: add(add(heel, mul(along, x)), mul(up, z)), u: mul(up, hh), v: mul(across, hw) });
    const rings = FOOT.map(([x, z, hh, hw]) => ring(x, z, hh, hw));
    const sole = FOOT.map(([x, , , hw]) => ring(x, 1.0, 1.0, hw + 0.5));
    const low = Math.min(...[...rings, ...sole].map((r) => r.c[2] - Math.hypot(r.u[2], r.v[2])));
    const lift: V3 = [0, 0, Math.max(0, 0.1 - low)];
    const raise = (r: Ring): Ring => ({ c: add(r.c, lift), u: r.u, v: r.v });
    put(`foot${side}`, `foot${side}`, { k: 'cloth', rings: rings.map(raise), ramp: iron, look: { lift: 0.04 } });
    put(`foot${side}`, `foot${side}`, { k: 'cloth', rings: sole.map(raise), ramp: [ST_CRUST[0], ST_CRUST[0], ST_LEATHER[1], ST_LEATHER[2], ST_LEATHER[2]], look: { lift: 0 } });
    for (const x of [7.4, 10.6, 13.8]) {
      const r = ring(x, 0, 0, 0);
      const k = Math.max(0, Math.min(FOOT.length - 2, FOOT.findIndex((q) => q[0] > x) - 1));
      const a = FOOT[k];
      const b = FOOT[k + 1];
      const m = (x - a[0]) / (b[0] - a[0]);
      const z = a[1] + (b[1] - a[1]) * m;
      const hh = a[2] + (b[2] - a[2]) * m + 0.3;
      const hw = a[3] + (b[3] - a[3]) * m + 0.3;
      put(`foot${side}`, `foot${side}`, { k: 'band', ring: { c: add(add(r.c, mul(up, z)), lift), u: mul(up, hh), v: mul(across, hw) }, ramp: iron, rows: 1 });
    }
  }
}

/**
 * THE FURNACE MASK'S HELM, as worked out from his bones: one shape of iron from its crown to its jaw (rings round it, `HELM`: how
 * far up from its middle, how far it is put forward, its half-depth and its half-width): a domed crown, straight sides, the jaw
 * flaring out wider than the crown and jutting before the face, closing under the chin; a heavy brow over the slits for his eyes;
 * a crest over the crown; the grille set in the jaw's front.
 */
export const HELM: ReadonlyArray<readonly [number, number, number, number]> = [
  [9.0, -0.6, 2.4, 2.8],
  [7.6, -0.4, 6.4, 7.0],
  [4.6, 0, 8.6, 9.2],
  [0.6, 0.3, 8.8, 9.4],
  [-3.4, 1.3, 9.4, 10.6],
  [-7.6, 2.2, 9.4, 11.2],
  [-10.6, 2.2, 8.0, 9.8],
  [-12.0, 1.6, 4.8, 6.0],
];
export interface HelmBody {
  /** Its middle and its frame (the face's). */
  c: V3;
  f: V3;
  l: V3;
  u: V3;
  rings: Ring[];
  brow: Egg;
  crest: Egg;
  eyes: [V3, V3];
}
export function helmOf(s: Skeleton): HelmBody {
  const [ff, fl, fu] = s.face;
  const c = add(add(s.head, mul(fu, -2.2)), mul(ff, -0.8));
  const rings: Ring[] = HELM.map(([z, fwd, hd, hw]) => ({ c: add(add(c, mul(fu, z)), mul(ff, fwd)), u: mul(ff, hd), v: mul(fl, hw) }));
  const crest: Egg = { c: add(add(c, mul(fu, 8.4)), mul(ff, -0.6)), ax: [mul(ff, 7.6), mul(fl, 1.5), mul(fu, 2.0)] };
  const brow: Egg = { c: add(add(c, mul(ff, 8.2)), mul(fu, 3.2)), ax: [mul(ff, 2.6), mul(fl, 9.6), mul(fu, 1.9)] };
  const eye = (k: number): V3 => add(add(add(c, mul(ff, 9.0)), mul(fl, 3.8 * k)), mul(fu, 1.2));
  return { c, f: ff, l: fl, u: fu, rings, brow, crest, eyes: [eye(-1), eye(1)] };
}
/** A slit for an eye: dark, the enemy's pink burning deep in it (gold as he winds up). */
function slitSkin(cold: number, heat: number, ember = false): PanelSkin {
  return (a, b, front) => {
    if (!front) return null;
    if (Math.abs(b) > 0.95 || Math.abs(a) > 2.7) return INK;
    if (cold > 0.5) return INK;
    if (ember) return Math.abs(b) < 0.45 ? EMBER[4] : EMBER[3];
    return Math.abs(b) < 0.45 ? (heat > 0.95 ? FLAME[3] : FLAME[2]) : FLAME[1];
  };
}
/** The grille set in the jaw: a frame, bars across it, his fire behind them. */
function grilleSkin(heat: number, cold: number, t: number): PanelSkin {
  const iron = ironOf(cold);
  return (a, b, front, tone) => {
    if (!front) return iron[1];
    if (Math.abs(a) > 5.6 || Math.abs(b) > 3.6) return iron[0];
    if (Math.abs(a) > 4.8 || Math.abs(b) > 2.9) return iron[Math.min(4, tone + 1)];
    if (fr((b + 2.9) / 1.45) < 0.45) return iron[Math.min(4, tone + 1)];
    const flick = noise2(a * 0.9 + t * 5, b * 0.8, 71);
    return cold > 0.6 ? ST_DEEP : coalAt(Math.max(0.2, heat), 0.5 + 0.5 * flick);
  };
}
/** The helm's rivets: a row round its sides under the brow, and round the jaw's flare. */
function helmRivets(h: HelmBody, put: Put, cold: number): void {
  const iron = ironOf(cold);
  for (const [z, fwd, hd, hw] of [[-3.0, 1.2, 9.5, 10.7], [-9.0, 2.2, 9.1, 10.9]] as const) {
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU;
      if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.7) continue;
      const out = norm(add(mul(h.f, Math.cos(a)), mul(h.l, Math.sin(a))));
      const p = add(add(add(h.c, mul(h.u, z)), mul(h.f, fwd)), add(mul(h.f, Math.cos(a) * hd * 1.02), mul(h.l, Math.sin(a) * hw * 1.02)));
      put('head', 'head', { k: 'dot', p, c: iron[4], facing: out });
    }
  }
}

/** HIS HEAD, PAINTED: on a thick neck (an iron gorget flaring down into his shoulders), the helm: a crown with a crest, a heavy brow, the jaw with the grille. */
function headBits(put: Put, s: Skeleton, heat: number, cold: number, t: number, dying = false): void {
  const iron = ironOf(cold);
  const [, , uu] = s.upper;
  const H = helmOf(s);
  // THE NECK: a thick gorget of iron, three lames, flaring down into the firebox between his shoulders
  {
    const top = lerp3(s.neck, s.skull, 0.55);
    const [cf, cl] = s.upper;
    const rings: Ring[] = [
      { c: add(s.neck, mul(uu, -5)), u: mul(cf, 11.4), v: mul(cl, 12.4) },
      { c: add(s.neck, mul(uu, -1)), u: mul(cf, 10.2), v: mul(cl, 11.0) },
      { c: lerp3(s.neck, top, 0.5), u: mul(cf, 8.8), v: mul(cl, 9.4) },
      { c: top, u: mul(cf, 8.0), v: mul(cl, 8.4) },
    ];
    put('collar', 'collar', { k: 'cloth', rings, ramp: iron, look: { lift: 0.3 } });
    for (const r of [rings[1], rings[2]]) put('collar', 'collar', { k: 'band', ring: { c: add(r.c, mul(uu, 0.4)), u: mul(r.u, 1.03), v: mul(r.v, 1.03) }, ramp: iron, rows: 1 });
  }
  put('head', 'head', { k: 'cloth', rings: H.rings, ramp: iron, look: { lift: 0.06 } });
  put('head', 'head', { k: 'ball', c: H.crest.c, ax: H.crest.ax, skin: forgedSkin(19, cold) });
  put('head', 'head', { k: 'ball', c: H.brow.c, ax: H.brow.ax, skin: forgedSkin(23, cold) });
  // (the slits for his eyes, each laid on the helm where it is, under the brow; the grille in the jaw's front, tipped as it juts)
  for (const p of H.eyes) {
    const out = norm(sub(p, add(H.c, mul(H.u, dot(sub(p, H.c), H.u)))), H.f);
    const across = norm(cross(H.u, out));
    put('head', 'head', { k: 'panel', c: add(p, mul(out, 0.5)), u: mul(across, -3.2), v: mul(H.u, -1.1), skin: slitSkin(cold, heat, dying) });
  }
  {
    const down = norm(add(mul(H.u, -4.2), mul(H.f, 0.9)));
    put('head', 'head', { k: 'panel', c: add(add(H.c, mul(H.u, -5.6)), mul(H.f, 11.4)), u: mul(H.l, -5.6), v: mul(down, 3.6), skin: grilleSkin(heat, cold, t) });
  }
  helmRivets(H, put, cold);
  if (cold < 0.5) {
    const eye = dying ? EMBER[4] : heat > 0.95 ? ST_EYE_HOT : ST_EYE;
    for (const p of H.eyes) put('head', 'eye', { k: 'dot', p: add(p, mul(H.f, 1.0)), c: eye, facing: s.face[0], c2: eye });
    if (heat > 0.9) put('glint', 'glint', { k: 'glow', p: add(lerp3(H.eyes[0], H.eyes[1], 0.5), mul(s.face[0], 2)), c: dying ? EMBER[3] : FLAME[3], r: 8 + 6 * (heat - 0.9), a: 0.3 });
  }
}

// =============================================================================================
// PAINTING HIM

/** What a moment paints over and above its solids (laid after his edge): sparks, smoke, soot, his smear. */
const MORE = new WeakMap<Moment, [V3, string, number][]>();

function stokerBits(st: Stage, m: Moment, say: StokerSay): Bit[] {
  const D0 = ST_DEATH;
  // (HIS DEATH, from the burst: what he flies apart into)
  if (m.dying && m.t >= D0.hit - 1e-9) return blastBits(st, m, say);
  const { s } = m;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const t = m.t;
  const dying = m.dying === true;
  // (his firebox overloading as he dies: `sw` how far, and in the strike's frame cracking open white)
  const sw = dying ? smooth(D0.build[0], D0.strike[0], t) : 0;
  const cracking = dying && t > D0.strike[0] + 1e-6;
  const heat = cracking ? 1.9 : Math.max(0, say.heat(m));
  const door = clamp01(say.door(m));
  const cold = clamp01(say.cold(m));
  const iron = ironOf(cold);
  const seams = cracking ? 1 : sw;
  const bulge = 1 + sw * (0.06 + 0.025 * Math.sin(t * 45)) + (cracking ? 0.05 : 0);
  // HIS LEGS: thick thighs under his skirt, a shaped knee under its poleyn, calves swelling and tapering into iron boots
  legBits(put, s, 'L', cold);
  legBits(put, s, 'R', cold);
  // HIS SKIRT of scorched leather, from under his belly over his thighs to above his knees, its hem burnt ragged
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  {
    const top = add(s.pelvis, mul(s.hips[2], 3));
    const knees: V3 = [(s.kneeL[0] + s.kneeR[0]) / 2, (s.kneeL[1] + s.kneeR[1]) / 2, hemOf(s)];
    const apart = Math.abs(dot(sub(s.kneeL, s.kneeR), f));
    const levels: [number, V3][] = [1, 0.9, 0.8, 0.65, 0.5, 0.3, 0].map((k): [number, V3] => [k, lerp3(top, knees, k)]);
    // (laid over his thighs as they are posed: never closer in than their muscle and a little slack, so that no thigh comes through it)
    const thighs = [...legBody(s, 'L').upper, ...legBody(s, 'R').upper];
    const rings: Ring[] = levels.map(([k, c], i) => {
      const deep = B.pelvisDeep + 5 + 4 * k + 0.5 * apart * k;
      const wide = B.pelvisHalf + 5.5 + 4.5 * k;
      const pts: V3[] = [];
      const rs: number[] = [];
      let rf = deep;
      let rl = wide;
      for (let j = 0; j < 20; j++) {
        const a = (j / 20) * TAU;
        const drop = i === 0 ? 1.6 * noise2(j * 1.3, 2, 101) : 0;
        const dir = add(mul(f, Math.cos(a)), mul(l, Math.sin(a)));
        const r = Math.max(Math.hypot(Math.cos(a) * deep, Math.sin(a) * wide), outFrom(thighs, c, dir) + 3.2);
        rf = Math.max(rf, Math.abs(r * Math.cos(a)));
        rl = Math.max(rl, Math.abs(r * Math.sin(a)));
        pts.push(add(add(c, mul(dir, r)), [0, 0, -drop]));
        rs.push(r);
      }
      const kk = Math.max(1, ...rs.map((r, j) => r / Math.hypot(rf * Math.cos((j / 20) * TAU), rl * Math.sin((j / 20) * TAU))));
      return { c, u: mul(f, rf * kk), v: mul(l, rl * kk), pts };
    });
    put('skirt', 'skirt', { k: 'cloth', rings, ramp: ST_LEATHER, look: { folds: [0, 30, -30, 70, -70, 115, -115, 160, -160], lift: 0.02 } });
  }
  // HIS FIREBOX: the great iron belly; its domed top; the collar round his neck
  const bl = bellyOf(s);
  put('belly', 'belly', { k: 'ball', c: bl.c, ax: [mul(bl.ax[0], bulge), mul(bl.ax[1], bulge), mul(bl.ax[2], bulge)], skin: bellySkin(s, heat, door, cold, t, seams) });
  const dm = domeOf(s);
  put('belly', 'dome', { k: 'ball', c: dm.c, ax: [mul(dm.ax[0], bulge), mul(dm.ax[1], bulge), mul(dm.ax[2], bulge)], skin: domeSkin(cold, seams, t) });
  // THE FIRE-DOOR, its grate glowing; hinged on his left (pushed out as his firebox bulges)
  const dr0 = doorOf(s, door);
  const pushed = mul(s.belly[0], bl.r[0] * (bulge - 1));
  const dr = { ...dr0, c: add(dr0.c, pushed), handle: add(dr0.handle, pushed) };
  put('door', 'door', { k: 'panel', c: dr.c, u: dr.u, v: dr.v, skin: doorSkin(heat, cold, t) });
  put('door', 'door', { k: 'rod', a: add(dr.handle, mul(dr.v, -0.25)), b: add(dr.handle, mul(dr.v, 0.25)), ra: 1.2, rb: 1.2, ramp: iron });
  if (cold < 0.5 && heat > 0.05) put('glow', 'glow', { k: 'glow', p: add(doorFrameOf(s).c, mul(s.belly[0], 6)), c: EMBER[2], r: 30 + 30 * Math.min(1.5, heat) + 24 * door, a: Math.min(0.5, 0.18 + 0.22 * heat + 0.1 * door) });
  // HIS FLUE out of his back
  const fl = flueOf(s);
  for (let i = 1; i < fl.length; i++) put('flue', 'flue', { k: 'rod', a: fl[i - 1], b: fl[i], ra: i === 1 ? FLUE_R + 0.8 : FLUE_R, rb: FLUE_R, ramp: iron });
  for (let i = 1; i < fl.length; i++) put('flue', 'flueband', { k: 'band', ring: { c: fl[i], u: mul(norm(cross(sub(fl[i], fl[i - 1]), [0, 1, 0]), [1, 0, 0]), FLUE_R + 0.7), v: mul(norm(cross(sub(fl[i], fl[i - 1]), [1, 0, 0]), [0, 1, 0]), FLUE_R + 0.7) }, ramp: iron, rows: 2 });
  const capA = fl[fl.length - 1];
  const capWay = norm(sub(fl[fl.length - 1], fl[fl.length - 2]));
  put('flue', 'cap', { k: 'rod', a: add(capA, mul(capWay, 1.5)), b: add(capA, mul(capWay, 4.5)), ra: FLUE_R + 2.6, rb: 1.2, ramp: iron });
  // HIS ARMS: a great deltoid under a riveted pauldron of overlapping plates, the upper arm swelling and tapering under its wraps
  // and an iron band, the couter at the elbow, the forearm thick at the top and narrowing into a vambrace, gauntleted fists
  {
    const sv0 = shovelOf(s, say.face(m), say.hold(m));
    const haft = say.held(m) ? { top: sv0.top, way: sv0.haftWay } : undefined;
    armBits(put, s, 'L', haft, cold);
    armBits(put, s, 'R', haft, cold);
  }
  // HIS HEAD: the furnace mask's helm on a thick neck sunk between his shoulders
  headBits(put, s, heat, cold, t, dying);
  // THE GREAT SHOVEL, in his right fist (dropped as he dies: its own piece, `shovel`, falls as the game's dying monsters' pieces
  // fall, new_mobs3 `fallApart`, which lets the piece go from the moment it falls and lays it on the floor)
  const grains: [V3, string, number][] = [];
  if (dying && t >= D0.drop) {
    // (let fall from his fist as his firebox overloads: lying where it fell)
    for (const b of shovelLying(st, m, say, t)) bits.push(b);
  } else {
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
  // HIS FIREBOX OVERLOADING as he dies: rivets popping off it in sparks, steam and smoke jetting from his flue and his joints, a
  // white flash in the strike's frame; and all of him above his knees shaking
  if (dying && sw > 0.01) {
    overloadGrains(st, grains, s, t, sw, cracking);
    if (cracking) put('glow', 'glow', { k: 'glow', p: bl.c, c: EMBER[4], r: 140, a: 0.6 });
    const sh = shakeAt('dying', t);
    if (len(sh) > 1e-6) {
      const still = /^(leg|knee|kneeA|kneeB|boot|bootB|foot)[LR]$|^shovel$|^glow$/;
      for (let i = 0; i < bits.length; i++) if (!still.test(bits[i].part)) bits[i] = { ...bits[i], shape: shifted(bits[i].shape, sh) };
    }
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

/** A SOLID OF HIM TRULY TURNED `deg` to his left about the upright through his floor point (for seeing him from the side: 45 puts his right side square to the game's eye, -135 his left), never his picture flipped. For the pictures and the checks. */
export function turnedShape(sh: Shape, deg: number): Shape {
  const a = deg * D;
  const T = (v: V3): V3 => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), v[2]];
  const R = (r: Ring): Ring => ({ c: T(r.c), u: T(r.u), v: T(r.v), ...(r.pts ? { pts: r.pts.map(T) } : {}) });
  switch (sh.k) {
    case 'rod': return { ...sh, a: T(sh.a), b: T(sh.b) };
    case 'ball': return { ...sh, c: T(sh.c), ax: [T(sh.ax[0]), T(sh.ax[1]), T(sh.ax[2])] };
    case 'cloth': return { ...sh, rings: sh.rings.map(R) };
    case 'band': return { ...sh, ring: R(sh.ring) };
    case 'panel': return { ...sh, c: T(sh.c), u: T(sh.u), v: T(sh.v) };
    case 'thread': return { ...sh, a: T(sh.a), b: T(sh.b) };
    case 'dot': return { ...sh, p: T(sh.p), facing: T(sh.facing) };
    case 'teeth': return { ...sh, pts: sh.pts.map(T), facing: sh.facing.map(T) };
    case 'mote': return { ...sh, p: T(sh.p) };
    case 'glow': return { ...sh, p: T(sh.p) };
    case 'greatsword': return { ...sh, grip: T(sh.grip), point: T(sh.point) };
  }
}
/** A point of him turned as `turnedShape` turns him. */
export const turnedPoint = (v: V3, deg: number): V3 => [v[0] * Math.cos(deg * D) - v[1] * Math.sin(deg * D), v[0] * Math.sin(deg * D) + v[1] * Math.cos(deg * D), v[2]];

// =============================================================================================
// HIS DEATH: THE FURNACE EXPLODES (`ST_DEATH`)

/** How far all of him above his knees is shaken, at a moment of a move (his lengths): only as his firebox overloads in his death. */
export function shakeAt(move: string, t: number): V3 {
  if (move !== 'dying') return [0, 0, 0];
  const D0 = ST_DEATH;
  if (t >= D0.hit) return [0, 0, 0];
  const k = ST_SHAKE_DEATH.amp * smooth(D0.build[0] + 0.2, D0.strike[0] - 0.1, t);
  const w = ST_SHAKE_DEATH.hz * TAU;
  return [k * Math.sin(w * t), k * Math.cos(w * t * 1.31 + 0.7), 0];
}
/** A solid of him moved by `d`. */
function shifted(sh: Shape, d: V3): Shape {
  return movedShape(sh, (v) => v, [0, 0, 0], d);
}
/** A solid of him turned by `rot` about `c0` and set down at `c1`. */
function movedShape(sh: Shape, rot: (v: V3) => V3, c0: V3, c1: V3): Shape {
  const out = movedShape0(sh, rot, c0, c1);
  const pl = PLATE_OF.get(sh);
  if (pl) PLATE_OF.set(out, pl);
  if (CAPS.has(sh)) CAPS.add(out);
  const cut = SHARD_OF.get(sh);
  if (cut) SHARD_OF.set(out, cut);
  return out;
}
function movedShape0(sh: Shape, rot: (v: V3) => V3, c0: V3, c1: V3): Shape {
  const P = (p: V3): V3 => add(c1, rot(sub(p, c0)));
  switch (sh.k) {
    case 'rod':
    case 'thread':
      return { ...sh, a: P(sh.a), b: P(sh.b) };
    case 'ball':
      return { ...sh, c: P(sh.c), ax: [rot(sh.ax[0]), rot(sh.ax[1]), rot(sh.ax[2])] };
    case 'cloth':
      return { ...sh, rings: sh.rings.map((r) => ({ c: P(r.c), u: rot(r.u), v: rot(r.v), ...(r.pts ? { pts: r.pts.map(P) } : {}) })) };
    case 'band':
      return { ...sh, ring: { c: P(sh.ring.c), u: rot(sh.ring.u), v: rot(sh.ring.v) } };
    case 'panel':
      return { ...sh, c: P(sh.c), u: rot(sh.u), v: rot(sh.v) };
    case 'dot':
      return { ...sh, p: P(sh.p), facing: rot(sh.facing) };
    case 'teeth':
      return { ...sh, pts: sh.pts.map(P), facing: sh.facing.map(rot) };
    case 'mote':
    case 'glow':
      return { ...sh, p: P(sh.p) };
    case 'greatsword':
      return { ...sh, grip: P(sh.grip), point: rot(sh.point) };
  }
}
/** The lowest a solid comes (its lowest point's height above the floor); Infinity for what has no body (a light, a speck, a dot). */
export function lowestOf(sh: Shape): number {
  if (sh.k === 'rod') return Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  if (sh.k === 'ball') return sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  if (sh.k === 'band') return sh.ring.c[2] - Math.hypot(sh.ring.u[2], sh.ring.v[2]);
  if (sh.k === 'cloth') return Math.min(...sh.rings.map((r) => Math.min(r.c[2] - Math.hypot(r.u[2], r.v[2]), ...(r.pts ?? []).map((q) => q[2]))));
  if (sh.k === 'panel') return sh.c[2] - Math.abs(sh.u[2]) - Math.abs(sh.v[2]);
  return Infinity;
}
/** The middle of what a piece is made of. */
function middleOfBits(bits: ReadonlyArray<Bit>): V3 {
  let sum: V3 = [0, 0, 0];
  let n = 0;
  for (const b of bits) {
    const sh = b.shape;
    const c = sh.k === 'rod' ? lerp3(sh.a, sh.b, 0.5) : sh.k === 'ball' || sh.k === 'panel' ? sh.c : sh.k === 'band' ? sh.ring.c : sh.k === 'cloth' ? sh.rings[Math.floor(sh.rings.length / 2)].c : null;
    if (!c) continue;
    sum = add(sum, c);
    n++;
  }
  return n ? mul(sum, 1 / n) : [0, 0, 0];
}
/** A turn as a line about which, and how far (degrees); `frameTurn` the turn that takes `a1` to `b1` and `a2` (made square to it) as near to `b2` as it goes. */
interface Turn3 {
  axis: V3;
  deg: number;
}
function frameTurn(a1: V3, b1: V3, a2: V3, b2: V3): Turn3 {
  const e1 = norm(a1);
  const e2 = norm(sub(a2, mul(e1, dot(a2, e1))), norm(cross(e1, [0, 0, 1]), [1, 0, 0]));
  const e3 = cross(e1, e2);
  const f1 = norm(b1);
  const f2 = norm(sub(b2, mul(f1, dot(b2, f1))), norm(cross(f1, [1, 0, 0]), [0, 1, 0]));
  const f3 = cross(f1, f2);
  // (the turn as a table: R = F Eᵀ)
  const R = (i: number, j: number): number => f1[i] * e1[j] + f2[i] * e2[j] + f3[i] * e3[j];
  const tr = R(0, 0) + R(1, 1) + R(2, 2);
  const ang = Math.acos(Math.max(-1, Math.min(1, (tr - 1) / 2)));
  if (ang < 1e-4) return { axis: [0, 0, 1], deg: 0 };
  if (Math.PI - ang < 1e-3) {
    // (half a turn round: the line it turns about from the table's diagonal)
    const x = Math.sqrt(Math.max(0, (R(0, 0) + 1) / 2));
    const y = Math.sqrt(Math.max(0, (R(1, 1) + 1) / 2)) * (R(0, 1) >= 0 ? 1 : -1);
    const z = Math.sqrt(Math.max(0, (R(2, 2) + 1) / 2)) * (R(0, 2) >= 0 ? 1 : -1);
    return { axis: norm([x, y, z], [0, 0, 1]), deg: 180 };
  }
  const axis = norm([R(2, 1) - R(1, 2), R(0, 2) - R(2, 0), R(1, 0) - R(0, 1)], [0, 0, 1]);
  return { axis, deg: ang / D };
}
/** How a piece of him flies when he bursts (or falls from his fist): the way it goes over the floor, how far, how high above where it starts, how many times it tumbles end over end, its hop and its slide as it lands, and how it lies once it is down. */
interface Flight {
  way: V3;
  dist: number;
  up: number;
  turns: number;
  hop: number;
  slide: number;
  lay: Turn3;
}
const FLIGHT_G = 900;
/** A piece (its solids as they were when it let go, `c0` their middle) `tau` seconds into its flight: where its solids are, where it comes to rest, and when it is still. */
function flown(bits0: ReadonlyArray<Bit>, c0: V3, F: Flight, tau: number): { bits: Bit[]; rest: V3; still: number } {
  const g = FLIGHT_G;
  const lay = (k: number) => (v: V3): V3 => about(v, F.lay.axis, F.lay.deg * k);
  const tumbleAxis = norm(cross(F.way, [0, 0, 1]), [0, 1, 0]);
  const at = (k: number) => (v: V3): V3 => lay(k)(about(v, tumbleAxis, 360 * F.turns * k));
  // (as it lies: its lowest point on the floor)
  let low = Infinity;
  for (const b of bits0) low = Math.min(low, lowestPainted(movedShape(b.shape, lay(1), c0, [0, 0, 0])));
  if (!Number.isFinite(low)) low = 0;
  const zRest = -low + 0.3;
  const vz = Math.sqrt(2 * g * Math.max(0, F.up));
  const T = (vz + Math.sqrt(vz * vz + 2 * g * Math.max(0, c0[2] - zRest))) / g;
  const hopT = 2 * Math.sqrt((2 * Math.max(0.01, F.hop)) / g);
  let k = 1;
  let c1: V3;
  const xy = (d: number): V3 => [c0[0] + F.way[0] * d, c0[1] + F.way[1] * d, 0];
  if (tau < T) {
    k = tau / T;
    const q = xy(F.dist * k);
    c1 = [q[0], q[1], c0[2] + vz * tau - (g * tau * tau) / 2];
  } else if (tau < T + hopT) {
    const v = (tau - T) / hopT;
    const q = xy(F.dist + F.slide * v);
    c1 = [q[0], q[1], zRest + F.hop * Math.sin(Math.PI * v)];
  } else {
    const q = xy(F.dist + F.slide);
    c1 = [q[0], q[1], zRest];
  }
  let bits = bits0.map((b) => ({ ...b, shape: movedShape(b.shape, at(k), c0, c1) }));
  // (never into the floor on its way down)
  const lowNow = Math.min(...bits.map((b) => lowestPainted(b.shape)));
  if (Number.isFinite(lowNow) && lowNow < 0.15) bits = bits.map((b) => ({ ...b, shape: shifted(b.shape, [0, 0, 0.15 - lowNow]) }));
  const r = xy(F.dist + F.slide);
  return { bits, rest: [r[0], r[1], zRest], still: T + hopT };
}
/** A piece's flight as he bursts, from where it is to the middle of the blast (`o`): clear out of the fireball, high, tumbling; then lying as the piece lies (`lay`). */
function blastFlight(piece: string, c0: V3, o: V3, lay: Turn3, heavy = 1, aim?: { ang: number; ring: number }): Flight {
  const h = (k: number): number => {
    let x = 0;
    for (let i = 0; i < piece.length; i++) x = (x * 31 + piece.charCodeAt(i)) | 0;
    return hash(x, k, 171);
  };
  let w = [c0[0] - o[0], c0[1] - o[1], 0] as V3;
  if (len(w) < 3) w = [Math.cos(h(1) * TAU), Math.sin(h(1) * TAU), 0];
  const way = norm(about(norm(w), [0, 0, 1], (h(2) - 0.5) * 50), [1, 0, 0]);
  if (aim) return { way: [Math.cos(aim.ang), Math.sin(aim.ang), 0], dist: (aim.ring * (92 + 16 * h(3))) / heavy ** 0.5, up: (24 + 36 * h(4)) / Math.sqrt(heavy), turns: 1 + Math.floor(2.4 * h(5)), hop: 2 + 4 * h(6), slide: 3 + 5 * h(7), lay };
  return { way, dist: (62 + 52 * h(3)) / heavy, up: (24 + 36 * h(4)) / Math.sqrt(heavy), turns: 1 + Math.floor(2.4 * h(5)), hop: 2 + 4 * h(6), slide: 3 + 6 * h(7), lay };
}
/** Which whole thing of him a piece belongs to as it flies (his pauldron with its lames, his gauntlet with its vambrace, his poleyn with its lames, his boot with its foot): each lies as the thing it was. */
export function wholeOf(piece: string): string {
  let m: RegExpExecArray | null;
  if ((m = /^(paul|lame)([LR])\d?$/.exec(piece))) return `pauldron${m[2]}`;
  if ((m = /^(vam|hand)([LR])$/.exec(piece))) return `gauntlet${m[2]}`;
  if ((m = /^(knee|kneeA|kneeB)([LR])$/.exec(piece))) return `poleyn${m[2]}`;
  if ((m = /^(couter|band)([LR])$/.exec(piece))) return `couter${m[2]}`;
  if ((m = /^(boot|bootB|foot)([LR])$/.exec(piece))) return `boot${m[2]}`;
  return piece;
}
/** How each thing of him lies once it is down, so that it reads as what it was, seen from above: a pauldron or a poleyn or a couter rocked on its back, its dark hollow up and tipped; a band flat; a boot fallen on its side, shaft and toe; his helm on its back, its grille up; his door and the shards of his firebox flat, face up; the rest along their length, out from the blast. */
function layOf(whole: string, bits0: ReadonlyArray<Bit>, way: V3, screenX: V3 = [1, 0, 0]): Turn3 {
  const across = norm(about(way, [0, 0, 1], 90));
  // (out to the side as the picture is seen, away from the blast; and across the floor the other way, into the picture)
  const sx0 = norm([screenX[0], screenX[1], 0], [1, 0, 0]);
  const side = mul(sx0, dot(sx0, way) >= 0 ? 1 : -1);
  const deep = norm(cross([0, 0, 1], sx0));
  const tilt = (deg: number): V3 => norm(add(mul([0, 0, 1], Math.cos(deg * D)), mul(side, Math.sin(deg * D))));
  const plate = (kind: Plate['kind']): Extract<Shape, { k: 'ball' }> | undefined => bits0.find((b) => b.shape.k === 'ball' && PLATE_OF.get(b.shape)?.kind === kind)?.shape as Extract<Shape, { k: 'ball' }> | undefined;
  const ball = bits0.find((b) => b.shape.k === 'ball')?.shape as Extract<Shape, { k: 'ball' }> | undefined;
  const cop = /^pauldron/.test(whole) ? plate('cop') : undefined;
  // (rolled onto its side, its mouth out to the side and up: the curve of its iron, its ridge and its rolled rim seen, and its dark hollow beside)
  if (cop) return frameTurn(cop.ax[2], tilt(76), cop.ax[0], deep);
  const cup = /^(poleyn|couter)/.test(whole) ? plate('cup') : undefined;
  if (cup) return frameTurn(cup.ax[0], mul(tilt(76), -1), cup.ax[2], deep);
  if (ball && /^band[LR]$/.test(whole)) return frameTurn(ball.ax[2], [0, 0, 1], ball.ax[0], across);
  // (a shard rocked on its curve, each tipped its own way)
  if (ball && /^chunk/.test(whole)) return frameTurn(ball.ax[2], about([0, 0, 1], across, (hash(Number(whole.slice(5)), 9, 341) - 0.5) * 44), ball.ax[0], across);
  if (/^boot[LR]$/.test(whole)) {
    const foot = bits0.find((b) => b.shape.k === 'cloth' && b.shape.rings.length === 7)?.shape as Extract<Shape, { k: 'cloth' }> | undefined;
    // (fallen on its side, its shaft out to the side, its toe across: a boot, shaft and foot, seen from above)
    if (foot) return frameTurn(foot.rings[2].u, tilt(80), sub(foot.rings[6].c, foot.rings[0].c), deep);
  }
  if (whole === 'head') {
    const helm = bits0.find((b) => b.shape.k === 'cloth')?.shape as Extract<Shape, { k: 'cloth' }> | undefined;
    // (on the back of its crown, its face up and turned out to the side: its brow, its eye-slits and its grille seen)
    if (helm) return frameTurn(helm.rings[3].u, tilt(40), sub(helm.rings[helm.rings.length - 1].c, helm.rings[0].c), deep);
  }
  const panel = bits0.find((b) => b.shape.k === 'panel')?.shape as Extract<Shape, { k: 'panel' }> | undefined;
  if (panel && whole === 'door') {
    const n = norm(cross(panel.u, panel.v));
    return frameTurn(n, [0, 0, 1], panel.u, across);
  }

  // (along its length: its two furthest points laid level)
  const pts: V3[] = [];
  for (const b of bits0) {
    const sh = b.shape;
    if (sh.k === 'rod') pts.push(sh.a, sh.b);
    else if (sh.k === 'ball' || sh.k === 'panel') pts.push(sh.c);
    else if (sh.k === 'cloth') for (const r of sh.rings) pts.push(r.c);
  }
  let a: V3 = [0, 0, 1];
  let best = -1;
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = len(sub(pts[i], pts[j]));
    if (d > best) {
      best = d;
      a = norm(sub(pts[j], pts[i]));
    }
  }
  // (laid out along the way it was thrown, so that a long thing lies out from the blast and across nothing else)
  return frameTurn(a, dot([a[0], a[1], 0], way) >= 0 ? way : mul(way, -1), [0, 0, 1], [0, 0, 1]);
}

/** The pieces of him that fly as he bursts (each a real piece of him): his plates, his pauldrons' lames, his helm and his gorget, his flue, his fire-door, his gauntlets and his boots. */
const FLIES = /^(paul|lame|band|couter|vam|hand|knee|kneeA|kneeB|boot|bootB|foot)[LR]\d?$|^(head|collar|flue|door)$/;
/** Him as he is the moment before he bursts, and his shovel as it left his fist (each worked out once: they are cut from him so). */
let BURST: { bits: Bit[]; o: V3; s: Skeleton } | null = null;
let DROPPED: Bit[] | null = null;
function burstOf(st: Stage, m: Moment, say: StokerSay): { bits: Bit[]; o: V3; s: Skeleton } {
  if (!BURST) {
    const t0 = ST_DEATH.hit - 1e-4;
    const s0 = (say.bonesAt as (t: number) => Skeleton)(t0);
    const m0: Moment = { ...m, s: s0, t: t0 };
    BURST = { bits: stokerBits(st, m0, say), o: bellyOf(s0).c, s: s0 };
  }
  return BURST;
}
function droppedOf(st: Stage, m: Moment, say: StokerSay): Bit[] {
  if (!DROPPED) {
    const t0 = ST_DEATH.drop - 1e-4;
    const m0: Moment = { ...m, s: (say.bonesAt as (t: number) => Skeleton)(t0), t: t0 };
    DROPPED = stokerBits(st, m0, say).filter((b) => b.piece === 'shovel');
  }
  return DROPPED;
}
/** HIS SHOVEL, let fall from his fist as his firebox overloads: it drops at his right and lies along the floor. */
const SHOVEL_FALL: Flight = { way: norm([0.25, -1, 0]), dist: 10, up: 2, turns: 0, hop: 2.2, slide: 3, lay: { axis: [0, 0, 1], deg: 0 } };
function shovelFall(st: Stage, m: Moment, say: StokerSay): { bits0: Bit[]; c0: V3; F: Flight } {
  const bits0 = droppedOf(st, m, say);
  const c0 = middleOfBits(bits0);
  return { bits0, c0, F: { ...SHOVEL_FALL, lay: layOf('shovel', bits0, SHOVEL_FALL.way) } };
}
function shovelLying(st: Stage, m: Moment, say: StokerSay, t: number): Bit[] {
  const { bits0, c0, F } = shovelFall(st, m, say);
  return flown(bits0, c0, F, t - ST_DEATH.drop).bits;
}
/**
 * A SHARD OF HIS FIREBOX'S IRON, torn out of it: a piece of its curved plate (cut from an egg as big as the bend it has, so its
 * curve is truly shaded), its outline a torn polygon (one edge the straight seam it was riveted along, a short row of rivet
 * heads inside it; the rest torn, jagged with bites), its thickness a second skin under it showing along its near edges, sooted,
 * dusted with ash, its torn edges glowing as it flies and dying to a dull ember glow, here and there, as it lies.
 */
interface ShardCut {
  /** Its size (half across, in his lengths), the bend it has across and along, how thick it is. */
  s: number;
  bend: number;
  along: number;
  thick: number;
  /** Its outline (in units of `s`), the first edge the seam; and the rivets along the seam. */
  poly: [number, number][];
  rivets: [number, number][];
  seed: number;
}
const SHARD_CUT = new Map<number, ShardCut>();
function shardCut(i: number): ShardCut {
  let c = SHARD_CUT.get(i);
  if (c) return c;
  const h = (k: number): number => hash(i, k, 341);
  const s = 8 + 9 * h(1);
  const n = 5 + Math.floor(4 * h(2));
  // (the seam: a long straight edge, corners 0 and 1; the torn rest round from 1 back to 0, its corners in and out)
  const a0 = h(3) * TAU;
  const gap = 1.3 + 0.5 * h(4);
  const poly: [number, number][] = [[Math.cos(a0), Math.sin(a0)], [Math.cos(a0 + gap), Math.sin(a0 + gap)]];
  const steps = Array.from({ length: n - 1 }, (_, k) => 0.6 + 0.8 * hash(i, k, 343));
  const sum = steps.reduce((p, q) => p + q, 0);
  let a = a0 + gap;
  for (let k = 0; k < n - 2; k++) {
    a += ((TAU - gap) * steps[k]) / sum;
    const r = k % 2 ? 0.92 + 0.08 * hash(i, k, 345) : 0.5 + 0.32 * hash(i, k, 345);
    poly.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  const rivets: [number, number][] = [];
  const [p0, p1] = poly;
  const mid: [number, number] = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
  const nr = 3 + Math.floor(2 * h(5));
  for (let k = 0; k < nr; k++) {
    const f = 0.18 + (0.64 * k) / (nr - 1);
    const x = p0[0] + (p1[0] - p0[0]) * f;
    const y = p0[1] + (p1[1] - p0[1]) * f;
    rivets.push([x - mid[0] * 0.24, y - mid[1] * 0.24]);
  }
  c = { s, bend: s * (1.05 + 1.1 * h(6)), along: s * (1.7 + 3.2 * h(7)), thick: 1.2 + 0.6 * h(8), poly, rivets, seed: i };
  SHARD_CUT.set(i, c);
  return c;
}
/** Where a point of a shard's plane (`x`, `y`, in units of its size) is against its outline: outside (null), or how far in from its seam and from its torn edges. */
function inShard(c: ShardCut, x: number, y: number): { seam: number; torn: number; along: number } | null {
  const P = c.poly;
  let inside = false;
  for (let k = 0, m = P.length - 1; k < P.length; m = k++) {
    const [xi, yi] = P[k];
    const [xj, yj] = P[m];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  if (!inside) return null;
  let seam = 9;
  let torn = 9;
  let along = 0;
  for (let k = 0; k < P.length; k++) {
    const [ax, ay] = P[k];
    const [bx, by] = P[(k + 1) % P.length];
    const ex = bx - ax;
    const ey = by - ay;
    const L = Math.hypot(ex, ey);
    const f = Math.max(0, Math.min(1, ((x - ax) * ex + (y - ay) * ey) / (L * L)));
    const d = Math.hypot(x - ax - ex * f, y - ay - ey * f);
    if (k === 0) seam = d;
    else {
      // (torn: bitten into, jagged teeth along it)
      const q = f * L * 7 + k * 1.7 + c.seed;
      const bite = 0.09 * (fr(q) < 0.5 ? fr(q) * 2 : 2 - fr(q) * 2) + 0.12 * noise2(q * 0.3, k, 347) ** 2;
      if (d - bite < torn) {
        torn = d - bite;
        along = f * L + k;
      }
    }
  }
  if (torn < 0) return null;
  return { seam, torn, along };
}
/** Its glow, `age` seconds after he burst: white-hot as it flies, dying to a dull red here and there along its torn edges as it lies. */
function emberAt(age: number, k: number): string | null {
  const g = Math.exp(-age / 2.2) * k;
  if (age < 0.4 && k > 0.4) return EMBER[3];
  return g > 0.8 ? EMBER[2] : g > 0.58 ? EMBER[1] : g > 0.4 ? ST_HOT[3] : g > 0.24 ? ST_HOT[2] : null;
}
/** A shard's plate (`under`: its thickness, the skin under it). */
function shardSkin(c: ShardCut, age: number, under: boolean): Skin {
  return (u, tone) => {
    if (u[2] <= 0) return null;
    const x = (u[0] * c.bend) / c.s;
    const y = (u[1] * c.along) / c.s;
    const at = inShard(c, x, y);
    if (!at) return null;
    const glow = (k: number): string | null => emberAt(age, k * (0.35 + 0.95 * noise2(at.along * 2.2 + c.seed * 3, c.seed, 349)));
    if (under) return (at.torn < 0.12 && glow(1 - at.torn / 0.12)) || ST_IRON[at.seam < 0.08 ? 1 : 0];
    // (its torn edge: dark iron, the ember glow dying along it)
    if (at.torn < 0.075) return glow(1 - at.torn / 0.075) ?? ST_IRON[0];
    if (at.torn < 0.13) return glow(0.6 * (1 - at.torn / 0.13)) ?? ST_IRON[Math.max(0, tone - 2)];
    // (its seam: the plate's edge rolled, lit; the rivets inside it)
    if (at.seam < 0.06) return ST_IRON[0];
    if (at.seam < 0.11) return ST_IRON[Math.min(4, tone)];
    for (const [rx, ry] of c.rivets) {
      const dx = (x - rx) * c.s;
      const dy = (y - ry) * c.s;
      const r = Math.hypot(dx, dy);
      if (r < 2.1) return r < 1.0 ? ST_IRON[4] : dx + dy > 0.4 ? ST_IRON[0] : ST_IRON[3];
    }
    // (sooted, dusted with ash, the curve of it shaded)
    const soot = noise2(x * 2.2 + c.seed, y * 2.2, 351);
    if (hash(Math.floor(x * c.s * 1.6), Math.floor(y * c.s * 1.6) + c.seed * 31, 353) < 0.05) return ST_ASH[soot > 0.5 ? 2 : 1];
    // (a dull sheen along the top of its bend, where it is not sooted)
    if (tone >= 4 && soot < 0.3) return ST_IRON[3];
    return ST_IRON[Math.max(0, Math.min(3, tone - 1 - (soot > 0.6 ? 1 : 0)))];
  };
}
/** A shard's two skins as solids: the plate, and under it its thickness (`top`: its middle on the plate, `n` out of it, `t1` across its bend). */
function shardBits(key: string, c: ShardCut, top: V3, n: V3, t1: V3, age: number): Bit[] {
  const t2 = norm(cross(n, t1));
  const Rd = c.bend * 0.9;
  const egg = (lift: number, under: boolean): Shape => {
    const sh: Shape = { k: 'ball', c: add(top, mul(n, -Rd - lift)), ax: [mul(t1, c.bend), mul(t2, c.along), mul(n, Rd)], skin: shardSkin(c, age, under) };
    SHARD_OF.set(sh, c);
    return sh;
  };
  return [{ part: key, piece: key, shape: egg(0, false) }, { part: key, piece: key, shape: egg(c.thick, true) }];
}
/** Which shard a ball of him is (so that what is painted of it, not the egg it is cut from, is what lies on the floor). */
const SHARD_OF = new WeakMap<object, ShardCut>();
/** The lowest point of a shard's plate: round its outline. */
function shardLowest(sh: Extract<Shape, { k: 'ball' }>, c: ShardCut): number {
  const R0 = len(sh.ax[0]);
  const R1 = len(sh.ax[1]);
  let low = Infinity;
  const P = c.poly;
  for (let k = 0; k < P.length; k++) {
    const [ax, ay] = P[k];
    const [bx, by] = P[(k + 1) % P.length];
    for (let f = 0; f <= 1; f += 0.125) {
      const u0 = ((ax + (bx - ax) * f) * c.s) / R0;
      const u1 = ((ay + (by - ay) * f) * c.s) / R1;
      const u2 = Math.sqrt(Math.max(0, 1 - u0 * u0 - u1 * u1));
      low = Math.min(low, sh.c[2] + sh.ax[0][2] * u0 + sh.ax[1][2] * u1 + sh.ax[2][2] * u2);
    }
  }
  return low;
}
/** Iron of him as it flies and lies after the blast: his own soot-black iron (a shade darker than he stood, lying face up to the light), dusted with ash, the ember glow dying on its open edges. */
const LYING = (r: Ramp): Ramp => [r[0], r[0], r[1], r[2], r[3]];
function lyingSkin(skin: Skin, seed: number, pl: Plate | undefined, age: number): Skin {
  if (typeof skin !== 'function') return LYING(skin);
  return (u, tone, x, y) => {
    const c = skin(u, Math.max(0, tone - 1), x, y);
    if (!c) return c;
    if (pl) {
      // (its open edges: the glow dying along them)
      let e = 9;
      if (pl.hi < 1) e = Math.min(e, pl.hi - u[2]);
      if (pl.lo > -1) e = Math.min(e, u[2] - pl.lo);
      if (pl.open > -1) e = Math.min(e, u[0] - pl.open);
      if (pl.inside > -1) e = Math.min(e, u[1] - pl.inside);
      if (e < 0.08) {
        const g = emberAt(age, (1 - e / 0.08) * (0.25 + 0.9 * noise2(Math.atan2(u[1], u[0]) * 2.4 + seed, u[2] * 3, 355)));
        if (g) return g;
      }
    }
    if (hash(Math.floor(u[0] * 14 + seed), Math.floor(u[1] * 14 + u[2] * 9), 357) < 0.045) return ST_ASH[noise2(u[0] * 3 + seed, u[2] * 3, 359) > 0.5 ? 2 : 1];
    return c;
  };
}
function lyingBits(bits0: ReadonlyArray<Bit>, age: number): Bit[] {
  return bits0.map((b, i) => {
    const sh = b.shape;
    let out: Shape = sh;
    if (sh.k === 'ball') out = { ...sh, skin: lyingSkin(sh.skin, i * 7.3, PLATE_OF.get(sh), age) };
    else if (sh.k === 'cloth' || sh.k === 'band' || sh.k === 'rod') out = { ...sh, ramp: LYING(sh.ramp) };
    else if (sh.k === 'panel' && !CAPS.has(sh)) {
      const skin = sh.skin;
      const darker: PanelSkin = (a, bb, front, tone) => skin(a, bb, front, Math.max(0, tone - 1));
      out = { ...sh, skin: darker };
    }
    if (out === sh) return b;
    const pl = PLATE_OF.get(sh);
    if (pl) PLATE_OF.set(out, pl);
    if (CAPS.has(sh)) CAPS.add(out);
    return { ...b, shape: out };
  });
}
/**
 * THE EXPLOSION, PAINTED PIXEL BY PIXEL ON THE PICTURE (laid over him as sparks and smoke are, so that every piece of him inside it
 * is hidden in it and is seen only as it is flung out of it): `tau` seconds after he bursts, about `o` (the middle of his firebox).
 * First a WHITE-HOT FLASH bursting out of his cracked firebox, jagged tongues and spikes of flame shooting out from it; then a
 * BILLOWING FIREBALL, its edge ragged with licking flame and curling billows of many sizes, lit from within (white-yellow at its
 * heart, orange, red-orange at its rim, dark creases between its billows), soot rolling over its top as it rises; then it
 * breaks up into DARK SMOKE, soft, dithered and curling, rising and thinning, embers in it.
 */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const SOOT = ['#141012', '#221c1e', '#342c2c', '#4a4140', '#625856'] as const;
/** A blast's smoke, the darkest of its billows' undersides to the palest of their lit tops. */
const SMOKE6 = [...SOOT, '#7a706a'] as const;
function explosion(st: Stage, o: V3, tau: number, out: [V3, string, number][], t: number): void {
  const [ox, oy] = st.at(o);
  const b = st.back;
  const X: V3 = [b[0][0], b[1][0], b[2][0]];
  const Y: V3 = [b[0][1], b[1][1], b[2][1]];
  const Z: V3 = [b[0][2], b[1][2], b[2][2]];
  // (the point of him a pixel is: on the picture's plane through the blast's middle, lifted off the floor along the eye)
  const at3 = (x: number, y: number): V3 => {
    let p = add(add(o, mul(X, x + 0.5 - ox)), mul(Y, y + 0.5 - oy));
    if (p[2] < 0.7 && Z[2] > 1e-3) p = add(p, mul(Z, (0.7 - p[2]) / Z[2]));
    return p;
  };
  const dith = (x: number, y: number): number => BAYER[(y & 3) * 4 + (x & 3)];
  const fireK = 1 - smooth(0.42, 1.0, tau);
  const smokeK = smooth(0.18, 0.75, tau) * (1 - smooth(1.9, 2.6, tau));
  // THE SMOKE, behind the fire: a cloud of billows climbing off it and rolling over and out at its top as a blast's smoke does
  // (a roll each side of it: up its middle, out over its top, down its sides), billows of many sizes, their edges billowed
  // again, each lit on its top and shadowed under, a dark crease where one rolls over another, the fire's red on their undersides
  // while it burns; the cloud's edge soft and dithered; thinning from its edges in as it climbs, breaking up into wisps; embers in it
  if (smokeK > 0.01) {
    const cx = ox + 3 * Math.sin(tau * 1.1);
    const cy = oy - 30 * tau - 6 * tau * tau;
    const R = 40 + 18 * tau;
    const thin = smooth(1.3, 2.5, tau);
    const puffs: { x: number; y: number; r: number; z: number }[] = [];
    for (let i = 0; i < 26; i++) {
      const side = i % 2 ? 1 : -1;
      const rho = 0.1 + 0.4 * hash(i, 1, 281);
      const th = hash(i, 2, 281) * TAU + 1.3 * tau * (0.7 + 0.6 * hash(i, 3, 281));
      const big = hash(i, 4, 281);
      puffs.push({ x: cx + R * side * (0.36 + rho * Math.cos(th)), y: cy + R * (0.7 * rho * Math.sin(th) - 0.04 + 0.12 * (hash(i, 8, 281) - 0.5)), r: R * (0.1 + 0.32 * big * big), z: R * (hash(i, 5, 281) - 0.5) * 0.8 });
    }
    // (its stem: billows climbing out of the fire into it while the fire burns)
    const stemK = 1 - smooth(0.9, 1.7, tau);
    if (stemK > 0) {
      for (let i = 0; i < 6; i++) {
        const life = fr(tau * 0.8 + i / 6);
        puffs.push({ x: cx + R * (hash(i, 6, 281) - 0.5) * 0.45, y: cy + R * (1.05 - 1.1 * life), r: R * (0.16 + 0.16 * life) * stemK, z: R * 0.35 * hash(i, 7, 281) });
      }
    }
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    for (const P of puffs) {
      x0 = Math.min(x0, P.x - P.r * 1.2);
      x1 = Math.max(x1, P.x + P.r * 1.2);
      y0 = Math.min(y0, P.y - P.r * 1.2);
      y1 = Math.max(y1, P.y + P.r * 1.2);
    }
    for (let y = Math.floor(y0); y <= y1; y++) {
      for (let x = Math.floor(x0); x <= x1; x++) {
        let best = -Infinity;
        let bi = -1;
        let be = 0;
        let behind = false;
        let cov = 0;
        for (let j = 0; j < puffs.length; j++) {
          const P = puffs[j];
          const dx = (x + 0.5 - P.x) / P.r;
          const dy = (y + 0.5 - P.y) / P.r;
          const q = Math.hypot(dx, dy);
          if (q > 1.3) continue;
          // (its edge billowed again, smaller)
          const e = q + 0.42 * (noise2(dx * 2.2 + j * 3.1, dy * 2.2 - tau * 0.9, 283) - 0.5) + 0.22 * (noise2(dx * 5 + j * 1.7, dy * 5 + tau, 285) - 0.5);
          if (e >= 1) continue;
          cov = Math.max(cov, 1 - e);
          const hgt = P.z + P.r * Math.sqrt(1 - e * e);
          if (hgt > best) {
            behind = bi >= 0;
            best = hgt;
            bi = j;
            be = e;
          } else behind = true;
        }
        if (bi < 0) continue;
        // (soft at its edge, and thinning from its edges in)
        const a = smokeK * clamp01(cov * 3.4) - thin * clamp01(0.6 - cov) * 1.5;
        if (a < dith(x, y) * 0.9 + 0.05) continue;
        const P = puffs[bi];
        const nx = (x + 0.5 - P.x) / P.r;
        const ny = (y + 0.5 - P.y) / P.r;
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        const lit = -0.45 * nx - 0.7 * ny + 0.55 * nz;
        let v = 0.44 + 0.34 * lit + (noise2((x + 0.5) / 4, (y + 0.5) / 4 - tau * 3, 287) - 0.5) * 0.28;
        if (be > 0.8 && behind) v -= 0.3;
        let c: string = SMOKE6[Math.max(0, Math.min(5, Math.floor(v * 6 + (dith(x, y) - 0.5) * 0.9)))];
        // (the fire's red on the undersides of its billows while it burns)
        if (ny * fireK > 0.25 + dith(x, y) * 0.35) c = ny * fireK > 0.55 ? ST_HOT[2] : ST_HOT[1];
        if (tau < 1.6 && hash(x, y + Math.floor(t * 20), 247) < 0.005 * (1 - tau / 1.6)) c = hash(x, y, 249) < 0.5 ? EMBER[2] : EMBER[3];
        out.push([at3(x, y), c, 1]);
      }
    }
  }
  // THE FLASH AND THE FIREBALL, in front: billows of fire of many sizes heaped on one another, each swelling out of the one
  // behind it, lit from within (white-yellow at the heart of the fireball and of each billow, orange, red-orange at their
  // edges, a dark red crease where one rolls over another); jagged spikes of flame shooting out in the flash, tongues of
  // flame licking up off it after; soot rolling over its top as it rises
  if (fireK > 0.01) {
    const cx = ox;
    const cy = oy - 30 * tau;
    const R = 34 + 46 * (1 - Math.exp(-tau * 6.5));
    const flash = 1 - smooth(0.0, 0.16, tau);
    const spikes: [number, number, number][] = [];
    for (let i = 0; i < 13; i++) spikes.push([hash(i, 1, 251) * TAU, 0.05 + 0.08 * hash(i, 2, 251), (0.5 + 0.9 * hash(i, 3, 251)) * flash]);
    const tongues: [number, number, number][] = [];
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (hash(i, 4, 253) - 0.5) * 2.6;
      tongues.push([a + 0.25 * Math.sin(t * 9 + i), 0.05 + 0.05 * hash(i, 5, 253), (0.15 + 0.25 * hash(i, 6, 253)) * (0.6 + 0.4 * Math.sin(t * 17 + i * 2)) * (1 - flash) * fireK]);
    }
    // (its billows: a big one at its heart, the rest heaped round it, those over the top rising faster, all rolling)
    const puffs: { x: number; y: number; r: number; z: number }[] = [];
    for (let i = 0; i < 16; i++) {
      const a = hash(i, 1, 301) * TAU + 0.6 * tau * (hash(i, 6, 301) - 0.5);
      const d = 0.08 + 0.56 * hash(i, 2, 301);
      const up = Math.sin(a) < 0 ? 1 : 0.3;
      puffs.push({ x: cx + Math.cos(a) * d * R, y: cy + Math.sin(a) * d * R * 0.88 - 14 * tau * up * hash(i, 3, 301), r: R * (0.24 + 0.26 * hash(i, 4, 301)), z: R * (0.3 * (1 - d) + 0.4 * hash(i, 5, 301)) });
    }
    const reach = R * (1.3 + 1.4 * flash);
    for (let y = Math.floor(cy - reach - 4); y <= cy + reach + 2; y++) {
      for (let x = Math.floor(cx - reach - 2); x <= cx + reach + 2; x++) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        const ux = dx / R;
        const uy = dy / R;
        let best = -Infinity;
        let be = 0;
        let bdy = 0;
        let behind = false;
        for (let j = 0; j < puffs.length; j++) {
          const P = puffs[j];
          const px = (x + 0.5 - P.x) / P.r;
          const py = (y + 0.5 - P.y) / P.r;
          const q = Math.hypot(px, py);
          if (q > 1.35) continue;
          // (each billow's edge billowed again, smaller, rolling)
          const e = q + 0.34 * (noise2(px * 2.0 + j * 2.3, py * 2.0 + tau * 2.6, 303) - 0.5) + 0.18 * (noise2(px * 4.6 + j, py * 4.6 - tau * 3.5, 305) - 0.5);
          if (e >= 1) continue;
          const hgt = P.z + P.r * Math.sqrt(1 - e * e);
          if (hgt > best) {
            behind = best > -Infinity;
            best = hgt;
            be = e;
            bdy = py;
          } else behind = true;
        }
        const d = Math.hypot(dx, dy * 1.06);
        let tip = 0;
        let along = 0;
        if (best === -Infinity) {
          // (out past its billows: the spikes of the flash, the licking tongues)
          const th = Math.atan2(dy, dx);
          let edge = 0;
          for (const [a, w, l] of spikes) {
            const da = Math.abs(((th - a + Math.PI * 3) % TAU) - Math.PI);
            if (da < w) edge = Math.max(edge, R * (0.8 + l * (1 - da / w) * 1.6));
          }
          // (a tongue licks: it waves along its length and frays at its tip)
          tongues.forEach(([a, w, l], i) => {
            const wave = 0.22 * Math.sin((d / R) * 7 - t * 15 + i * 1.7) * clamp01(d / R - 0.7);
            const da = Math.abs(((th + wave - a + Math.PI * 3) % TAU) - Math.PI);
            const fray = 0.75 + 0.5 * noise2((d / R) * 6 - t * 9, i * 3.7, 307);
            if (da < w * fray) edge = Math.max(edge, R * (0.8 + l * (1 - da / (w * fray)) ** 1.2));
          });
          if (d > edge) continue;
          tip = 1;
          along = clamp01((d - 0.6 * R) / Math.max(1, edge - 0.6 * R));
        }
        // lit from within: hottest at its heart and at each billow's middle and top; a dark crease under a billow where it rolls over another
        // (a spike or a tongue white-hot or orange at its root, going red to its tip)
        let v = tip
          ? 0.8 + 0.5 * flash - 0.5 * along - 0.2 * smooth(0.12, 0.7, tau) - 0.8 * (1 - fireK)
          : 1.02 - 0.82 * (d / R) + (0.3 + 0.45 * (1 - fireK)) * (1 - be * be) - 0.12 * bdy + 0.6 * flash - 0.32 * smooth(0.12, 0.7, tau) - 0.8 * (1 - fireK) - (be > 0.74 && behind && bdy > -0.25 ? 0.3 : 0);
        v += (dith(x, y) - 0.5) * 0.14;
        // soot rolling over its top as it rises, in billows (its underside lit red by the fire under it)
        const sootN = noise2(ux * 3 + 4, uy * 3 + tau * 1.8, 265) * 0.65 + noise2(ux * 7, uy * 7 + tau * 3, 267) * 0.35;
        const sv = (-uy - 0.05) * 1.1 + (tau - 0.1) * 1.2 + (sootN - 0.5) * 1.3 + Math.max(0, tau - 0.45) * 1.6 * (d / R - 0.35);
        const soot = !tip && tau > 0.1 && sv > 0.85 + dith(x, y) * 0.2 && (d / R > 0.55 || tau > 0.62);
        let c: string;
        if (soot && sv < 0.97) c = sv < 0.91 ? EMBER[0] : ST_HOT[1];
        else if (soot) c = SOOT[Math.max(0, Math.min(3, Math.floor(sootN * 2.6 - uy * 0.8 + (be > 0.8 && behind ? -1 : 0))))];
        else if (v > 0.95) c = EMBER[4];
        else if (v > 0.72) c = EMBER[3];
        else if (v > 0.48) c = EMBER[2];
        else if (v > 0.26) c = EMBER[1];
        else if (v > 0.08) c = EMBER[0];
        else if (fireK < 0.6) {
          if (dith(x, y) > fireK + 0.2) continue;
          c = SOOT[1];
        } else c = EMBER[0];
        out.push([at3(x, y), c, 1]);
      }
    }
  }
}
/** Where each thing of him flies as he bursts (`fly`: each thing and where it starts): out all round the blast's middle `o`, in
 * the order they lie round it, spread evenly round it, each its own distance (near, middling or far, in turn), so that none comes
 * down on another. */
function aimsOf(all: ReadonlyArray<[string, V3]>, o: V3): Map<string, { ang: number; ring: number }> {
  // (the shards, small and flat, nearer in, between the whole things of him further out)
  const out = new Map<string, { ang: number; ring: number }>();
  const shards = all.filter(([k]) => /^chunk/.test(k));
  const wholes = all.filter(([k]) => !/^chunk/.test(k));
  // (a clear way kept either side of his shovel, long as it is)
  const sv = wholes.find(([k]) => k === 'shovel');
  const room: [string, V3][] = sv ? [-0.02, 0.02].map((d, i): [string, V3] => [`~room${i}`, add(o, about(sub(sv[1], o), [0, 0, 1], d / D))]) : [];
  for (const [k, v] of spreadRound([...wholes, ...room], o, [0.84, 1.18, 0.98, 1.3])) if (!k.startsWith('~')) out.set(k, v);
  // (his shovel, heavy and long, blown less far, lying out from the blast; no shard on it, nor on the gear)
  const kept: [string, V3][] = [];
  for (const k of ['shovel', 'gear']) {
    const a = out.get(k);
    if (a) kept.push([`~${k}`, add(o, [Math.cos(a.ang) * 50, Math.sin(a.ang) * 50, 0])]);
  }
  const sh = out.get('shovel');
  if (sh) out.set('shovel', { ...sh, ring: 0.62 });
  for (const [k, v] of spreadRound([...shards, ...kept], o, [0.4, 0.78, 0.55, 0.92, 0.48, 0.68])) if (!k.startsWith('~')) out.set(k, v);
  return out;
}
function spreadRound(fly: ReadonlyArray<[string, V3]>, o: V3, rings: number[]): Map<string, { ang: number; ring: number }> {
  const nat = fly.map(([k, c], i): [string, number] => {
    const dx = c[0] - o[0];
    const dy = c[1] - o[1];
    return [k, Math.hypot(dx, dy) > 2 ? Math.atan2(dy, dx) : hash(i, 1, 293) * TAU];
  });
  nat.sort((p, q) => p[1] - q[1]);
  const n = nat.length;
  const step = TAU / n;
  let sx = 0;
  let sy = 0;
  nat.forEach(([, a], i) => {
    sx += Math.cos(a - i * step);
    sy += Math.sin(a - i * step);
  });
  const start = Math.atan2(sy, sx);
  const out = new Map<string, { ang: number; ring: number }>();
  // (each its own way and distance, not set out in a ring: thrown)
  nat.forEach(([k], i) => out.set(k, { ang: start + i * step + (hash(i, 2, 293 + n) - 0.5) * step * 0.55, ring: rings[i % rings.length] * (0.86 + 0.28 * hash(i, 3, 293 + n)) }));
  return out;
}
/** A thing of him as it flies and lies, its fire going out: his fire-door's grate going dark; his helm's grille and eye-slits gone dark. */
function cooledOf(whole: string, bits0: ReadonlyArray<Bit>, tau: number, t: number): ReadonlyArray<Bit> {
  if (whole === 'door') return bits0.map((b) => (b.shape.k === 'panel' ? { ...b, shape: { ...b.shape, skin: doorSkin(Math.max(0, 1.3 - 1.1 * tau), clamp01((tau - 0.6) / 1.4), t) } } : b));
  if (whole === 'head') {
    return bits0.map((b) => {
      if (b.shape.k !== 'panel' || CAPS.has(b.shape)) return b;
      const grille = len(b.shape.u) > 4;
      return { ...b, shape: { ...b.shape, skin: grille ? grilleSkin(Math.max(0, 1 - 1.6 * tau), clamp01(0.2 + tau * 1.2), t) : slitSkin(1, 0) } };
    });
  }
  return bits0;
}
/** THE BURST AND AFTER: the explosion, the pieces of him flying out of it and lying smoking, his shovel blown away, the gear. */
function blastBits(st: Stage, m: Moment, say: StokerSay): Bit[] {
  const D0 = ST_DEATH;
  const t = m.t;
  const tau = t - D0.hit;
  const bits: Bit[] = [];
  const under: [V3, string, number][] = [];
  const grains: [V3, string, number][] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const B0 = burstOf(st, m, say);
  const o = B0.o;
  // (a few of them smoking where they lie: a thin wisp rising off each, swaying, curling, thinning as it goes up, to the end)
  const wisp = (rest: V3, still: number, j: number): void => {
    const since = tau - still;
    if (since < 0) return;
    const k = clamp01(since / 0.35) * (1 - 0.35 * clamp01(since / 2.5));
    const ph = hash(j, 1, 337) * TAU;
    for (let i = 0; i < 30; i++) {
      const h = 1.5 + i * 1.2;
      const sway = Math.sin(h * 0.17 - t * 2.1 + ph) * (0.4 + h * 0.1);
      const p = add(rest, [sway * 0.62 + h * 0.08, sway * 0.62 + h * 0.08, h + 1.5]);
      const dens = k * (1.15 - h / 36) * (0.62 + 0.38 * Math.sin(h * 0.42 - t * 5.5 + ph));
      if (hash(i, j, 339) > dens) continue;
      grains.push([p, ST_SMOKE[Math.min(3, Math.floor(h / 9))], 1]);
      // (thicker where it leaves the iron)
      if (h < 9 && hash(i, j, 341) < dens) grains.push([add(p, [0.6, -0.6, 0]), ST_SMOKE[1], 1]);
    }
  };
  // (a trail of smoke and sparks behind a piece as it flies)
  const trail = (bits0: ReadonlyArray<Bit>, c0: V3, F: Flight, j: number): void => {
    for (let k = 1; k <= 14; k++) {
      const tk = tau - k * 0.014;
      if (tk <= 0) break;
      const f = flown(bits0, c0, F, tk);
      if (tk > f.still - (F.hop > 0 ? 0.2 : 0)) break;
      const c = middleOfBits(f.bits);
      const fade = clamp01(1.3 - tau);
      // (sparks shed off it, just behind it; then its smoke, spreading as it is left behind, thinning)
      if (k <= 4 && hash(j, k, 261) < fade + 0.3) under.push([add(c, [hash(j, k, 267) * 5 - 2.5, hash(j, k, 269) * 5 - 2.5, hash(j, k, 265) * 3 - 1.5]), k === 1 ? EMBER[4] : k === 2 ? EMBER[3] : EMBER[2], 1]);
      if (k >= 2 && hash(j, k, 263) < fade + 0.15) {
        // (pale where it is new, close behind it; darker, wider and thinning behind)
        const sp = 0.8 + k * 0.35;
        for (let q = 0; q < 3; q++) under.push([add(c, [(hash(j, k * 3 + q, 271) - 0.5) * sp * 2, (hash(j, k * 3 + q, 273) - 0.5) * sp * 2, (hash(j, k * 3 + q, 275) - 0.3) * sp]), SMOKE6[Math.max(1, 5 - Math.floor(k / 3) - (q === 2 ? 1 : 0))], k < 10 ? 2 : 1]);
      }
    }
  };
  // THE THINGS HE WAS MADE OF, each whole, flung clear out of the fireball, tumbling, trailing smoke and sparks, then lying as they lie
  const groups = new Map<string, Bit[]>();
  for (const b of B0.bits) {
    if (!FLIES.test(b.piece) || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
    const w = wholeOf(b.piece);
    const g = groups.get(w) ?? [];
    g.push(b);
    const pl = b.shape.k === 'ball' ? PLATE_OF.get(b.shape) : undefined;
    if (pl && b.shape.k === 'ball') for (const cap of mouthsOf(b.shape, pl)) g.push({ part: b.part, piece: b.piece, shape: cap });
    // (the gorget's mouths, top and foot: a ring of iron, hollow)
    if (w === 'collar' && b.shape.k === 'cloth') {
      for (const r of [b.shape.rings[0], b.shape.rings[b.shape.rings.length - 1]]) {
        const lu = len(r.u) * 0.9;
        const lv = len(r.v) * 0.9;
        const cap: Shape = { k: 'panel', c: r.c, u: mul(r.u, 0.9), v: mul(r.v, 0.9), skin: hollowSkin(lu, lv) };
        CAPS.add(cap);
        g.push({ part: b.part, piece: b.piece, shape: cap });
      }
    }
    groups.set(w, g);
  }
  // (shards of his firebox, torn out of it)
  const s0 = B0.s;
  const bl = bellyOf(s0);
  const [bf, blf, bu] = s0.belly;
  const shards = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * TAU + hash(i, 1, 181) * 0.4;
    const h = (hash(i, 2, 181) - 0.5) * 1.4;
    const out = norm(add(mul(bf, Math.cos(a)), mul(blf, Math.sin(a))));
    const c = add(add(bl.c, mul(out, ((bl.r[0] + bl.r[1]) / 2) * Math.sqrt(1 - h * h * 0.5))), mul(bu, h * bl.r[2]));
    // (bent round his firebox as it was, each a little its own way)
    const ta = norm(cross(bu, out));
    const tb = norm(cross(out, ta));
    const ph = (hash(i, 5, 181) - 0.5) * 1.4;
    const t1 = add(mul(ta, Math.cos(ph)), mul(tb, Math.sin(ph)));
    return { key: `chunk${i}`, c, out, t1 };
  });
  const sh0 = shovelFall(st, m, say);
  const shovelLaid = flown(sh0.bits0, sh0.c0, sh0.F, 99);
  const shovelC = middleOfBits(shovelLaid.bits);
  // (where each thing goes: out all round the blast, each its own way, near, middling or far, so that none lies on another; the gear's way kept clear)
  const gearEnd = say.gear({ ...m, t: D0.long });
  const aims = aimsOf([...[...groups].map(([w, b]): [string, V3] => [w, middleOfBits(b)]), ...shards.map((q): [string, V3] => [q.key, q.c]), ['shovel', shovelC], ...(gearEnd ? [['gear', gearEnd.c] as [string, V3]] : [])], o);
  let j = 0;
  for (const [whole, bits0] of groups) {
    const c0 = middleOfBits(bits0);
    const heavy = /^boot[LR]$/.test(whole) ? 1.7 : whole === 'head' ? 0.85 : /^(pauldron|gauntlet)/.test(whole) ? 1.1 : 1;
    const F0 = blastFlight(whole, c0, o, { axis: [0, 0, 1], deg: 0 }, heavy, aims.get(whole));
    const F = { ...F0, lay: layOf(whole, bits0, F0.way, [st.back[0][0], st.back[1][0], st.back[2][0]]) };
    const f = flown(lyingBits(cooledOf(whole, bits0, tau, t), tau), c0, F, tau);
    for (const b of f.bits) bits.push({ part: `p_${b.part}`, piece: whole, shape: b.shape });
    trail(bits0, c0, F, j);
    if (j % 3 === 0) wisp(f.rest, f.still, j);
    j++;
  }
  // SHARDS OF HIS FIREBOX, torn out of it
  shards.forEach(({ key, c, out, t1 }, i) => {
    const bits0 = shardBits(key, shardCut(i), c, out, t1, tau);
    const F0 = blastFlight(key, c, o, { axis: [0, 0, 1], deg: 0 }, 0.85, aims.get(key));
    const F = { ...F0, lay: layOf(key, bits0, F0.way) };
    const f = flown(bits0, c, F, tau);
    for (const b of f.bits) bits.push(b);
    trail(bits0, c, F, 40 + i);
    if (i % 4 === 1) wisp(f.rest, f.still, 40 + i);
  });
  // HIS SHOVEL, blown from where it lay
  {
    const lying = shovelLaid;
    const c1 = shovelC;
    const F0 = blastFlight('shovel', c1, o, { axis: [0, 0, 1], deg: 0 }, 1.6, aims.get('shovel'));
    // (it comes down lying out from the blast, along the way it was blown, so that it lies across nothing else)
    // (its blade flat on the floor)
    const rod = lying.bits.map((b) => b.shape).find((q) => q.k === 'rod' && len(sub(q.a, q.b)) > 30) as Extract<Shape, { k: 'rod' }> | undefined;
    const blade = lying.bits.map((b) => b.shape).find((q) => q.k === 'panel') as Extract<Shape, { k: 'panel' }> | undefined;
    let lay: Turn3 = { axis: [0, 0, 1], deg: 0 };
    if (rod && blade) {
      const d = norm(sub(rod.b, rod.a));
      const w = dot([d[0], d[1], 0], F0.way) >= 0 ? F0.way : mul(F0.way, -1);
      const n = norm(cross(blade.u, blade.v));
      lay = frameTurn(d, w, n, n[2] >= 0 ? [0, 0, 1] : [0, 0, -1]);
    }
    const F2: Flight = { ...F0, turns: 1, lay };
    const f = flown(lyingBits(lying.bits, tau), c1, F2, tau);
    for (const b of f.bits) bits.push({ part: 'shovel', piece: 'shovel', shape: b.shape });
    trail(lying.bits, c1, F2, 60);
  }
  // sparks and burning bits flung out of the blast
  for (let i = 0; i < 46; i++) {
    const T = tau * (0.8 + 0.4 * hash(i, 1, 185));
    if (T > 0.8) continue;
    const a = hash(i, 2, 185) * TAU;
    const e = (hash(i, 3, 185) - 0.2) * 1.3;
    const v = 140 + 160 * hash(i, 4, 185);
    const at = (T: number): V3 => add(o, [Math.cos(a) * Math.cos(e) * v * T, Math.sin(a) * Math.cos(e) * v * T, Math.sin(e) * v * T - 260 * T * T]);
    const p = at(T);
    if (p[2] < 0.5) continue;
    // (a spark: a white-hot head and its streak behind it, going red)
    grains.push([at(Math.max(0, T - 0.03)), EMBER[1], 1], [at(Math.max(0, T - 0.015)), EMBER[2], 1], [p, T < 0.3 ? EMBER[4] : EMBER[3], 1]);
  }
  // THE EXPLOSION over all of it (the pieces inside it hidden in it), and its light
  const fire: [V3, string, number][] = [];
  explosion(st, o, tau, fire, t);
  if (tau < 1.0) put('glow', 'glow', { k: 'glow', p: add(o, [0, 0, 10]), c: EMBER[3], r: 90 + 120 * (1 - tau), a: Math.min(0.7, 0.8 * (1 - tau)) });
  // THE GEAR, spinning out of the fireball, clanging down, lying glinting
  const gr = say.gear(m);
  if (gr) gearBits(put, gr.c, gr.up, gr.spin, 0);
  MORE.set(m, [...under.map(([p, c, n]): [V3, string, number] => [p[2] < 0.6 ? [p[0], p[1], 0.6] : p, c, n]), ...fire, ...grains]);
  return bits;
}
/** As his firebox overloads: rivets popping off its bands in sparks; steam and smoke jetting from his flue, his shoulders, his door and his hips. */
/** The point of him a pixel (`x`, `y`) of his picture is, on the picture's plane through `o`, lifted off the floor along the eye. */
function pixelAt(st: Stage, o: V3): (x: number, y: number) => V3 {
  const [ox, oy] = st.at(o);
  const b = st.back;
  const X: V3 = [b[0][0], b[1][0], b[2][0]];
  const Y: V3 = [b[0][1], b[1][1], b[2][1]];
  const Z: V3 = [b[0][2], b[1][2], b[2][2]];
  return (x, y) => {
    let p = add(add(o, mul(X, x + 0.5 - ox)), mul(Y, y + 0.5 - oy));
    if (p[2] < 0.7 && Z[2] > 1e-3) p = add(p, mul(Z, (0.7 - p[2]) / Z[2]));
    return p;
  };
}
const STEAM = ['#ece6dc', '#d2cac0', '#b2aaa2', '#918982', '#726b66'] as const;
/**
 * A JET OF STEAM, painted pixel by pixel on the picture: driven out of a gap of him at `p0` along `way`, `reach` long, `k` hard
 * (0 to 2): a tight white jet at the gap, swelling as it goes into billows that roll and slow and rise, each lit on its top and
 * grey under, their edges soft and dithered, thinning to nothing at its end.
 */
function steamJet(st: Stage, out: [V3, string, number][], p0: V3, way: V3, reach: number, k: number, t: number, seed: number): void {
  if (k <= 0.02) return;
  const at3 = pixelAt(st, p0);
  const [x0, y0] = st.at(p0);
  const [x1, y1] = st.at(add(p0, mul(way, reach)));
  const n = 15;
  const puffs: { x: number; y: number; r: number; a: number; j: number }[] = [];
  for (let i = 0; i < n; i++) {
    const life = fr(t * 2.4 + i / n + 0.37 * hash(i, seed, 311));
    // (fast out of the gap, slowing; rising as it slows)
    const go = 1 - (1 - life) * (1 - life);
    const wob = (hash(i, seed + 1, 311) - 0.5) * 6 * life;
    puffs.push({ x: x0 + (x1 - x0) * go + wob, y: y0 + (y1 - y0) * go - 10 * life * life + wob * 0.4, r: (1.4 + 6 * life) * Math.min(1.4, 0.6 + 0.4 * k), a: Math.min(1.2, 0.5 + 0.6 * k) * (1 - life) ** 0.6, j: i });
  }
  // (the oldest, furthest billows first, the new ones out of the gap over them)
  puffs.sort((p, q) => q.r - p.r);
  for (const P of puffs) {
    for (let y = Math.floor(P.y - P.r * 1.4); y <= P.y + P.r * 1.4; y++) {
      for (let x = Math.floor(P.x - P.r * 1.4); x <= P.x + P.r * 1.4; x++) {
        const dx = (x + 0.5 - P.x) / P.r;
        const dy = (y + 0.5 - P.y) / P.r;
        const e = Math.hypot(dx, dy) + 0.35 * (noise2(dx * 2 + P.j * 3.3, dy * 2 + t * 3, 313 + seed) - 0.5);
        if (e >= 1) continue;
        if (P.a * (1.5 - e * e) < BAYER[(y & 3) * 4 + (x & 3)] * 0.9 + 0.05) continue;
        const lit = -0.45 * dx - 0.8 * dy;
        const tone = Math.floor(1.6 - 1.6 * lit + (1 - P.a) * 1.8 + (BAYER[(y & 3) * 4 + (x & 3)] - 0.5) * 0.8);
        out.push([at3(x, y), STEAM[Math.max(0, Math.min(4, tone))], 1]);
      }
    }
  }
}
function overloadGrains(st: Stage, grains: [V3, string, number][], s: Skeleton, t: number, sw: number, cracking: boolean): void {
  const D0 = ST_DEATH;
  const bl = bellyOf(s);
  const [bf, blf, bu] = s.belly;
  // (rivets: each pops off at its moment, flies with a spark trail)
  for (let i = 0; i < 22; i++) {
    const tp = D0.build[0] + 0.15 + (D0.strike[0] - D0.build[0] - 0.2) * hash(i, 1, 191);
    const T = t - tp;
    if (T < 0 || T > 0.4) continue;
    const a = hash(i, 2, 191) * TAU;
    const out = norm(add(mul(bf, Math.cos(a)), mul(blf, Math.sin(a))));
    const p0 = add(add(bl.c, mul(out, (bl.r[0] + bl.r[1]) / 2)), mul(bu, (i % 2 ? 1 : -1) * 9.5));
    const v = add(mul(out, 60 + 40 * hash(i, 3, 191)), [0, 0, 40]);
    const p = add(add(p0, mul(v, T)), [0, 0, -300 * T * T]);
    if (p[2] < 0.5) continue;
    // (a rivet: its head torn off its band, white-hot where it sheared, sparks streaming off it; a white-hot hole left where it was)
    for (let k = 4; k >= 1; k--) {
      const Tk = Math.max(0, T - k * 0.015);
      grains.push([add(add(p0, mul(v, Tk)), [0, 0, -300 * Tk * Tk]), k > 2 ? EMBER[2] : EMBER[3], 1]);
    }
    grains.push([p, ST_IRON[2], 2], [add(p, [0, 0, 1]), T < 0.2 ? EMBER[4] : ST_IRON[4], 1]);
    if (T < 0.06) grains.push([p0, EMBER[4], 3]);
    else grains.push([p0, T < 0.25 ? EMBER[4] : EMBER[3], 1]);
  }
  // (jets of steam and smoke out of the gaps of him, harder as he swells)
  const fl = flueOf(s);
  const jets: [V3, V3][] = [
    [fl[fl.length - 1], norm(sub(fl[fl.length - 1], fl[fl.length - 2]))],
    [add(s.shoulderL, mul(s.upper[2], 7)), norm(add(s.upper[1], mul(s.upper[2], 0.8)))],
    [add(s.shoulderR, mul(s.upper[2], 7)), norm(add(mul(s.upper[1], -1), mul(s.upper[2], 0.8)))],
    [add(doorFrameOf(s).c, mul(bu, DOOR.high + 1)), norm(add(bf, mul(bu, 0.6)))],
    [add(s.pelvis, mul(s.hips[2], 8)), norm(add(mul(s.hips[0], -1), mul(s.hips[2], 0.3)))],
  ];
  jets.forEach(([p0, way], jn) => {
    const k = (jn === 0 ? 1.3 : 0.9) * (0.45 + sw) * (cracking ? 1.4 : 1);
    steamJet(st, grains, p0, way, (jn === 0 ? 34 : 22) * (0.5 + sw), k, t * (1 + jn * 0.13), 20 + jn);
  });
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
