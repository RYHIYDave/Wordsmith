// THE CULT'S TWO NEW FIGHTERS, ON THE HEROES' BONES (the art chat, 11 Oct 2026). A MOCK-UP: NOT IN THE
// GAME. Nothing of the game imports this file, and `CULTISTS_SWITCH.on`, the switch a later chat would put
// them in by, is off.
//
// The owner's words, in the art chat, 11 Oct, 14:57: “When you’re finished with that I’d like 2 more
// cultist enemies.  A melee cultist the runs at you with a sacrificial dagger, and a mini fleshmancer elite
// that uses cultist corpses to raise skeletons (can just use the same animation as the warden) and does a
// smaller version of the fire laser from the boss.  They start showing up in floor 4, then all over floor
// 5.” And of the fleshmancer, the same day: “I don’t need the whole mock up sheet, just show me what he
// looks like and what the attacks look like”. So: one picture of each, then a film of each attack.
//
// THE DAGGER CULTIST. One of the cult's flock (the game's cultist, art/monster_cultist.ts: a robe of the
// cult's violet, a deep cowl with a point and two burning eyes in its dark, a pink stole), made for the
// knife: lean and wiry, a little shorter than the knight, hunched; his robe girded up to his knees with a
// rope so that he can run, his shins and feet bound in dark rags; his sleeves pushed back off pale, bony
// forearms; in his right fist A SACRIFICIAL DAGGER, a long wavy blade of bone, pale, a dark iron guard, its
// grip bound in the cult's pink. His eyes in the dark of his cowl are two slanting slashes of the enemy's
// pink (the cultists' are; the fleshmancer's are points).
//
// THE MINI FLESHMANCER. The fleshmancer's lesser self (art/fleshmancer.ts, painted by his own painter in a
// look of its own, `MINI_FM_LOOK`): a floating priest of the same near-black plum, the knight's height (his
// master is a head taller), his mantle banded pink and no gold, no ribs of bone over his hood; a shorter
// staff of bone with a smaller skull on it, its fire burning in its sockets; his casting hand a claw with
// the fire held in it. So that he reads as his master's at a glance, and never as his master.
//
// What glows on them is the enemy's (the art rulebook, Colour 3): their eyes, the fire. Nothing on them is
// cyan. Each wears the enemy's pink edge while he lives.

import type { ActorArt } from './actor_types';
import { INK, PINK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME, SOCKET } from './mkit';
import { FM_BODY, FM_LOOK, FM_REST, HAND_BONE, clamp01, curve, fleshmancerBits, fmGlide, fmHalt, fmReel, fmSetOff, pk, rampAt, stamp, withFmLook } from './fleshmancer';
import type { FmLook, P2, Pix } from './fleshmancer';
import { TILE3, mobSet, sphere } from './new_mobs3';
import type { Bit, Mob, MobCanvas, Moment, Put } from './new_mobs3';
import { onCloth, wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file; a chat that puts them in, on the owner's yes, does it behind this. */
export const CULTISTS_SWITCH = { on: false };

const D = Math.PI / 180;

// =============================================================================================
// THE MINI FLESHMANCER

/** His lengths beside his master's: the knight's height, where his master is a head over it. */
export const MINI_K = 0.86;
const K = MINI_K;
/** His body: his master's, made smaller. */
export const MINI_BODY: Build = buildOf(55 * K, 1.06, { shoulders: 1.2, chest: 0.95, depth: 0.98, waist: 0.74, hips: 0.78, arms: 1.12, trunk: 1.06, limbs: 0.84, pad: 2.0 });

/**
 * THE LESSER SKULL, ten across (his master's is fourteen): pale bone lit from the upper left, a broad low
 * cranium, a heavy brow over two deep pits slanting in, the fire deep in each at its outer side (p), the
 * notch of the nose, a broken row of teeth, the mouth open and dark (d), the jaw hanging. (H highlight, L
 * lit, M middle, S shade; k the dark of a hole.)
 */
const LESSER_SKULL: ReadonlyArray<string> = [
  '...HHLL...',
  '.HHHLLLLM.',
  'HHLLLLLLMS',
  'HLLLLLLLMS',
  'LkkLLLLkkS',
  'LpkkLLkkpS',
  'LkkkLLkkkS',
  '.LkLkkLkS.',
  '.MLkLLkLS.',
  '.LkddddkS.',
  '..MLkLkS..',
  '..MMMMSS..',
  '...MMSS...',
];
/**
 * THE FACE IN HIS HOOD, as his master's (art/fleshmancer.ts HOOD_FACE), smaller and without the gold: the
 * opening pitch black (k), its edge lit a little pink from inside (r), his cult's pink on the outer brim (P);
 * his eyes two hot points (h), each with a dimmer one by it (e), the two not alike.
 */
const LESSER_FACE: ReadonlyArray<string> = [
  '....PPPPP....',
  '..PP.....PP..',
  '.P..rrrrr..P.',
  '.P.rkkkkkr.P.',
  'P.rkkkkkkkr.P',
  'P.rkhkkkhkr.P',
  'P.rkekkkker.P',
  '.P.rkkkkkr.P.',
  '...rkkkkkr...',
  '....kkkkk....',
  '.....kkk.....',
];

/** HIS LOOK, for his master's painter: smaller in every length, no gold, no ribs of bone over his hood, a shorter staff and a smaller skull, a smaller claw. */
export const MINI_FM_LOOK: FmLook = {
  body: MINI_BODY,
  k: K,
  float: FM_LOOK.float * K,
  hemUp: FM_LOOK.hemUp * K,
  hemWide: FM_LOOK.hemWide * K,
  crown: false,
  gold: false,
  staff: {
    long: 44,
    grip: 20,
    joints: FM_LOOK.staff.joints.map(([at, f, l]) => [at * (44 / 60), f * 0.8, l * 0.8] as const),
    spurs: FM_LOOK.staff.spurs.filter(([i]) => i % 2 === 1).map(([i, f, l, long]) => [i, f, l, long * 0.75] as const),
    skullUp: 7,
  },
  skull: { pix: LESSER_SKULL, mid: [5, 6], mouth: 9, eyes: [[1, 5, -1], [8, 5, 1]], crown: [[4, 6.5, 2.4, 0.4], [7, 2.6, 1.4, 1.6], [1.5, 1.8, 1.2, -1.2]] },
  hood: { fwd: FM_LOOK.hood.fwd * K, up: FM_LOOK.hood.up * K, r: mul(FM_LOOK.hood.r, K), face: LESSER_FACE, mid: [6, 5], eyes: [[4, 5], [8, 5]] },
  claw: 0.8,
  tails: 0.8,
};

/** Of a pose's numbers, those that are lengths (made smaller for him), and not angles or amounts. */
const LENGTHS = new Set<keyof Bones>(['px', 'py', 'pz', 'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'lfx', 'lfy', 'lfz', 'rfx', 'rfy', 'rfz']);
/** His rest pose: his master's, every length made smaller. */
export const MINI_REST: Bones = (() => {
  const out = { ...FM_REST } as Record<string, number>;
  for (const k of LENGTHS) out[k] = FM_REST[k] * K;
  return out as unknown as Bones;
})();
/** One of his master's moves, made his: every key's lengths made smaller (his master's moves, at his size). */
export function miniOf(m: Motion): Motion {
  return {
    ...m,
    keys: m.keys.map((k) => {
      const pose: Partial<Bones> = {};
      for (const [f, v] of Object.entries(k.pose) as [keyof Bones, number][]) (pose as Record<string, number>)[f] = LENGTHS.has(f) && typeof v === 'number' ? v * K : v;
      return { ...k, pose } as Key3;
    }),
  };
}

/** His canvas: room for his staff and its skull over his hood. */
export const MINI_CANVAS: MobCanvas = { w: 240, h: 240, ax: 120, ay: 182 };

/** His standing loop: 3 s round, 30 frames at ten a second. */
export const MINI_STAND_LONG = 3.0;
/**
 * STANDING, NEVER STILL: he floats, rising and sinking slowly, swaying; his hood turns as he looks about;
 * his claw kneads the fire in it, and twice round it swells, drawn down out of the skull in streaks, and
 * sinks again; the skull's fire burns.
 */
function miniStand(): Motion {
  const R = MINI_REST;
  const keys: Key3[] = [];
  const N = 30;
  for (let i = 0; i <= N; i++) {
    const t = i / 10;
    const a = (t / MINI_STAND_LONG) * Math.PI * 2;
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 2.6 * K * Math.sin(a - 1.745),
        px: 0.45 * Math.sin(a + 2.0),
        py: 0.8 * Math.sin(a + 1.2),
        roll: 1.3 * Math.sin(a + 1.2),
        pitch: R.pitch + 0.8 * Math.sin(a + 0.5),
        bend: R.bend + 1.0 * Math.sin(a),
        twist: R.twist + 2 * Math.sin(a + 0.3),
        faceTurn: R.faceTurn + 14 * Math.sin(a - 0.6),
        faceUp: R.faceUp + 2.5 * Math.sin(2 * a),
        faceTilt: 3 * Math.sin(a + 2.2),
        lhx: R.lhx + 0.8 * Math.sin(a + 1.0),
        lhy: R.lhy + 0.6 * Math.sin(2 * a + 0.4),
        lhz: R.lhz + 1.2 * Math.sin(2 * a),
        rhz: R.rhz + 0.5 * Math.sin(a + 0.8),
        draw: 0.35 + 0.3 * Math.sin(2 * a + 0.6),
        // (the fire in his claw swelling as it is drawn down out of the skull, twice round, and sinking again)
        pAz: 1 + 0.3 * Math.max(0, Math.sin(2 * a - 0.4)),
        pt: 0.12 + 0.12 * Math.sin(3 * a),
        gale: 0.1 + 0.1 * Math.sin(a * 2 + 1),
      },
    });
  }
  return { loop: 0, keys };
}

export const MINI_PACE = 1.0;
export const MINI_FM: Mob = {
  id: 'miniFleshmancer',
  name: 'The Mini Fleshmancer',
  size: 'an elite: the knight’s height, floating',
  build: MINI_BODY,
  stand: { name: 'The mini fleshmancer floats, his staff burning', motion: miniStand(), rest: MINI_REST },
  // (his attacks come once his look has the owner's yes; till then his stand stands in for them)
  attack: { name: 'The mini fleshmancer (his attacks to come)', motion: miniStand(), rest: MINI_REST },
  idleFrames: 30,
  idleFps: 10,
  walk: { name: 'The mini fleshmancer glides', motion: miniOf(fmGlide()), rest: MINI_REST, period: 1, ground: MINI_PACE * TILE3 },
  walkFrames: 8,
  walkFps: 8,
  pace: MINI_PACE,
  reel: { name: 'The mini fleshmancer is struck', motion: miniOf(fmReel()), rest: MINI_REST },
  reelTime: 0.5,
  hit: 1.0,
  warn: 0.4,
  dieTime: 1.6,
  dying: { name: 'The mini fleshmancer falls', motion: miniOf(fmReel()), rest: MINI_REST },
  aura: { x: MINI_CANVAS.ax - 2, y: MINI_CANVAS.ay - 38, r: 62, color: '#ff3a78', a: 0.16 },
  shadow: 7,
  canvas: MINI_CANVAS,
  trueBack: true,
  bits: (st, m) => withFmLook(MINI_FM_LOOK, () => fleshmancerBits(st, m)),
  more: {
    setOff: { name: 'The mini fleshmancer sets off', motion: miniOf(fmSetOff()), rest: MINI_REST, period: 1, ground: MINI_PACE * TILE3 },
    halt: { name: 'The mini fleshmancer stops', motion: miniOf(fmHalt()), rest: MINI_REST, period: 1, ground: MINI_PACE * TILE3 },
  },
};
void FM_BODY;

/** THE MINI FLESHMANCER, as the game holds a monster (art/new_mobs3.ts makeShadeArt3). */
export function makeMiniFleshmancerArt3(pace = MINI_FM.pace): ActorArt {
  return { front: mobSet(MINI_FM, 'front', pace), back: mobSet(MINI_FM, 'back', pace) };
}

// =============================================================================================
// THE DAGGER CULTIST

/** His body: lean and wiry, a little shorter than the knight (58), narrow in the shoulder, thin in the limb. */
export const KNIFE_BODY: Build = buildOf(55, 1.0, { shoulders: 1.04, chest: 0.95, depth: 0.95, waist: 0.86, hips: 0.92, arms: 1.04, trunk: 1.0, limbs: 0.9 });
const KB = KNIFE_BODY;
/** His canvas: room for his leap, and his blade over his head. */
export const KNIFE_CANVAS: MobCanvas = { w: 200, h: 190, ax: 96, ay: 140 };

/** His robe: the cultists' violet (art/mkit.ts GLOOM), and his cowl a step darker. */
const ROBE: Ramp = ['#1e0e38', '#1e0e38', '#40206a', '#6e4498', '#6e4498'];
const COWL: Ramp = ['#150a2a', '#150a2a', '#2e144c', '#523078', '#523078'];
/** The dark rags his shins and feet are bound in, and the lighter bands of them. */
const RAGS: Ramp = ['#120e1c', '#120e1c', '#262036', '#3e3652', '#3e3652'];
const RAG_BAND: Ramp = ['#221c30', '#221c30', '#3a3250', '#584e72', '#584e72'];
/** The cord his robe is girded up with: the cult's pink (the flock's stole, knotted round him for the knife). */
const ROPE: Ramp = PINK;
/** His skin: pale, bony. */
const SKIN: Ramp = HAND_BONE;
/** The blade: bone, pale (highlight, lit, middle, shade); the guard's dark iron; the grip's binding, the cult's pink. */
const BLADE = { H: '#f6eedc', L: '#dccfb6', M: '#ab9a80', S: '#6e5e58' } as const;
const GUARD = { L: '#5a5480', M: '#3a3660', S: '#221e40' } as const;
/** The torn hem of his robe (how far up each piece of it is gone, round it). */
const TORN: readonly number[] = [1, 3, 0, 2, 4, 1, 0, 3, 2, 0, 1, 4, 2, 0, 3, 1];

/**
 * THE FACE IN HIS COWL, painted pixel by pixel where it faces the way he looks: the opening pitch black (k),
 * its edge lit a little pink from inside (r); his eyes TWO SLANTING SLASHES of the enemy's pink (h), down and
 * in toward his nose: a scowl (the cultists' eyes are slashes).
 */
const KNIFE_FACE: ReadonlyArray<string> = [
  '..rrrrr..',
  '.rkkkkkr.',
  'rkhkkkhkr',
  'rkkhkhkkr',
  'rkkkkkkkr',
  '.kkkkkkk.',
  '..kkkkk..',
];
const KNIFE_FACE_MID: P2 = [4, 3];

/** HIS COWL: its middle before his head and above it, and its half-lengths (front to back, across, up). */
const COWL_FWD = 1.0;
const COWL_UP = 1.0;
export const COWL_R: V3 = [5.6, 5.0, 5.8];
/** The top of his cowl above the floor, its point aside (for the sheet and the tests). */
export function knifeCowlTop(s: { head: V3; face: readonly [V3, V3, V3] }): number {
  const [ff, fl, fu] = s.face;
  const c = s.head[2] + ff[2] * COWL_FWD + fu[2] * COWL_UP;
  return c + Math.hypot(ff[2] * COWL_R[0], fl[2] * COWL_R[1], fu[2] * COWL_R[2]);
}

/** THE DAGGER: its blade from the fist, its guard, its grip and pommel (the figure's own lengths, along it from the middle of his fist). */
export const BLADE_LONG = 13;
const BLADE_FROM = 2.0;
/** Where its point is, on his bones. */
export function knifeTipOf(s: { handR: V3; point: V3 }): V3 {
  return add(s.handR, mul(s.point, BLADE_FROM + BLADE_LONG));
}

/**
 * THE DAGGER, AS A LITTLE PICTURE laid along the way it points as the eye sees it (as the champion's great
 * sword is): from the fist (`gx`, `gy`), at `deg` across the picture, `seen` of its length seen. A long WAVY
 * BLADE of bone, pale, its edge on the side the light comes from bright, a dark line down its middle, waving
 * twice along its length and drawn out to a point; a dark iron guard across it at the fist; a pommel of bone
 * past the fist on its other side. `glint`: the light caught on the blade (the warning), a star of it.
 */
function daggerPix(gx: number, gy: number, deg: number, seen: number, glint: number): Pix {
  const pix: Pix = new Map();
  const dx = Math.cos(deg * D);
  const dy = -Math.sin(deg * D);
  // (the side of the blade the light falls on, as the eye sees it)
  const litSide = 0.65 * dy - 0.75 * dx > 0 ? 1 : -1;
  const len0 = Math.max(4, BLADE_LONG * seen);
  const from = BLADE_FROM * Math.max(0.4, seen);
  const tip = from + len0;
  const reach = tip + 6;
  const set = (x: number, y: number, c: string): void => {
    pix.set(pk(x, y), c);
  };
  for (let y = Math.floor(gy - reach); y <= Math.ceil(gy + reach); y++) {
    for (let x = Math.floor(gx - reach); x <= Math.ceil(gx + reach); x++) {
      const rx = x + 0.5 - gx;
      const ry = y + 0.5 - gy;
      const u = rx * dx + ry * dy;
      const v = (-rx * dy + ry * dx) * litSide;
      if (u >= from && u <= tip) {
        const k = (u - from) / Math.max(1, len0);
        // (waving twice along it, drawn out to a point over its last third)
        const wave = 0.42 * Math.sin(k * Math.PI * 4);
        const half = (1.3 + 0.25 * (1 - k)) * (k > 0.66 ? (1 - k) / 0.34 : 1);
        if (Math.abs(v - wave) <= half + 0.05) {
          const vv = v - wave;
          set(x, y, vv > half - 0.9 ? BLADE.H : vv < -half + 0.9 ? BLADE.S : k < 0.62 && Math.abs(vv) < 0.5 ? BLADE.M : BLADE.L);
        }
      } else if (u >= from - 1.4 && u < from && Math.abs(v) <= 2.7) {
        set(x, y, v > 0.9 ? GUARD.L : v < -0.9 ? GUARD.S : GUARD.M);
      } else if (u >= -3.4 && u < -1.6 && Math.abs(v) <= 1.25 - Math.abs(u + 2.5) * 0.3) {
        set(x, y, v > 0.2 ? BLADE.L : BLADE.M);
      }
    }
  }
  // THE GLINT: a star of light on the blade, two thirds of the way along it
  if (glint > 0.15) {
    const k = 0.62;
    const cx = Math.floor(gx + dx * (from + len0 * k));
    const cy = Math.floor(gy + dy * (from + len0 * k));
    set(cx, cy, '#fffbe8');
    if (glint > 0.4) for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) set(cx + ox, cy + oy, glint > 0.75 ? FLAME[4] : BLADE.H);
    if (glint > 0.75) for (const [ox, oy] of [[2, 0], [-2, 0], [0, 2], [0, -2]] as const) set(cx + ox, cy + oy, FLAME[3]);
  }
  return pix;
}

/** His rest pose: crouched and coiled, his weight forward on the balls of his feet; the dagger brandished high in his right fist beside his cowl, its point up; his left hand out before him, clawing; his cowl down, his eyes up out of it. */
export const KNIFE_REST: Bones = {
  ...standing(KB),
  pz: -3.4, px: 0.8, py: 0, yaw: 2, pitch: 9, roll: 0, twist: 2, bend: 12, side: 0,
  faceTurn: -4, faceUp: 8, faceTilt: 0,
  lfx: -3.0, lfy: 3.4, lft: 18, lk: 14, rfx: 3.4, rfy: -3.6, rft: -14, rk: -18,
  rhIn: 0, rhx: 3.0, rhy: -8.5, rhz: 9.0, re: 70,
  lhIn: 0, lhx: 9.0, lhy: 4.0, lhz: -12.0, le: -8,
  wAz: -20, wEl: 74, wRoll: 0,
  draw: 0.4, out: 0, gale: 0, prop: 0, pt: 0, pAz: 0, pEl: 0, stow: 0,
};

/** His standing loop: 2.4 s round, 24 frames at ten a second. */
export const KNIFE_STAND_LONG = 2.4;
/**
 * STANDING, NEVER STILL, AND NEVER EASY: coiled, his shoulders heaving with his breath, his weight rocking
 * from foot to foot; his cowl jerking from side to side as he watches you, snapping round; the dagger high
 * in his fist, its blade turning over and back, and once round thrust up higher, ready; the fingers of his
 * other hand curling and uncurling.
 */
function knifeStand(): Motion {
  const R = KNIFE_REST;
  const keys: Key3[] = [];
  const N = 24;
  // (his cowl's jerks: held, then snapped round to the next)
  const look: ReadonlyArray<readonly [number, number]> = [[0, 0], [0.3, 0], [0.38, 16], [0.9, 16], [0.98, -10], [1.5, -10], [1.56, 4], [2.0, 4], [2.1, 0], [2.4, 0]];
  for (let i = 0; i <= N; i++) {
    const t = i / 10;
    const a = (t / KNIFE_STAND_LONG) * Math.PI * 2;
    const lift = rampAt(t, 1.3, 1.55) * (1 - rampAt(t, 1.9, 2.3));
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz - 0.6 * Math.max(0, Math.sin(4 * a)) + 0.5 * lift,
        px: R.px + 0.6 * Math.sin(a),
        py: 0.9 * Math.sin(a + 0.6),
        roll: 2.5 * Math.sin(a + 0.6),
        bend: R.bend + 2.0 * Math.sin(4 * a) - 3 * lift,
        pitch: R.pitch + 0.8 * Math.sin(4 * a + 0.4),
        twist: R.twist + 3 * Math.sin(a + 1.4) - 4 * lift,
        faceTurn: R.faceTurn + curve(look, t),
        faceUp: R.faceUp + 2 * Math.sin(2 * a) + 4 * lift,
        faceTilt: 4 * Math.sin(a + 0.4),
        rhx: R.rhx + 0.8 * Math.sin(2 * a) + 1.5 * lift,
        rhz: R.rhz + 0.8 * Math.sin(2 * a + 1) + 3 * lift,
        wAz: R.wAz + 18 * Math.sin(2 * a) + 12 * lift,
        wEl: R.wEl - 8 + 8 * Math.sin(2 * a + 0.8) + 6 * lift,
        wRoll: 30 * Math.sin(2 * a),
        lhx: R.lhx + 1.0 * Math.sin(a + 2.0),
        lhz: R.lhz + 1.2 * Math.sin(2 * a + 2.2),
        draw: 0.45 + 0.35 * Math.sin(3 * a),
        gale: 0.15 + 0.1 * Math.sin(a),
      },
    });
  }
  return { loop: 0, keys };
}

/** THE DAGGER CULTIST AS SOLIDS: his bound legs, his robe girded up with its rope and its torn hem, his stole, his sleeves and bare forearms, his hands, the cowl and its point and the face in it, the dagger. */
function knifeBits(st: Stage, m: Moment): Bit[] {
  const { s, q } = m;
  const B = KB;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const gale = clamp01(q.gale);
  const glare = lit * (1 + 0.9 * clamp01(m.glint));
  const ph = m.wind * Math.PI * 2;
  const lagRaw = mul(m.come, -1.6);
  const lagL = len(lagRaw);
  const lag = lagL > 3.2 ? mul(lagRaw, 3.2 / lagL) : lagRaw;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];

  // --- HIS LEGS, bound in dark rags from the knee down, bands of them lighter; his feet bound too ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: 1.8, rb: 1.45, ramp: RAGS, far: true });
    put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(1.5), skin: RAGS, far: true });
    put(`leg${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: 1.35, rb: 1.05, ramp: RAGS, far: true });
    const way = norm(sub(ankle, knee), [0, 0, -1]);
    const e1 = norm(cross(way, [0, 0, 1]), [0, 1, 0]);
    const e2 = norm(cross(e1, way));
    for (const k of [0.3, 0.62]) put(`leg${side}`, `shin${side}`, { k: 'band', ring: { c: lerp3(knee, ankle, k), u: mul(e1, 1.45 - 0.3 * k), v: mul(e2, 1.45 - 0.3 * k) }, ramp: RAG_BAND, rows: 1 });
    put(`leg${side}`, `foot${side}`, { k: 'rod', a: add(heel, [0, 0, 1.0]), b: add(toe, [0, 0, 0.75]), ra: 1.15, rb: 0.85, ramp: RAGS, far: true });
    put(`leg${side}`, `foot${side}`, { k: 'ball', c: ankle, ax: sphere(1.1), skin: RAGS, far: true });
  }

  // --- HIS ROBE: from his neck down over his chest, girded up at his waist, down over his thighs to a torn hem at his knees, left behind as he runs ---
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const be = s.belly;
  const torso: Ring[] = [
    { c: add(s.neck, mul(cu, 0.8)), u: mul(cf, 3.6), v: mul(cl, 4.4) },
    { c: lerp3(s.ribs, s.neck, 0.7), u: mul(cf, B.ribDeep + 2.2), v: mul(cl, B.shoulderHalf + 1.0) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 2.0), v: mul(cl, B.ribHalf + 2.2) },
    { c: waistC, u: mul(be[0], B.waistDeep + 1.6), v: mul(be[1], B.waistHalf + 1.6) },
  ];
  const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
  const spanF = Math.abs(dot(sub(s.kneeL, s.kneeR), f));
  const hemZ = Math.min(s.kneeL[2], s.kneeR[2]) + 1.2 + 1.2 * gale;
  const hipC: V3 = [s.pelvis[0], s.pelvis[1], s.pelvis[2] - 1.2];
  const hemC: V3 = [s.pelvis[0] + (kneeMid[0] - s.pelvis[0]) * 0.55 + lag[0] * 1.3, s.pelvis[1] + (kneeMid[1] - s.pelvis[1]) * 0.55 + lag[1] * 1.3, hemZ];
  const hemDeep = Math.max(B.pelvisDeep + 3.2, spanF / 2 + 2.6) + 1.2 * gale;
  const hemWide = B.pelvisHalf + 3.2 + 1.2 * gale;
  const hemPts: V3[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const rear = Math.max(0, -Math.cos(a));
    const p = add(hemC, add(mul(f, Math.cos(a) * hemDeep), mul(l, Math.sin(a) * hemWide)));
    hemPts.push(add(p, add([0, 0, Math.sin(ph * 2 + a * 3) * 0.6 + rear * (0.6 + 1.6 * gale)], mul(lag, rear * 0.7))));
  }
  const skirt: Ring[] = [
    { c: hipC, u: mul(f, B.pelvisDeep + 2.0), v: mul(l, B.pelvisHalf + 2.2) },
    { c: lerp3(hipC, hemC, 0.5), u: mul(f, (B.pelvisDeep + 2.0 + hemDeep) / 2), v: mul(l, (B.pelvisHalf + 2.2 + hemWide) / 2) },
    { c: hemC, u: mul(f, hemDeep), v: mul(l, hemWide), pts: hemPts },
  ];
  const robeRings = [...torso, ...skirt];
  put('robe', 'robe', { k: 'cloth', rings: robeRings, ramp: ROBE, look: { folds: [25, -25, 70, -70, 120, -120, 165, -165], lift: 0.08 }, torn: TORN });

  // --- THE CULT'S PINK CORD ROUND HIS WAIST, girding his robe up, its knot at his side and its two ends hanging, swinging ---
  {
    const ring: Ring = { c: add(waistC, mul(cu, -0.4)), u: mul(be[0], B.waistDeep + 1.6), v: mul(be[1], B.waistHalf + 1.6) };
    put('rope', 'rope', { k: 'band', ring, ramp: ROPE, rows: 2 });
    const knot = add(add(ring.c, mul(norm(be[0]), (B.waistDeep + 1.6) * 0.75)), mul(norm(be[1]), (B.waistHalf + 1.6) * 0.62));
    put('rope', 'rope', { k: 'ball', c: knot, ax: sphere(1.0), skin: ROPE });
    for (const [j, long] of [[0, 6.5], [1, 5.0]] as const) {
      const sway = Math.sin(ph * 2 + j * 1.9) * 0.8;
      const end = add(knot, add([0, 0, -long], add(mul(l, (j ? 0.8 : -0.3) + sway * 0.4), mul(lag, 1.1))));
      put('rope', 'rope', { k: 'rod', a: knot, b: end, ra: 0.75, rb: 0.6, ramp: ROPE });
    }
  }

  // --- HIS SLEEVES, pushed back off his forearms; bare, bony forearms; his hands ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    put(`sleeve${side}`, `sleeve${side}`, { k: 'rod', a: sh, b: el, ra: 2.5, rb: 2.6, ramp: ROBE, far: true });
    const e1 = norm(sub([0, 0, 1], mul(fore, dot([0, 0, 1], fore))), cu);
    const e2 = norm(cross(fore, e1));
    const mouth = add(el, mul(fore, 1.8));
    const mouthPts: V3[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const under = Math.max(0, -Math.cos(a));
      mouthPts.push(add(add(mouth, add(mul(e1, Math.cos(a) * 2.7), mul(e2, Math.sin(a) * 2.7))), add([0, 0, -under * (1.6 + gale)], mul(lag, under * 0.5))));
    }
    put(`sleeve${side}`, `sleeve${side}`, { k: 'cloth', rings: [{ c: el, u: mul(e1, 2.4), v: mul(e2, 2.4) }, { c: mouth, u: mul(e1, 2.7), v: mul(e2, 2.7), pts: mouthPts }], ramp: ROBE, look: { folds: [90, -90], lift: 0.1 } });
    const wrist = add(hand, mul(fore, -0.9));
    put(`arm${side}`, `arm${side}`, { k: 'rod', a: add(mouth, mul(fore, -0.6)), b: wrist, ra: 0.95, rb: 0.75, ramp: SKIN, far: true });
    if (side === 'R') {
      // (his fist, closed on the dagger's grip)
      put('handR', 'handR', { k: 'ball', c: hand, ax: [mul(fore, 1.4), mul(e1, 1.25), mul(e2, 1.25)], skin: SKIN, far: true });
    } else {
      // (his left hand open, clawing: a narrow palm and four bony fingers hooked in, curling as he breathes)
      const curl = clamp01(q.draw);
      put('handL', 'handL', { k: 'ball', c: hand, ax: [mul(fore, 1.1), mul(e1, 1.1), mul(e2, 0.7)], skin: SKIN, far: true });
      for (let j = 0; j < 4; j++) {
        const t = (j - 1.5) / 1.5;
        const base = add(add(hand, mul(fore, 0.9)), mul(e2, t * 1.1));
        const d0 = norm(add(fore, mul(e2, t * 0.45)));
        const mid0 = add(base, mul(d0, 1.8));
        const hook = norm(add(mul(d0, 1 - curl), mul(e1, -0.9 * curl - 0.2)));
        put('handL', 'handL', { k: 'rod', a: base, b: mid0, ra: 0.45, rb: 0.4, ramp: SKIN, far: true });
        put('handL', 'handL', { k: 'rod', a: mid0, b: add(mid0, mul(hook, 1.6)), ra: 0.4, rb: 0.3, ramp: SKIN, far: true });
      }
    }
  }

  // --- THE DAGGER, in his right fist: laid along the way it points as the eye sees it, just behind his fist ---
  {
    const [gx, gy] = st.at(s.handR);
    const [px, py] = st.seen(s.point);
    const deg = (Math.atan2(-py, px) * 180) / Math.PI;
    const pix = daggerPix(Math.floor(gx) + 0.5, Math.floor(gy) + 0.5, deg, Math.hypot(px, py), clamp01(m.glint));
    stamp(st, put, 'dagger', 'dagger', pix, add(s.handR, mul(st.eye, -0.6)));
  }
  // (its way through the air as he plunges it, streaked)
  if (m.blur && m.trails) {
    for (const tr0 of m.trails) {
      for (let i = 1; i < tr0.length; i++) {
        const a = tr0[i - 1];
        const b = tr0[i];
        const n = Math.max(1, Math.ceil(Math.hypot(st.at(b)[0] - st.at(a)[0], st.at(b)[1] - st.at(a)[1])));
        for (let j = 0; j < n; j++) put('streak', 'streak', { k: 'mote', p: lerp3(a, b, j / n), c: i < tr0.length / 2 ? BLADE.H : BLADE.M, size: 1 });
      }
    }
  }

  // --- HIS COWL: deep, its point drooping behind; the opening dark, his eyes two slashes of pink in it ---
  const face = wornOn(st, s, 12);
  const [ff, fl, fu] = face;
  {
    const hc = add(s.head, add(mul(ff, COWL_FWD), mul(fu, COWL_UP)));
    const hr = COWL_R;
    const cam = Math.atan2(dot(st.eye, fl), dot(st.eye, ff)) / D;
    const toward = clamp01((110 - Math.abs(cam)) / 40);
    const midA = Math.max(-40, Math.min(40, cam * 0.8)) * toward * D;
    const od: V3 = norm(add(mul(ff, Math.cos(midA)), mul(fl, Math.sin(midA))));
    const odLevel = norm([od[0], od[1], od[2] * 0.4]);
    const [ox, oy] = st.at(add(add(hc, mul(odLevel, hr[0] * 0.9)), [0, 0, -0.6]));
    const oxi = Math.floor(ox);
    const oyi = Math.floor(oy);
    const hot = glare > 1.4;
    const faceColour = (ch: string): string | null => {
      switch (ch) {
        case 'r':
          return lit < 0.05 ? INK : hot ? FLAME[1] : '#4a0c38';
        case 'k':
          return INK;
        case 'h':
          return lit < 0.05 ? INK : hot ? FLAME[4] : glare > 0.5 ? SOCKET : FLAME[1];
        default:
          return null;
      }
    };
    const seenFace = dot(od, st.eye) > 0.15;
    const cowlSkin: Skin = (u, tone) => {
      const toOpen = u[0] * Math.cos(midA) + u[1] * Math.sin(midA);
      if (seenFace && toOpen > 0.15) {
        const p = add(hc, add(add(mul(ff, u[0] * hr[0]), mul(fl, u[1] * hr[1])), mul(fu, u[2] * hr[2])));
        const [x, y] = st.at(p);
        const line = KNIFE_FACE[Math.floor(y) - oyi + KNIFE_FACE_MID[1]];
        const col = Math.floor(x) - oxi + KNIFE_FACE_MID[0];
        if (line && col >= 0 && col < line.length) {
          const c = faceColour(line[col]);
          if (c) return c;
        }
      }
      return COWL[tone];
    };
    put('cowl', 'cowl', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: cowlSkin });
    // (the back of the cowl falls to his shoulders)
    put('cowl', 'cowl', { k: 'ball', c: add(add(hc, mul(ff, -2.6)), mul(fu, -3.2)), ax: [mul(ff, 3.8), mul(fl, 4.6), mul(fu, 3.6)], skin: COWL });
    // ITS POINT: from the top of the back of the cowl, drooping back and down, tapering, swinging as he moves
    {
      let at = add(hc, add(mul(fu, hr[2] * 0.72), mul(ff, -hr[0] * 0.4)));
      const R0 = [2.5, 1.9, 1.3, 0.7, 0.3];
      for (let i = 0; i < 4; i++) {
        const k = (i + 1) / 4;
        const sway = Math.sin(ph * 2 + i * 0.9) * 0.4 * k;
        const next = add(at, add(add(mul(ff, -2.1), mul(fu, 1.1 - 2.0 * k)), add(mul(fl, sway), mul(lag, 0.35 * k))));
        put('cowl', 'cowl', { k: 'rod', a: at, b: next, ra: R0[i], rb: R0[i + 1], ramp: COWL });
        at = next;
      }
    }
    // (the light of his eyes, in the dark of the cowl)
    if (lit > 0.05 && dot(od, st.eye) > 0.05) put('glow', 'glow', { k: 'glow', p: add(hc, mul(od, hr[0] * 0.9)), c: SOCKET, r: 3 + 3 * clamp01(m.glint), a: Math.min(0.6, 0.28 * glare) });
  }

  // --- THE DUST he kicks up as he lands on his blow ---
  if (m.dust && m.since !== undefined && m.since >= 0 && m.since < DUST_FOR) {
    const k = m.since / DUST_FOR;
    const foot = lerp3(lerp3(s.heelL, s.toeL, 0.6), lerp3(s.heelR, s.toeR, 0.6), 0.5);
    for (let i = 0; i < 18; i++) {
      if (hash(i, 7, 613) < k * 0.9) continue;
      const a = (i / 18) * Math.PI * 2 + hash(i, 1, 613);
      const r = 3 + (7 + 7 * hash(i, 2, 613)) * Math.sqrt(k);
      const z = 0.4 + (1.5 + 3.5 * hash(i, 3, 613)) * Math.sin(Math.PI * Math.min(1, k * 1.3));
      put('dust', 'dust', { k: 'mote', p: [foot[0] + Math.cos(a) * r * 1.2, foot[1] + Math.sin(a) * r, z], c: i % 3 ? DUST[1] : DUST[0], size: i % 3 === 0 ? 2 : 1 });
    }
  }
  return bits;
}
/** How long the dust he kicks up as he lands lasts; its colours. */
const DUST_FOR = 0.4;
const DUST = ['#463e64', '#6a6088'] as const;

export const KNIFE_PACE = 3.0;
export const DAGGER_CULTIST: Mob = {
  id: 'daggerCultist',
  name: 'The Dagger Cultist',
  size: 'small: a little shorter than the knight',
  build: KB,
  stand: { name: 'The dagger cultist, coiled', motion: knifeStand(), rest: KNIFE_REST },
  // (his run and his blow come once his look has the owner's yes; till then his stand stands in for them)
  attack: { name: 'The dagger cultist (his blow to come)', motion: knifeStand(), rest: KNIFE_REST },
  idleFrames: 24,
  idleFps: 10,
  walk: { name: 'The dagger cultist (his run to come)', motion: knifeStand(), rest: KNIFE_REST, period: KNIFE_STAND_LONG },
  walkFrames: 24,
  walkFps: 10,
  pace: KNIFE_PACE,
  reel: { name: 'The dagger cultist is struck', motion: knifeStand(), rest: KNIFE_REST },
  reelTime: 0.3,
  hit: 0.6,
  warn: 0.3,
  dieTime: 1.2,
  dying: { name: 'The dagger cultist falls', motion: knifeStand(), rest: KNIFE_REST },
  aura: { x: KNIFE_CANVAS.ax - 2, y: KNIFE_CANVAS.ay - 30, r: 42, color: '#ff3a78', a: 0.13 },
  shadow: 11,
  canvas: KNIFE_CANVAS,
  trueBack: true,
  bits: (st, m) => knifeBits(st, m),
};

/** THE DAGGER CULTIST, as the game holds a monster. */
export function makeDaggerCultistArt3(pace = DAGGER_CULTIST.pace): ActorArt {
  return { front: mobSet(DAGGER_CULTIST, 'front', pace), back: mobSet(DAGGER_CULTIST, 'back', pace) };
}
