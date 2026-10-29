// FLOOR 17'S BOSS, THE PRINCE (THE MASQUE, THE BLACK ROOM), ON THE HEROES' BONES. A MOCK-UP: NOT IN THE GAME. Nothing of
// the game imports this file; `PRINCE_ON` is off. His moves are art/prince_moves.ts; what his moves leave on the floor
// (the ring of masked partners, the flung masks, the clock's rings) art/prince_fx.ts.
//
// His floor, THE MASQUE: the prince's masked ball, gone on for weeks, in a suite of seven rooms each in its own colour (blue,
// purple, green, orange, white, violet, and a black one lit red through its windows), from Poe's "The Masque of the Red
// Death" (1842), only from the book. His story: the prince opened the city to the Silent Order in return for his walls,
// shut the poor out, and kept dancing while the city below went quiet. The Princess's last words as she falls (floor 16):
// “Stop the dancing.”
//
// HIS BRIEF, offered to him as a pop-up ("You said “like the prince with a rapier, dancing is going to need to be fast and
// constantly moving”. Is this his brief?"), his pick: “Yes, this brief (Recommended)”. The brief as offered:
//   THE PRINCE (floor 17 boss, the Black Room). Look: a tall young man in a long velvet coat and a smiling gilt mask, with
//   a rapier. Size: a head taller than the knight. Move: fast and never still. He dances the whole fight, darting,
//   spinning, lunging across the room. Mark: the smiling gilt mask. Moves: a rapier thrust (basic); the Dance, a ring of
//   masked partners closing round you as he waltzes past; Masks, smiling masks flung spinning across the room; Midnight,
//   the great clock striking twelve, each chime a ring rolling out to dodge. Each phase the clock strikes faster. Death:
//   his mask cracks; under it, only the Hush's grey fog, which drains away up the stairs. Never: not a jester or clown,
//   not gory. Sound: the clock, the music, his boots; no voice.
//
// HIS LOOK: a tall young man, slim, long in the leg, a head taller than the knight. A long coat of BLACK VELVET, the black
// room's own, fitted to the waist and flaring to the calf, its skirts split before and behind so that they swing and fly
// out as he turns; braided in gilt down its fronts, gilt buttons; deep turned-back cuffs of SCARLET, the red of the black
// room's windows (never the enemy's pink); a waistcoat of the same scarlet, buttoned in gilt; a lace jabot at the throat;
// scarlet breeches; tall black boots, their tops turned down; pale grey kid gloves. His head in a snug coif of black
// velvet, a soft velvet bonnet on it, tilted, a long scarlet plume curling back from it. HIS FACE IS THE MASK: a smiling
// gilt mask, the whole face, its smile fixed, too wide, unsettling; through its eye holes the dull pink of the Hush. Under
// it there is nothing but the Hush's grey fog (it curls out of his collar a little all the while). THE RAPIER: a long thin
// blade, a swept hilt of gilt. Nothing cyan anywhere; nothing in the pinks; no jester's motley, no clown's face.

import { footOn } from './bosses3';
import { HUSH } from './crier';
import { BREATH_PALE, lagOf } from './hushed';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { skirtOf, wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const PRINCE_ON = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const D = Math.PI / 180;

// =============================================================================================
// HIS COLOURS: the black room's black velvet and its scarlet light; gilt; steel; the Hush's grey

/** His coat, his breeches, his coif and bonnet: black velvet, its sheen a deep violet (hue about 266: clear of the enemy's pink and the friend's cyan). */
export const VELVET: Ramp = ['#0c0914', '#1a1428', '#2e2444', '#4a3a68', '#76619a'];
/** His cuffs, his waistcoat, his plume: scarlet, the red of the black room's windows (hue about 3 to 9: a red, never the pink). */
export const SCARLET: Ramp = ['#2a0808', '#4c0c0c', '#741410', '#9c2216', '#c43a22'];
/** The gilt: his mask, the braid and buttons of his coat, the hilt of his rapier. */
export const GILT: Ramp = ['#3c2a0a', '#6c4c14', '#a47c26', '#d6ae46', '#f6e090'];
/** The rapier's blade. */
export const STEEL: Ramp = ['#26242e', '#46444f', '#757380', '#aeacb8', '#e4e2ea'];
/** His gloves: pale grey kid. */
const GLOVE: Ramp = ['#3c3842', '#5e5866', '#8a8492', '#b6b0bc', '#dad6de'];
/** His boots: black leather. */
const BOOT: Ramp = ['#08080c', '#121218', '#1e1e26', '#2e2e3a', '#46465a'];
/** The lace at his throat. */
const LACE: Ramp = ['#4a4652', '#76727e', '#a8a4ae', '#d0ccd4', '#ecebf0'];
/** The Hush's grey fog: what he is under the mask. */
export const FOG: Ramp = HUSH;
/** The fog where his face was, once the mask is gone: paler, the Hush's breath. */
const FOG_PALE: Ramp = ['#3e3852', '#625a7a', '#8f88aa', '#b6b0cc', '#d6d2e4'];
/** The mask's carved smile and its eye holes: dark. */
const CARVED = '#1a1208';

// =============================================================================================
// HIS BODY

/** A tall young man, a head taller than the knight (58): slim, long in the leg; his head a little more than life, so that the mask reads. */
export const PRINCE_BODY: Build = buildOf(66, 1.42, { shoulders: 1.2, chest: 1.06, depth: 0.92, waist: 0.66, hips: 0.84, legs: 1.08, arms: 1.03, trunk: 1.0, limbs: 0.92, pad: 1.5 });
const B = PRINCE_BODY;
/**
 * His picture: room for his lunge (his body flown two tiles and more forward, the rapier out at the end of it), for his
 * rapier held straight up at Midnight, and for the coat lying on the floor when he is gone.
 */
export const PC_CANVAS: MobCanvas = { w: 420, h: 330, ax: 130, ay: 220 };

/** His rest: upright, light, up a little on the balls of his feet; his right foot a little forward and turned out; the rapier held low before him, its point toward you; his left hand lifted at his side, its fingers spread, as a dancer's. */
export const PRINCE_REST: Bones = {
  ...standing(B),
  pz: -1.2, px: -1.5, py: 0.8, pitch: 0, bend: -4, roll: -2, side: 2, yaw: -10, twist: 8, faceUp: 4, faceTilt: -5, faceTurn: 6,
  lk: 22, rk: -10,
  ...footOn(B, 'L', { at: [2.0, 6.4], turn: 30, pitch: 8 }), ...footOn(B, 'R', { at: [13.5, -4.6], turn: -8, pitch: 34 }),
  lhIn: 0, lhx: 1, lhy: 18, lhz: -3, le: -30,
  rhIn: 0, rhx: 11, rhy: -4.5, rhz: -18, re: 20,
  wAz: 0, wEl: -18, wRoll: 0,
  out: 0,
} as Bones;

// =============================================================================================
// WHAT A MOMENT OF A MOVE SAYS OF HIM OVER AND ABOVE THE BONES

export interface PrinceSay {
  /** Whether the rapier is in his hand (his death: he lets it fall). */
  armed?: (m: Moment) => boolean;
  /** How far his coat flies out as he spins (0 hanging, 1 flung out flat), and how far round its hem trails his turn (degrees). */
  twirl?: (m: Moment) => { k: number; trail: number };
  /** THE SMEAR OF A LIGHTNING STRIKE (his Movement 9): after-images of what strikes along the way it has just come, each a line of points, the oldest first. */
  smear?: (m: Moment) => V3[][] | null;
  /** Grains of his own move laid after his edge (the point glinting pink, the masks' eye holes glinting, the fog pouring out of him). */
  more?: (m: Moment) => [V3, string, number][];
  /** The masks fanned in his left hand (Masks, before he flings them): how many, and how far fanned out (0 shut, 1 open). */
  fan?: (m: Moment) => { n: number; open: number } | null;
  /** HIS DEATH: how far his mask has cracked (0 whole, 1 split right across); whether its halves have fallen (then his face is fog); how empty he is (0 himself, 1 only his clothes left, lying flat). */
  crack?: (m: Moment) => number;
  unmasked?: (m: Moment) => boolean;
  empty?: (m: Moment) => number;
  /** How far his head has gone to fog (his death, once the mask is off: 0 there, 1 gone, nothing in his collar). */
  gone?: (m: Moment) => number;
}

// =============================================================================================
// HIM AS SOLIDS

/** A point flattened toward the floor as he empties (his death): down to lie on it, spread a little out from where he knelt. */
function flatten(p: V3, k: number, mid: V3): V3 {
  if (k <= 0) return p;
  const lie = 1.2 + p[2] * 0.06;
  const out: V3 = [p[0] + (p[0] - mid[0]) * 0.25 * k + Math.max(0, p[2] - 10) * 0.35 * k, p[1] + (p[1] - mid[1]) * 0.25 * k, p[2] + (lie - p[2]) * k];
  return out;
}

/**
 * A COAT'S SKIRT KEPT TO HIS LEG (as the Headsman's, art/bosses3.ts): rings no deeper or wider than these, their middles no
 * further than `off` from the top's (so a leg flung out in a lunge parts the skirts, and does not blow one up into a bell).
 */
function hugged(rings: Ring[], top: V3, deep: number, wide: number, off: number): Ring[] {
  return rings.map((r, i) => {
    if (i === 0) return r;
    const du = len(r.u);
    const dv = len(r.v);
    const ku = du > deep ? deep / du : 1;
    const kv = dv > wide ? wide / dv : 1;
    const fu = mul(r.u, 1 / Math.max(1e-6, du));
    const fv = mul(r.v, 1 / Math.max(1e-6, dv));
    const away: V3 = [r.c[0] - top[0], r.c[1] - top[1], 0];
    const far = len(away);
    const c: V3 = far > off ? [top[0] + (away[0] * off) / far, top[1] + (away[1] * off) / far, r.c[2]] : r.c;
    const pts = r.pts?.map((p) => {
      const d = sub(p, r.c);
      return add(c, add(add(mul(fu, dot(d, fu) * ku), mul(fv, dot(d, fv) * kv)), [0, 0, d[2]]));
    });
    return { c, u: mul(r.u, ku), v: mul(r.v, kv), pts };
  });
}

/** The rapier in his right hand: the grip in his fist, the blade along the way the bones say what is held points. Its points: pommel, guard, tip; and the swept hilt's bars. */
export const BLADE_LONG = 46;
export function rapierOf(s: Skeleton): { pommel: V3; guard: V3; tip: V3; point: V3; across: V3; knuckle: V3 } {
  const point = s.point;
  const across = s.across;
  const knuckle = norm(cross(point, across), [0, 0, 1]);
  const grip = s.handR;
  return { pommel: add(grip, mul(point, -3.4)), guard: add(grip, mul(point, 2.2)), tip: add(grip, mul(point, 2.2 + BLADE_LONG)), point, across, knuckle };
}
function rapier(put: Put, s: Skeleton, ramp: Ramp = STEEL): void {
  const r = rapierOf(s);
  // the blade: long and thin, tapering to its point; its edge catching the light
  put('rapier', 'rapier', { k: 'rod', a: r.guard, b: lerp3(r.guard, r.tip, 0.55), ra: 0.95, rb: 0.72, ramp });
  put('rapier', 'rapier', { k: 'rod', a: lerp3(r.guard, r.tip, 0.55), b: r.tip, ra: 0.72, rb: 0.3, ramp });
  // the ricasso, the quillons across it, the swept bars round the knuckles to the pommel, a ring each side of the blade
  put('rapier', 'rapier', { k: 'rod', a: add(r.guard, mul(r.across, 4.2)), b: add(r.guard, mul(r.across, -4.2)), ra: 0.62, rb: 0.62, ramp: GILT });
  put('rapier', 'rapier', { k: 'ball', c: add(r.guard, mul(r.across, 4.4)), ax: sphere(0.85), skin: GILT });
  put('rapier', 'rapier', { k: 'ball', c: add(r.guard, mul(r.across, -4.4)), ax: sphere(0.85), skin: GILT });
  let prev = add(r.guard, mul(r.knuckle, 0.6));
  for (let i = 1; i <= 6; i++) {
    const k = i / 6;
    const p = add(lerp3(r.guard, r.pommel, k), add(mul(r.knuckle, 0.6 + 3.2 * Math.sin(Math.PI * k)), mul(r.across, 0.9 * Math.sin(Math.PI * k))));
    put('rapier', 'rapier', { k: 'rod', a: prev, b: p, ra: 0.5, rb: 0.5, ramp: GILT });
    prev = p;
  }
  for (const sg of [1, -1]) {
    const c = add(add(r.guard, mul(r.point, 1.1)), mul(r.across, sg * 1.9));
    let q = add(c, mul(r.knuckle, 1.5));
    for (let i = 1; i <= 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const p = add(c, add(mul(r.knuckle, 1.5 * Math.cos(a)), mul(r.point, 1.3 * Math.sin(a))));
      put('rapier', 'rapier', { k: 'rod', a: q, b: p, ra: 0.38, rb: 0.38, ramp: GILT });
      q = p;
    }
  }
  put('rapier', 'rapier', { k: 'ball', c: r.pommel, ax: sphere(1.2), skin: GILT });
}

/** THE MASK'S FACE, in its own lines (forward out of the face, to its left, up), on a shell over the front of his head: the smile, the eye holes, the brows, the cheeks, the ridge of the nose. `half`: which half of it, once cracked (null: whole). */
/** A skin drawn point by point (the mask's carving). */
type Carved = (u: V3, tone: number, x: number, y: number) => string | null;

function maskSkin(half: 'A' | 'B' | null, crack: number): Carved {
  return (u, tone) => {
    if (u[0] < 0.2) return null;
    const y = u[1] / 0.98;
    const z = u[2] / 0.98;
    // (its outline: a long oval, the whole face, brow to chin)
    if ((y / 0.9) ** 2 + (z / 0.98) ** 2 > 1) return null;
    // (the crack: a jagged line across it from the brow over the left eye to the jaw on the right)
    const line = 0.62 * z + 0.12 * Math.sin(z * 19) - y * 0.8;
    if (half === 'A' && line < 0) return null;
    if (half === 'B' && line >= 0) return null;
    if (crack > 0.02 && Math.abs(line) < 0.06 && (z + 1) / 2 > 1 - crack) return CARVED;
    // its edge, rolled: a lip of brighter gilt all round
    const r = Math.hypot(y / 1.0, z / 1.0);
    // the eye holes: almond, tilted up at their outer corners
    for (const sg of [-1, 1]) {
      const ex = y - sg * 0.36;
      const ez = z - 0.17 - sg * ex * 0.25;
      if ((ex / 0.21) ** 2 + (ez / 0.12) ** 2 < 1) return CARVED;
    }
    // THE SMILE: wide, fixed, its corners turned up hard into the cheeks; a dark crescent
    const sz = -0.44 + 0.8 * y * y;
    if (Math.abs(y) < 0.62 && z < sz + 0.1 && z > sz - 0.12 - 0.08 * (1 - Math.abs(y) / 0.62)) return CARVED;
    // the cheeks, raised by the smile, and the ridge of the nose: lit
    const cheek = [-1, 1].some((sg) => ((y - sg * 0.42) / 0.22) ** 2 + ((z + 0.08) / 0.16) ** 2 < 1);
    if (cheek || (Math.abs(y) < 0.08 && z > -0.2 && z < 0.24)) return GILT[Math.min(4, tone + 1)];
    // the brows, arched: a shade into the gilt over each eye
    for (const sg of [-1, 1]) {
      const bx = y - sg * 0.36;
      if (Math.abs(bx) < 0.26 && Math.abs(z - (0.42 - 0.8 * bx * bx)) < 0.07) return GILT[Math.max(1, tone - 1)];
    }
    if (r > 0.9) return GILT[Math.max(1, tone)];
    return GILT[tone];
  };
}

/** The mask's shell over his face (its middle, its three half-lengths), from his head's own lines. */
function maskFrame(st: Stage, s: Skeleton, ff: V3, fl: V3, fu: V3): { c: V3; ax: readonly [V3, V3, V3] } {
  const hr = B.headR;
  // (its face drawn turned two thirds of the way toward whoever looks, as the heroes' faces are (skin.ts, eyesToward): from
  // half way round to one side, both its eyes and its whole smile are seen)
  const cam = Math.atan2(dot(st.eye, fl), dot(st.eye, ff)) / D;
  const toward = clamp01((110 - Math.abs(cam)) / 40);
  const midA = Math.max(-40, Math.min(40, cam * 0.67)) * toward * D;
  const od = norm(add(mul(ff, Math.cos(midA)), mul(fl, Math.sin(midA))), ff);
  const os = norm(sub(fl, mul(od, dot(fl, od))), fl);
  const c = add(s.head, add(mul(ff, -0.3), mul(fu, -hr[2] * 0.04)));
  return { c, ax: [mul(od, hr[0] * 1.14), mul(os, hr[1] * 1.2), mul(fu, hr[2] * 1.06)] };
}

/** Where the mask's eye holes are, from its frame (the dull pink seen through them). */
function maskEyes(c: V3, ax: readonly [V3, V3, V3]): V3[] {
  return [-1, 1].map((sg) => add(c, add(mul(ax[0], 0.89), add(mul(ax[1], sg * 0.35), mul(ax[2], 0.17)))));
}

/** The Hush curling off him: from his collar, a few grey grains rising and gone (his mark, as the Hushed's grey breath). */
function collarFog(out: [V3, string, number][], s: Skeleton, t: number, n: number, seed: number): void {
  for (let i = 0; i < n; i++) {
    const life = (t * 0.6 + i / n + 0.37 * hash(i, seed, 7711)) % 1;
    if (life > 0.85) continue;
    const a = hash(i, seed, 7712) * Math.PI * 2;
    const from: V3 = add(s.neck, [Math.cos(a) * 3.6, Math.sin(a) * 3.6, 1.5]);
    const p = add(from, [Math.sin(life * 5 + i) * 1.3 - life * 2.5, Math.cos(life * 4 + i) * 1.3, life * 13]);
    out.push([p, life < 0.3 ? BREATH_PALE : life < 0.6 ? FOG[4] : FOG[3], 1]);
  }
}

const GRAINS = new WeakMap<Moment, [V3, string, number][]>();

function princeBits(st: Stage, m: Moment, say: PrinceSay): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const grains: [V3, string, number][] = [];
  GRAINS.set(m, grains);
  const empty = clamp01(say.empty?.(m) ?? 0);
  const mid0: V3 = [s.pelvis[0], s.pelvis[1], 0];
  // (as he empties, all he wears sinks flat to the floor: every solid's points flattened)
  const F = (p: V3): V3 => flatten(p, empty, mid0);
  // (and nothing sinks into the floor as it goes down: what would, lies on it)
  const onFloor = (p: V3, deep: number): V3 => [p[0], p[1], Math.max(p[2], deep)];
  const put: Put = (part, piece, shape) => {
    if (empty <= 0) {
      bits.push({ part, piece, shape });
      return;
    }
    const sh = shape;
    if (sh.k === 'rod') {
      const ra = sh.ra * (1 - 0.35 * empty);
      const rb = sh.rb * (1 - 0.35 * empty);
      bits.push({ part, piece, shape: { ...sh, a: onFloor(F(sh.a), ra), b: onFloor(F(sh.b), rb), ra, rb } });
    }
    else if (sh.k === 'ball') {
      const sq = (v: V3): V3 => [v[0], v[1], v[2] * (1 - 0.6 * empty)];
      const ax: [V3, V3, V3] = [sq(sh.ax[0]), sq(sh.ax[1]), sq(sh.ax[2])];
      bits.push({ part, piece, shape: { ...sh, c: onFloor(F(sh.c), Math.hypot(ax[0][2], ax[1][2], ax[2][2])), ax } });
    }
    else if (sh.k === 'cloth') bits.push({ part, piece, shape: { ...sh, rings: sh.rings.map((r) => {
      const u: V3 = [r.u[0], r.u[1], r.u[2] * (1 - empty)];
      const v: V3 = [r.v[0], r.v[1], r.v[2] * (1 - empty)];
      return { c: onFloor(F(r.c), Math.hypot(u[2], v[2])), u, v, pts: r.pts?.map((p) => onFloor(F(p), 0)) };
    }) } });
    else if (sh.k === 'band') bits.push({ part, piece, shape: { ...sh, ring: { c: onFloor(F(sh.ring.c), Math.hypot(sh.ring.u[2], sh.ring.v[2])), u: sh.ring.u, v: sh.ring.v } } });
    else if (sh.k === 'dot' || sh.k === 'mote') bits.push({ part, piece, shape: { ...sh, p: F(sh.p) } });
    else if (sh.k === 'thread') bits.push({ part, piece, shape: { ...sh, a: F(sh.a), b: F(sh.b) } });
    else bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const lag = lagOf(m, 1.6, 7);
  const tw = say.twirl?.(m) ?? { k: 0, trail: 0 };
  const t = m.t;
  const fH = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const lH: V3 = [-fH[1], fH[0], 0];
  const [rH, rK, rA] = B.legR;

  // --- THE LEGS: scarlet breeches to the knee; tall black boots, their tops turned down, a heel, a pointed toe ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.05, rb: rK * 1.08, ramp: SCARLET, far: true });
    put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.12), skin: SCARLET, far: true });
    const top = lerp3(knee, ankle, 0.08);
    put(`boot${side}`, `boot${side}`, { k: 'rod', a: top, b: ankle, ra: rK * 1.18, rb: rA * 1.15, ramp: BOOT, far: true });
    // the turned-down top: a wider band of the boot's lining just under the knee
    const shin = norm(sub(ankle, knee), [0, 0, -1]);
    put(`boot${side}`, `boot${side}`, { k: 'rod', a: add(top, mul(shin, -0.4)), b: add(top, mul(shin, 3.2)), ra: rK * 1.42, rb: rK * 1.32, ramp: BOOT, far: true });
    const fwd = norm(sub(toe, heel), [1, 0, 0]);
    const side3 = norm([-fwd[1], fwd[0], 0], [0, 1, 0]);
    // the foot: slim, pointed, on a heel
    put(`boot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.48), [0, 0, 1.6]), ax: [mul(fwd, 5.6), mul(side3, 1.9), [0, 0, 1.6]], skin: BOOT, far: true });
    put(`boot${side}`, `foot${side}`, { k: 'rod', a: add(heel, [0, 0, 1.4]), b: add(ankle, mul(fwd, -0.6)), ra: 1.6, rb: rA * 1.1, ramp: BOOT, far: true });
  }

  // --- THE COAT'S SKIRTS: black velvet from the waist to the calf, SPLIT before and behind (one round each leg, so that a
  // stride or a lunge parts them), braided in gilt down their front edges; they swing after him, and as he spins they fly
  // out and round after his turn ---
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.55));
  const flare = clamp01(tw.k);
  for (const side of ['L', 'R'] as const) {
    const sgn = side === 'L' ? 1 : -1;
    const one: Skeleton = side === 'L' ? { ...s, hipR: s.hipL, kneeR: s.kneeL, ankleR: s.ankleL, heelR: s.heelL, toeR: s.toeL } : { ...s, hipL: s.hipR, kneeL: s.kneeR, ankleL: s.ankleR, heelL: s.heelR, toeL: s.toeR };
    const top: Ring = { c: add(waistC, add(mul(s.hips[1], sgn * B.waistHalf * 0.4), mul(s.hips[0], -0.6))), u: mul(s.hips[0], B.waistDeep + 2.6), v: mul(s.hips[1], B.waistHalf * 0.62 + 2.4) };
    const drop = B.thigh * (1.18 - 0.3 * flare);
    let rings = hugged(skirtOf(one, B, { top, drop, wide: B.pelvisHalf * 0.5 + 2.6 + 5 * flare, deep: B.pelvisDeep + 3.6 + 5 * flare, lag, wind: m.wind, gale: q.gale, pad: 1.1 }), top.c, B.pelvisDeep + 6 + 5 * flare, B.pelvisHalf * 0.5 + 5 + 5 * flare, 7);
    // (spun: its hem flung out from his middle and trailing round behind his turn)
    if (flare > 0.01 || Math.abs(tw.trail) > 0.5) {
      const ang = -tw.trail * D;
      const c0 = waistC;
      rings = rings.map((r, i) => {
        if (i === 0) return r;
        const k = i / (rings.length - 1);
        const turn = (p: V3): V3 => {
          const dx = p[0] - c0[0];
          const dy = p[1] - c0[1];
          const a = ang * k;
          const out = 1 + 0.3 * flare * k;
          return [c0[0] + (dx * Math.cos(a) - dy * Math.sin(a)) * out, c0[1] + (dx * Math.sin(a) + dy * Math.cos(a)) * out, p[2] + 4 * flare * k * k];
        };
        const rot = (v: V3): V3 => [v[0] * Math.cos(ang * k) - v[1] * Math.sin(ang * k), v[0] * Math.sin(ang * k) + v[1] * Math.cos(ang * k), v[2]];
        return { c: turn(r.c), u: mul(rot(r.u), 1 + 0.3 * flare * k), v: mul(rot(r.v), 1 + 0.3 * flare * k), pts: r.pts?.map(turn) };
      });
    }
    // (each skirt open at the front, where it falls away from his legs, so that a leg comes out between them; its lining
    // scarlet, seen through the opening and wherever it is turned back)
    const arc: readonly [number, number] = side === 'L' ? [42, 204] : [156, 318];
    put(`coat${side}`, 'coat', { k: 'cloth', rings, ramp: VELVET, look: { folds: side === 'L' ? [60, 100, 140, 180] : [-60, -100, -140, -180], lift: 0.12 + 0.3 * flare, arc } });
    const inner = rings.map((r) => ({ c: r.c, u: mul(r.u, 0.95), v: mul(r.v, 0.95), pts: r.pts?.map((p) => add(r.c, mul(sub(p, r.c), 0.95))) }));
    put(`coat${side}`, 'lining', { k: 'cloth', rings: inner, ramp: SCARLET, look: { side: 'far', lift: 0.1, shade: 0.15 } });
    // its front edge, faced in scarlet and braided in gilt
    const edgeA = (side === 'L' ? 42 : 318) * D;
    const edgePts: V3[] = rings.map((r) => add(r.c, add(mul(r.u, Math.cos(edgeA)), mul(r.v, Math.sin(edgeA)))));
    for (let i = 1; i < edgePts.length; i++) put(`coat${side}`, 'braid', { k: 'thread', a: edgePts[i - 1], b: edgePts[i], c: GILT[3], lift: 0.6 });
  }

  // --- THE SASH: scarlet, round his waist over the coat, knotted at his left hip, its two tails hanging and swinging after him ---
  {
    const sc = add(waistC, mul(s.hips[2], 0.4));
    put('sash', 'sash', { k: 'band', ring: { c: sc, u: mul(s.belly[0], B.waistDeep + 3.0), v: mul(s.belly[1], B.waistHalf + 3.0) }, ramp: SCARLET, rows: 3 });
    const knot = add(sc, add(mul(s.belly[1], B.waistHalf + 3.1), mul(s.belly[0], 1.2)));
    put('sash', 'sash', { k: 'ball', c: knot, ax: [mul(s.belly[0], 1.5), mul(s.belly[1], 1.0), mul(s.hips[2], 1.6)], skin: SCARLET });
    for (const [off, long] of [[0.9, 12], [-0.7, 9.5]] as const) {
      let prev = knot;
      for (let i = 1; i <= 5; i++) {
        const k = i / 5;
        const sw = Math.sin(t * 2.6 + off * 3 + k * 2) * 0.7 * k;
        const p = add(knot, add(mul(s.belly[0], off * 1.6 * k + sw), add(mul(s.belly[1], 1.0 * k), add([0, 0, -long * k], add(mul(lag, 1.5 * k * k), mul(lH, flare * 6 * k))))));
        put('sash', 'sashTail', { k: 'rod', a: prev, b: p, ra: 1.25 - 0.25 * k, rb: 1.2 - 0.25 * k, ramp: SCARLET });
        prev = p;
      }
    }
  }
  // --- THE WAISTCOAT: scarlet, from the waist to the throat, buttoned in gilt down its front ---
  const be = s.belly;
  const vest: Ring[] = [
    { c: add(waistC, mul(s.hips[2], -2.5)), u: mul(be[0], B.waistDeep + 1.6), v: mul(be[1], B.waistHalf + 1.4) },
    { c: waistC, u: mul(be[0], B.waistDeep + 1.4), v: mul(be[1], B.waistHalf + 1.3) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 1.4), v: mul(cl, B.ribHalf + 1.3) },
    { c: lerp3(s.ribs, s.neck, 0.75), u: mul(cf, B.ribDeep + 0.8), v: mul(cl, B.shoulderHalf * 0.8) },
  ];
  put('body', 'vest', { k: 'cloth', rings: vest, ramp: SCARLET, look: { folds: [0], lift: 0.04 } });
  for (let i = 0; i < 5; i++) {
    const k = i / 4;
    const r0 = k < 0.5 ? vest[1] : vest[2];
    const r1 = k < 0.5 ? vest[2] : vest[3];
    const kk = k < 0.5 ? k * 2 : k * 2 - 1;
    const c = lerp3(r0.c, r1.c, kk);
    const u = lerp3(r0.u, r1.u, kk);
    put('body', 'button', { k: 'ball', c: add(c, mul(norm(u), len(u) + 0.3)), ax: sphere(0.62), skin: GILT });
  }
  // --- THE COAT'S BODY: fitted, open down the front (the waistcoat seen between its fronts), braided in gilt along them ---
  const coat: Ring[] = [
    { c: add(waistC, mul(s.hips[2], -1.2)), u: mul(be[0], B.waistDeep + 2.2), v: mul(be[1], B.waistHalf + 2.0) },
    { c: lerp3(waistC, s.ribs, 0.5), u: mul(be[0], B.waistDeep + 2.2), v: mul(be[1], B.waistHalf + 2.4) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 2.3), v: mul(cl, B.ribHalf + 2.8) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, B.ribDeep + 1.6), v: mul(cl, B.shoulderHalf + 1.8) },
    { c: add(s.neck, mul(cu, 0.6)), u: mul(cf, 3.8), v: mul(cl, 5.2) },
  ];
  put('body', 'coat', { k: 'cloth', rings: coat, ramp: VELVET, look: { folds: [70, -70, 180], lift: 0.05, arc: [34, 326], lining: 0.2 } });
  for (const sg of [1, -1]) {
    const a = sg * 35 * D;
    const pts = coat.map((r) => add(r.c, add(mul(r.u, Math.cos(a)), mul(r.v, Math.sin(a)))));
    for (let i = 1; i < pts.length - 1; i++) put('body', 'braid', { k: 'thread', a: pts[i - 1], b: pts[i], c: GILT[3], lift: 0.7 });
  }
  // the standing collar: black velvet faced with scarlet, round the back and sides of his neck
  {
    const nk = add(s.neck, mul(cu, 0.5));
    const collar: Ring[] = [
      { c: nk, u: mul(cf, 3.6), v: mul(cl, 4.6) },
      { c: add(nk, add(mul(cu, 4.2), mul(cf, -0.8))), u: mul(cf, 4.2), v: mul(cl, 5.0) },
    ];
    put('collar', 'collar', { k: 'cloth', rings: collar, ramp: VELVET, look: { arc: [62, 298], lining: 0.0, lift: 0.1 } });
  }
  // the lace jabot at his throat, falling over the waistcoat's top
  {
    const at = add(add(lerp3(s.ribs, s.neck, 0.86), mul(cf, B.ribDeep * 0.75 + 0.6)), mul(cu, 0.6));
    const sway = Math.sin(t * 2.1) * 0.35 + lag[0] * 0.1;
    put('jabot', 'jabot', { k: 'ball', c: add(at, mul(cu, -2.2)), ax: [mul(cf, 1.3), mul(cl, 2.3), mul(cu, 3.1)], skin: (u, tone) => (Math.abs(u[1]) > 0.75 && u[2] < -0.3 ? null : LACE[Math.min(4, tone + ((Math.round(u[2] * 6) & 1) ? 0 : 1))]) });
    put('jabot', 'jabot', { k: 'ball', c: add(at, add(mul(cu, -5.0), mul(cf, 0.6 + sway * 0.2))), ax: [mul(cf, 1.0), mul(cl, 1.7), mul(cu, 1.8)], skin: LACE });
  }

  // --- THE ARMS: velvet sleeves, deep turned-back scarlet cuffs edged in gilt, pale grey kid gloves ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    const [r0, r1, r2] = B.armR;
    put(`arm${side}`, `arm${side}`, { k: 'ball', c: add(sh, mul(cu, 0.6)), ax: sphere(r0 * 1.5), skin: VELVET, far: true });
    put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.32, rb: r1 * 1.15, ramp: VELVET, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.14), skin: VELVET, far: true });
    const cuffAt = lerp3(el, hand, 0.55);
    put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: cuffAt, ra: r1 * 1.08, rb: r1 * 1.0, ramp: VELVET, far: true });
    // the cuff: deep, flared back toward the elbow, scarlet with a gilt edge
    const wrist = add(hand, mul(fore, -1.3));
    put(`fore${side}`, `cuff${side}`, { k: 'rod', a: add(cuffAt, mul(fore, -0.4)), b: lerp3(cuffAt, wrist, 0.7), ra: r1 * 1.5, rb: r1 * 1.25, ramp: SCARLET, far: true });
    put(`fore${side}`, `cuff${side}`, { k: 'band', ring: { c: add(cuffAt, mul(fore, -0.2)), u: mul(norm(cross(fore, [0, 0, 1]), cf), r1 * 1.55), v: mul(norm(cross(fore, norm(cross(fore, [0, 0, 1]), cf)), cu), r1 * 1.55) }, ramp: GILT, rows: 1 });
    put(`fore${side}`, `fore${side}`, { k: 'rod', a: lerp3(cuffAt, wrist, 0.6), b: wrist, ra: r2 * 1.15, rb: r2 * 1.05, ramp: GLOVE, far: true });
    // the gloved hand: long-fingered; the right closed on the grip, the left open, its fingers spread as a dancer's
    const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
    const e2 = norm(cross(fore, e1), [0, 1, 0]);
    put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.5)), ax: [mul(fore, 1.7), mul(e2, 1.35), mul(e1, 0.8)], skin: GLOVE, far: true });
    const grip = side === 'R' ? 1 : 0.15;
    for (let i = 0; i < 4; i++) {
      const spread = (i - 1.5) * (side === 'L' ? 0.5 : 0.3);
      const base = add(hand, add(mul(fore, 1.4), mul(e2, spread * 0.8)));
      const mid = add(base, add(mul(fore, 1.6 * (1 - 0.45 * grip)), add(mul(e1, -0.5 - 0.6 * grip), mul(e2, spread * 0.6))));
      const tip = add(mid, add(mul(fore, 1.3 * (1 - 0.8 * grip)), mul(e1, -0.6 - 0.6 * grip)));
      put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.44, rb: 0.38, ramp: GLOVE, far: true });
      put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.38, rb: 0.28, ramp: GLOVE, far: true });
    }
  }

  // --- HIS HEAD: a snug coif of black velvet; his face THE MASK; under it, fog ---
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr = B.headR;
  const unmasked = say.unmasked?.(m) ?? false;
  const crack = clamp01(say.crack?.(m) ?? 0);
  const fogFace: Skin = (u, tone) => {
    // (where the mask was: the Hush's grey fog, pale, swirling, nothing behind it)
    const sw = Math.sin(u[1] * 9 + u[2] * 7 + t * 5) + Math.sin(u[2] * 11 - t * 4);
    return FOG_PALE[Math.max(1, Math.min(4, tone + (sw > 0.6 ? 1 : sw < -0.8 ? -1 : 0)))];
  };
  const coifSkin: Skin = (u, tone) => {
    if (u[0] > 0.18 && Math.abs(u[1]) < 0.82 && u[2] < 0.72 && u[2] > -0.9) return unmasked ? fogFace(u, tone, 0, 0) : VELVET[Math.max(0, tone - 1)];
    return VELVET[tone];
  };
  // (dying, once the mask is off, his head goes to fog: the coif sinks and shrinks into his collar, and is gone)
  const gone = clamp01(say.gone?.(m) ?? 0);
  const hk = 1 - gone;
  const hc = lerp3(add(s.head, mul(ff, -0.3)), add(s.neck, mul(cu, 2)), gone);
  if (gone < 0.97) {
    put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0] * 1.02 * hk), mul(fl, hr[1] * 1.06 * hk), mul(fu, hr[2] * 1.02 * hk)], skin: coifSkin });
    // (the coif comes down behind his neck into his collar)
    put('head', 'head', { k: 'rod', a: add(hc, add(mul(ff, -hr[0] * 0.4 * hk), mul(fu, -hr[2] * 0.2 * hk))), b: add(s.neck, add(mul(cf, -1.4), mul(cu, 1.5))), ra: hr[1] * 0.78 * hk + 0.3, rb: 3.4 * (0.4 + 0.6 * hk), ramp: VELVET });
  }
  // (the mask is drawn on his face as long as he lives; dying, it is drawn there always, and the painter of a death lets its
  // halves fall from where they are as they go: art/new_mobs3.ts `fallApart`)
  if (!unmasked || m.dying) {
    const mk = maskFrame(st, s, ff, fl, fu);
    if (crack < 0.01) {
      put('mask', 'maskA', { k: 'ball', c: mk.c, ax: mk.ax, skin: maskSkin('A', 0) });
      put('mask', 'maskB', { k: 'ball', c: mk.c, ax: mk.ax, skin: maskSkin('B', 0) });
    } else {
      // (cracked: the two halves drawn apart a hair along the crack, fog seeping between them)
      const gap = mul(norm(add(mul(fl, 0.8), mul(fu, -0.62)), fl), 1.0 * crack * crack);
      put('mask', 'maskA', { k: 'ball', c: add(mk.c, gap), ax: mk.ax, skin: maskSkin('A', crack) });
      put('mask', 'maskB', { k: 'ball', c: sub(mk.c, gap), ax: mk.ax, skin: maskSkin('B', crack) });
    }
    // the dull pink of the Hush through its eye holes (going out as he dies)
    if (!unmasked) for (const e of maskEyes(mk.c, mk.ax)) put('mask', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#2a1e24', facing: norm(mk.ax[0]) });
  }
  // THE BONNET: soft black velvet, tilted over his right brow; a gilt band; a long scarlet plume curling back off it
  {
    const crown = add(hc, add(mul(fu, hr[2] * 0.78), add(mul(ff, -0.4), mul(fl, -0.5))));
    const tilt = norm(add(fu, add(mul(fl, -0.22), mul(ff, -0.1))));
    const fw = norm(sub(ff, mul(tilt, dot(ff, tilt))), ff);
    const lw = cross(tilt, fw);
    const brim: Ring = { c: crown, u: mul(fw, hr[0] * 1.32), v: mul(lw, hr[1] * 1.45) };
    const puff: Ring = { c: add(crown, mul(tilt, 1.8)), u: mul(fw, hr[0] * 1.42), v: mul(lw, hr[1] * 1.5) };
    const topR: Ring = { c: add(crown, mul(tilt, 3.0)), u: mul(fw, hr[0] * 0.9), v: mul(lw, hr[1] * 0.95) };
    put('bonnet', 'bonnet', { k: 'cloth', rings: [brim, puff, topR], ramp: VELVET, look: { lift: 0.5, folds: [40, -40, 120, -120] } });
    put('bonnet', 'bonnet', { k: 'band', ring: { c: add(crown, mul(tilt, 0.5)), u: mul(fw, hr[0] * 1.36), v: mul(lw, hr[1] * 1.48) }, ramp: GILT, rows: 1 });
    // the plume: from a gilt clasp at its left, curling up and back over the crown and down behind, its fronds stirring after him
    const clasp = add(crown, add(mul(lw, hr[1] * 1.3), add(mul(tilt, 1.2), mul(fw, 0.6))));
    put('bonnet', 'bonnet', { k: 'ball', c: clasp, ax: sphere(0.95), skin: GILT });
    const plume: V3[] = [clasp];
    for (let i = 1; i <= 9; i++) {
      const k = i / 9;
      const sway = Math.sin(t * 2.4 + k * 3) * 0.9 * k;
      const back = add(mul(fw, -13 * k), add(mul(tilt, 5 * Math.sin(Math.PI * Math.min(1, k * 1.4)) - 9 * k * k), mul(lw, 1.6 * k + sway)));
      plume.push(add(clasp, add(back, mul(lag, 1.4 * k * k))));
    }
    for (let i = 1; i < plume.length; i++) {
      const k = i / plume.length;
      put('bonnet', 'plume', { k: 'rod', a: plume[i - 1], b: plume[i], ra: 1.5 * (1 - 0.55 * k) + 0.3, rb: 1.5 * (1 - 0.55 * (k + 0.1)) + 0.25, ramp: SCARLET });
      // (its fronds: little tongues off it, either side)
      if (i % 2 === 0) for (const sg of [1, -1]) put('bonnet', 'plume', { k: 'rod', a: plume[i], b: add(plume[i], add(mul(lw, sg * 1.6), [0, 0, -1.4 * (1 - k)])), ra: 0.7, rb: 0.3, ramp: SCARLET });
    }
  }

  // --- THE RAPIER ---
  if (say.armed?.(m) ?? true) rapier(put, s);

  // --- THE MASKS FANNED IN HIS LEFT HAND (Masks, before he flings them) ---
  const fan = say.fan?.(m) ?? null;
  if (fan && fan.n > 0) {
    // (a fan of them, as a hand of cards, spread up and out over his fingers; each a little gilt mask, the same smile, facing out)
    const hand = s.handL;
    const fore = norm(sub(s.handL, s.elbowL), [0, 0, -1]);
    const side3 = norm(cross(fore, [0, 0, 1]), cl);
    const out3 = norm(cross(side3, [0, 0, 1]), cf);
    for (let i = 0; i < fan.n; i++) {
      const a = ((i - (fan.n - 1) / 2) * 26 * fan.open) * D;
      const dir = norm(add(mul([0, 0, 1], Math.cos(a)), mul(side3, Math.sin(a))));
      const c = add(hand, add(mul(dir, 5.4), mul(fore, 1.2)));
      const across = norm(cross(dir, out3), side3);
      put('fan', `fanMask${i}`, { k: 'ball', c, ax: [mul(out3, 1.6), mul(across, 3.3), mul(dir, 4.2)], skin: maskSkin(null, 0) });
    }
  }
  // THE SMEAR of a lightning strike: its after-images, pale, the oldest thinned to every other point
  const sm = say.smear?.(m);
  if (sm) {
    sm.forEach((line, j) => {
      const k = j / Math.max(1, sm.length - 1);
      for (let i = 1; i < line.length; i++) {
        const [x0, y0] = st.at(line[i - 1]);
        const [x1, y1] = st.at(line[i]);
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
        for (let e = 0; e < n; e++) {
          if (k < 0.5 && (e + i) % 2) continue;
          put('smear', 'smear', { k: 'mote', p: lerp3(line[i - 1], line[i], e / n), c: k > 0.7 ? SMEAR[2] : k > 0.35 ? SMEAR[1] : SMEAR[0], size: k > 0.7 ? 2 : 1 });
        }
      }
    });
  }
  // the Hush curling out of his collar, a little, all the while he lives
  if (lit > 0.4 && empty < 0.01) collarFog(grains, s, t, 5, 3);
  grains.push(...(say.more?.(m) ?? []));
  void INK;
  return bits;
}
/** The smear's after-images: the oldest a dull violet-grey, the newest near white with the gilt in it. */
export const SMEAR = ['#7a7092', '#c8c0d4', '#f6eedc'];

/** HIM AS THE PAINTER TAKES HIM. */
export function princePainter(say: PrinceSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => princeBits(st, m, say), grains: (_st, m) => GRAINS.get(m) ?? [] };
}

/** A smiling gilt mask by itself (his Masks, flung; the masks his partners wear): its shell's skin, for art/prince_fx.ts. */
export function maskFace(): Carved {
  return maskSkin(null, 0);
}
