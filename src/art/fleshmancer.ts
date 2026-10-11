// THE FLESHMANCER, THE CRYPT'S LAIR BOSS ON FLOOR 5, ON THE HEROES' BONES (the art chat, 11 Oct 2026).
// A MOCK-UP: NOT IN THE GAME. Nothing of the game imports this file, and `FLESHMANCER_SWITCH.on`, the
// switch a later chat would put him in by, is off. THIS IS HIS LOOK ONLY: his standing loop, for the
// owner's yes; his moves come after (docs/mockups/fleshmancer/README.md).
//
// His words, 9 Oct, 22:47, his outline of the Crypt (in the main chat): "Floor 5 will have the Lair
// boss, which will be a very powerful cultist fleshmancer.  He is the one creating the ossuary guys and
// the giant amalgamation.  This guy is tough.  Hes human sized, but He has crazy spells that fill the
// room and you have to dodge around to avoid them."
//
// His brief (his art rulebook's "A new character"), answered by 08:36 on 11 Oct, each in his words:
//   his look, "Hooded priest, hands of power" (robe and deep hood, face hidden in the dark but for
//     pink eyes; long bony fingers that glow; the magic is all in his hands);
//   the one thing he is known by, "A staff topped with a skull" (a tall staff of fused bone with a
//     burning skull at its head);
//   how he moves, "Glides, feet just off the floor (Recommended)" (unnaturally smooth, robes trailing
//     on the floor, then a sudden lurch when he casts);
//   never, "Nothing gory (Recommended)" (grim like the rest of the Crypt: bone, robe and pink fire,
//     never blood or open flesh).
//   (His death, his attacks and his big spells are his brief's too, and come after this.)
//
// HIS LOOK, AS REMADE AFTER TWO FRESH LOOKS (11 Oct): the first drawing read at a phone's size as a hooded
// torch-bearer; the second as a big step up, but with accidental shapes in it (a symbol down his front, a
// face like a wall socket, crosses for embers, numbers in a hand) and a small, crouched body. So, as painted
// now:
//   HIS BODY is a man's a head taller than the knight, upright, his robe hanging plumb from his hips: broad,
//     stiff shoulders under a mantle, tapering to a narrow hem off the floor, its tattered tails curling
//     up; behind his hood RIBS OF BONE rise from his collar and curve in over it, a ribcage closing over his
//     head (bone, never gold); his staff held out at his side, clear of him, his casting hand out at the
//     other.
//   HIS COLOURS are his cult's, raised: a robe of near-black plum, his hood a step darker, his mantle the
//     same raised to magenta, its edge clean and banded pink and gold all round; below the mantle the two
//     edges of his robe where it parts, pink edged with gold, unbroken to the hem (nothing hangs from his
//     face); the pink lining dark in his sleeves and where his tails curl up.
//   HIS HOOD is deep and round; his cult's pink and gold are on its outer brim, an arch over his brow open
//     below; the opening pitch black, its edge dark, lit a little pink from inside; and in it his eyes, two
//     hot points of fire, not alike, no frame round them (the others' are slanting slashes). When he
//     flares, only his eyes and the opening's edge blaze, never his face.
//   HIS HANDS are the heart of him ("hands of power"): bare bony forearms out of pushed-back sleeves, and
//     the casting hand half as big again as a man's, four long bone-pale fingers and a thumb splayed as a
//     claw, their tips burning pink to gold, the fire held between them; the staff hand's long fingers
//     slanting across the bone, each its own length, pointed, their tips lit.
//   HIS STAFF is bone, not a pole: warm ivory, knuckled segments each its own length, spurs off it, a crook
//     near its head; on its head A SKULL about as wide as his hood (his emblem: he is the mass), dark pits
//     for eyes with the fire deep in them licking up and out over its temples, its teeth, its jaw hanging
//     open on a dark mouth, and a ragged flame from behind its crown; it looks at you from in front and from
//     behind alike.
//   HE FLOATS, unmistakably: a clear gap of floor under him, lit by his own pink light and the embers that
//     drip off his tails; he rises and sinks on nothing. No ember of his is ever a lone pixel (with his pink
//     edge round it, a lone pixel is a cross): each is a slanting fleck.
//   THE SKULL, HIS HANDS AND THE FACE IN HIS HOOD are painted pixel by pixel (little pictures held square to
//     the eye, each as near it as the thing it is), so that they read at a phone's size.
//
// What glows on him is the enemy's (the art rulebook, Colour 3: "Hot pink burning to gold glows only on
// an enemy"): his eyes, his fingertips and the fire in his hand, the skull's fire, the embers. Nothing on
// him is cyan.
//
// He is a monster of art/new_mobs3.ts's kind (a `Mob`: posed on the heroes' bones, dressed in the heroes'
// solids, lit from the upper left, the enemy's pink edge round him while he lives), on a canvas of his
// own (FM_CANVAS), seen from behind as the camera truly sees him (`trueBack`: his staff stays in his right
// hand), and he goes through every boss check (art/boss_checks.ts, `FM_SHAPE`; the art rulebook, How art
// is made 7).
//
// What the numbers of a pose mean to his painter besides the bones:
//   draw  how far the fingers of his casting hand are curled (0 spread wide, 1 a claw closed round the fire)
//   pAz   the fire in his casting hand (0 gone, 1 as it burns, 2 charged)
//   pEl   the gout of fire he flings (0 none; 0 to 1 in flight from his hand; 1 to 2 bursting on the floor)
//   pt    the skull's fire flaring (0 as it burns, 1 roaring)
//   gale  his robe, tails and sleeves kicked out (a lurch)
//   out   the light going out of him, 0 lit to 1 dark

import type { ActorArt } from './actor_types';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME, SOCKET } from './mkit';
import { TILE3, mobSet, sphere } from './new_mobs3';
import type { Bit, Mob, MobCanvas, Moment, Put } from './new_mobs3';
import type { BossShape, CheckLimb, CheckLump, CheckThing } from './boss_checks';
import { onCloth, wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, bonesAt, buildOf, cross, dot, len, lerp3, mul, norm, solve, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file; a chat that puts him in, on the owner's yes, does it behind this. */
export const FLESHMANCER_SWITCH = { on: false };

const D = Math.PI / 180;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (k: number): number => {
  const v = clamp01(k);
  return v * v * (3 - 2 * v);
};
/** Smoothly from 0 to 1 between two moments. */
const rampAt = (t: number, t0: number, t1: number): number => smooth((t - t0) / (t1 - t0));

// ---------------------------------------------------------------------------------------------
// His body, his canvas, his colours

/** His body: a man's (the knight is 58 tall), broad and stiff in the shoulders, narrow below, long in the arm. */
export const FM_BODY: Build = buildOf(55, 1.06, { shoulders: 1.2, chest: 0.95, depth: 0.98, waist: 0.74, hips: 0.78, arms: 1.12, trunk: 1.06, limbs: 0.84, pad: 2.0 });
const FB = FM_BODY;
/** How far he floats at rest: his pelvis this far above where a body's would be, standing (his legs drawn up inside his robe). */
export const FM_FLOAT = 5.0;
/** How high the hem of his robe is off the floor at rest, before its tails (they hang and curl below it). */
export const FM_HEM_UP = 20.5;
/** How much wider than his hips his robe is at its hem (narrow: he tapers from broad shoulders to it). */
const FM_HEM_WIDE = 1.8;
/** How high his pelvis is at rest, floating (his robe's hem keeps its height under it as he rises and sinks). */
const FM_PELVIS_UP = FM_BODY.ankle + FM_BODY.shank + FM_BODY.thigh + FM_FLOAT;
/** His canvas: room for his staff and its fire high over his hood, raised higher when he casts, and for the gout of fire he flings out to his side. */
export const FM_CANVAS: MobCanvas = { w: 320, h: 300, ax: 160, ay: 228 };

/** His robe: near-black plum, its lit side a dark magenta (the cultists' violet is bright, the Shade's grey, the Headsman's coat blue-black, his hood red). */
export const FM_ROBE: Ramp = ['#170a1b', '#170a1b', '#3a1440', '#6e2660', '#6e2660'];
/** His hood: a step darker than his mantle, so that its round shape reads against his shoulders from in front and from behind. */
const FM_HOOD: Ramp = ['#120816', '#120816', '#2e1036', '#56204e', '#56204e'];
/** His mantle, stiff over his shoulders: his robe's plum, raised to his cult's magenta (so his shoulders read broad and his hem narrow). */
const FM_MANTLE: Ramp = ['#1f0b22', '#1f0b22', '#521a4c', '#8e2e74', '#8e2e74'];
/** The pink lining of his robe, seen in his sleeves and where his tails curl up. */
const FM_LINING: Ramp = ['#2e0a26', '#2e0a26', '#6e1a4e', '#9a2a68', '#9a2a68'];
/** The band down his front and round his hood's rim: his cult's pink, bolder, and its edge of gold. */
const BAND: Ramp = ['#6a0e4a', '#6a0e4a', '#c0206a', '#ff5a98', '#ff5a98'];
const GOLD: Ramp = ['#5a2c18', '#5a2c18', '#b8742c', '#f4c060', '#f4c060'];
/** Bone, warm and old: his staff's and the stays of his collar (a step darker than the skull), his forearms' (bone-pale). */
const STAFF_BONE: Ramp = ['#3e2c2c', '#3e2c2c', '#9a7c62', '#d6bc94', '#d6bc94'];
const STAY_BONE: Ramp = ['#3a2a2c', '#3a2a2c', '#907660', '#ccb494', '#ccb494'];
const HAND_BONE: Ramp = ['#4a3a44', '#4a3a44', '#a48e8c', '#d4c2b6', '#d4c2b6'];
/** The skull's ivory, warm, lit from the upper left: highlight, lit, middle, shade, deep shade. */
const IVORY = { H: '#f0e7d4', L: '#d9ccb3', M: '#ae9f88', S: '#76665c', D: '#4e4048' } as const;
/** His hands' bone, pale: highlight, lit, middle. */
const PALE = { H: '#efe4d6', L: '#d4c2b6', M: '#a48e8c' } as const;

// ---------------------------------------------------------------------------------------------
// His hood

/** HIS HOOD: its middle this far before his head and above it, and its half-lengths (front to back, across, up): bigger than a head by a hand all round, its brow drawn forward. */
export const FM_HOOD_FWD = 1.3;
export const FM_HOOD_UP = 1.0;
export const FM_HOOD_R: V3 = [8.0, 7.2, 8.0];
/** The top of his hood above the floor (the figure's own lengths), on his bones: for the sheet and the tests. */
export function fmHoodTop(s: Skeleton): number {
  const [ff, fl, fu] = s.face;
  const c = s.head[2] + ff[2] * FM_HOOD_FWD + fu[2] * FM_HOOD_UP;
  return c + Math.hypot(ff[2] * FM_HOOD_R[0], fl[2] * FM_HOOD_R[1], fu[2] * FM_HOOD_R[2]);
}

/**
 * THE FACE IN HIS HOOD, as it is painted, pixel by pixel, on the hood where it faces the way he looks: the
 * opening pitch black (k), its edge dark, lit a little pink from inside (r); and in it, low, his eyes, two
 * hot points of fire (h), each with a dimmer one by it (e), the two not alike: no frame round them, no bars
 * (the cultists', the Shade's and the Headsman's eyes are slanting slashes). His cult's pink (P) and gold (G)
 * are on the hood's outer brim, an arch over his brow and down its sides, open below, well clear of the
 * opening.
 */
const HOOD_FACE: ReadonlyArray<string> = [
  '....GGGGGGG....',
  '..GGPPPPPPPGG..',
  '.GPP.......PPG.',
  '.GP..rrrrr..PG.',
  'GP..rkkkkkr..PG',
  'GP.rkkkkkkkr.PG',
  'GP.rkkkkkkkr.PG',
  'GP.rkhkkkhkr.PG',
  'GP.rkekkkker.PG',
  '.P.rkkkkkkkr.P.',
  '...rkkkkkkkr...',
  '....kkkkkkk....',
  '....kkkkkkk....',
];
/** The middle of the face (column, row): where the middle of the hood's opening is; and where in it his eyes' hot points are. */
const HOOD_FACE_MID: P2 = [7, 7];
const HOOD_EYES: ReadonlyArray<P2> = [[5, 7], [9, 7]];

// ---------------------------------------------------------------------------------------------
// His staff

/** HIS STAFF: from its foot to its head; where his right hand holds it, from its foot; the middle of the skull above its head (its chin rests on the staff's head), and the skull's half-lengths as the checks take it (front to back, across, up): wider than his hood. */
export const STAFF_LEN = 60;
const STAFF_GRIP = 28;
const SKULL_UP = 9.5;
export const SKULL_R: V3 = [6.0, 7.0, 9.5];
/** Where along the staff its bones are fused (from its foot), and how far each joint is off its line (forward, to his left): no two segments alike, a crook out near its head. */
const JOINTS: ReadonlyArray<readonly [number, number, number]> = [
  [0, 0, 0], [8.5, 0.6, -0.3], [15.5, -0.5, 0.4], [25, 0.4, 0.1], [33, -0.4, -0.3], [42, 0.5, -0.4], [50.5, 0.1, -2.2], [56, -0.3, -1.4], [60, 0, -0.4],
];
/** The spurs off its joints: which joint, which way (forward, to his left: away from him), how long. */
const SPURS: ReadonlyArray<readonly [number, number, number, number]> = [
  [1, -0.4, -0.9, 5.0], [3, 0.55, -0.85, 6.5], [4, -0.75, -0.6, 5.0], [5, 0.35, -0.95, 7.5], [6, -0.2, -1, 4.5],
];

/** WHERE HIS STAFF IS, on his bones: its foot, its head, the middle of the skull, the way it points, its joints, and its forward and left. */
export function staffOf(s: Skeleton): { foot: V3; top: V3; skull: V3; way: V3; joints: V3[]; fwd: V3; left: V3 } {
  const way = s.point;
  const hf = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const fwd = norm(sub(hf, mul(way, dot(hf, way))), [1, 0, 0]);
  const left = norm(cross(way, fwd), [0, 1, 0]);
  const foot = add(s.handR, mul(way, -STAFF_GRIP));
  const joints = JOINTS.map(([at, f, l]) => add(add(foot, mul(way, at)), add(mul(fwd, f), mul(left, l))));
  const top = joints[joints.length - 1];
  return { foot, top, skull: add(top, mul(way, SKULL_UP)), way, joints, fwd, left };
}

// ---------------------------------------------------------------------------------------------
// Fire, painted in the picture's own pixels

/** A point of the figure that is seen `dx`, `dy` picture pixels across and down the picture from `c`, as near the eye as it. */
function screenStep(st: Stage, c: V3, dx: number, dy: number): V3 {
  const b = st.back;
  return add(c, [b[0][0] * dx + b[0][1] * dy, b[1][0] * dx + b[1][1] * dy, b[2][0] * dx + b[2][1] * dy]);
}
/** How wide a tongue of flame is from its foot (0) to its tip (1): round underneath, widest a third of the way up, drawn out to a point. */
function tearAt(t: number): number {
  const waist = 0.34;
  if (t < waist) {
    const k = 1 - t / waist;
    return Math.sqrt(1 - k * k * 0.9);
  }
  return (1 - ((t - waist) / (1 - waist)) ** 1.6) ** 1.4;
}
/**
 * A FIRE OF THE ENEMY'S, hot pink burning to gold, standing up off `base`: `tall` and `wide` picture
 * pixels, its tongues rising, falling and leaning each to its own beat (`ph`), and (if `sparks`) sparks
 * going up off it; `hot` from 0 (embers) to 1 and over (a white-gold heart); `lean0` bends it sideways.
 * Laid in the picture's own pixels, on the layer over everything; `hidden` says a pixel of it is behind
 * something of him.
 */
function fireAt(st: Stage, put: Put, base: V3, tall: number, wide: number, ph: number, hot: number, seed: number, hidden?: (p: V3, x: number, y: number) => boolean, sparks = true, lean0 = 0): void {
  if (tall < 1.5) return;
  const [bx, by] = st.at(base);
  const lit = new Map<number, string>();
  const shells: [number, string][] = [[1, FLAME[1]], [0.8, FLAME[2]], [0.55, FLAME[3]]];
  if (hot > 0.75) shells.push([0.28, FLAME[4]]);
  const tongues: ReadonlyArray<readonly [number, number, number, number, number, number, number, number]> = [
    [0, 0, 0, 1, 1, 2, 1, 0],
    [-0.6, -0.9, 0.16, 0.55, 0.42, 3, 2, 2.1 + seed],
    [0.62, 0.95, 0.22, 0.48, 0.38, 1, 3, 4.4 + seed],
  ];
  const body = tall * (1 + 0.12 * Math.sin(ph * 2 + seed) + 0.07 * Math.sin(ph * 3 + 1.1 + seed));
  for (const [s, colour] of shells) {
    for (const [at, tip, up0, tl, wd, beat, sway, phase] of tongues) {
      const full = at === 0 ? body : body * tl * (1 + 0.24 * Math.sin(ph * beat + phase));
      const lean = Math.sin(ph * sway + phase * 1.7) * 0.8 + lean0;
      const rows = Math.max(1, Math.round(full * s));
      const up = Math.round(up0 * body) + (s < 1 ? Math.max(1, Math.round((1 - s) * full * 0.16)) : 0);
      for (let i = 0; i < rows; i++) {
        const k = rows > 1 ? i / (rows - 1) : 0;
        const hw = Math.max(0.5, wd * wide * s * tearAt(k));
        const h = Math.min(1.2, (i + up) / Math.max(1, body));
        const mid = bx + at * wide + (tip - at) * 0.6 * wide * k ** 1.3 + lean * h * h * (1 + tall * 0.1);
        const x0 = Math.round(mid - hw);
        const x1 = Math.max(x0 + 1, Math.round(mid + hw));
        const y = Math.round(by) - up - i;
        for (let x = x0; x < x1; x++) lit.set(y * 4096 + x, colour);
      }
    }
  }
  if (sparks) {
    // (sparks: thrown off, they rise, wander and go out)
    const n = 2 + Math.round(2 * Math.min(1.5, hot));
    for (let j = 0; j < n; j++) {
      const life = ((ph / (Math.PI * 2)) * (2 + (j % 2)) + j * 0.37 + seed * 0.13) % 1;
      if (life > 0.7) continue;
      const x = Math.round(bx + (((j * 0.618 + seed * 0.37) % 1) - 0.5) * wide * 2.2 + Math.sin(life * 6 + j) * 1.5 + lean0 * life * 4);
      const y = Math.round(by - tall * (0.75 + life * 0.9));
      // (a fleck of two, never one pixel alone)
      lit.set(y * 4096 + x, life < 0.35 ? FLAME[3] : FLAME[2]);
      lit.set((y + (j % 2 ? 1 : -1)) * 4096 + x + 1, FLAME[2]);
    }
  }
  for (const [key, colour] of lit) {
    const y = Math.floor((key + 2048) / 4096);
    const x = key - y * 4096;
    const p = screenStep(st, base, x + 0.5 - bx, y + 0.5 - by);
    if (hidden?.(p, x, y)) continue;
    put('fire', 'fire', { k: 'mote', p, c: colour, size: 1 });
  }
}
/** A ball of the enemy's fire, `r` picture pixels round, its heart gold, and a tail of it streaming back along `back` (a way in the picture), `tail` long. */
function fireBall(st: Stage, put: Put, c: V3, r: number, back: readonly [number, number], tail: number, hidden?: (p: V3, x: number, y: number) => boolean, core: string = FLAME[4]): void {
  const [cx, cy] = st.at(c);
  const bl = Math.hypot(back[0], back[1]) || 1;
  const bx = back[0] / bl;
  const by = back[1] / bl;
  const R = Math.ceil(r + tail + 1);
  for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++) {
    for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      // (along the tail, and across it: the ball drawn out into a comet)
      const a = dx * bx + dy * by;
      const b = -dx * by + dy * bx;
      const k = a > 0 ? clamp01(a / Math.max(0.1, tail)) : 0;
      const w = r * (1 - k * 0.85);
      const d = Math.hypot(a > 0 ? (a * r) / Math.max(r, tail) : a, b) / Math.max(0.5, w);
      if (d > 1) continue;
      const colour = d < 0.35 && k < 0.3 ? core : d < 0.6 && k < 0.55 ? FLAME[3] : d < 0.85 ? FLAME[2] : FLAME[1];
      const p = screenStep(st, c, dx, dy);
      if (hidden?.(p, x, y)) continue;
      put('fire', 'fire', { k: 'mote', p, c: colour, size: 1 });
    }
  }
}

/**
 * A TONGUE OF FIRE, one flame laid in the picture's own pixels: from its foot at `b` (picture pixels) up,
 * `tall` high and `wide` across at its widest, its tip leaning `lean` pixels over; gold at its foot, pink in
 * its body, deep pink at its tip (a step hotter with `hot` over 1.2). On the layer over everything, as near
 * the eye as `ref`; `skip` leaves a pixel alone.
 */
function tongueAt(st: Stage, put: Put, ref: V3, b: readonly [number, number], tall: number, wide: number, lean: number, hot: number, skip?: (x: number, y: number) => boolean, steps?: number): void {
  const rows = Math.round(tall);
  if (rows < 1) return;
  const [rx, ry] = st.at(ref);
  const step = steps ?? (hot > 1.2 ? 1 : 0);
  let was: [number, number] | null = null;
  for (let i = 0; i < rows; i++) {
    const k = rows > 1 ? i / (rows - 1) : 0;
    const hw = Math.max(0.5, (wide / 2) * (k < 0.3 ? 0.75 + k : 1.05 * ((1 - k) / 0.7) ** 0.8));
    const cx = b[0] + lean * k * k;
    const y = Math.floor(b[1]) - i;
    let xa = Math.round(cx - hw);
    let xb = Math.max(xa + 1, Math.round(cx + hw));
    // (each row touching the one below it: a flame is never broken into lone pixels)
    if (was) {
      if (xa > was[1]) {
        xb -= xa - was[1];
        xa = was[1];
      } else if (xb < was[0]) {
        xa += was[0] - xb;
        xb = was[0];
      }
    }
    was = [xa, xb];
    for (let x = xa; x < xb; x++) {
      if (skip?.(x, y)) continue;
      const c = FLAME[Math.max(0, Math.min(4, (k < 0.3 ? 3 : k < 0.7 ? 2 : 1) + step))];
      put('fire', 'fire', { k: 'mote', p: screenStep(st, ref, x + 0.5 - rx, y + 0.5 - ry), c, size: 1 });
    }
  }
}

/**
 * AN EMBER, never a dot: with his pink edge round it a dot is a cross (+). A fleck slanting one way or the
 * other, three pixels long, dimming along it (by `seed`); at `p`, on the layer over everything.
 */
function fleck(st: Stage, put: Put, p: V3, c: string, seed: number, part = 'embers'): void {
  const [x, y] = st.at(p);
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const kind = ((Math.floor(seed * 7.13) % 4) + 4) % 4;
  const dy = kind % 2 === 0 ? 1 : -1;
  const n = 3;
  const dim = FLAME[Math.max(0, FLAME.indexOf(c) - 1)];
  for (let i = 0; i < n; i++) put(part, part, { k: 'mote', p: screenStep(st, p, xi + i + 0.5 - x, yi + i * dy + 0.5 - y), c: i === 0 ? c : dim, size: 1 });
}

// ---------------------------------------------------------------------------------------------
// Little pictures painted pixel by pixel: the skull, his hands, the face in his hood. At a phone's size
// a figure is a few dozen pixels tall, and these are what he is known by, so each is laid down pixel by
// pixel as a little picture, held square to the eye (as a sign is held up to it), as near the eye as the
// thing it is: what of him is nearer hides it, and the style's dark seam goes round it as round any part.

/** A point in the picture, in its own pixels (across, down). */
type P2 = [number, number];
/** A little picture: a colour at each pixel it has (keyed by `pk`). */
type Pix = Map<number, string>;
const pk = (x: number, y: number): number => (y + 2048) * 4096 + (x + 2048);
const pxOf = (k: number): P2 => [(k % 4096) - 2048, Math.floor(k / 4096) - 2048];
/** The pixels of a little picture, and those beside, above and below them (`by` deep): what fire laid over it leaves alone, so that its seam shows. */
function grown(keys: Iterable<number>, by = 1): Set<number> {
  const out = new Set<number>();
  for (const k of keys) {
    const [x, y] = pxOf(k);
    for (let dy = -by; dy <= by; dy++) for (let dx = -by; dx <= by; dx++) if (Math.abs(dx) + Math.abs(dy) <= by) out.add(pk(x + dx, y + dy));
  }
  return out;
}
/** A line one pixel thick from `a` to `b`, each pixel coloured by how far along it is (0 to 1). */
function linePix(pix: Pix, a: P2, b: P2, colour: (k: number) => string): void {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))));
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    pix.set(pk(Math.floor(a[0] + (b[0] - a[0]) * k), Math.floor(a[1] + (b[1] - a[1]) * k)), colour(k));
  }
}
const rot2 = (v: P2, deg: number): P2 => {
  const a = deg * D;
  return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
};
const unit2 = (v: P2): P2 => {
  const l = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / l, v[1] / l];
};
const add2 = (a: P2, b: P2, k = 1): P2 => [a[0] + b[0] * k, a[1] + b[1] * k];

/** A unit square to `a` (and as near `want` as can be). */
function squareTo(a: V3, want: V3, or: V3): V3 {
  return norm(sub(want, mul(a, dot(want, a))), or);
}

/** A LITTLE PICTURE held square to the eye, as near it as `at`: a part of him like any other (seamed round, hidden by what is nearer). */
function stamp(st: Stage, put: Put, part: string, piece: string, pix: Pix, at: V3): void {
  if (!pix.size) return;
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const k of pix.keys()) {
    const [x, y] = pxOf(k);
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const mx = x0 + w / 2;
  const my = y0 + h / 2;
  const [ax, ay] = st.at(at);
  const c = screenStep(st, at, mx - ax, my - ay);
  const u = sub(screenStep(st, c, w / 2, 0), c);
  const v = sub(screenStep(st, c, 0, -h / 2), c);
  const lu = len(u);
  const lv = len(v);
  put(part, piece, { k: 'panel', c, u, v, skin: (a, b) => pix.get(pk(Math.floor(mx + (a / lu) * (w / 2)), Math.floor(my - (b / lv) * (h / 2)))) ?? null });
}

// ---------------------------------------------------------------------------------------------
// His hands

/**
 * HIS CASTING HAND, a claw half as big again as a man's hand, of bone-pale bones: a narrow palm out of the
 * wrist along the forearm's way (`way`, in the picture), and from its far edge four long fingers fanned
 * about `fan`, `spread` degrees from the little finger to the first, each of three bones, hooked in toward
 * the middle of the claw by `curl` (0 spread straight, 1 a claw closed round the fire), and the thumb off
 * the palm's side (`side`: which side of the forearm's way, in the picture); the last two pixels of each
 * burning, pink to gold, hotter with `heat`. Its pixels, the heart of the claw (where the fire is held),
 * and its fingertips.
 */
function clawPix(wr: P2, way: P2, fan: P2, spread: number, curl: number, heat: number, side: number): { pix: Pix; keep: Set<number>; heart: P2; tips: P2[] } {
  const pix: Pix = new Map();
  /** Its fingers above their first knuckles: what the fire it holds stays off, so that they stand out of it, seamed. */
  const outer: Pix = new Map();
  const across: P2 = [-way[1] * side, way[0] * side];
  const c = clamp01(curl);
  // THE PALM, narrow and bony: lit on its upper edge
  for (let a = 0; a <= 3.4; a += 0.5) {
    const half = 1.1 + 0.5 * (a / 3.4);
    for (let b = -half; b <= half + 1e-6; b += 0.5) {
      const p = add2(add2(wr, way, a), across, b);
      const up = across[1] * b < -0.4;
      pix.set(pk(Math.floor(p[0]), Math.floor(p[1])), up ? PALE.L : PALE.M);
    }
  }
  // THE FINGERS: from the knuckles along the palm's far edge, fanned wide, each hooked in toward the claw's middle
  const kn = add2(wr, way, 3.6);
  const sgn = fan[0] * across[1] - fan[1] * across[0] >= 0 ? 1 : -1;
  const LONG = [7.4, 8.8, 9.0, 7.6];
  const tips: P2[] = [];
  const hotA = heat > 0.45 ? FLAME[2] : FLAME[1];
  const hotB = heat > 1.05 ? FLAME[4] : heat > 0.45 ? FLAME[3] : FLAME[2];
  const finger = (base: P2, d0: P2, long: number, bend: number): P2 => {
    let at = base;
    let d = d0;
    const parts = [0.4, 0.33, 0.27];
    for (let j = 0; j < 3; j++) {
      const next = add2(at, d, long * parts[j]);
      const last = j === 2;
      const colour = (k: number): string => (last && k > 0.5 ? (k > 0.8 ? hotB : hotA) : j === 0 && k < 0.2 ? PALE.H : PALE.L);
      linePix(pix, at, next, colour);
      if (j > 0) linePix(outer, at, next, colour);
      at = next;
      d = rot2(d, bend);
    }
    return at;
  };
  for (let i = 0; i < 4; i++) {
    const t = (i - 1.5) / 1.5;
    const base = add2(kn, across, t * 1.5);
    const d0 = unit2(rot2(fan, sgn * t * (spread / 2)));
    const long = LONG[i] * (1 - 0.18 * c);
    tips.push(finger(base, d0, long, -sgn * t * (3 + 13 * c)));
  }
  // THE THUMB, off the palm's side
  {
    const base = add2(add2(wr, way, 1.6), across, 1.7);
    const d0 = unit2(rot2(fan, sgn * (spread / 2 + 26)));
    tips.push(finger(base, d0, 6.4 * (1 - 0.15 * c), -sgn * (8 + 16 * c)));
  }
  // (the fire sits in the hollow of the claw, over the palm and the roots of the fingers)
  const heart = add2(kn, fan, 3.6 + 0.6 * (1 - c));
  return { pix, keep: new Set(pix.keys()), heart, tips };
}

/**
 * HIS STAFF HAND, round the bone (`g` where he holds it, `along` the staff's way up the picture, `toArm` the
 * way to his forearm across it): the back of his hand on the forearm's side, its knuckles standing out of it
 * one by one, and three long fingers slanting down across the bone, each its own length, pointed, their tips
 * lit pink to gold with `heat` beyond its far side; his thumb hooked over it above them. Nothing of it closes
 * on itself (a ring of finger round a gap reads at this size as a letter or a number).
 */
function gripPix(g: P2, along: P2, toArm: P2, heat: number): Pix {
  const pix: Pix = new Map();
  const tip = heat > 0.7 ? FLAME[3] : heat > 0.3 ? FLAME[2] : FLAME[1];
  const at = (a: number, b: number): P2 => add2(add2(g, along, a), toArm, b);
  const dot1 = (p: P2, c: string): void => {
    pix.set(pk(Math.floor(p[0]), Math.floor(p[1])), c);
  };
  // (the back of the hand: a narrow blob on the forearm's side, its edge not straight)
  for (let a = -2.0; a <= 1.6; a += 0.5) for (let b = 2.2; b <= 3.4 - 0.25 * Math.abs(a); b += 0.5) dot1(at(a, b), b < 2.7 ? PALE.L : PALE.M);
  // (three fingers: from a knuckle, down across the bone, each its own length, pointed and lit at its tip)
  const FINGERS: ReadonlyArray<readonly [number, number]> = [[1.1, 4.4], [-0.9, 5.2], [-2.8, 3.8]];
  for (const [a0, long] of FINGERS) {
    dot1(at(a0, 2.0), PALE.H);
    const from = at(a0, 1.6);
    const to = at(a0 - 0.55 * long, 1.6 - long);
    linePix(pix, from, to, (k) => (k > 0.82 ? tip : PALE.L));
  }
  // (his thumb, hooked over the bone above them)
  linePix(pix, at(1.8, 2.2), at(3.1, 0.1), (k) => (k > 0.7 ? PALE.M : PALE.L));
  return pix;
}

// ---------------------------------------------------------------------------------------------
// The skull at his staff's head

/**
 * THE SKULL, as it is painted, pixel by pixel (14 across: about his hood's width, no more), pale bone lit from
 * the upper left: a broad, low cranium; a heavy brow coming down over two deep sockets that slant in toward
 * the nose (a scowl), DARK PITS, the fire deep in each low at its outer side (p), whence it licks up and out
 * over the temple; the notch of the nose; a broken row of upper teeth; the mouth open below them, dark, at
 * most a dim glow in it (d); and the jaw HANGING OPEN below it on its two hinges, a few teeth left in it. (H
 * highlight, L lit, M middle, S shade; k the dark of a hole.)
 */
const SKULL_PIX: ReadonlyArray<string> = [
  '....HHHLLL....',
  '..HHHHLLLLLM..',
  '.HHHHLLLLLLLM.',
  'HHHLLLLLLLLLMS',
  'HHLLLLLLLLLLMS',
  'HLLLLLLLLLLLMS',
  'HLkkLLLLLLkkMS',
  'LkkkkkLLkkkkkS',
  'LpkkkkLLkkkkpS',
  'LkpkkkLLkkkpkS',
  '.LkkkLkkLkkkS.',
  '.MLLMLkkLMLLS.',
  '.LLkLLkLkLLkS.',
  '.LkkkdddkkkkS.',
  '.MkkkkddkkkkS.',
  '..MkLLkLkLkS..',
  '..MLLLMMMMMS..',
  '...MLMMMMSS...',
  '.....MMSS.....',
];
/** How wide the skull is, as painted (picture pixels). */
export const FM_SKULL_WIDE = Math.max(...SKULL_PIX.map((row) => row.length));
/** The row of the open mouth that its jaw drops below as it roars; where in it the fire in its sockets is (column, row), and which way each licks out. */
const SKULL_MOUTH = 13;
const SKULL_EYES: ReadonlyArray<readonly [number, number, number]> = [[1, 8, -1], [12, 8, 1]];
const SKULL_MID: P2 = [7, 9];
/** THE SKULL'S PIXELS, its top left at `x0`, `y0`; its fire as hot as `hot` (0 embers, 1 burning, 2 roaring), out if `lit` is; its jaw dropped `drop` pixels further. */
function skullPix(x0: number, y0: number, hot: number, lit: number, drop: number): Pix {
  const pix: Pix = new Map();
  // (the fire deep in its sockets: dim as it is drawn down out of it, hotter as it roars; the glow in its mouth never more than dim)
  const pit = lit < 0.05 ? INK : hot > 1.3 ? FLAME[2] : hot < 0.55 ? FLAME[0] : FLAME[1];
  const mouth = lit < 0.05 ? INK : hot > 1.3 ? FLAME[0] : '#4a0c38';
  const rows: string[] = [];
  SKULL_PIX.forEach((row, r) => {
    rows.push(row);
    if (r === SKULL_MOUTH) for (let d = 0; d < drop; d++) rows.push(row.replace(/d/g, 'k'));
  });
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '.') continue;
      const c = ch === 'k' ? INK : ch === 'p' ? pit : ch === 'd' ? mouth : IVORY[ch as keyof typeof IVORY];
      pix.set(pk(x0 + i, y0 + j), c);
    }
  });
  return pix;
}

// ---------------------------------------------------------------------------------------------
// His robe's tails

/** The phase of his stand at a moment (round once in it), for what ripples and flickers. */
const FM_STAND_LONG = 3.6;
const phaseOf = (t: number): number => (t / FM_STAND_LONG) * Math.PI * 2;

/** The tails his robe ends in, round its hem: where round it (degrees from before him), how long, how thick. Uneven, longer behind (his train). */
const TAILS: ReadonlyArray<readonly [number, number, number]> = [
  [8, 4.6, 1.25], [52, 6.4, 1.3], [-40, 5.6, 1.3], [100, 9.0, 1.4], [-96, 9.5, 1.4], [142, 12.5, 1.45], [-138, 11.5, 1.45], [178, 13.5, 1.5],
];
/**
 * HIS ROBE'S TAILS, as they are at a moment: from the hem (`hem`, its middle and half-lengths), each down a
 * little and then curling out and up at its end, rippling, kicked out by `gale`, left behind as he moves
 * (`lag`); never down on the floor. Each tail's points, thickest first. (For the painter and the tests.)
 */
export function fmTails(hem: { c: V3; f: V3; l: V3; deep: number; wide: number }, ph: number, gale: number, lag: V3 = [0, 0, 0]): { pts: V3[]; r: number }[] {
  return TAILS.map(([deg, long, r], j) => {
    const a = deg * D;
    const out: V3 = norm(add(mul(hem.f, Math.cos(a)), mul(hem.l, Math.sin(a))));
    const rear = Math.max(0, -Math.cos(a));
    const base = add(hem.c, add(mul(hem.f, Math.cos(a) * hem.deep * 0.92), mul(hem.l, Math.sin(a) * hem.wide * 0.92)));
    const pts: V3[] = [base];
    let at = base;
    const n = 5;
    const step = (long * (1 + 0.15 * gale)) / n;
    for (let k = 1; k <= n; k++) {
      // (down at first, then curling out, then up: the more so behind him, and as he lurches)
      const fore = Math.max(0, Math.cos(a));
      const th = (-86 + 26 * rear + ((k / n) ** 1.5) * (70 + 40 * fore + 80 * rear + 40 * gale) + 13 * Math.sin(ph * 2 + j * 1.7 + k * 0.9)) * D;
      const sway = Math.sin(ph * 2 + j * 2.3 + k * 0.7) * 0.5 * k;
      at = add(at, add(add(mul(out, Math.cos(th) * step), [0, 0, Math.sin(th) * step]), add(mul(cross([0, 0, 1], out), sway * 0.4), mul(lag, 0.18 * k * (0.5 + rear)))));
      pts.push(at);
    }
    return { pts, r };
  });
}
/**
 * HIS ROBE BELOW HIS WAIST: it hangs PLUMB from his hips to its hem, a little narrower at the hem than at the
 * hips, whatever his drawn-up legs are doing inside it (nothing of them is painted: there is nothing of him
 * below his waist but robe), so that he stands upright in it and never sits; left behind as he moves
 * (`lag`), kicked out by `gale`. Its rings, from the waist down. (For the painter and the tests.)
 */
function fmSkirt(s: Skeleton, gale = 0, lag: V3 = [0, 0, 0]): Ring[] {
  const B = FB;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const hemZ = FM_HEM_UP + (s.pelvis[2] - FM_PELVIS_UP);
  const hipZ = s.pelvis[2] - 1.5;
  const rings: Ring[] = [{ c: waistC, u: mul(s.belly[0], B.waistDeep + 2.0), v: mul(s.belly[1], B.waistHalf + 2.0) }];
  const N = 4;
  for (let i = 0; i <= N; i++) {
    const k = i / N;
    const z = hipZ + (hemZ - hipZ) * k;
    const c: V3 = [s.pelvis[0] + lag[0] * k, s.pelvis[1] + lag[1] * k, z];
    const deep = B.pelvisDeep + 2.6 + (FM_HEM_WIDE - 2.6) * k + 1.5 * gale * k;
    const wide = B.pelvisHalf + 2.6 + (FM_HEM_WIDE - 2.6) * k + 1.5 * gale * k;
    rings.push({ c, u: mul(f, deep), v: mul(l, wide) });
  }
  return rings;
}
/** His hem at a moment (its middle, its forward and left, its half-lengths), as his painter makes it: for the tests. */
export function fmHemOf(s: Skeleton): { c: V3; f: V3; l: V3; deep: number; wide: number } {
  const hem = fmSkirt(s).slice(-1)[0];
  return { c: hem.c, f: norm(hem.u), l: norm(hem.v), deep: len(hem.u), wide: len(hem.v) };
}

// ---------------------------------------------------------------------------------------------
// The gout of fire he flings

/** When it leaves his hand, when it strikes the floor, how long it burns there; where it lands (before him and to his left: beside him, from in front and from behind). */
export const FM_GOUT_LET = 2.14;
export const FM_GOUT_LAND = 2.54;
export const FM_GOUT_BURN = 0.9;
export const FM_GOUT_SPOT: V3 = [56, 8, 0];

// ---------------------------------------------------------------------------------------------
// Him, as solids

/** THE FLESHMANCER AS SOLIDS: his robe and its tails, his sleeves and bare forearms, his hands, the mantle and the collar of bone behind his hood, the band down his front, the hood and his eyes, the staff, the skull and its fire, the gout of fire he flings. */
function fleshmancerBits(st: Stage, m: Moment): Bit[] {
  const { s, q } = m;
  const B = FB;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const flare = clamp01(q.pt);
  const gale = clamp01(q.gale);
  const handFire = Math.max(0, q.pAz);
  const charge = clamp01(q.pAz - 1);
  const ph = phaseOf(m.t);
  const lagRaw = mul(m.come, -1.4);
  const lag = len(lagRaw) > 3 ? mul(lagRaw, 3 / len(lagRaw)) : lagRaw;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const pulse = 0.5 + 0.5 * Math.sin(ph * 4 + 0.4);
  /** How far behind him a point is, as the eye sees it, 0 not at all to 1 well behind (for a light that goes behind him and comes out again: never all at once). */
  const behindness = (p: V3): number => {
    const deep = clamp01((st.near(s.ribs) - 1.5 - st.near(p)) / 3);
    const [x, y] = st.at(p);
    const [nx, ny] = st.at(s.neck);
    const floorY = st.at([s.pelvis[0], s.pelvis[1], FM_HEM_UP])[1];
    const [hx] = st.at([s.pelvis[0], s.pelvis[1], 0]);
    const k = clamp01((y - ny) / Math.max(1, floorY - ny));
    const half = y < ny - 3 ? 10 : 15 - 7 * k;
    const inside = clamp01((half - Math.abs(x - (nx + (hx - nx) * k))) / 5) * clamp01((y - (ny - 16)) / 4) * clamp01((floorY - y) / 4);
    return deep * inside;
  };
  /** Behind him, as the eye sees it: further from the eye than his chest, and within his shape across the picture (for what is laid over everything: fire in a hand held out before him, seen from behind). */
  const behindHim = (p: V3): boolean => {
    if (st.near(p) > st.near(s.ribs) - 1.5) return false;
    const [x, y] = st.at(p);
    const [nx, ny] = st.at(s.neck);
    const floorY = st.at([s.pelvis[0], s.pelvis[1], FM_HEM_UP])[1];
    const [hx] = st.at([s.pelvis[0], s.pelvis[1], 0]);
    if (y < ny - 14 || y > floorY) return false;
    const k = clamp01((y - ny) / Math.max(1, floorY - ny));
    // (his hood and the collar of bone above his shoulders; his mantle and robe below them, narrowing)
    return Math.abs(x - (nx + (hx - nx) * k)) < (y < ny - 3 ? 10 : 15 - 7 * k);
  };

  // --- HIS ROBE: from his neck, broad over the chest, narrowing to a hem off the floor ---
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const be = s.belly;
  const torso: Ring[] = [
    { c: add(s.neck, mul(cu, 1.0)), u: mul(cf, 4.4), v: mul(cl, 5.4) },
    { c: lerp3(s.ribs, s.neck, 0.7), u: mul(cf, B.ribDeep + 2.2), v: mul(cl, B.shoulderHalf + 0.4) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 2.0), v: mul(cl, B.ribHalf + 2.2) },
    { c: waistC, u: mul(be[0], B.waistDeep + 2.0), v: mul(be[1], B.waistHalf + 2.0) },
  ];
  const skirt = fmSkirt(s, gale, lag);
  const hem = skirt[skirt.length - 1];
  const hemF = norm([hem.u[0], hem.u[1], 0], f);
  const hemL = norm([hem.v[0], hem.v[1], 0], l);
  const hemDeep = len(hem.u);
  const hemWide = len(hem.v);
  {
    // (its hem rippling as it hangs)
    const pts: V3[] = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const p = add(hem.c, add(mul(hemF, Math.cos(a) * hemDeep), mul(hemL, Math.sin(a) * hemWide)));
      pts.push(add(p, [0, 0, Math.sin(ph * 2 + a * 3) * 0.7 + Math.sin(ph + a * 5) * 0.3]));
    }
    skirt[skirt.length - 1] = { ...hem, pts };
  }
  const robeRings = [...torso, ...skirt.slice(1)];
  put('robe', 'robe', { k: 'cloth', rings: robeRings, ramp: FM_ROBE, look: { folds: [30, -30, 70, -70, 115, -115, 160, -160], lift: 0.06 } });

  // HIS TAILS: tattered, curling up at their ends, the pink lining showing as they curl; and the embers that drip off them
  const tails = fmTails({ c: hem.c, f: hemF, l: hemL, deep: hemDeep, wide: hemWide }, ph, gale, lag);
  tails.forEach(({ pts, r }, j) => {
    for (let k = 0; k + 1 < pts.length; k++) {
      const ra = r * (1 - k / pts.length) + 0.25;
      const rb = r * (1 - (k + 1) / pts.length) + 0.2;
      put(`tail${j % 3}`, 'robe', { k: 'rod', a: pts[k], b: pts[k + 1], ra, rb, ramp: k >= pts.length - 2 ? FM_LINING : FM_ROBE, far: true });
    }
    if (lit > 0.05) {
      // (an ember off its tip now and then, dripping down toward the floor and going out)
      const life = (m.t / FM_STAND_LONG) * 3 + hash(j, 1, 223);
      const k = life % 1;
      if (k < 0.65) {
        const tip = pts[pts.length - 1];
        const z = tip[2] - 9 * (k / 0.65) ** 1.6;
        if (z > 0.5) fleck(st, put, [tip[0], tip[1], z], k < 0.2 ? FLAME[3] : k < 0.45 ? FLAME[2] : FLAME[1], j + Math.floor(life));
      }
    }
  });
  // (the floor under him, lit faintly by his embers: there is floor between him and it)
  if (lit > 0.05) {
    put('glow', 'glow', { k: 'glow', p: [s.pelvis[0], s.pelvis[1], 0.5], c: SOCKET, r: 14 + 3 * gale, a: (0.34 + 0.06 * pulse) * lit });
    put('glow', 'glow', { k: 'glow', p: [s.pelvis[0], s.pelvis[1], 0.5], c: FLAME[3], r: 6, a: 0.22 * lit });
  }

  // --- HIS SLEEVES, pushed back to the elbow, their pink lining showing; out of each a bare, bony forearm ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    put(`sleeve${side}`, `sleeve${side}`, { k: 'rod', a: sh, b: el, ra: 2.9, rb: 3.1, ramp: FM_ROBE, far: true });
    const e1 = squareTo(fore, [0, 0, 1], cu);
    const e2 = norm(cross(fore, e1));
    const mouth = add(el, mul(fore, 1.4));
    const sway = Math.sin(ph * 2 + (side === 'L' ? 0 : 1.7)) * 0.9;
    const droop = 3.4 + 2.0 * gale;
    const mouthPts: V3[] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const r = 3.9 + 0.8 * gale;
      const p = add(mouth, add(mul(e1, Math.cos(a) * r), mul(e2, Math.sin(a) * r)));
      const under = Math.max(0, -Math.cos(a));
      mouthPts.push(add(p, add([0, 0, -under * droop + sway * under], mul(lag, under * 0.6))));
    }
    const rings: Ring[] = [
      { c: lerp3(sh, el, 0.55), u: mul(e1, 2.9), v: mul(e2, 2.9) },
      { c: el, u: mul(e1, 3.2), v: mul(e2, 3.2) },
      { c: mouth, u: mul(e1, 3.9), v: mul(e2, 3.9), pts: mouthPts },
    ];
    put(`sleeve${side}`, `sleeve${side}`, { k: 'cloth', rings, ramp: FM_ROBE, look: { folds: [90, -90, 180], lift: 0.1, lining: 0.5 } });
    // (the pink lining inside its mouth, round the forearm)
    put(`sleeve${side}`, `sleeve${side}`, { k: 'ball', c: add(mouth, mul(fore, -0.2)), ax: [mul(fore, 0.45), mul(e1, 3.3), mul(e2, 3.3)], skin: FM_LINING, far: true });
    const wrist = add(hand, mul(fore, -0.4));
    put(`arm${side}`, `arm${side}`, { k: 'rod', a: add(mouth, mul(fore, -0.6)), b: wrist, ra: 1.0, rb: 0.8, ramp: HAND_BONE, far: true });
    put(`arm${side}`, `arm${side}`, { k: 'ball', c: wrist, ax: sphere(1.05), skin: HAND_BONE, far: true });
  }

  // --- THE STAFF: bone, knuckled, spurred, a crook near its head ---
  const staff = staffOf(s);
  {
    const J = staff.joints;
    for (let i = 0; i + 1 < J.length; i++) {
      const a = J[i];
      const b = J[i + 1];
      const m0 = lerp3(a, b, 0.5);
      // (each a bone, thinner in its middle than at its ends)
      const rEnd = 1.45 + 0.3 * hash(i, 1, 151);
      put('staff', 'staff', { k: 'rod', a, b: m0, ra: rEnd, rb: 1.0, ramp: STAFF_BONE, far: true });
      put('staff', 'staff', { k: 'rod', a: m0, b, ra: 1.0, rb: rEnd, ramp: STAFF_BONE, far: true });
    }
    J.forEach((jt, i) => {
      if (i === 0 || i === J.length - 1) return;
      const big = 1.85 + 0.6 * hash(i, 2, 151);
      const tw = i * 1.7 + hash(i, 3, 151) * 2;
      const a1 = add(mul(staff.fwd, Math.cos(tw)), mul(staff.left, Math.sin(tw)));
      const a2 = norm(cross(staff.way, a1));
      put('staff', 'staff', { k: 'ball', c: jt, ax: [mul(a1, big), mul(a2, big * 0.75), mul(staff.way, 1.1)], skin: STAFF_BONE, far: true });
    });
    put('staff', 'staff', { k: 'ball', c: staff.foot, ax: sphere(1.8), skin: STAFF_BONE, far: true });
    // its spurs: bones grown out of its joints, away from him, hooked upward, pointed
    for (const [i, fw, lf, long] of SPURS) {
      const out = norm(add(mul(staff.fwd, fw), mul(staff.left, lf)));
      const way = norm(add(mul(out, 0.85), mul(staff.way, 0.5)));
      const b0 = J[i];
      const b1 = add(b0, mul(way, long * 0.55));
      const b2 = add(b1, mul(norm(add(way, mul(staff.way, 0.9))), long * 0.45));
      put('staff', 'staff', { k: 'rod', a: b0, b: b1, ra: 0.95, rb: 0.65, ramp: STAFF_BONE, far: true });
      put('staff', 'staff', { k: 'rod', a: b1, b: b2, ra: 0.65, rb: 0.2, ramp: STAFF_BONE, far: true });
    }
  }
  // HIS STAFF HAND, its long fingers wrapped round the bone, their tips lit
  {
    const [gx, gy] = st.at(s.handR);
    const [tx, ty] = st.at(staff.top);
    const [fx, fy] = st.at(staff.foot);
    const along = unit2([tx - fx, ty - fy]);
    const [ex, ey] = st.at(s.elbowR);
    const toArm0: P2 = [-along[1], along[0]];
    const toArm: P2 = toArm0[0] * (ex - gx) + toArm0[1] * (ey - gy) >= 0 ? toArm0 : [-toArm0[0], -toArm0[1]];
    const heat = lit * (0.5 + 0.3 * pulse + 0.4 * flare);
    stamp(st, put, 'handR', 'handR', gripPix([Math.floor(gx) + 0.5, Math.floor(gy) + 0.5], along, toArm, heat), add(s.handR, mul(st.eye, 2.4)));
  }

  // --- THE SKULL AT ITS HEAD, looking at you whichever way he faces; the fire licking up and out of its sockets, a ragged flame off its crown ---
  {
    const sc = staff.skull;
    const suck = charge;
    const hot = lit * (1 + 0.8 * flare - 0.55 * suck);
    const [scx, scy] = st.at(sc);
    const x0 = Math.round(scx) - SKULL_MID[0];
    const y0 = Math.round(scy) - SKULL_MID[1];
    const drop = flare > 0.55 ? 2 : flare > 0.2 ? 1 : 0;
    const pix = skullPix(x0, y0, hot, lit, drop);
    stamp(st, put, 'skull', 'skull', pix, add(sc, mul(st.eye, 1.5)));
    if (lit > 0.05) {
      const behindSkull = grown(pix.keys(), 1);
      const atPx = (x: number, y: number): V3 => screenStep(st, sc, x + 0.5 - scx, y + 0.5 - scy);
      const roar = 1 + 0.15 * Math.sin(ph * 6 + 0.7) + 0.7 * flare - 0.6 * suck;
      const step = hot > 1.3 ? 0 : -1;
      // OUT OF ITS SOCKETS: from the fire deep in each, a tongue licking up and out over the temple, away from its face
      SKULL_EYES.forEach(([ex, ey, out], i) => {
        const lean = out * (3.2 + 1.0 * Math.sin(ph * 4 + i * 2));
        tongueAt(st, put, sc, [x0 + ex + 0.5, y0 + ey + 1], (5 + 1.5 * Math.sin(ph * 6 + i * 2.3)) * roar * lit, 1.8 + 0.6 * flare, lean, 1, undefined, step);
      });
      // OFF ITS CROWN, from behind it: ragged, one tongue taller than the rest, lower than the skull is tall
      const crown: ReadonlyArray<readonly [number, number, number, number]> = [[5, 9, 3.2, 0.5], [9, 3.5, 1.8, 1.9], [2, 2.2, 1.4, -1.4]];
      crown.forEach(([cx, tall0, wide, lean], j) => {
        const tall = Math.min(12, (tall0 + 1.8 * Math.sin(ph * (5 + j) + j * 1.9)) * roar) * lit;
        tongueAt(st, put, sc, [x0 + cx + 0.5, y0 + 3], tall, wide + 0.6 * flare, lean + 0.7 * Math.sin(ph * 3 + j), 1, (x, y) => behindSkull.has(pk(x, y)), hot > 1.3 ? 1 : 0);
      });
      // (its light: over its crown, where the flame is, and a little at its sockets; never over the bone to wash it white)
      put('glow', 'glow', { k: 'glow', p: atPx(x0 + 6, y0 - 9), c: FLAME[3], r: 14 + 2 * Math.sin(ph * 6 + 0.7) + 4 * flare - 3 * suck, a: Math.min(0.55, (0.32 + 0.12 * flare - 0.1 * suck) * lit) });
      for (const [ex, ey] of SKULL_EYES) put('glow', 'glow', { k: 'glow', p: atPx(x0 + ex, y0 + ey - 1), c: SOCKET, r: 3 + 2 * flare, a: Math.min(0.5, (0.28 + 0.18 * flare) * lit) });
    }
    // THE FIRE DRAWN DOWN OUT OF IT into his hand as he gathers it: streaks of it, unevenly spaced, running down to his claw
    if (charge > 0.15 && lit > 0.05) {
      const to = add(s.handL, [0, 0, 3]);
      const along = (k: number): V3 => add(lerp3(sc, to, k), [0, 0, Math.sin(Math.PI * k) * 8]);
      const OFFS = [0, 0.19, 0.27, 0.52, 0.78];
      OFFS.forEach((o, i) => {
        const k = (((m.t * 2.1 + o) % 1) + 1) % 1;
        if (k < 0.08 || k > 0.94) return;
        const long = 0.05 + 0.04 * hash(i, 3, 227);
        const streak: Pix = new Map();
        const [ax, ay] = st.at(along(k));
        const [bx, by] = st.at(along(Math.max(0, k - long)));
        linePix(streak, [ax, ay], [bx, by], (u) => (u < 0.4 ? (k > 0.6 ? FLAME[3] : FLAME[2]) : FLAME[1]));
        if (streak.size < 2) streak.set(pk(Math.floor(ax) + 1, Math.floor(ay) + 1), FLAME[1]);
        for (const [key, c] of streak) {
          const [x, y] = pxOf(key);
          put('embers', 'embers', { k: 'mote', p: screenStep(st, along(k), x + 0.5 - ax, y + 0.5 - ay), c, size: 1 });
        }
      });
    }
  }

  // --- HIS CASTING HAND: the claw, the fire held between its fingers ---
  {
    const heat = lit * (0.7 + 0.25 * pulse + 0.6 * charge);
    const [wx, wy] = st.at(s.handL);
    const [ex, ey] = st.at(s.elbowL);
    const way = unit2([wx - ex, wy - ey]);
    // (held up round the fire, its fingers rising; thrown out straight along the arm as he flings it, and gathering again)
    const open = clamp01((1 - handFire) / 0.8);
    const upFan = unit2(add2([0, -1], way, 0.45));
    const fan = unit2(add2(upFan, add2(way, upFan, -1), open));
    const [cx] = st.at(s.ribs);
    // (the thumb on the side away from his middle)
    const side = -way[1] * (wx - cx) >= 0 ? 1 : -1;
    const claw = clawPix([wx, wy], way, fan, 128 - 38 * open, clamp01(q.draw) * (1 - open), heat, side);
    const hidden = behindHim(s.handL);
    stamp(st, put, 'handL', 'handL', claw.pix, add(s.handL, mul(st.eye, 1.5)));
    if (lit > 0.05 && handFire > 0.05) {
      const keep = claw.keep;
      const at = screenStep(st, s.handL, claw.heart[0] - wx, claw.heart[1] - wy);
      const r = (4.0 + 0.5 * pulse) * Math.min(1, handFire) + 1.4 * charge;
      // (what of it is behind him, as the eye sees it, is hidden by him; and his fingers stand in front of it)
      const skip = (x: number, y: number): boolean => keep.has(pk(x, y)) || behindHim(screenStep(st, s.handL, x + 0.5 - wx, y + 0.5 - wy));
      fireBall(st, put, at, r, [0, 1], 1.0, (_p, x, y) => skip(x, y), charge > 0.5 ? FLAME[4] : FLAME[3]);
      // (its flames, rising between his fingers)
      const [hx, hy] = st.at(at);
      for (const [deg, k] of [[-34, 0], [0, 1], [34, 2]] as const) {
        const d = rot2(fan, deg);
        const foot: P2 = [hx + d[0] * 2.2, hy + d[1] * 2.2 + 1];
        const tall = ((k === 1 ? 7 : 5) + 1.6 * Math.sin(ph * 6 + k * 2.1) + 4 * charge) * Math.min(1, handFire) * lit;
        tongueAt(st, put, at, foot, tall, 2.0 + 0.8 * charge, d[0] * 2 + 0.8 * Math.sin(ph * 4 + k), 0.9 + charge, skip);
      }
    }
    if (lit > 0.05 && handFire > 0.05) {
      const at = screenStep(st, s.handL, claw.heart[0] - wx, claw.heart[1] - wy);
      put('glow', 'glow', { k: 'glow', p: at, c: FLAME[2], r: (12 + 3 * pulse + 7 * charge) * Math.min(1, handFire), a: Math.min(0.7, (0.38 + 0.1 * pulse + 0.2 * charge) * lit) * (1 - 0.7 * behindness(at)) });
    }
  }

  // --- THE MANTLE: stiff and broad over his shoulders, its edge clean and banded gold and pink ---
  const face = wornOn(st, s, 12);
  const [ff, fl, fu] = face;
  const capeC = add(add(s.neck, mul(cu, -7.6)), mul(lag, 0.4));
  const mantle: Ring[] = [];
  {
    const capeU = mul(cf, B.ribDeep + 4.4 + gale);
    const capeV = mul(cl, B.shoulderHalf + 6.6 + gale);
    const hemPts: V3[] = [];
    const N = 28;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const rear = Math.max(0, -Math.cos(a));
      const p = add(capeC, add(mul(capeU, Math.cos(a)), mul(capeV, Math.sin(a))));
      // (lower behind; stirring)
      hemPts.push(add(p, [0, 0, -rear * 2.6 + Math.sin(ph * 2 + a * 3) * 0.4 - gale * rear * 1.5]));
    }
    mantle.push(
      { c: add(s.neck, mul(cu, 3.4)), u: mul(cf, 5.2), v: mul(cl, 6.0) },
      { c: add(s.neck, mul(cu, -0.6)), u: mul(cf, B.ribDeep + 3.4), v: mul(cl, B.shoulderHalf + 5.4) },
      { c: capeC, u: capeU, v: capeV, pts: hemPts },
    );
    put('mantle', 'mantle', { k: 'cloth', rings: mantle, ramp: FM_MANTLE, look: { folds: [35, -35, 80, -80, 125, -125, 158, -158], lift: 0.3 } });
    // its edge: a band of pink, and gold at the very edge, round it (seen from in front and from behind)
    for (let i = 0; i < N; i++) {
      const a0 = hemPts[i];
      const b0 = hemPts[(i + 1) % N];
      const outA = norm([a0[0] - capeC[0], a0[1] - capeC[1], 0]);
      const outB = norm([b0[0] - capeC[0], b0[1] - capeC[1], 0]);
      put('trim', 'mantle', { k: 'rod', a: add(add(a0, mul(outA, 0.5)), [0, 0, 1.2]), b: add(add(b0, mul(outB, 0.5)), [0, 0, 1.2]), ra: 0.85, rb: 0.85, ramp: BAND });
      put('trim', 'mantle', { k: 'rod', a: add(a0, mul(outA, 0.7)), b: add(b0, mul(outB, 0.7)), ra: 0.55, rb: 0.55, ramp: GOLD });
    }
  }

  // --- THE FRONT OF HIS ROBE, where it parts below the mantle: two edges of it, each pink edged with gold, from under the mantle's edge down to the hem, unbroken, parting a little as they go down ---
  {
    const zTop = capeC[2] - 0.4;
    const zEnd = hem.c[2] + 1.0;
    const steps = 14;
    let prev: V3[] | null = null;
    for (let i = 0; i <= steps; i++) {
      const k = i / steps;
      const z = zTop + (zEnd - zTop) * k;
      const kz = clamp01((z - s.pelvis[2]) / Math.max(1, s.neck[2] - s.pelvis[2]));
      const mid0: V3 = [s.pelvis[0] + (s.neck[0] - s.pelvis[0]) * kz, s.pelvis[1] + (s.neck[1] - s.pelvis[1]) * kz, z];
      const apart = 1.7 + 1.6 * k;
      const pts: V3[] = [];
      for (const side of [-1, 1]) {
        const edge = onCloth(robeRings, add(add(mid0, mul(f, 30)), mul(l, side * apart * 7)), 0.6);
        pts.push(edge, add(edge, mul(l, side * 0.9)));
      }
      if (prev) {
        for (const j of [0, 2]) {
          put('opening', 'opening', { k: 'rod', a: prev[j], b: pts[j], ra: 0.7, rb: 0.7, ramp: BAND });
          put('opening', 'opening', { k: 'rod', a: prev[j + 1], b: pts[j + 1], ra: 0.45, rb: 0.45, ramp: GOLD });
        }
      }
      prev = pts;
    }
  }

  // --- THE COLLAR OF BONE: ribs of bone rising from his collar behind his hood and curving in over it like a ribcage closing over his head; bone, never gold, never higher than a little over his hood ---
  {
    const hcTop = add(add(s.head, add(mul(ff, FM_HOOD_FWD), mul(fu, FM_HOOD_UP))), mul(fu, FM_HOOD_R[2]));
    const base0 = add(s.neck, mul(cu, 0.6));
    // (each rib: where round the back of him, how far over his hood its tip comes, how high it ends against the top of his hood)
    const RIBS: ReadonlyArray<readonly [number, number, number]> = [[98, 0.72, 2.2], [128, 0.86, 4.2], [232, 0.86, 3.8], [262, 0.72, 1.8]];
    RIBS.forEach(([deg, over, up], i) => {
      const a = deg * D;
      const out: V3 = norm(add(mul(cf, Math.cos(a)), mul(cl, Math.sin(a))));
      const b0 = add(base0, add(mul(cf, Math.cos(a) * (B.ribDeep + 1.0)), mul(cl, Math.sin(a) * (B.shoulderHalf * 0.62))));
      // (out and up first, then curling in toward the top of his hood)
      const sway = Math.sin(ph * 2 + i * 1.3) * 0.25 + gale * 0.6;
      const tip = add(add(add(hcTop, mul(fu, up)), mul(ff, -1.8)), mul(out, FM_HOOD_R[1] * (1 - over) + sway));
      const ctrl = add(add(lerp3(b0, tip, 0.55), mul(out, 9.5 + 0.8 * Math.sin(i * 2.7))), mul(cu, 2.5));
      const pts: V3[] = [];
      for (let k = 0; k <= 4; k++) {
        const u = k / 4;
        pts.push(lerp3(lerp3(b0, ctrl, u), lerp3(ctrl, tip, u), u));
      }
      for (let k = 0; k < 4; k++) {
        put('collar', 'collar', { k: 'rod', a: pts[k], b: pts[k + 1], ra: 1.35 - k * 0.25, rb: 1.35 - (k + 1) * 0.25, ramp: STAY_BONE, far: true });
      }
      put('collar', 'collar', { k: 'ball', c: pts[1], ax: sphere(1.3), skin: STAY_BONE, far: true });
    });
  }

  // --- THE HOOD: deep and round, its point drooping behind; gold and pink on its outer brim; the opening pitch black, its edge lit a little from inside; in it his eyes, two hot points ---
  {
    const hc = add(s.head, add(mul(ff, FM_HOOD_FWD), mul(fu, FM_HOOD_UP)));
    const hr = FM_HOOD_R;
    const cam = Math.atan2(dot(st.eye, fl), dot(st.eye, ff)) / D;
    const toward = clamp01((110 - Math.abs(cam)) / 40);
    const midA = Math.max(-40, Math.min(40, cam * 0.8)) * toward * D;
    const od: V3 = norm(add(mul(ff, Math.cos(midA)), mul(fl, Math.sin(midA))));
    const blaze = lit * (1 + 0.8 * flare);
    const hot = blaze > 1.4;
    // (where the middle of the opening is in the picture)
    // (kept toward the middle of the hood as the eye sees it, as his head tips back and turns, so the face in it is seen whole)
    const odLevel = norm([od[0], od[1], od[2] * 0.4]);
    const [ox, oy] = st.at(add(add(hc, mul(odLevel, hr[0] * 0.9)), [0, 0, -0.9]));
    const oxi = Math.floor(ox);
    const oyi = Math.floor(oy);
    const faceColour = (ch: string): string | null => {
      switch (ch) {
        case 'G':
          return GOLD[3];
        case 'P':
          return hot ? FLAME[2] : BAND[2];
        case 'r':
          return lit < 0.05 ? INK : hot ? FLAME[1] : '#4a0c38';
        case 'k':
          return INK;
        case 'h':
          return lit < 0.05 ? INK : hot ? '#fffbe8' : FLAME[3];
        case 'e':
          return lit < 0.05 ? INK : hot ? FLAME[2] : FLAME[1];
        default:
          return null;
      }
    };
    // (the face is painted only when it is turned toward the eye: from behind, the hood is the back of a hood)
    const seenFace = dot(od, st.eye) > 0.15;
    const hoodSkin: Skin = (u, tone) => {
      const toOpen = u[0] * Math.cos(midA) + u[1] * Math.sin(midA);
      if (seenFace && toOpen > -0.25) {
        const p = add(hc, add(add(mul(ff, u[0] * hr[0]), mul(fl, u[1] * hr[1])), mul(fu, u[2] * hr[2])));
        const [x, y] = st.at(p);
        const col = Math.floor(x) - oxi + HOOD_FACE_MID[0];
        const row = Math.floor(y) - oyi + HOOD_FACE_MID[1];
        const line = HOOD_FACE[row];
        if (line && col >= 0 && col < line.length) {
          const ch = line[col];
          // (the brim round its sides, the opening only where the hood faces the way he looks)
          const c = ch === 'G' || ch === 'P' || toOpen > 0.15 ? faceColour(ch) : null;
          if (c) return c;
        }
      }
      return FM_HOOD[tone];
    };
    put('hood', 'hood', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: hoodSkin });
    // (the back of the hood falls to the mantle)
    put('hood', 'hood', { k: 'ball', c: add(add(hc, mul(ff, -3.6)), mul(fu, -4.0)), ax: [mul(ff, 4.8), mul(fl, 5.8), mul(fu, 4.6)], skin: FM_HOOD });
    if (lit > 0.05 && dot(od, st.eye) > 0.05) {
      for (const [ex, ey] of HOOD_EYES) put('glow', 'glow', { k: 'glow', p: screenStep(st, hc, oxi + ex - HOOD_FACE_MID[0] + 0.5 - st.at(hc)[0], oyi + ey - HOOD_FACE_MID[1] + 0.5 - st.at(hc)[1]), c: SOCKET, r: 3 + 2 * flare, a: Math.min(0.55, 0.3 * blaze) });
    }
  }

  // --- THE GOUT OF FIRE HE FLINGS: out of his hand, before him and down toward you, trailing; and bursting on the floor ---
  const g = q.pEl;
  if (g > 0.001 && g < 1.999 && lit > 0.05) {
    const [sx, sy] = st.at(FM_GOUT_SPOT);
    if (g < 1) {
      const p = add(goutAtU(g), [0, 0, 1.5]);
      const prev = add(goutAtU(Math.max(0, g - 0.2)), [0, 0, 1.5]);
      const [px1, py1] = st.at(p);
      const [px0, py0] = st.at(prev);
      const back: [number, number] = [px0 - px1, py0 - py1];
      fireBall(st, put, p, 4.2 + 0.8 * (1 - g), back, Math.min(16, Math.hypot(back[0], back[1]) + 6), behindHim);
      // (its trail: flecks of its fire left along the way it has come, going out)
      for (let i = 1; i <= 7; i++) {
        const u = g - i * 0.055 - 0.03 * hash(i, 9, 241);
        if (u <= 0) break;
        const tp = add(goutAtU(u), [0, 0, 1.5 + (hash(i, 8, 241) - 0.5) * 3]);
        if (behindHim(tp)) continue;
        fleck(st, put, tp, i < 3 ? FLAME[3] : i < 5 ? FLAME[2] : FLAME[1], i * 1.7 + Math.floor(g * 5), 'fire');
      }
      put('glow', 'glow', { k: 'glow', p, c: FLAME[3], r: 14, a: (0.5 - 0.2 * g) * lit });
    } else {
      // (seconds since it struck)
      const kt = (g - 1) * FM_GOUT_BURN;
      const onFloor = (x: number, y: number): V3 => screenStep(st, FM_GOUT_SPOT, x + 0.5 - sx, y + 0.5 - sy);
      const hid = (x: number, y: number): boolean => behindHim(onFloor(x, y));
      // THE FLASH where it strikes: a splash of white-gold and pink on the floor, as wide as he is; then a broken ring of it spreading out and going out
      if (kt < 0.13) {
        const rx = 11 + 30 * kt;
        for (let y = Math.floor(sy - rx / 2) - 1; y <= Math.ceil(sy + rx / 2) + 1; y++) {
          for (let x = Math.floor(sx - rx) - 1; x <= Math.ceil(sx + rx) + 1; x++) {
            const d = Math.hypot((x + 0.5 - sx) / rx, (y + 0.5 - sy) / (rx / 2));
            if (d > 1 || hid(x, y)) continue;
            put('fire', 'fire', { k: 'mote', p: onFloor(x, y), c: d < 0.35 ? FLAME[4] : d < 0.65 ? FLAME[3] : FLAME[2], size: 1 });
          }
        }
      } else if (kt < 0.55) {
        const k = (kt - 0.13) / 0.42;
        const rx = 15 + 12 * k;
        const c = k < 0.35 ? FLAME[2] : k < 0.7 ? FLAME[1] : FLAME[0];
        // (in unbroken arcs, some arcs gone, more of them as it goes out: never a lone pixel)
        for (let seg = 0; seg < 12; seg++) {
          if (hash(seg, 3, 251) < 0.2 + 0.45 * k) continue;
          const arc = new Set<number>();
          for (let j = 0; j <= 24; j++) {
            const a0 = ((seg + j / 24) / 12) * Math.PI * 2;
            arc.add(pk(Math.floor(sx + Math.cos(a0) * rx), Math.floor(sy + Math.sin(a0) * rx * 0.5)));
          }
          for (const key of arc) {
            const [x, y] = pxOf(key);
            if (!hid(x, y)) put('fire', 'fire', { k: 'mote', p: onFloor(x, y), c, size: 1 });
          }
        }
      }
      // THE BURST: tongues of fire standing up off the floor across it, ragged, rising fast and dying down
      const rise = smooth(kt / 0.12);
      const fall = 1 - smooth((kt - 0.15) / 0.5);
      const TONGUES: ReadonlyArray<readonly [number, number, number]> = [[-11, 8, 2.4], [-6, 13, 3], [-1.5, 18, 3.6], [2.5, 15, 3.2], [7, 10, 2.8], [11.5, 6, 2.2]];
      TONGUES.forEach(([dx, tall0, wide], j) => {
        const tall = tall0 * rise * fall * (1 + 0.18 * Math.sin(ph * 7 + j * 2.3));
        if (tall >= 1.5) tongueAt(st, put, FM_GOUT_SPOT, [sx + dx + 0.5, sy + 0.5 + Math.abs(dx) * 0.08], tall, wide, Math.sin(j * 1.9 + kt * 6) * 1.5, fall > 0.6 ? 1.3 : 0.8, hid);
      });
      // THE EMBERS it throws out: up and out, falling back to the floor, going out one by one over its last frames
      for (let i = 0; i < 16; i++) {
        const life = 0.45 + 0.4 * hash(i, 5, 251);
        if (kt > life) continue;
        const a0 = (i / 16) * Math.PI * 2 + hash(i, 1, 251);
        const out = (9 + 13 * hash(i, 2, 251)) * smooth(kt / 0.45);
        const up = (5 + 9 * hash(i, 3, 251)) * Math.sin(Math.PI * Math.min(1, kt / life));
        const ep: V3 = [FM_GOUT_SPOT[0] + Math.cos(a0) * out, FM_GOUT_SPOT[1] + Math.sin(a0) * out, Math.max(0.6, up)];
        if (behindHim(ep)) continue;
        const left = 1 - kt / life;
        fleck(st, put, ep, left > 0.55 ? FLAME[3] : left > 0.25 ? FLAME[2] : FLAME[1], i * 2.3, 'embers');
      }
      // (its light: swelling over two or three frames, dying away)
      // (from the light it had in flight, as it strikes, up over three or four frames, and dying away)
      const L = smooth(kt / 0.45) * (1 - smooth((kt - 0.42) / 0.45));
      const fade = 1 - smooth((kt - 0.42) / 0.45);
      const ga = (0.3 + 0.25 * L) * fade;
      if (ga > 0.02) put('glow', 'glow', { k: 'glow', p: [FM_GOUT_SPOT[0], FM_GOUT_SPOT[1], 4], c: FLAME[3], r: 14 + 12 * L, a: ga * lit });
    }
  }
  return bits;
}

// ---------------------------------------------------------------------------------------------
// How he stands

/**
 * HOW HE FLOATS, AT REST: upright over nothing, a little bent forward at the chest, his hood a little down,
 * looking toward you from under it; his legs drawn up inside his robe; his staff held out at his right
 * side, clear of him, nearly upright; his left hand held out before him and to his left, at his chest,
 * palm up, its claw round the fire in it.
 */
export const FM_REST: Bones = {
  ...standing(FB),
  pz: FM_FLOAT, px: 0, py: 0, yaw: -8, pitch: -1, roll: 0, twist: 4, bend: 1, side: 0,
  faceTurn: 6, faceUp: -2, faceTilt: 0,
  lfx: -1.0, lfy: 0.9, lfz: FM_FLOAT + 5.5, lfp: 44, lft: 12, lk: 10,
  rfx: -1.6, rfy: -0.9, rfz: FM_FLOAT + 6.0, rfp: 48, rft: -10, rk: -6,
  rhIn: 1, rhx: 1.5, rhy: -13.5, rhz: -9.5, re: 28,
  lhIn: 0, lhx: 3.5, lhy: 15.0, lhz: 1.5, le: 50,
  wAz: -90, wEl: 81, wRoll: 0,
  draw: 0.35, out: 0, gale: 0, prop: 0, pt: 0, pAz: 1, pEl: 0, stow: 0,
};
/**
 * A CURVE THROUGH KEYS (seconds, value): smooth through each key, its slope there taken from the keys either
 * side, so that it goes on through a key it does not stop at (and may overshoot), and stops only where two
 * keys either side of one agree; flat before the first key and after the last.
 */
function curve(keys: ReadonlyArray<readonly [number, number]>, t: number): number {
  const n = keys.length;
  if (t <= keys[0][0]) return keys[0][1];
  if (t >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 0;
  while (t > keys[i + 1][0]) i++;
  const [t0, v0] = keys[i];
  const [t1, v1] = keys[i + 1];
  const slope = (j: number): number => (j <= 0 || j >= n - 1 ? 0 : (keys[j + 1][1] - keys[j - 1][1]) / (keys[j + 1][0] - keys[j - 1][0]));
  const m0 = slope(i) * (t1 - t0);
  const m1 = slope(i + 1) * (t1 - t0);
  const u = (t - t0) / (t1 - t0);
  const u2 = u * u;
  const u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * m1;
}
type Keys = ReadonlyArray<readonly [number, number]>;
/**
 * HIS CASTING HAND THROUGH HIS HABIT (from his shoulder, along his chest's forward, left and up; and how his
 * elbow swings): at rest out at his side; drawn in before his chest to gather (where it is seen); wound back
 * across him; then THE THROW, his elbow leading and the hand whipping after it, past where it lets go and
 * on (the overshoot), and back; then home.
 */
const LH_KEYS: { x: Keys; y: Keys; z: Keys; e: Keys } = {
  x: [[0, 3.5], [0.95, 3.5], [1.6, 10], [1.85, 8.5], [1.95, 8], [2.05, 8.5], [2.14, 13.5], [2.24, 17], [2.34, 15], [2.55, 12.5], [2.95, 9], [3.6, 3.5]],
  y: [[0, 15], [0.95, 15], [1.6, 0.5], [1.85, -2], [1.95, 0], [2.05, 6], [2.14, 12], [2.24, 16.5], [2.34, 16.5], [2.55, 16], [2.95, 15.5], [3.6, 15]],
  z: [[0, 1.5], [0.95, 1.5], [1.6, -2], [1.85, -1], [1.95, 2], [2.05, 5], [2.14, 3], [2.24, -3.5], [2.34, -2], [2.55, 0.5], [2.95, 1.5], [3.6, 1.5]],
  e: [[0, 50], [0.95, 50], [1.6, 15], [1.85, 8], [1.95, 40], [2.05, 75], [2.14, 45], [2.24, -12], [2.34, -4], [2.55, 10], [2.95, 30], [3.6, 50]],
};

/**
 * STANDING, NEVER STILL (the art rulebook, Movement 6, "Alive when still"; and Animations 1, "as big and
 * wild and kinetic and weighty as possible"): 3.6 s round, 36 frames at ten a second. He floats upright,
 * rising and sinking slowly on nothing, swaying, unnaturally smooth; his robe, his tails and his sleeves
 * ripple; his hood turns as he looks about the hall; the skull's fire burns; his claw kneads the fire in it.
 * Once round, HIS HABIT. ANTICIPATION (1.0 to 1.9 s): he rises, his hood tilting back, his staff leaning out,
 * and draws the fire down out of the skull into his claw before his chest, the fire swelling in it, winding
 * his shoulders back across him. THE THROW (1.9 to 2.25 s): he lunges into it, his shoulders twisting round,
 * his elbow leading and his arm whipping after it and on past where the fire leaves his hand (2.08 s); A GOUT
 * OF FIRE flies out before him and down toward you, trailing, and bursts on the floor (2.5 s), a flash and a
 * burst as wide as he is, its embers falling and going out; the skull's fire roars up a beat after the throw,
 * his tails and sleeves kick. Then he settles, and the fire in his claw kindles again.
 */
function fmStand(): Motion {
  const R = FM_REST;
  const keys: Key3[] = [];
  const N = 36;
  for (let i = 0; i <= N; i++) {
    const t = i / 10;
    const a = phaseOf(t);
    const charged = rampAt(t, 0.95, 1.85);
    const quiet = 1 - rampAt(t, 0.8, 1.2) * (1 - rampAt(t, 2.9, 3.4));
    const flare = rampAt(t, 2.18, 2.48) * (1 - rampAt(t, 2.55, 3.25));
    const kick = rampAt(t, 2.1, 2.28) * (1 - rampAt(t, 2.35, 3.05));
    // (his bob: slow, at its highest as the anticipation ends)
    const bob = 3.8 * Math.sin(a - 1.745);
    // (the fire in his claw: as it burns, charged, gone as it is flung, kindling again)
    const fire = t < 2.12 ? 1 + charged : 0.15 + 0.85 * rampAt(t, 2.6, 3.4);
    // (the gout: in flight from his hand, then burning on the floor)
    const gout = t < FM_GOUT_LET ? 0 : t < FM_GOUT_LAND ? (t - FM_GOUT_LET) / (FM_GOUT_LAND - FM_GOUT_LET) : t < FM_GOUT_LAND + FM_GOUT_BURN ? 1 + (t - FM_GOUT_LAND) / FM_GOUT_BURN : 0;
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + bob + curve([[0, 0], [0.95, 0], [1.85, 0.4], [2.0, 0.3], [2.22, -2.4], [2.6, -0.8], [3.2, 0]], t),
        px: 0.5 * Math.sin(a + 2.0) * quiet + curve([[0, 0], [1.0, 0], [1.85, -1.0], [2.15, 2.2], [2.45, 0.8], [3.1, 0]], t),
        py: 0.9 * Math.sin(a + 1.2) * quiet + curve([[0, 0], [1.0, 0], [1.85, -0.8], [2.15, 1.6], [2.6, 0.4], [3.2, 0]], t),
        roll: 1.4 * Math.sin(a + 1.2) * quiet + curve([[0, 0], [1.0, 0], [1.85, -2], [2.15, 4], [2.6, 0.5], [3.2, 0]], t),
        pitch: R.pitch + 0.8 * Math.sin(a + 0.5) * quiet + curve([[0, 0], [0.95, 0], [1.8, -3], [1.92, -3], [2.15, 5], [2.4, 1.5], [3.1, 0]], t),
        bend: R.bend + 1.0 * Math.sin(a) * quiet + curve([[0, 0], [1.0, 0], [1.8, -3], [1.95, -3], [2.2, 11], [2.45, 6], [2.8, 1], [3.3, 0]], t),
        twist: R.twist + 2 * Math.sin(a + 0.3) * quiet + curve([[0, 0], [0.95, 0], [1.7, -9], [1.95, -12], [2.17, 18], [2.35, 15], [2.75, 5], [3.3, 0]], t),
        faceTurn: R.faceTurn + 12 * Math.sin(a - 0.6) * quiet + curve([[0, 0], [1.0, 0], [1.7, -3], [2.1, 10], [2.6, 8], [3.3, 0]], t),
        faceUp: R.faceUp + 2.5 * Math.sin(2 * a) * quiet + curve([[0, 0], [0.95, 0], [1.8, 9], [1.95, 9], [2.2, -8], [2.6, -4], [3.2, 0]], t),
        faceTilt: 3 * Math.sin(a + 2.2) * quiet,
        rhx: R.rhx + 0.5 * Math.sin(a + 1.6) + curve([[0, 0], [1.95, 0], [2.2, -2.2], [2.45, -1.2], [2.9, 0]], t),
        rhz: R.rhz + 0.6 * Math.sin(a + 0.8),
        wEl: R.wEl + curve([[0, 0], [1.0, 0], [1.8, -1.5], [1.92, -1.5], [2.15, 1], [2.6, 0.3], [3.2, 0]], t),
        le: curve(LH_KEYS.e, t),
        lhx: curve(LH_KEYS.x, t) + 0.7 * Math.sin(a + 1.0) * quiet,
        lhy: curve(LH_KEYS.y, t) + 0.5 * Math.sin(2 * a + 0.4) * quiet,
        lhz: curve(LH_KEYS.z, t) + 0.8 * Math.sin(2 * a) * quiet,
        draw: curve([[0, 0.35], [1.0, 0.4], [1.7, 0.85], [2.05, 0.9], [2.14, 0.1], [2.25, 0], [2.7, 0.05], [3.4, 0.35]], t) + 0.12 * Math.sin(3 * a) * quiet,
        pAz: fire,
        pEl: gout,
        pt: flare,
        gale: 0.95 * kick,
      },
    });
  }
  return { loop: 0, keys };
}
const FM_STAND_MOTION = fmStand();

/** Where the gout of fire leaves his hand (worked out once, from his stand as it is at that moment), and the point its flight bends toward. */
let GOUT: { from: V3; apex: V3 } | null = null;
function goutPath(): { from: V3; apex: V3 } {
  if (!GOUT) {
    const s = solve(FB, bonesAt(FM_STAND_MOTION.keys, FM_REST, FM_GOUT_LET));
    const from = add(s.handL, [0, 0, 2]);
    // (thrown out before him: it leaves level and a little up, and falls the faster the further it goes)
    const near = lerp3(from, FM_GOUT_SPOT, 0.38);
    GOUT = { from, apex: [near[0], near[1], from[2] + 6] };
  }
  return GOUT;
}
/** Where the gout is, `u` of the way from his hand to the floor (falling faster as it goes). */
function goutAtU(u: number): V3 {
  const path = goutPath();
  const kk = u * u * 0.35 + u * 0.65;
  return lerp3(lerp3(path.from, path.apex, kk), lerp3(path.apex, FM_GOUT_SPOT, kk), kk);
}
/** Where the gout is at a moment of his stand (in flight: from his hand to the floor), or null. (For the tests.) */
export function fmGoutAt(t: number): V3 | null {
  if (t < FM_GOUT_LET || t >= FM_GOUT_LAND) return null;
  return goutAtU((t - FM_GOUT_LET) / (FM_GOUT_LAND - FM_GOUT_LET));
}

/** A move not yet made: he floats at rest, held (a placeholder until it is: his moves come after his look). */
function heldOf(len0: number): Motion {
  return { keys: [{ at: 0, pose: {} }, { at: len0, pose: {} }] };
}
/** His glide not yet made: he floats at rest (a placeholder until it is). */
function heldGlide(): Motion {
  const keys: Key3[] = [];
  for (let i = 0; i <= 8; i++) keys.push({ at: i / 8, pose: {}, ease: 'lin' });
  return { keys, loop: 0 };
}

/** How fast he glides, in tiles a second (the rules' own: a placeholder until his glide is made). */
export const FLESHMANCER_PACE = 1.0;
export const FLESHMANCER: Mob = {
  id: 'fleshmancer',
  name: 'The Fleshmancer',
  size: 'a boss: a man’s height, floating',
  build: FB,
  stand: { name: 'The Fleshmancer floats, his staff burning', motion: FM_STAND_MOTION, rest: FM_REST },
  attack: { name: 'The Fleshmancer (his blow: not made yet)', motion: heldOf(1.0), rest: FM_REST },
  idleFrames: 36,
  idleFps: 10,
  walk: { name: 'The Fleshmancer glides (not made yet)', motion: heldGlide(), rest: FM_REST, period: 1, ground: FLESHMANCER_PACE * TILE3 },
  walkFrames: 8,
  walkFps: 8,
  pace: FLESHMANCER_PACE,
  reel: { name: 'The Fleshmancer is struck (not made yet)', motion: heldOf(0.3), rest: FM_REST },
  reelTime: 0.3,
  hit: 0.5,
  warn: 0.3,
  dieTime: 1.0,
  dying: { name: 'His own dead drag him down (not made yet)', motion: heldOf(1.0), rest: FM_REST },
  aura: { x: FM_CANVAS.ax - 2, y: FM_CANVAS.ay - 44, r: 80, color: '#ff3a78', a: 0.18 },
  shadow: 8,
  canvas: FM_CANVAS,
  trueBack: true,
  bits: (st, m) => fleshmancerBits(st, m),
};

/** HIS STAND, the only move of his made so far: the one the checks review (his other moves are held placeholders until they are made). */
export const FM_MADE: ReadonlyArray<string> = ['stand'];

/** THE FLESHMANCER, as the game holds a monster (see art/new_mobs3.ts makeShadeArt3). */
export function makeFleshmancerArt3(pace = FLESHMANCER.pace): ActorArt {
  return { front: mobSet(FLESHMANCER, 'front', pace), back: mobSet(FLESHMANCER, 'back', pace) };
}

// ---------------------------------------------------------------------------------------------
// As the checks see him (art/boss_checks.ts)

/** His robe below his hips, as painted: an egg round his thighs and drawn-up legs, down to its hem. */
function skirtLumps(s: Skeleton): CheckLump[] {
  const B = FB;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const rot: readonly [V3, V3, V3] = [f, l, [0, 0, 1]];
  const topZ = s.pelvis[2] - B.thigh * 0.2;
  const lowZ = FM_HEM_UP + (s.pelvis[2] - FM_PELVIS_UP);
  return [{ name: 'skirt', c: [s.pelvis[0], s.pelvis[1], (topZ + lowZ) / 2], rot, h: [B.pelvisDeep + 4.0, B.pelvisHalf + 4.4, (topZ - lowZ) / 2 + 1] }];
}
/**
 * THE FLESHMANCER AS THE CHECKS SEE HIM: his outside as painted, by name (his legs drawn up inside his robe,
 * his sleeves, his hood as painted round his head; his trunk in the barrel of his robe, its skirt), and what
 * he carries: his staff from its foot to its head, and the skull at its head. His right fist is round the
 * shaft, so it may lie in his right forearm; nothing else of him.
 */
export function fmSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const B = FB;
  const [rH, rK] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: rK * 1.1 },
      { name: `foot${side}`, a: L ? s.heelL : s.heelR, b: L ? s.toeL : s.toeR, r: 1.0 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: Math.max(r0 * 1.1, 2.9) },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.1 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: s.skull, r: 4.4 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const lumps: CheckLump[] = [
    { name: 'hood', c: add(s.head, add(mul(s.face[0], FM_HOOD_FWD), mul(s.face[2], FM_HOOD_UP))), rot: s.face, h: FM_HOOD_R },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.2, B.ribHalf + 2.2, len(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.5), rot: s.belly, h: [B.waistDeep + 2.2, B.waistHalf + 2.2, Math.max(4, len(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 3, B.pelvisHalf + 3, B.waist * 0.75] },
    ...skirtLumps(s),
  ];
  return { limbs, lumps };
}
/** THE MANTLE over his shoulders, down to its edge at his upper arms: worn over his arms (so not one of the solids his arms keep out of, as the Headsman's cape is not), but his staff passes outside it (tests/fleshmancer.test.ts). */
export function fmMantle(s: Skeleton): CheckLump {
  return { name: 'mantle', c: add(s.neck, mul(s.chest[2], -4.2)), rot: s.chest, h: [FB.ribDeep + 4.0, FB.shoulderHalf + 5.8, 4.4] };
}
export const FM_SHAPE: BossShape = {
  body: fmSolids,
  // (the end he strikes with: the skull at his staff's head, which spits his bone shards)
  tip: (_move, _t, s) => staffOf(s).skull,
  things: (_move, _t, s) => {
    const { joints, skull: sc } = staffOf(s);
    const shaft: V3[] = [];
    for (let i = 0; i + 1 < joints.length; i++) {
      const n = Math.max(1, Math.ceil(len(sub(joints[i + 1], joints[i])) / 3));
      for (let k = 0; k < n; k++) shaft.push(lerp3(joints[i], joints[i + 1], k / n));
    }
    shaft.push(joints[joints.length - 1]);
    const out: CheckThing[] = [
      { name: 'staff', pts: shaft, r: 1.6, may: ['foreR'] },
      { name: 'skull', pts: [sc], r: Math.min(...SKULL_R), may: [] },
    ];
    return out;
  },
};
