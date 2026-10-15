// FLOOR 8'S BOSS, THE CANTOR (THE CANTOR'S GORGE), ON THE HEROES' BONES. A MOCK-UP: NOT IN THE GAME. Nothing of
// the game imports this file; `CANTOR_ON` is off.
//
// The planning chat's, with his yes (12 Oct, 18:07, “All the main ones rock.  I like them all”): the cult's
// choirmaster, leading the chant down the supply road; everything he does echoes off the canyon walls a beat
// later. A staff strike (his basic attack); a shout whose shockwave comes back off the wall behind you, so you
// dodge twice; sound-copies of him that repeat his last move; rockfall shaken loose by his voice.
//
// HIS BRIEF, asked as his art rulebook's questions for a new character (14 Oct, by 22:40), his picks as he tapped
// them:
// - HOW BIG: “Tall and gaunt, menacing (Recommended)”, offered as: half again your height, robed, looming over you
//   like a preacher over his flock.
// - THE ONE THING TO KNOW HIM BY: “Bone pipes rising from his back (Recommended)”, offered as: a fan of bone organ
//   pipes grows from his shoulders; they blast pink when he shouts.
// - HOW HE MOVES: “Stately, then sudden (Recommended)”, offered as: slow and grand, conducting with sweeping arms;
//   then he lunges fast.
// - WHAT HE CARRIES: “A long staff topped with a bell (Recommended)”, offered as: he strikes with the staff, and the
//   bell rings with every blow.
// - HOW HE DIES: “His last note tears him apart (Recommended)”, offered as: he screams one last note; his pipes
//   crack, he shatters, and his echoes ring on and fade after him.
// - NEVER: “Not a wizard in a pointy hat (Recommended)”, offered as: magic is the mage's; he's a singer and a
//   preacher, not a spellcaster.
// - HIS SOUND: “A choir of voices, echoing (Recommended)”, offered as: his voice is many voices at once, and each
//   comes back off the walls.
//
// HIS LOOK, his yes (14 Oct, by 22:48: “Yes, animate him (Recommended)”): one of the cult's, its violet and its
// pink; bare-headed, a long, gaunt, hairless head, its eyes the cult's pink, its mouth a dark slot that burns when
// he sings; a mantle over his shoulders and a robe to the floor; the cult's pink stole; long bony hands, the left
// raised as if to lead a choir; the staff in his right hand planted beside him, a crook at its head and a bronze
// bell hung in it; nine pipes of bone rising from between his shoulder blades behind his head, the middle one
// tallest, their mouths glowing with his breath.
//
// HIS MOVES, the plan he said yes to (“Yes, build these (Recommended)”): “stately, then sudden”: slow and grand,
// then a snap of violence, and every blow comes back as an echo a beat later. His walk, a procession; his staff
// strike; his shout; his sound-copies; his rockfall; his flinch; his death, his last note tearing him apart. Every
// one through the whole boss review (tests/cantor_shape.ts) before he sees it.

import { INK, PINK, hash, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME, SOCKET } from './mkit';
import { TILE3, momentOf, paintBits, paintMob, paintViewOf, posedOfMob } from './new_mobs3';
import type { Bit, Mob, MobCanvas, MobMove, Moment, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView, Ring, Stage } from './skin';
import { rgba } from '../engine/px';
import type { Sprite } from '../engine/px';
import { add, buildOf, cross, dot, heading, len, lerp3, mul, norm, solve, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const CANTOR_ON = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const D = Math.PI / 180;
const Z: V3 = [0, 0, 1];
const smooth = (k: number): number => {
  const v = clamp01(k);
  return v * v * (3 - 2 * v);
};

// =============================================================================================
// HIS COLOURS (three tones a material, as the flock's: the ramps' ends doubled)

/** His robe: the cult's violet, a step deeper than the flock's (he is their master). */
const ROBE: Ramp = ['#170a2c', '#170a2c', '#36185a', '#5c3a88', '#5c3a88'];
/** His mantle over his shoulders, deeper again. */
const MANTLE: Ramp = ['#0f0620', '#0f0620', '#26123f', '#432866', '#432866'];
/** The cult's pink: his stole, his mantle's edge. */
const STOLE: Ramp = PINK;
/** His skin: pale, grey, bony (the flock's hands' colours). */
const SKIN: Ramp = ['#4a3a44', '#4a3a44', '#a48e8c', '#d4c2b6', '#d4c2b6'];
/** His pipes: old bone, yellowed. */
const PIPE: Ramp = ['#4e4438', '#4e4438', '#b0a28a', '#ded2b8', '#ded2b8'];
/** His staff: dark wood worn smooth. */
const STAFF: Ramp = ['#1c1410', '#1c1410', '#3c2c22', '#5e4634', '#5e4634'];
/** The bell: old bronze, dull. */
const BRONZE: Ramp = ['#3a2a1c', '#3a2a1c', '#7a5c34', '#ae8a52', '#ae8a52'];
/** The dark inside a pipe, a mouth, a bell. */
const HOLLOW = '#120a14';

/** HIS SOUND, seen (Animations 3: his own way of being wild is sound): the cult's pink, dim, full and bright. */
const SOUND = [FLAME[1], SOCKET, PINK[3]] as const;
/** The light his pipes draw in and blast out: the cult's fire, pink burning to gold. */
const FIRE = [SOCKET, FLAME[3], FLAME[4]] as const;
/** The canyon's own sand and rock (floor 8's, src/art/canyon.ts), for what his blows kick off it. */
const SAND = ['#9c6c52', '#b88462', '#cc9a74', '#dcb08a'] as const;
const ROCK: Ramp = ['#4c3832', '#4c3832', '#8a5c48', '#b67c5e', '#b67c5e'];
const CHIPS = ['#82504a', '#a46c54', '#b67c5e', '#d49c78'] as const;
const CRACK = ['#2a2026', '#5c3e36'] as const;

// =============================================================================================
// HIS BODY, HIS REST

/** His body: half again the knight's height (58), gaunt: narrow in the chest and waist, long in the arm. */
export const CANTOR_BODY: Build = buildOf(86, 1.05, { shoulders: 0.9, chest: 0.82, depth: 0.82, waist: 0.72, hips: 0.88, arms: 1.12, trunk: 1.04, limbs: 0.74, legs: 1.0 });
const B = CANTOR_BODY;
/** His canvas: room for his pipes, his staff held high, and what his moves throw across the floor round him. */
export const CANTOR_CANVAS: MobCanvas = { w: 600, h: 660, ax: 300, ay: 470 };

/**
 * His rest: upright and a little back, his chin up, as a preacher stands over his flock; his left hand raised
 * before him, open, as if to lead the choir; his right hand gripping his staff, planted beside him.
 */
export const CANTOR_REST: Bones = {
  ...standing(B),
  pitch: -3, bend: -3, faceUp: 8, faceTurn: 0,
  lfx: 1.6, lfy: 4, lft: 12, rfx: -1.2, rfy: -4, rft: -12, lk: 6, rk: -6,
  lhIn: 0, lhx: 12, lhy: 3, lhz: -4, le: -34,
  rhIn: 0, rhx: 4, rhy: -9, rhz: -12, re: 40,
  wAz: 0, wEl: 90,
};
const R = CANTOR_REST;

// ---------------------------------------------------------------------------------------------
// Smooth curves for his moves (as the Carrion Queen's)

type Track = ReadonlyArray<readonly [number, number]>;
/**
 * A SMOOTH WAY THROUGH THESE (time, value) POINTS, easing to a stop at each turn and at its ends, never
 * overshooting (a monotone cubic); `period`, if given, the time it comes round in.
 */
function curve(pts: Track, period = 0): (t: number) => number {
  const n = pts.length;
  const P = (i: number): readonly [number, number] => {
    if (!period) return pts[Math.max(0, Math.min(n - 1, i))];
    const k = ((i % n) + n) % n;
    return [pts[k][0] + Math.floor(i / n) * period, pts[k][1]];
  };
  const slope = pts.map((_, i) => {
    if (!period && (i === 0 || i === n - 1)) return 0;
    const [x0, y0] = P(i - 1);
    const [x1, y1] = P(i);
    const [x2, y2] = P(i + 1);
    const d0 = (y1 - y0) / (x1 - x0);
    const d1 = (y2 - y1) / (x2 - x1);
    return d0 * d1 <= 0 ? 0 : (2 * d0 * d1) / (d0 + d1);
  });
  return (t: number): number => {
    let q = t;
    if (period) q = t - Math.floor((t - pts[0][0]) / period) * period;
    if (!period && q <= pts[0][0]) return pts[0][1];
    if (!period && q >= pts[n - 1][0]) return pts[n - 1][1];
    let i = n - 1;
    while (i > 0 && pts[i][0] > q) i--;
    const [x0, y0] = P(i);
    const [x1, y1] = P(i + 1);
    const h = x1 - x0;
    const s = (q - x0) / h;
    const m0 = slope[i] * h;
    const m1 = slope[(i + 1) % n] * h;
    const s2 = s * s;
    const s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * y0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * y1 + (s3 - s2) * m1;
  };
}
/** A move from smooth curves: a key at every frame (`fps`) for `long` seconds. */
function byCurves(long: number, fps: number, at: (t: number) => Partial<Bones>): Key3[] {
  const keys: Key3[] = [];
  const n = Math.round(long * fps);
  for (let i = 0; i <= n; i++) keys.push({ at: i / fps, ease: 'lin', pose: at(i / fps) });
  return keys;
}
/** Three curves at once, for a point. */
function curve3(pts: ReadonlyArray<readonly [number, V3]>): (t: number) => V3 {
  const c = [0, 1, 2].map((k) => curve(pts.map(([t, v]) => [t, v[k]] as const)));
  return (t) => [c[0](t), c[1](t), c[2](t)];
}
function hermite(a: number, b: number, ma: number, mb: number, u: number): number {
  const u2 = u * u;
  const u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * a + (u3 - 2 * u2 + u) * ma + (-2 * u3 + 3 * u2) * b + (u3 - u2) * mb;
}

// =============================================================================================
// HIS STAND

/** HIS STAND (3.2 s round): stately. He breathes deep and slow, his chest rising, his weight going over from foot to foot; his raised hand beats a slow time, sweeping; his head turns a little to look over his flock and back; his pipes' mouths glow and dim with his breath (`draw`). */
export const CANTOR_STAND_LONG = 3.2;
function standAt(t: number): Partial<Bones> {
  const a = (t / CANTOR_STAND_LONG) * Math.PI * 2;
  return {
    pz: R.pz + 0.7 * Math.sin(a),
    // (his weight going over from foot to foot, slowly, as he leans on his staff and off it)
    py: 1.6 * Math.sin(a + 0.3),
    roll: 1.4 * Math.sin(a + 0.3),
    bend: R.bend - 1.6 * Math.sin(a),
    faceUp: R.faceUp + 2.5 * Math.sin(a + 0.6),
    faceTurn: R.faceTurn + 9 * Math.sin(a + 1.2),
    // (his left hand beating a slow time: a sweep out and up, and back)
    lhx: R.lhx + 1.2 * Math.sin(a * 2),
    lhy: R.lhy + 2.6 * Math.sin(a),
    lhz: R.lhz + 2.2 * Math.sin(a * 2 + 0.8),
    draw: 0.5 + 0.5 * Math.sin(a - 0.4),
  };
}
function cantorStand(): Motion {
  const keys: Key3[] = [];
  const N = 32;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * CANTOR_STAND_LONG;
    keys.push({ at: t, ease: 'lin', pose: standAt(t) });
  }
  return { loop: 0, keys };
}

/** A pose whole: what it names, and the rest as his rest has it. */
const whole = (p: Partial<Bones>): Posed => ({ ...R, ...p }) as Posed;
/** His stand as every move begins and ends: its first moment. */
const P0 = standAt(0);
const S0 = solve(B, whole(P0));
/** HIS STAFF: how high he holds it standing (its foot on the floor, upright), and how long it is (to where its crook begins). */
const G0 = S0.handR[2];
export const STAFF_LONG = G0 + 30;
/** Where its foot stands as he stands. */
const FOOT0: V3 = [S0.handR[0], S0.handR[1], 0];
/** The values his stand begins with, as every move's curves begin and end with them. */
const at0 = (k: keyof Bones): number => (P0[k] as number | undefined) ?? (R[k] as number);

// =============================================================================================
// HIS STAFF IN HIS HANDS

/**
 * HIS STAFF: its foot, its head (where its crook begins), and the way it points: held in his right hand, along the
 * way the pose points what he holds. As he stands (`pt` 0), its foot is down on the floor under his hand; in his
 * moves `pt` says how far up it from its foot he holds it.
 */
export function staffOf(s: Skeleton, q?: Pick<Bones, 'pt'>): { foot: V3; head: V3; up: V3 } {
  const grip = s.handR;
  const up = norm(s.point, Z);
  const g = q && q.pt > 0 ? q.pt : Math.max(4, grip[2] / Math.max(0.2, up[2]));
  const foot = sub(grip, mul(up, g));
  return { foot, head: add(foot, mul(up, STAFF_LONG)), up };
}

/** A point off one of his shoulders, along his chest's own forward, left and up (as a hand measured from it is). */
function offShoulder(s: Skeleton, left: boolean, v: V3): V3 {
  const [cf, cl, cu] = s.chest;
  return add(left ? s.shoulderL : s.shoulderR, add(mul(cf, v[0]), add(mul(cl, v[1]), mul(cu, v[2]))));
}

/**
 * THE POSE WITH HIS STAFF WHERE IT IS SAID TO BE: his right hand at `H` on it, the staff along `U`, held `G` up
 * from its foot; his left hand `left` of the way (0 none, 1 all) from where the pose has it to the staff, `leftAt`
 * up it from its foot (below his right, if not said). Both hands are then said where they are on the floor's own
 * grid (`HandIn` 2), so that the staff is where it is said to be, whatever his body does.
 */
function holding(P: Partial<Bones>, H: V3, U0: V3, G: number, left = 0, leftAt?: number): Partial<Bones> {
  const U = norm(U0, Z);
  const pose: Partial<Bones> = { ...P, rhIn: 2, rhx: H[0], rhy: H[1], rhz: H[2], wAz: Math.atan2(U[1], U[0]) / D, wEl: Math.asin(Math.max(-1, Math.min(1, U[2]))) / D, pt: G };
  const s = solve(B, whole(pose));
  const foot = sub(H, mul(U, G));
  const want = add(foot, mul(U, leftAt ?? G - 10));
  const L = lerp3(s.handL, want, clamp01(left));
  return { ...pose, lhIn: 2, lhx: L[0], lhy: L[1], lhz: L[2] };
}
/** His staff planted, its foot at `F`, his right hand on it where his arm (along his chest) puts it. */
function planted(P: Partial<Bones>, hand: V3, F: V3 = FOOT0, left = 0, leftAt?: number): Partial<Bones> {
  const s = solve(B, whole(P));
  const H = offShoulder(s, false, hand);
  return holding(P, H, sub(H, F), len(sub(H, F)), left, leftAt);
}
/** His right hand where his arm puts it, the staff along `U`, held where he holds it standing (`G0`, or as said). */
function carried(P: Partial<Bones>, hand: V3, U: V3, G = G0, left = 0, leftAt?: number): Partial<Bones> {
  const s = solve(B, whole(P));
  return holding(P, offShoulder(s, false, hand), U, G, left, leftAt);
}
/** The hand's place off his right shoulder as his rest has it. */
const HAND0: V3 = [R.rhx, R.rhy, R.rhz];
/** His left hand's, as his stand begins. */
const LHAND0: V3 = [at0('lhx'), at0('lhy'), at0('lhz')];

// =============================================================================================
// HIS WALK: A PROCESSION

/** His pace, tiles a second, and his walk: a round of 24 frames at 16 a second (two strides; his staff planted once). */
export const CANTOR_PACE = 0.8;
export const CANTOR_WALK = { frames: 24, fps: 16, plant: 1.05, lift: 0.3 } as const;
const WALK_T = CANTOR_WALK.frames / CANTOR_WALK.fps;
/** How long each foot is down in a round (of 1.5 s), and how high it is lifted. */
const WALK_DOWN = 0.9;
/**
 * A FOOT OF HIS PROCESSION: down for `WALK_DOWN` round `mid`, carried back with the floor; lifted and swung through
 * the rest of the round, going on at the floor's pace as it leaves it and comes down. Its ankle forward of where
 * it stands, how high, its toes tipped.
 */
function walkFoot(t: number, mid: number, x0: number, v: number): [number, number, number] {
  const T = WALK_T;
  const half = WALK_DOWN / 2;
  const d = ((((t - mid) % T) + T * 1.5) % T) - T / 2;
  if (Math.abs(d) <= half) return [x0 - v * d, 0, 0];
  const sw = T - WALK_DOWN;
  const u = (d > half ? d - half : d + T - half) / sw;
  const x = hermite(x0 - v * half, x0 + v * half, -v * sw, -v * sw, u);
  const lift = Math.sin(Math.PI * u);
  return [x, 6 * Math.pow(lift, 0.7), 16 * lift * (1 - u) - 9 * lift * u];
}
/**
 * HIS WALK, A PROCESSION (one round, 1.5 s): slow, grand strides, his robe swaying; his left hand raised before
 * him, beating time with his steps; his head never bows. His staff is swung forward and planted ahead of him once a
 * round (`CANTOR_WALK.plant`), as his left foot comes down, and he walks on past it; as it is planted, the bell tolls
 * a ring of pink sound across the floor. Each foot, and the staff's foot, is carried back with the floor while down.
 */
function cantorWalk(): Motion {
  const v = CANTOR_PACE * TILE3;
  const T = WALK_T;
  const { plant } = CANTOR_WALK;
  const down = 0.75;
  // (its foot planted ahead of where it stands, so that it is under his hand, upright, as the round begins)
  const xp = FOOT0[0] + v * (WALK_T - plant);
  const staffFoot = (t: number): V3 => {
    const d = (((t - plant) % T) + T) % T;
    if (d <= down) return [xp - v * d, FOOT0[1], 0];
    const u = (d - down) / (T - down);
    return [hermite(xp - v * down, xp, -v * (T - down), -v * (T - down), u), FOOT0[1] - 3 * Math.sin(Math.PI * u), 14 * Math.sin(Math.PI * u)];
  };
  const keys = byCurves(T, CANTOR_WALK.fps, (t) => {
    const a = (t / T) * Math.PI * 2;
    const [lx, lz, lp] = walkFoot(t, 0, R.lfx, v);
    const [rx, rz, rp] = walkFoot(t, T / 2, R.rfx, v);
    const P: Partial<Bones> = {
      // (lowest as both feet are down, highest over each foot; his weight going over onto each in turn)
      pz: -1 + Math.cos(2 * a),
      py: 1.8 * Math.cos(a),
      roll: 2.6 * Math.cos(a),
      yaw: -5 * Math.sin(a),
      twist: 4 * Math.sin(a),
      pitch: R.pitch,
      bend: R.bend - 0.6 * Math.cos(2 * a),
      // (his head held high and level, looking over his flock as he goes)
      faceUp: R.faceUp + 1.5,
      faceTurn: 5 * Math.sin(a + 0.6),
      faceTilt: 1.5 * Math.cos(a),
      lfx: lx, lfz: lz, lfp: lp, rfx: rx, rfz: rz, rfp: rp,
      // (his left hand beating time: down a little on each step)
      lhx: R.lhx + 2 * Math.sin(a),
      lhy: R.lhy + 4 * Math.sin(a + 0.4),
      lhz: R.lhz + 3 * Math.cos(2 * a),
      draw: 0.55 + 0.35 * Math.sin(2 * a - 0.5),
    };
    const F = staffFoot(t);
    // his right hand goes with the staff: forward as he reaches to plant it, back as he walks past it
    const s = solve(B, whole(P));
    const H = offShoulder(s, false, [R.rhx + 0.55 * (F[0] - FOOT0[0]), R.rhy, R.rhz + 0.6 * F[2]]);
    return holding(P, H, sub(H, F), len(sub(H, F)));
  });
  return { keys, loop: 0 };
}

// =============================================================================================
// HIS STAFF STRIKE, HIS BASIC BLOW

/** HIS STAFF STRIKE: how long; when he holds it overhead (the warning); when he brings it down; when it lands (on a frame of thirty a second), held `freeze`; when its echo strikes the same spot, after the blow. */
export const CANTOR_STRIKE = { long: 2.2, warn: 0.45, swing: 0.85, hit: 1.0, freeze: 0.1, echo: 0.45, skid: 1.25 } as const;
/** Where the staff's head is as it lands, forward of where he stands, and how high (its bell on the rock). */
const STRIKE_TIP_Z = 11;
/** How the staff is swung down: slow to start, and fastest as it lands. */
const swingK = (t: number): number => Math.pow(clamp01((t - CANTOR_STRIKE.swing) / (CANTOR_STRIKE.hit - CANTOR_STRIKE.swing)), 2.2);
/**
 * HIS STAFF STRIKE: he takes up the staff in both hands, steps forward and heaves it overhead, the staff thrust up
 * through his hands until its bell is high over him, and holds it there, leaning back, trembling, the bell shaking
 * (THE WARNING, `warn` to `swing`); then he brings it down in one sudden, huge arc, his hips first, then his back,
 * then the staff, bending right over it (`hit`): the bell clangs on the rock (held a tenth: a heavy blow). It skids
 * on a little; he holds there, bent over it, while a ghostly pink echo of the blow strikes the same spot again
 * (`hit + echo`); then he heaves it up and plants it beside him again, and steps back.
 */
function cantorStrike(): Motion {
  const { long, warn, swing, hit, freeze, skid } = CANTOR_STRIKE;
  const c = (pts: Track): ((t: number) => number) => curve(pts);
  const H1 = hit + freeze;
  const pz = c([[0, 0], [0.12, -3], [warn, 4], [swing, 5], [hit, -9], [H1, -9], [skid, -9.5], [1.55, -8], [1.9, -1.5], [long, 0]]);
  const px = c([[0, 0], [0.12, 0], [warn, -3], [swing, -4], [hit, 7], [H1, 7], [skid, 8], [1.55, 7], [1.9, 1.5], [long, 0]]);
  const pitch = c([[0, 0], [0.12, 2], [warn, -2], [swing, -3], [0.93, 14], [hit, 20], [H1, 20], [skid, 21], [1.55, 18], [1.9, 3], [long, 0]]);
  const bend = c([[0, 0], [0.12, 2], [warn, -3], [swing, -4], [0.9, -2], [hit, 22], [H1, 22], [skid, 23], [1.55, 19], [1.9, 2], [long, 0]]);
  const faceUp = c([[0, 0], [warn, 12], [swing, 14], [hit, -2], [H1, -2], [skid, -2], [1.42, 10], [1.6, 6], [long, 0]]);
  const faceTurn = c([[0, 0], [warn, -at0('faceTurn')], [1.9, -at0('faceTurn')], [long, 0]]);
  const draw = c([[0, at0('draw')], [warn, 0.6], [swing, 0.75], [hit, 1], [H1, 1], [1.4, 0.6], [long, at0('draw')]]);
  // his left foot stepped forward as he heaves it up, and back when he has planted it again
  const lfx = c([[0, 0], [0.14, 0], [0.34, 12], [1.62, 12], [1.84, 0], [long, 0]]);
  const lfz = c([[0, 0], [0.14, 0], [0.24, 6], [0.34, 0], [1.62, 0], [1.73, 6], [1.84, 0], [long, 0]]);
  const lfp = c([[0, 0], [0.14, 0], [0.2, 10], [0.3, -6], [0.34, 0], [1.62, 0], [1.68, 10], [1.8, -6], [1.84, 0], [long, 0]]);
  // his right hand, off his shoulder: taking it up, overhead (the warning), down at the blow, pushing on as it skids, home
  const OVER: V3 = [10, 6, 30];
  const LOW: V3 = [22, 3, -4];
  const handUp = curve3([[0, HAND0], [0.12, [6, -8, -8]], [warn, OVER], [swing, [10, 6, 30.5]]]);
  const handOn = curve3([[H1, LOW], [skid, [27, 2, -6]], [1.5, [27, 2, -6]], [1.85, [12, -6, 4]], [long, HAND0]]);
  // the staff: its elevation (degrees from level, forward; over 90 it leans back past upright) and how far its head is beyond his hand
  const elUp = c([[0, 90], [0.12, 90], [warn, 97], [swing, 97]]);
  const reachUp = c([[0, 30], [0.12, 34], [0.4, 72], [swing, 72]]);
  const AZ = -4;
  // (held near its foot until it is upright again; then let slide down through his hand to the floor, planted)
  const reachOn = c([[H1, 76], [skid, 82], [1.5, 82], [1.82, 81], [long, 30]]);
  // his left hand on the staff, below his right, from as he takes it up to as he plants it again
  const leftOn = c([[0, 0], [0.06, 0], [0.25, 1], [1.55, 1], [1.85, 0], [long, 0]]);
  // (held overhead, the warning: his arms and the staff trembling)
  const shiver = (t: number): number => (t > warn + 0.04 && t < swing ? Math.sin((t - warn) * Math.PI * 2 * 9) * Math.sin(((t - warn - 0.04) / (swing - warn - 0.04)) * Math.PI) : 0);
  const body = (t: number): Partial<Bones> => ({
    px: px(t), pz: R.pz + pz(t) + 0.3 * shiver(t), pitch: R.pitch + pitch(t), bend: R.bend + bend(t),
    py: at0('py'), roll: at0('roll'),
    faceUp: at0('faceUp') + faceUp(t), faceTurn: at0('faceTurn') + faceTurn(t),
    lfx: R.lfx + lfx(t), lfz: lfz(t), lfp: lfp(t),
    lhx: LHAND0[0], lhy: LHAND0[1], lhz: LHAND0[2],
    draw: draw(t),
  });
  // where his hand and the staff's head are at the blow (its bell on the rock), worked out once
  const atHit = solve(B, whole(body(hit)));
  const Hhit = offShoulder(atHit, false, LOW);
  const elHit = Math.asin(Math.max(-1, Math.min(1, (STRIKE_TIP_Z - Hhit[2]) / 76))) / D;
  const staffAt = (t: number, s: Skeleton): { H: V3; U: V3; G: number } => {
    let H: V3;
    let el: number;
    let reach: number;
    if (t < swing) {
      H = offShoulder(s, false, handUp(t));
      el = elUp(t) + 0.5 * shiver(t);
      reach = reachUp(t);
    } else if (t < hit) {
      const k = swingK(t);
      H = offShoulder(s, false, lerp3([10, 6, 30.5], LOW, Math.pow(clamp01((t - swing) / (hit - swing)), 1.6)));
      el = 97 + (elHit - 97) * k;
      reach = 72 + 4 * k;
    } else if (t < H1) {
      H = Hhit;
      el = elHit;
      reach = 76;
    } else {
      H = offShoulder(s, false, handOn(t));
      reach = reachOn(t);
      // (skidding on, its head kept on the rock; then lifted, back up to upright)
      const onRock = Math.asin(Math.max(-1, Math.min(1, (STRIKE_TIP_Z - H[2]) / reach))) / D;
      el = onRock + (90 - onRock) * smooth((t - 1.5) / 0.38);
    }
    const U = heading(AZ, el);
    return { H, U, G: STAFF_LONG - reach };
  };
  const keys = byCurves(long, 30, (t) => {
    const P = body(t);
    const { H, U, G } = staffAt(t, solve(B, whole(P)));
    return holding(P, H, U, G, leftOn(t), Math.max(1.5, G - 9));
  });
  return { keys, hit };
}

// =============================================================================================
// HIS SHOUT

/** HIS SHOUT: how long; the warning (he rears back, his pipes drawing in light); when he lunges; when it blasts (the blow); when the shockwave comes back off the far wall; how far it rolls out (the figure's lengths). */
export const CANTOR_SHOUT = { long: 2.2, warn: 0.6, lunge: 0.86, hit: 1.0, back: 1.45, out: 0.5, reach: 175 } as const;
/**
 * HIS SHOUT: he rears back and swells, his arms spread wide, his head back, his mouth shut, while his pipes draw in
 * light, the cult's fire streaming into their mouths (THE WARNING, held trembling); then he lunges, a stride forward,
 * his arms flung back, his jaw dropping wide, and all nine pipes blast pink (`hit`): a shockwave rolls out across
 * the floor at you, and a beat later (`back`) it comes back from behind you, off the far wall. His staff stays
 * planted beside him, braced.
 */
function cantorShout(): Motion {
  const { long, warn, lunge, hit } = CANTOR_SHOUT;
  const c = (pts: Track): ((t: number) => number) => curve(pts);
  const pz = c([[0, 0], [warn, 4.5], [lunge, 5], [hit, -3], [1.3, -4], [1.7, -1], [long, 0]]);
  const px = c([[0, 0], [warn, -7], [lunge, -7.5], [hit, 8], [1.3, 13], [1.7, 4], [long, 0]]);
  const pitch = c([[0, 0], [warn, -5], [lunge, -5.5], [0.93, 6], [hit, 12], [1.3, 18], [1.7, 4], [long, 0]]);
  const bend = c([[0, 0], [warn, -7], [lunge, -7.5], [0.92, -2], [hit, 14], [1.3, 20], [1.7, 4], [long, 0]]);
  const faceUp = c([[0, 0], [warn, 16], [lunge, 18], [hit, -6], [1.3, -10], [1.7, -2], [long, 0]]);
  const faceTurn = c([[0, 0], [0.3, -at0('faceTurn')], [1.8, -at0('faceTurn')], [long, 0]]);
  const draw = c([[0, at0('draw')], [0.15, 0.5], [warn, 0.85], [lunge, 0.95], [hit, 1], [1.35, 1], [1.6, 0.5], [long, at0('draw')]]);
  // his left foot a stride forward as he lunges, and back
  const lfx = c([[0, 0], [lunge, 0], [hit, 14], [1.6, 14], [1.85, 0], [long, 0]]);
  const lfz = c([[0, 0], [lunge, 0], [0.93, 7], [hit, 0], [1.6, 0], [1.72, 6], [1.85, 0], [long, 0]]);
  const lfp = c([[0, 0], [lunge, 0], [0.9, 8], [0.97, -5], [hit, 0], [1.6, 0], [1.66, 8], [1.8, -5], [1.85, 0], [long, 0]]);
  // his arms spread wide as he swells; flung back as he shouts
  const lh = curve3([[0, LHAND0], [warn, [2, 24, 10]], [lunge, [2, 25, 11]], [hit, [-8, 20, -12]], [1.3, [-10, 19, -14]], [1.75, [8, 6, 0]], [long, LHAND0]]);
  const rh = curve3([[0, HAND0], [warn, [0, -15, -6]], [lunge, [0, -15.5, -5.5]], [hit, [4, -13, -14]], [1.3, [6, -12, -15]], [1.75, [4, -10, -12]], [long, HAND0]]);
  const shiver = (t: number): number => (t > warn + 0.04 && t < lunge ? Math.sin((t - warn) * Math.PI * 2 * 9) * Math.sin(((t - warn - 0.04) / (lunge - warn - 0.04)) * Math.PI) : 0);
  const keys = byCurves(long, 30, (t) => {
    const l = lh(t);
    const P: Partial<Bones> = {
      px: px(t), pz: R.pz + pz(t) + 0.3 * shiver(t), pitch: R.pitch + pitch(t), bend: R.bend + bend(t),
      py: at0('py'), roll: at0('roll'),
      faceUp: at0('faceUp') + faceUp(t) + 0.8 * shiver(t), faceTurn: at0('faceTurn') + faceTurn(t),
      lfx: R.lfx + lfx(t), lfz: lfz(t), lfp: lfp(t),
      lhx: l[0], lhy: l[1], lhz: l[2] + 0.4 * shiver(t),
      draw: draw(t),
    };
    return planted(P, rh(t));
  });
  return { keys, hit };
}

// =============================================================================================
// HIS SOUND-COPIES

/** HIS SOUND-COPIES: how long; his staff raised overhead (from `raise`); when the bell rings; when each copy tears away from him, how far behind him in time it moves (a beat each), and how far to his side it goes. */
export const CANTOR_COPIES = { long: 2.2, raise: 0.45, rings: [0.55, 0.78, 1.0], tear: [0.62, 0.86], delay: [0.18, 0.36], reach: 46 } as const;
/**
 * HIS SOUND-COPIES: he spreads his arms wide and raises the staff high over his head in his one hand, and rings the
 * bell, shaking it three times (`rings`); two see-through pink copies of him tear away from him, the first to his
 * left, the second to his right (`tear`), each a beat behind the last in all it does; he lowers the staff and plants
 * it, and the copies, a beat after him each, do the same.
 */
function cantorCopies(): Motion {
  const { long, raise } = CANTOR_COPIES;
  const c = (pts: Track): ((t: number) => number) => curve(pts);
  const pz = c([[0, 0], [raise, 2], [1.2, 2.4], [1.6, 1], [long, 0]]);
  const pitch = c([[0, 0], [raise, -2], [1.2, -3], [1.6, -1], [long, 0]]);
  const bend = c([[0, 0], [raise, -3], [1.2, -4], [1.6, -1], [long, 0]]);
  const faceUp = c([[0, 0], [raise, 24], [1.2, 26], [1.6, 4], [long, 0]]);
  const faceTurn = c([[0, 0], [raise, -at0('faceTurn')], [1.7, -at0('faceTurn')], [long, 0]]);
  const draw = c([[0, at0('draw')], [raise, 0.6], [0.55, 1], [1.2, 0.9], [1.6, 0.4], [long, at0('draw')]]);
  const lh = curve3([[0, LHAND0], [raise, [2, 30, 6]], [1.25, [2, 31, 7]], [1.85, [10, 6, -2]], [long, LHAND0]]);
  const rh = curve3([[0, HAND0], [0.2, [6, -7, 4]], [raise, [8, -3, 30]], [1.2, [8, -3, 31]], [1.6, [7, -7, 4]], [long, HAND0]]);
  // (the staff upright in his hand, leaning a little out to his right as he holds it up)
  const lean = c([[0, 90], [raise, 84], [1.2, 84], [1.7, 90], [long, 90]]);
  // ringing: the staff shaken, three times
  const shake = (t: number): number => (t > raise && t < 1.2 ? Math.sin((t - raise) * Math.PI * 2 * 4.4) * Math.sin(((t - raise) / (1.2 - raise)) * Math.PI) : 0);
  const keys = byCurves(long, 30, (t) => {
    const l = lh(t);
    const r = rh(t);
    const P: Partial<Bones> = {
      pz: R.pz + pz(t), pitch: R.pitch + pitch(t), bend: R.bend + bend(t), py: at0('py'), roll: at0('roll'),
      faceUp: at0('faceUp') + faceUp(t), faceTurn: at0('faceTurn') + faceTurn(t),
      lhx: l[0], lhy: l[1], lhz: l[2],
      draw: draw(t),
    };
    return carried(P, [r[0], r[1] + 1.3 * shake(t), r[2]], heading(-90, lean(t)));
  });
  return { keys };
}

// =============================================================================================
// HIS ROCKFALL

/** HIS ROCKFALL: how long; when the staff comes down (planted); when he sings up at the rim, and stops; when each rock comes down and where (forward, to his left, of where he stands); how long one falls; when the dust begins to pour. */
export const CANTOR_ROCKFALL = {
  long: 2.6, plant: 0.4, sing: 0.75, hush: 1.9, fall: 0.5, pour: 0.8,
  rocks: [{ at: 1.3, x: 70, y: 40, r: 12 }, { at: 1.42, x: -40, y: -78, r: 10 }, { at: 1.54, x: 104, y: -46, r: 13 }, { at: 1.66, x: -66, y: 66, r: 11 }, { at: 1.78, x: 36, y: 96, r: 9 }, { at: 1.9, x: 20, y: -104, r: 12 }],
} as const;
/**
 * HIS ROCKFALL: he lifts the staff and drives it down, planted (`plant`), the bell tolling; throws his head back,
 * his chest up and his left hand raised high, and sings straight up at the canyon's rim, his mouth wide and burning,
 * his pipes blasting pink skyward (`sing` to `hush`); dust pours down from above and rocks come down round him, each
 * smashing on the floor. Then he lowers his head.
 */
function cantorRockfall(): Motion {
  const { long, plant, sing, hush } = CANTOR_ROCKFALL;
  const c = (pts: Track): ((t: number) => number) => curve(pts);
  const pz = c([[0, 0], [0.22, 1], [plant, -1.5], [sing, 2], [hush, 2.5], [2.25, 0.5], [long, 0]]);
  const pitch = c([[0, 0], [0.22, -2], [plant, 3], [sing, -6], [hush, -7], [2.25, -2], [long, 0]]);
  const bend = c([[0, 0], [0.22, -2], [plant, 4], [sing, -8], [hush, -9], [2.25, -2], [long, 0]]);
  const faceUp = c([[0, 0], [plant, -2], [sing, 56], [hush, 58], [2.25, 8], [long, 0]]);
  const faceTurn = c([[0, 0], [plant, -at0('faceTurn')], [2.3, -at0('faceTurn')], [long, 0]]);
  const draw = c([[0, at0('draw')], [plant, 0.6], [sing, 1], [hush, 1], [2.25, 0.5], [long, at0('draw')]]);
  const lh = curve3([[0, LHAND0], [plant, [8, 8, 8]], [sing, [6, 10, 30]], [hush, [6, 11, 31]], [2.35, [11, 4, 0]], [long, LHAND0]]);
  // the staff: lifted (its foot off the floor) and driven down; then planted, his hand along his chest
  const lift = c([[0, 0], [0.1, 0], [0.24, 10], [plant, 0], [long, 0]]);
  const rh = curve3([[plant, HAND0], [sing, [6, -12, -10]], [hush, [6, -12.5, -10]], [2.3, [4, -9.5, -11.5]], [long, HAND0]]);
  const shiver = (t: number): number => (t > sing && t < hush ? Math.sin((t - sing) * Math.PI * 2 * 7) * Math.sin(((t - sing) / (hush - sing)) * Math.PI) : 0);
  const keys = byCurves(long, 30, (t) => {
    const l = lh(t);
    const P: Partial<Bones> = {
      pz: R.pz + pz(t) + 0.25 * shiver(t), pitch: R.pitch + pitch(t), bend: R.bend + bend(t), py: at0('py'), roll: at0('roll'),
      faceUp: at0('faceUp') + faceUp(t), faceTurn: at0('faceTurn') + faceTurn(t) + 1.2 * shiver(t),
      lhx: l[0], lhy: l[1], lhz: l[2],
      draw: draw(t),
    };
    if (t <= plant) {
      const F: V3 = [FOOT0[0], FOOT0[1], lift(t)];
      return holding(P, add(F, [0, 0, G0]), Z, G0);
    }
    // (from the floor's own place to where his arm along his chest puts it, as he leans back)
    const s = solve(B, whole(P));
    const k = smooth((t - plant) / 0.3);
    const H = lerp3(add(FOOT0, [0, 0, G0]), offShoulder(s, false, rh(t)), k);
    return holding(P, H, sub(H, FOOT0), len(sub(H, FOOT0)));
  });
  return { keys };
}

// =============================================================================================
// STRUCK

export const CANTOR_REEL_LONG = 0.7;
/** STRUCK: his head snaps back and his pipes clatter, spitting a burst of pink; he staggers half a step back, then straightens slowly to glare. His staff stays planted. */
function cantorReel(): Motion {
  const L = CANTOR_REEL_LONG;
  const c = (pts: Track): ((t: number) => number) => curve(pts);
  const pitch = c([[0, 0], [0.07, -12], [0.25, -7], [0.45, -2], [L, 0]]);
  const bend = c([[0, 0], [0.07, -14], [0.3, -6], [L, 0]]);
  const faceUp = c([[0, 0], [0.07, 30], [0.25, 14], [0.5, 3], [L, 0]]);
  const faceTurn = c([[0, 0], [0.07, 14], [0.3, -10], [0.55, -9], [L, 0]]);
  const px = c([[0, 0], [0.07, -4], [0.3, -6], [0.5, -2], [L, 0]]);
  const pz = c([[0, 0], [0.07, 1.5], [0.3, -1.5], [0.5, -0.5], [L, 0]]);
  // (his right foot stepped back, and forward again as he straightens)
  const rfx = c([[0, 0], [0.05, 0], [0.2, -9], [0.36, -9], [0.56, 0], [L, 0]]);
  const rfz = c([[0, 0], [0.05, 0], [0.12, 5], [0.2, 0], [0.36, 0], [0.46, 4], [0.56, 0], [L, 0]]);
  const lh = curve3([[0, LHAND0], [0.07, [4, 12, 10]], [0.35, [8, 7, 2]], [L, LHAND0]]);
  const rh = curve3([[0, HAND0], [0.07, [2, -12, -8]], [0.35, [3, -10, -11]], [L, HAND0]]);
  const draw = c([[0, at0('draw')], [0.04, 1], [0.3, 0.55], [L, at0('draw')]]);
  const keys = byCurves(L, 30, (t) => {
    const l = lh(t);
    const P: Partial<Bones> = {
      px: px(t), pz: R.pz + pz(t), pitch: R.pitch + pitch(t), bend: R.bend + bend(t), py: at0('py'), roll: at0('roll'),
      faceUp: at0('faceUp') + faceUp(t), faceTurn: at0('faceTurn') + faceTurn(t),
      rfx: R.rfx + rfx(t), rfz: rfz(t),
      lhx: l[0], lhy: l[1], lhz: l[2],
      draw: draw(t),
    };
    return planted(P, rh(t));
  });
  return { keys };
}

// =============================================================================================
// HIS DEATH, HIS PICK: HIS LAST NOTE TEARS HIM APART

/** The order his pipes burst in: from the outside in, the middle one last. */
const PIPE_ORDER = [0, 8, 1, 7, 2, 6, 3, 5, 4];
/** HIS DEATH: how long; his scream; each pipe's bursting (by pipe, left to right as he faces); when pink light splits through him; when he shatters; when his staff is down; his echoes ringing on. */
export const CANTOR_DIE = {
  long: 2.6, scream: 0.22, split: 0.95, shatter: 1.35, down: 1.85,
  burst: PIPE_ORDER.map((_, i) => 0.36 + 0.085 * PIPE_ORDER.indexOf(i)),
  echoes: [1.35, 1.65, 1.95, 2.2],
} as const;
/**
 * HIS DEATH, HIS PICK (“His last note tears him apart (Recommended)”): struck, he throws his head back, his arms
 * flung wide, and screams one last note (to `scream`), trembling, his mouth and his pipes blazing; his pipes crack
 * and burst one after another in shards of bone (`burst`); pink light splits through him (`split`); he shatters
 * (`shatter`), his robe collapsing empty to the floor and his staff toppling with a last clang of its bell, while his
 * echoes ring on and fade (`echoes`). (His bones keep his scream once he is gone: nothing of them is painted then.)
 */
function cantorDie(): Motion {
  const { long, scream, shatter } = CANTOR_DIE;
  const c = (pts: Track): ((t: number) => number) => curve(pts);
  const pitch = c([[0, 0], [scream, -7], [shatter, -9], [long, -9]]);
  const bend = c([[0, 0], [scream, -8], [shatter, -10], [long, -10]]);
  const faceUp = c([[0, 0], [0.2, 50], [shatter, 56], [long, 56]]);
  const faceTurn = c([[0, 0], [scream, -at0('faceTurn')], [long, -at0('faceTurn')]]);
  const pz = c([[0, 0], [scream, 3], [shatter, 4], [long, 4]]);
  const px = c([[0, 0], [scream, -3], [shatter, -4], [long, -4]]);
  const lh = curve3([[0, LHAND0], [scream, [0, 26, 14]], [shatter, [0, 27, 16]], [long, [0, 27, 16]]]);
  const rh = curve3([[0, HAND0], [scream, [5, -16, -4]], [shatter, [5, -16.5, -3]], [long, [5, -16.5, -3]]]);
  const shake = (t: number): number => (t > scream && t < shatter ? Math.sin((t - scream) * Math.PI * 2 * 8) * clamp01((t - scream) / 0.4) * clamp01((shatter - t) / 0.08) : 0);
  const keys = byCurves(long, 30, (t) => {
    const l = lh(t);
    const P: Partial<Bones> = {
      px: px(t), pz: R.pz + pz(t) + 0.3 * shake(t), pitch: R.pitch + pitch(t), bend: R.bend + bend(t), py: at0('py'), roll: at0('roll'),
      faceUp: at0('faceUp') + faceUp(t), faceTurn: at0('faceTurn') + faceTurn(t) + 1.2 * shake(t),
      lhx: l[0], lhy: l[1], lhz: l[2],
      draw: t < 0.1 ? at0('draw') + (1 - at0('draw')) * (t / 0.1) : 1,
    };
    return planted(P, rh(t));
  });
  return { keys };
}

// =============================================================================================
// HOW THE BELL SWINGS, AND HOW HIS MOUTH AND PIPES GO, MOVE BY MOVE

const NAME_STAND = 'The Cantor stands over his flock';
const NAME_WALK = 'The Cantor walks in procession';
const NAME_STRIKE = 'The Cantor strikes with his staff';
const NAME_SHOUT = 'The Cantor shouts';
const NAME_COPIES = 'The Cantor rings out his sound-copies';
const NAME_ROCKFALL = 'The Cantor sings down the rockfall';
const NAME_REEL = 'The Cantor is struck';
const NAME_DIE = 'The Cantor\'s last note tears him apart';

/** Seconds since `t0`, round a loop of `period` (for what goes on round the walk's join). */
const since = (t: number, t0: number, period: number): number => ((((t - t0) % period) + period) % period);
/** A ring of a struck bell: swinging hard at first, dying away. */
const ringOut = (tau: number, k: number): number => (tau < 0 ? 0 : k * Math.exp(-tau * 4.5) * Math.sin(tau * 26));

/** THE BELL IN ITS CROOK: how far it swings (out from the staff, as a fraction of a right angle), and how far it is flung out along the staff (0 hanging, 1 flung right out). */
function bellOf(move: string | undefined, t: number, ph: number): { swing: number; fling: number } {
  const idle = Math.sin(ph * 2) * 0.12;
  if (move === NAME_WALK) return { swing: 0.18 * Math.sin(ph * Math.PI * 4) + ringOut(since(t, CANTOR_WALK.plant, WALK_T), 0.55), fling: 0 };
  if (move === NAME_STRIKE) {
    const S = CANTOR_STRIKE;
    const held = t > S.warn && t < S.swing ? 0.35 * Math.sin(t * 52) : 0;
    const fling = t < S.swing ? 0 : t < S.hit + 0.15 ? smooth((t - S.swing) / 0.08) : 1 - smooth((t - S.hit - 0.15) / 0.5);
    return { swing: held + ringOut(t - S.hit, 0.5) + ringOut(t - S.hit - S.echo, 0.35), fling };
  }
  if (move === NAME_COPIES) {
    const C = CANTOR_COPIES;
    return { swing: t > C.raise && t < 1.3 ? 0.85 * Math.sin((t - C.raise) * Math.PI * 2 * 4.4) * Math.sin(((t - C.raise) / (1.3 - C.raise)) * Math.PI) : idle, fling: 0 };
  }
  if (move === NAME_ROCKFALL) return { swing: idle + ringOut(t - CANTOR_ROCKFALL.plant, 0.5), fling: 0 };
  if (move === NAME_REEL) return { swing: ringOut(t, 0.45), fling: 0 };
  if (move === NAME_SHOUT) return { swing: idle + ringOut(t - CANTOR_SHOUT.hit, 0.3), fling: 0 };
  if (move === NAME_DIE) return { swing: t < CANTOR_DIE.shatter ? 0.3 * Math.sin(t * 40) : ringOut(t - CANTOR_DIE.down, 0.4), fling: 0 };
  return { swing: idle, fling: 0 };
}

/** HOW WIDE HIS JAW IS DROPPED (0 shut, 1 wide), move by move: his shout, his song, his scream. */
function jawOf(move: string | undefined, t: number): number {
  const up = (a: number, b: number): number => smooth((t - a) / (b - a));
  if (move === NAME_SHOUT) return up(CANTOR_SHOUT.lunge, CANTOR_SHOUT.hit) * (1 - up(1.35, 1.65));
  if (move === NAME_ROCKFALL) return up(CANTOR_ROCKFALL.plant, CANTOR_ROCKFALL.sing) * (1 - up(CANTOR_ROCKFALL.hush, 2.2));
  if (move === NAME_COPIES) return 0.5 * up(CANTOR_COPIES.raise, 0.55) * (1 - up(1.2, 1.5));
  if (move === NAME_STRIKE) return 0.7 * up(CANTOR_STRIKE.swing, CANTOR_STRIKE.hit) * (1 - up(1.25, 1.6));
  if (move === NAME_REEL) return 0.6 * up(0, 0.05) * (1 - up(0.1, 0.4));
  if (move === NAME_DIE) return up(0, 0.12);
  return 0;
}

/** How hard his pipes clatter (struck), 0 to 1. */
const clatterOf = (move: string | undefined, t: number): number => (move === NAME_REEL ? Math.exp(-t * 7) * clamp01(t / 0.02 + 0.5) : 0);

// =============================================================================================
// HIM AS SOLIDS

/** Where his pipes rise from: between his shoulder blades, and the way his back looks. */
function pipeRoot(s: Skeleton): { at: V3; back: V3; up: V3; left: V3 } {
  const [cf, cl, cu] = s.chest;
  return { at: add(add(s.ribs, mul(cf, -(B.ribDeep + 0.6))), mul(cu, B.chest * 0.42)), back: mul(cf, -1), up: cu, left: cl };
}

/** HIS PIPES: nine of bone side by side behind his head, the middle tallest; `clatter` (0 to 1) shakes them about in their roots, at the moment `t`. Their feet and tops. */
export function pipesOf(s: Skeleton, clatter = 0, t = 0): { foot: V3; top: V3; r: number }[] {
  const { at, back, up, left } = pipeRoot(s);
  const out: { foot: V3; top: V3; r: number }[] = [];
  for (let i = -4; i <= 4; i++) {
    const k = Math.abs(i);
    const foot = add(add(at, mul(left, i * 3.4)), mul(back, 0.9 + k * 0.2));
    const jl = clatter * 0.22 * Math.sin(t * 61 + i * 2.3);
    const jb = clatter * 0.16 * Math.cos(t * 47 + i * 1.7);
    const dir = norm(add(add(mul(up, 1), mul(left, i * 0.05 + jl)), mul(back, 0.14 + jb)));
    const long = 50 - k * 5.5;
    out.push({ foot, top: add(foot, mul(dir, long)), r: 1.45 });
  }
  return out;
}

/** HIS ROBE, as rings from his neck to its hem (the hem over his feet, left behind a little as he goes). */
function robeOf(s: Skeleton, m: Moment): { rings: Ring[]; hemC: V3 } {
  const [cf, cl, cu] = s.chest;
  const ph = m.wind * Math.PI * 2;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const lag = mul(m.come, -1.2);
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const be = s.belly;
  const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
  const footMid = lerp3(lerp3(s.heelL, s.toeL, 0.5), lerp3(s.heelR, s.toeR, 0.5), 0.5);
  const spanF = Math.abs(dot(sub(s.ankleL, s.ankleR), f));
  const spanL = Math.abs(dot(sub(s.ankleL, s.ankleR), l));
  const hemC: V3 = [footMid[0] + lag[0], footMid[1] + lag[1], 1.4];
  const hemDeep = Math.max(B.pelvisDeep + 6, spanF / 2 + 5);
  const hemWide = Math.max(B.pelvisHalf + 8, spanL / 2 + 6);
  const hemPts: V3[] = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const rear = Math.max(0, -Math.cos(a));
    const p = add(hemC, add(mul(f, Math.cos(a) * hemDeep), mul(l, Math.sin(a) * hemWide)));
    hemPts.push(add(p, add([0, 0, Math.sin(ph * 2 + a * 3) * 0.35 + rear * 0.3], mul(lag, rear * 0.5))));
  }
  const rings: Ring[] = [
    { c: add(s.neck, mul(cu, 0.6)), u: mul(cf, 3.6), v: mul(cl, 4.2) },
    { c: lerp3(s.ribs, s.neck, 0.65), u: mul(cf, B.ribDeep + 2.0), v: mul(cl, B.shoulderHalf + 0.6) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 1.6), v: mul(cl, B.ribHalf + 1.6) },
    { c: waistC, u: mul(be[0], B.waistDeep + 1.4), v: mul(be[1], B.waistHalf + 1.4) },
    { c: [s.pelvis[0], s.pelvis[1], s.pelvis[2] - 1.2], u: mul(f, B.pelvisDeep + 2.4), v: mul(l, B.pelvisHalf + 2.6) },
    { c: [kneeMid[0] * 0.6 + hemC[0] * 0.4, kneeMid[1] * 0.6 + hemC[1] * 0.4, kneeMid[2]], u: mul(f, (B.pelvisDeep + 2.4 + hemDeep) / 2), v: mul(l, (B.pelvisHalf + 2.6 + hemWide) / 2) },
    { c: hemC, u: mul(f, hemDeep), v: mul(l, hemWide), pts: hemPts },
  ];
  return { rings, hemC };
}

/**
 * CLOTH COLLAPSING EMPTY (his death): each ring brought down onto a low heap where his hem was, `k` of the way (0 as
 * it hung on him, 1 lying), spreading a little as it falls and slumping forward; the higher, the further it falls.
 */
function slumped(rings: Ring[], hemC: V3, k: number, top: number, spread: number): Ring[] {
  const n = rings.length;
  return rings.map((r, i) => {
    const up = (n - 1 - i) / Math.max(1, n - 1);
    const lie: V3 = [hemC[0] + 3 * up, hemC[1], 1.6 + top * up];
    const c = lerp3(r.c, [lerp3(r.c, lie, 1)[0], lie[1] * 0.5 + r.c[1] * 0.5, lie[2]], k);
    const w = 1 + spread * up * k;
    const pts = r.pts?.map((p) => add(c, mul(sub(p, r.c), w)));
    return { c, u: mul(r.u, w), v: mul(r.v, w), pts: pts ? pts.map((p) => [p[0], p[1], Math.max(0.8, p[2])] as V3) : undefined };
  });
}

/** THE STAFF, ITS CROOK AND ITS BELL, from its foot along `up` (its crook hooked over to the side away from `cl`); the bell swinging `swing`, flung out along it `fling`. Painted as `part`, a solid of the figure (or of a copy). */
function staffBits(put: Put, foot: V3, up: V3, cl: V3, swing: number, fling: number, part = 'staff'): void {
  const head = add(foot, mul(up, STAFF_LONG));
  put(part, 'staff', { k: 'rod', a: foot, b: head, ra: 0.95, rb: 0.8, ramp: STAFF, far: true });
  const side = norm(sub(cl, mul(up, dot(cl, up))), [0, 1, 0]);
  const out = mul(side, -1);
  const hook = [head, add(add(head, mul(up, 2.6)), mul(out, 1.6)), add(add(head, mul(up, 3.0)), mul(out, 4.4)), add(add(head, mul(up, 1.4)), mul(out, 6.6)), add(add(head, mul(up, -1.0)), mul(out, 7.0))];
  for (let i = 1; i < hook.length; i++) put(part, 'crook', { k: 'rod', a: hook[i - 1], b: hook[i], ra: 0.8, rb: 0.72, ramp: STAFF, far: true });
  // the bell: hanging from the hook's end, swinging; flung out along the staff as it is swung
  const hang = add(hook[hook.length - 1], [0, 0, -1.2]);
  const hangDown = norm(add(mul(Z, -1), mul(out, swing)), [0, 0, -1]);
  const down = norm(lerp3(hangDown, up, fling), [0, 0, -1]);
  const bellH = 6.4;
  // (never into the rock: lifted clear of it)
  let lowest = Infinity;
  for (let k = 0; k <= 8; k++) lowest = Math.min(lowest, hang[2] + down[2] * (k / 8) * bellH - bellH * 0.6);
  const lift: V3 = [0, 0, Math.max(0, 1 - lowest)];
  const e1 = norm(cross(down, [1, 0, 0]), [0, 1, 0]);
  const e2 = norm(cross(down, e1));
  for (let k = 0; k <= 8; k++) {
    const t = k / 8;
    const c = add(add(hang, mul(down, t * bellH)), lift);
    const r = bellH * (0.3 + 0.12 * t + 0.3 * Math.pow(t, 4));
    put(part, 'bell', { k: 'ball', c, ax: [mul(e1, r), mul(e2, r), mul(down, 0.9)], skin: k === 8 ? () => HOLLOW : BRONZE });
  }
}
/** Where the bell's mouth is (for what rings out of it). */
function bellMouth(foot: V3, up: V3, cl: V3, swing: number, fling: number): V3 {
  const head = add(foot, mul(up, STAFF_LONG));
  const side = norm(sub(cl, mul(up, dot(cl, up))), [0, 1, 0]);
  const hang = add(add(add(head, mul(up, -1.0)), mul(side, -7.0)), [0, 0, -1.2]);
  const down = norm(lerp3(norm(add(mul(Z, -1), mul(side, -swing)), [0, 0, -1]), up, fling), [0, 0, -1]);
  const p = add(hang, mul(down, 6.4));
  return [p[0], p[1], Math.max(1, p[2])];
}

/** What is left of him at a moment of his death: 0 whole; after he shatters, how far his robe has collapsed (0 to 1). */
function goneOf(m: Moment): { dying: boolean; t: number; shattered: boolean; slump: number } {
  const dying = m.move === NAME_DIE;
  const t = m.t;
  const shattered = dying && t >= CANTOR_DIE.shatter;
  const u = clamp01((t - CANTOR_DIE.shatter) / 0.42);
  const slump = shattered ? Math.min(1, u * u) - (u >= 1 ? 0.05 * Math.sin(Math.PI * clamp01((t - CANTOR_DIE.shatter - 0.42) / 0.14)) : 0) : 0;
  return { dying, t, shattered, slump };
}

/** HIM AS SOLIDS: his feet, robe, stole, mantle, sleeves, arms and hands, staff and bell, pipes and head. */
function bodyBits(m: Moment, copy = false): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part: copy ? `c_${part}` : part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const sing = lit * clamp01(q.draw);
  const ph = m.wind * Math.PI * 2;
  const gone = goneOf(m);
  const { rings: robe0, hemC } = robeOf(s, m);
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const lag = mul(m.come, -1.2);

  // --- his feet, bare and bony, under the hem ---
  if (!gone.shattered) {
    for (const side of ['L', 'R'] as const) {
      const heel = side === 'L' ? s.heelL : s.heelR;
      const toe = side === 'L' ? s.toeL : s.toeR;
      put(`foot${side}`, `foot${side}`, { k: 'rod', a: add(heel, [0, 0, 1.1]), b: add(toe, [0, 0, 0.7]), ra: 1.3, rb: 0.8, ramp: SKIN, far: true });
    }
  }

  // --- HIS ROBE to the floor (collapsing empty as he dies) ---
  const robe = gone.shattered ? slumped(robe0, hemC, gone.slump, 9, 0.6) : robe0;
  put('robe', 'robe', { k: 'cloth', rings: robe, ramp: ROBE, look: { folds: [20, -20, 60, -60, 110, -110, 160, -160], lift: 0.06, hem: STOLE } });

  // --- THE CULT'S PINK STOLE: over his neck and down his front to his shins ---
  const waistC = robe0[3].c;
  const be = s.belly;
  const kneeMid = lerp3(s.kneeL, s.kneeR, 0.5);
  const down = (p: V3, up: number): V3 => (gone.shattered ? lerp3(p, [hemC[0] + 4 * up + (p[0] - hemC[0]) * 0.3, p[1] * 0.6 + hemC[1] * 0.4, 1.4 + 10 * up], gone.slump) : p);
  for (const sd of [1, -1]) {
    const top = down(add(add(s.neck, mul(cl, sd * 2.4)), mul(cf, 2.0)), 1);
    const chest = down(add(add(s.ribs, mul(cl, sd * 2.0)), mul(cf, B.ribDeep + 1.9)), 0.8);
    const belly = down(add(add(waistC, mul(be[1], sd * 1.9)), mul(be[0], B.waistDeep + 1.6)), 0.55);
    const end = down(add(add(lerp3(kneeMid, hemC, 0.55), mul(l, sd * 2.2)), add(mul(f, B.pelvisDeep + 3.6), mul(lag, 0.7))), 0.1);
    put('stole', 'stole', { k: 'rod', a: top, b: chest, ra: 1.0, rb: 1.05, ramp: STOLE });
    put('stole', 'stole', { k: 'rod', a: chest, b: belly, ra: 1.05, rb: 1.1, ramp: STOLE });
    put('stole', 'stole', { k: 'rod', a: belly, b: end, ra: 1.1, rb: 1.2, ramp: STOLE });
  }

  // --- HIS MANTLE: a short cape over his shoulders to his elbows, its edge the cult's pink ---
  const mantle0: Ring[] = [
    { c: add(s.neck, mul(cu, 1.4)), u: mul(cf, 3.8), v: mul(cl, 4.4) },
    { c: add(lerp3(s.ribs, s.neck, 0.8), mul(cu, 0.6)), u: mul(cf, B.ribDeep + 3.0), v: mul(cl, B.shoulderHalf + 2.4) },
    { c: add(s.ribs, mul(cu, 0.4)), u: mul(cf, B.ribDeep + 4.2), v: mul(cl, B.shoulderHalf + 4.4) },
  ];
  const mantle = gone.shattered ? mantle0.map((r, i) => {
    const c = lerp3(r.c, [hemC[0] + 2, hemC[1], 10.5 - i * 1.6], gone.slump);
    return { c, u: mul(r.u, 1 + 0.3 * gone.slump), v: mul(r.v, 1 + 0.25 * gone.slump) };
  }) : mantle0;
  put('mantle', 'mantle', { k: 'cloth', rings: mantle, ramp: MANTLE, look: { folds: [35, -35, 90, -90], lift: 0.08, ragged: true, hem: STOLE } });

  // --- HIS SLEEVES, wide; his long bony forearms and hands out of them ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    if (gone.shattered) {
      // (empty, fallen onto the heap)
      const sd = side === 'L' ? 1 : -1;
      const a = lerp3(sh, [hemC[0] + 1, hemC[1] + sd * 6, 8], gone.slump);
      const b = lerp3(el, [hemC[0] + 6, hemC[1] + sd * 16, 2.6], gone.slump);
      put(`sleeve${side}`, `sleeve${side}`, { k: 'rod', a, b, ra: 2.4, rb: 2.8 - 0.8 * gone.slump, ramp: ROBE, far: true });
      continue;
    }
    const fore = norm(sub(hand, el), [0, 0, -1]);
    put(`sleeve${side}`, `sleeve${side}`, { k: 'rod', a: sh, b: el, ra: 2.4, rb: 2.8, ramp: ROBE, far: true });
    const e1 = norm(sub([0, 0, 1], mul(fore, dot([0, 0, 1], fore))), cu);
    const e2 = norm(cross(fore, e1));
    const mouth = add(el, mul(fore, 3.6));
    const wide = 3.4;
    const mouthPts: V3[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const under = Math.max(0, -Math.cos(a));
      mouthPts.push(add(add(mouth, add(mul(e1, Math.cos(a) * wide), mul(e2, Math.sin(a) * wide))), add([0, 0, -under * 2.6], mul(lag, under * 0.4))));
    }
    put(`sleeve${side}`, `sleeve${side}`, { k: 'cloth', rings: [{ c: el, u: mul(e1, 2.7), v: mul(e2, 2.7) }, { c: mouth, u: mul(e1, wide), v: mul(e2, wide), pts: mouthPts }], ramp: ROBE, look: { folds: [90, -90], lift: 0.1, hem: STOLE } });
    const wrist = add(hand, mul(fore, -1.0));
    put(`arm${side}`, `arm${side}`, { k: 'rod', a: add(mouth, mul(fore, -0.8)), b: wrist, ra: 0.9, rb: 0.7, ramp: SKIN, far: true });
    put(`hand${side}`, `hand${side}`, { k: 'ball', c: hand, ax: [mul(fore, 1.4), mul(e1, 1.1), mul(e2, 0.7)], skin: SKIN, far: true });
    // (the raised left hand's long fingers, spread; closed round the staff when it holds it)
    if (side === 'L' && q.lhIn !== 2) {
      for (let k = -2; k <= 2; k++) {
        const dirF = norm(add(add(fore, mul(e2, k * 0.32)), mul(e1, 0.35)));
        put('handL', 'handL', { k: 'rod', a: add(hand, mul(fore, 0.9)), b: add(hand, mul(dirF, 4.2 - Math.abs(k) * 0.5)), ra: 0.42, rb: 0.3, ramp: SKIN, far: true });
      }
    } else if (side === 'L') {
      const { foot, up } = staffOf(s, q);
      const rel = sub(hand, foot);
      const onStaff = len(sub(rel, mul(up, dot(rel, up)))) < 2.5;
      if (!onStaff) {
        for (let k = -2; k <= 2; k++) {
          const dirF = norm(add(add(fore, mul(e2, k * 0.32)), mul(e1, 0.35)));
          put('handL', 'handL', { k: 'rod', a: add(hand, mul(fore, 0.9)), b: add(hand, mul(dirF, 4.2 - Math.abs(k) * 0.5)), ra: 0.42, rb: 0.3, ramp: SKIN, far: true });
        }
      }
    }
  }

  // --- HIS STAFF, the crook at its head and the bell hung in it (toppling to the floor when he is gone) ---
  const bell = bellOf(m.move, m.t, ph);
  const st0 = staffOf(s, q);
  let staffUp = st0.up;
  if (gone.shattered) {
    // (it falls over away to his right, about its foot, and lies there)
    const lie = norm([0.35, -1, 0.04]);
    const u = clamp01((gone.t - CANTOR_DIE.shatter) / (CANTOR_DIE.down - CANTOR_DIE.shatter));
    const k = u * u - (gone.t > CANTOR_DIE.down ? 0.04 * Math.sin(Math.PI * clamp01((gone.t - CANTOR_DIE.down) / 0.12)) : 0);
    staffUp = norm(lerp3(st0.up, lie, k), lie);
  }
  staffBits(put, st0.foot, staffUp, cl, bell.swing, bell.fling);

  // --- HIS PIPES, rising from between his shoulder blades in a fan behind his head; their mouths glowing with his breath ---
  const pipes = pipesOf(s, clatterOf(m.move, m.t), m.t);
  const root0 = pipeRoot(s);
  pipes.forEach(({ foot: pf, top, r }, i) => {
    if (gone.dying && gone.t >= CANTOR_DIE.burst[i]) return;
    // (blazing before it bursts)
    const blaze = gone.dying ? clamp01(1 - (CANTOR_DIE.burst[i] - gone.t) / 0.12) : 0;
    const ramp = blaze > 0.5 ? (['#c0206a', '#c0206a', '#ff4f8a', '#ffb070', '#ffb070'] as Ramp) : PIPE;
    put('pipes', `pipe${i}`, { k: 'rod', a: lerp3(pf, top, 0.16), b: top, ra: r, rb: r, ramp, far: true });
    put('pipes', `pipe${i}`, { k: 'rod', a: pf, b: lerp3(pf, top, 0.16), ra: r * 0.55, rb: r, ramp, far: true });
    const dir = norm(sub(top, pf));
    const slot = add(lerp3(pf, top, 0.24), mul(root0.back, r * 0.95));
    put('pipes', `slot${i}`, { k: 'dot', p: slot, c: sing > 0.4 ? FLAME[2] : HOLLOW, facing: root0.back, c2: sing > 0.4 ? FLAME[1] : HOLLOW });
    const e1 = norm(cross(dir, [1, 0, 0]), [0, 1, 0]);
    const e2 = norm(cross(dir, e1));
    put('pipes', `lip${i}`, { k: 'rod', a: add(top, mul(dir, -1.2)), b: add(top, mul(dir, -0.3)), ra: r * 1.2, rb: r * 1.2, ramp, far: true });
    put('pipes', `mouth${i}`, { k: 'ball', c: add(top, mul(dir, 0.5)), ax: [mul(e1, r * 1.0), mul(e2, r * 1.0), mul(dir, 0.15)], skin: () => (sing > 0.55 ? FLAME[2] : sing > 0.2 ? FLAME[1] : HOLLOW) });
    if (!copy && sing > 0.15) put('glow', 'glow', { k: 'glow', p: add(top, mul(dir, 2)), c: FLAME[2], r: 6 + 6 * sing + 10 * blaze, a: 0.22 + 0.28 * sing });
  });
  if (gone.shattered) return bits;
  const root = pipeRoot(s);
  put('pipes', 'root', { k: 'ball', c: add(root.at, mul(root.back, 0.4)), ax: [mul(root.left, 9.4), mul(root.back, 2.8), mul(root.up, 3.4)], skin: PIPE });

  // --- HIS HEAD: long, gaunt, hairless; his eyes the cult's pink; his mouth a dark slot that burns when he sings, his jaw dropping wide when he shouts ---
  const [ff, fl, fu] = s.face;
  const hr = B.headR;
  const hc = add(s.head, mul(fu, 0.6));
  const jaw = m.jaw ?? 0;
  const headSkin = (u: V3, tone: number): string => {
    if (u[0] > 0.5 && Math.abs(Math.abs(u[1]) - 0.42) < 0.24 && u[2] > -0.12 && u[2] < 0.26) return SKIN[0];
    if (u[0] > 0.55 && Math.abs(u[1]) > 0.5 && u[2] < -0.2) return SKIN[Math.min(tone, 2)];
    return SKIN[tone];
  };
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0] * 0.92), mul(fl, hr[1] * 0.88), mul(fu, hr[2] * 1.12)], skin: headSkin });
  put('head', 'brow', { k: 'rod', a: add(add(add(hc, mul(ff, hr[0] * 0.7)), mul(fu, hr[2] * 0.3)), mul(fl, hr[1] * 0.55)), b: add(add(add(hc, mul(ff, hr[0] * 0.7)), mul(fu, hr[2] * 0.3)), mul(fl, -hr[1] * 0.55)), ra: 0.7, rb: 0.7, ramp: SKIN });
  put('head', 'nose', { k: 'rod', a: add(add(hc, mul(ff, hr[0] * 0.82)), mul(fu, hr[2] * 0.12)), b: add(add(hc, mul(ff, hr[0] * 1.2)), mul(fu, -hr[2] * 0.32)), ra: 0.65, rb: 0.45, ramp: SKIN });
  // his long jaw, dropping as he shouts and sings
  const jawC = add(add(hc, mul(ff, hr[0] * (0.38 + 0.08 * jaw))), mul(fu, -hr[2] * (0.72 + 0.42 * jaw)));
  put('head', 'jaw', { k: 'ball', c: jawC, ax: [mul(ff, hr[0] * 0.6), mul(fl, hr[1] * 0.62), mul(fu, hr[2] * 0.5)], skin: SKIN });
  put('neck', 'neck', { k: 'rod', a: s.neck, b: add(hc, mul(fu, -hr[2] * 0.6)), ra: 1.5, rb: 1.3, ramp: SKIN, far: true });
  for (const sd of [1, -1]) {
    const e = add(add(add(hc, mul(ff, hr[0] * 0.92 * 0.93)), mul(fl, sd * hr[1] * 0.88 * 0.4)), mul(fu, hr[2] * 1.12 * 0.06));
    put('head', `eye${sd}`, { k: 'dot', p: e, c: lit > 0.3 ? SOCKET : INK, facing: ff, c2: lit > 0.3 ? FLAME[1] : INK });
    if (!copy && lit > 0.3) put('glow', 'glow', { k: 'glow', p: e, c: SOCKET, r: 4, a: 0.35 * lit });
  }
  // his mouth: a dark slot, burning as he sings; wide open, a hole of fire, as he shouts
  if (jaw > 0.2) {
    const mc = add(add(hc, mul(ff, hr[0] * 0.86)), mul(fu, -hr[2] * (0.5 + 0.22 * jaw)));
    put('head', 'mouth', { k: 'ball', c: mc, ax: [mul(ff, hr[0] * 0.24), mul(fl, hr[1] * 0.36), mul(fu, hr[2] * 0.28 * jaw)], skin: () => (sing > 0.6 ? FLAME[3] : sing > 0.25 ? FLAME[2] : HOLLOW) });
  } else {
    const mouthP = add(add(jawC, mul(ff, hr[0] * 0.62)), mul(fu, -hr[2] * 0.06));
    put('head', 'mouth', { k: 'dot', p: mouthP, c: sing > 0.6 ? FLAME[3] : sing > 0.25 ? FLAME[1] : HOLLOW, facing: ff, c2: HOLLOW });
  }
  return bits;
}

// =============================================================================================
// WHAT HIS MOVES THROW OFF (Animations 3: his own way of being wild is sound, the cult's pink rings and blasts, and
// the canyon's dust and rock; Animations 8: effects are pixel art, each a mote of whole pixels)

/** A mark on the floor: over him where it is nearer the eye than his feet, under him where it is further (whole game pixels). */
function floorDot(st: Stage, ref: V3, p: V3, c: string, size: number): void {
  const layer = st.near(p) > st.near(ref) ? st.over : st.under;
  const [x, y] = st.at(p);
  const xi = 2 * Math.round((x - size / 2) / 2);
  const yi = 2 * Math.round((y - size / 2) / 2);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) layer.set(xi + dx, yi + dy, c);
}

/**
 * A RING OF HIS PINK SOUND rolling out across the floor from `c`: wider and thinner as it goes; `tau` seconds after
 * it began, gone after `life`; `k` how strong (an echo is weaker); `arc`, if given, only that much of it either side
 * of the way `toward` (a shockwave sent out at you). With a light or two of the cult's fire on it.
 */
function soundRing(st: Stage, put: Put, ref: V3, c: V3, tau: number, life: number, r0: number, reach: number, seed: number, k = 1, arc?: { toward: number; half: number; rows: number }, shrink = false): void {
  const u = tau / life;
  if (u < 0 || u >= 1) return;
  const go = 1 - (1 - u) * (1 - u);
  const r = shrink ? reach + r0 - reach * go : r0 + reach * go;
  const n = Math.min(220, Math.ceil((Math.PI * 2 * r) / 4.5));
  const rows = arc?.rows ?? 1;
  for (let row = 0; row < rows; row++) {
    const rr = r - row * 4;
    if (rr < 2) continue;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      if (arc) {
        const d = Math.abs(((a - arc.toward + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
        if (d > arc.half) continue;
      }
      if (hash(i, 5 + row, seed) < u * 0.8 + (1 - k) * 0.55) continue;
      const p: V3 = [c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr, 0];
      const h = hash(i, 6, seed);
      floorDot(st, ref, p, row > 1 ? SOUND[0] : row > 0 ? SOUND[1] : h < 0.25 ? SOUND[2] : SOUND[1], (u < 0.35 || (arc && u < 0.7)) && row === 0 ? 4 : 2);
      // (a wave rolling over the floor lifts the sand on its front)
      if (arc && row === 0 && h < 0.18) put('dust', 'dust', { k: 'mote', p: [p[0], p[1], 3 + 10 * hash(i, 8, seed) * (1 - u)], c: SAND[(i % 3) + 1], size: 2 });
    }
  }
  if (k > 0.5) for (let j = 0; j < 4; j++) {
    const a = (j / 4) * Math.PI * 2 + seed;
    if (arc && Math.abs(((a - arc.toward + Math.PI * 3) % (Math.PI * 2)) - Math.PI) > arc.half) continue;
    put('glow', 'glow', { k: 'glow', p: [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, 2], c: FLAME[2], r: 14, a: 0.25 * (1 - u) * k });
  }
}

/** RINGS OF SOUND IN THE AIR round a point (a bell rung, a pipe blasting): circles on the picture, growing and thinning, `tau` after they began. */
function airRing(st: Stage, p: V3, tau: number, life: number, r0: number, reach: number, seed: number, k = 1): void {
  const u = tau / life;
  if (u < 0 || u >= 1) return;
  const [cx, cy] = st.at(p);
  const r = r0 + reach * (1 - (1 - u) * (1 - u));
  const n = Math.min(120, Math.ceil((Math.PI * 2 * r) / 5));
  for (let i = 0; i < n; i++) {
    if (hash(i, 3, seed) < u * 0.75 + (1 - k) * 0.5) continue;
    const a = (i / n) * Math.PI * 2;
    const x = 2 * Math.round((cx + Math.cos(a) * r - 1) / 2);
    const y = 2 * Math.round((cy + Math.sin(a) * r * 0.9 - 1) / 2);
    const c = hash(i, 4, seed) < 0.3 ? SOUND[2] : SOUND[1];
    for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) st.over.set(x + dx, y + dy, c);
  }
}

/** DUST KICKED UP OFF THE CANYON'S SAND: a ring of it from `c`, thrown out to `reach` and rising, thinning as it settles. */
function dustOf(put: Put, c: V3, tau: number, life: number, n: number, reach: number, seed: number, rise = 26): void {
  const k = tau / life;
  if (k < 0 || k >= 1) return;
  const go = 1 - (1 - k) * (1 - k);
  for (let i = 0; i < n; i++) {
    if (hash(i, 7, seed) < k * 0.95) continue;
    const a = (i / n) * Math.PI * 2 + (hash(i, 1, seed) - 0.5) * 0.5;
    const r = reach * go * (0.4 + 0.6 * hash(i, 2, seed));
    const z = c[2] + 3 + rise * go * hash(i, 3, seed) * (1 - 0.6 * k);
    put('dust', 'dust', { k: 'mote', p: [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, z], c: SAND[(i % 3) + (hash(i, 5, seed) < 0.3 ? 1 : 0)], size: hash(i, 4, seed) < 0.35 ? 4 : 2 });
  }
}

/** CHIPS OF THE CANYON'S RED ROCK flung up from `c`, falling, lying where they land until `life` is out. */
function chipsOf(put: Put, c: V3, tau: number, life: number, n: number, seed: number, speed: number, up: number): void {
  if (tau < 0 || tau >= life) return;
  for (let i = 0; i < n; i++) {
    const a = hash(i, 1, seed) * Math.PI * 2;
    const v = speed * (0.5 + hash(i, 2, seed));
    const sh = Math.min(tau, 0.4);
    const z = Math.max(1.5, c[2] + up * (0.6 + 0.8 * hash(i, 3, seed)) * tau - 420 * tau * tau);
    put('chips', 'chips', { k: 'mote', p: [c[0] + Math.cos(a) * v * sh, c[1] + Math.sin(a) * v * sh, z], c: CHIPS[i % 4], size: i % 4 === 0 ? 4 : 2 });
  }
}

/** THE ROCK CRACKED where the bell came down: crooked cracks out from `c`, grown in a few frames, thinning away as `fade` goes to 1. */
function cracksOf(st: Stage, ref: V3, c: V3, tau: number, seed: number, fade: number): void {
  if (tau < 0) return;
  const grown = clamp01(tau / 0.08);
  for (let j = 0; j < 7; j++) {
    let a = (j / 7) * Math.PI * 2 + hash(j, 1, seed) * 0.7;
    let p: V3 = [c[0], c[1], 0];
    const L = (10 + 16 * hash(j, 2, seed)) * grown;
    for (let d = 0; d < L; d += 2) {
      a += (hash(j, 10 + d, seed) - 0.5) * 0.7;
      p = [p[0] + Math.cos(a) * 2, p[1] + Math.sin(a) * 2, 0];
      if (hash(j, 40 + d, seed) < fade) continue;
      floorDot(st, ref, p, d < L * 0.5 ? CRACK[0] : CRACK[1], 2);
    }
  }
}

/** LIGHT DRAWN INTO A PIPE'S MOUTH (his shout's warning): motes of the cult's fire streaming in to `p` from round it. */
function drawIn(put: Put, p: V3, t: number, k: number, seed: number): void {
  const n = Math.round(9 * k);
  for (let i = 0; i < n; i++) {
    const ph = (t * 1.8 + hash(i, 1, seed)) % 1;
    const a = hash(i, 2, seed) * Math.PI * 2;
    const e = hash(i, 3, seed) - 0.3;
    const r = 38 * (1 - ph);
    const q: V3 = [p[0] + Math.cos(a) * r * Math.cos(e), p[1] + Math.sin(a) * r * Math.cos(e), p[2] + r * Math.sin(e) + 4];
    put('fire', 'fire', { k: 'mote', p: q, c: ph > 0.7 ? FIRE[2] : ph > 0.35 ? FIRE[1] : FIRE[0], size: ph > 0.7 ? 4 : 2 });
  }
}

/** A BLAST OF HIS SOUND out of a pipe's mouth `p`, along `way`: a stream of the cult's pink and fire, flung out and spreading, from `t0` for `lasts`. */
function blastOut(put: Put, p: V3, way: V3, t: number, t0: number, lasts: number, speed: number, seed: number, k = 1): void {
  const w = norm(way);
  const s1 = norm(cross(w, Z), [0, 1, 0]);
  const s2 = norm(cross(s1, w), Z);
  for (let j = 0; j < 30; j++) {
    const born = t0 + (j / 30) * lasts;
    const age = t - born;
    if (age < 0 || age > 0.42) continue;
    if (hash(j, 9, seed) > k) continue;
    const a = hash(j, 1, seed) * Math.PI * 2;
    const spread = 0.28 * hash(j, 2, seed);
    const d = norm(add(w, add(mul(s1, Math.cos(a) * spread), mul(s2, Math.sin(a) * spread))));
    const q = add(p, mul(d, speed * age));
    put('blast', 'blast', { k: 'mote', p: q, c: age < 0.08 ? FIRE[2] : age < 0.16 ? FIRE[1] : hash(j, 3, seed) < 0.4 ? SOUND[2] : SOUND[1], size: age < 0.24 ? 4 : 2 });
  }
}

/** A CONE OF HIS SOUND: rings of it in the air, one after another from `t0` every `every` seconds, each flung out from `p` along `way` and widening as it goes. */
function soundCone(st: Stage, p: V3, way: V3, t: number, t0: number, n: number, every: number, speed: number, seed: number): void {
  for (let j = 0; j < n; j++) {
    const age = t - t0 - j * every;
    if (age < 0 || age > 0.4) continue;
    const at = add(p, mul(norm(way), speed * age));
    airRing(st, at, age, 0.4, 5, 26, seed + j, 1);
  }
}

/**
 * SHARDS flung from `origins` at `t0` (his pipes bursting, his body shattering): each a sliver of what it was,
 * thrown out along `out` from where it was and up, turning, falling, and lying where it lands.
 */
function shards(put: Put, origins: ReadonlyArray<V3>, centre: V3, tau: number, seed: number, ramp: Ramp, speed: number, part: string): void {
  if (tau < 0) return;
  const G = 420;
  origins.forEach((o, i) => {
    const r = (k: number): number => hash(i, k, seed);
    // (away from where it burst, but every way round too)
    const a = r(1) * Math.PI * 2;
    const away = norm([o[0] - centre[0], o[1] - centre[1], 0], [Math.cos(a), Math.sin(a), 0]);
    const out = norm(add(mul(away, 0.45), [Math.cos(a) * 0.8, Math.sin(a) * 0.8, 0.5 + 0.9 * r(3)]), Z);
    const v = mul(out, speed * (0.55 + 0.7 * r(4)));
    // (when it reaches the floor)
    const z0 = o[2];
    const land = (v[2] + Math.sqrt(v[2] * v[2] + 2 * G * Math.max(0, z0 - 1))) / G;
    const tt = Math.min(tau, land);
    const p: V3 = [o[0] + v[0] * tt, o[1] + v[1] * tt, Math.max(1, z0 + v[2] * tt - (G * tt * tt) / 2)];
    const spin = tt * (8 + 10 * r(5)) + r(6) * 6;
    const lying = tau >= land;
    const d = lying ? norm([Math.cos(r(6) * 6), Math.sin(r(6) * 6), 0]) : norm([Math.cos(spin), Math.sin(spin * 0.8), Math.sin(spin * 1.3)]);
    const L = 1.4 + 1.6 * r(7);
    put(part, `${part}${i}`, { k: 'rod', a: sub(p, mul(d, L)), b: add(p, mul(d, L)), ra: 0.8, rb: 0.5, ramp });
  });
}

// ---------------------------------------------------------------------------------------------
// SEE-THROUGH COPIES OF HIM (his sound-copies; the echo of his blow): painted as he is, then laid down in the
// cult's pink, every other game pixel, under him

/** A canvas a size of its own, so that a copy is painted on layers of its own. */
const GHOST_CAN = { w: CANTOR_CANVAS.w, h: CANTOR_CANVAS.h + 2 };
const INK_RGB = rgba(INK);
/** SEE-THROUGH, IN THE CULT'S PINK: `bits` painted as a solid figure `shift` (the figure's own lengths) from him, then laid under him in pink by how light each pixel was, every other game pixel (and its seam whole); `k` how much of it there is (0 none, 1 all). */
function ghostInto(st: Stage, bits: Bit[], shift: V3, k: number, ref: V3, solid = false): void {
  if (k <= 0.02) return;
  const [ax, ay] = st.at([0, 0, 0]);
  const [sx, sy] = st.at(shift);
  const dx = 2 * Math.round((sx - ax) / 2);
  const dy = 2 * Math.round((sy - ay) / 2);
  const g = stage(st.view, ax + dx, ay + dy, GHOST_CAN);
  paintBits(g, bits, ref);
  const px = g.whole(null);
  const W = Math.min(px.w, st.under.w);
  const H = Math.min(px.h, st.under.h);
  const d = px.d;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * px.w + x) * 4;
      if (d[i + 3] === 0) continue;
      const gx = x >> 1;
      const gy = y >> 1;
      const seam = d[i] === INK_RGB[0] && d[i + 1] === INK_RGB[1] && d[i + 2] === INK_RGB[2];
      const keep = hash(gx, gy, 77) < k;
      if (!keep) continue;
      if (seam) {
        st.under.set(x, y, solid ? FLAME[1] : FLAME[0]);
        continue;
      }
      if (!solid && ((gx + gy) & 1) !== 0) continue;
      const lum = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
      st.under.set(x, y, lum < 60 ? FLAME[1] : lum < 130 ? SOCKET : PINK[3]);
    }
  }
}

// ---------------------------------------------------------------------------------------------
// ALL OF HIM

function cantorBits(st: Stage, m: Moment): Bit[] {
  const { s, q } = m;
  const bits = bodyBits(m);
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const t = m.t;
  const feet: V3 = [(s.ankleL[0] + s.ankleR[0]) / 2, (s.ankleL[1] + s.ankleR[1]) / 2, 0];
  const ph = m.wind * Math.PI * 2;
  const bell = bellOf(m.move, t, ph);
  const sf = staffOf(s, q);
  const pipes = pipesOf(s);
  const [cf] = s.chest;
  const fwd = Math.atan2(s.hips[0][1], s.hips[0][0]);

  // HIS WALK: the bell tolls as the staff is planted, a ring of pink sound across the floor from its foot (carried
  // back with the floor, as everything on it is), and its echo a beat after
  if (m.move === NAME_WALK) {
    const v = CANTOR_PACE * TILE3;
    const tau = since(t, CANTOR_WALK.plant, WALK_T);
    const at: V3 = [FOOT0[0] + v * (WALK_T - CANTOR_WALK.plant) - v * tau, FOOT0[1], 0];
    // (all of it over before the round comes round again, so that nothing is left hanging as he sets off or stops)
    soundRing(st, put, feet, at, tau, 0.42, 4, 64, 5101);
    soundRing(st, put, feet, [at[0] - v * 0.18, at[1], 0], tau - 0.18, 0.26, 4, 44, 5103, 0.45);
    airRing(st, bellMouth(sf.foot, sf.up, s.chest[1], bell.swing, 0), tau, 0.4, 3, 14, 5105, 0.8);
  }

  // HIS STAFF STRIKE
  if (m.move === NAME_STRIKE) {
    const S = CANTOR_STRIKE;
    // (held overhead: the bell shaking and the light in his pipes gathering)
    if (t > S.warn && t < S.swing) airRing(st, bellMouth(sf.foot, sf.up, s.chest[1], bell.swing, 0), (t - S.warn) % 0.2, 0.2, 2, 8, 5201 + Math.floor((t - S.warn) / 0.2), 0.6);
    // (the arc: a streak of pink sound where the staff's head has been)
    streaksOf(put, m);
    // where it came down: the bell's mouth on the rock
    const spot = strikeSpot();
    const tau = t - S.hit;
    for (let j = 0; j < 3; j++) soundRing(st, put, feet, spot, tau - j * 0.08, 0.55, 4, 70 + j * 16, 5211 + j);
    airRing(st, add(spot, [0, 0, 6]), tau, 0.35, 4, 26, 5215);
    cracksOf(st, feet, spot, tau, 5221, clamp01((t - 1.9) / 0.3));
    dustOf(put, spot, tau, 0.6, 30, 40, 5231);
    chipsOf(put, spot, tau, 0.7, 16, 5233, 120, 140);
    // THE ECHO: a ghostly pink staff strikes the same spot a beat later, and the floor rings again, weaker
    const te = t - S.echo;
    if (te > S.swing + 0.02 && te < S.hit + S.freeze + 0.05) {
      const qe = posedOfMob(CANTOR, 'attack', te);
      const He: V3 = [qe.rhx, qe.rhy, qe.rhz];
      const Ue = heading(qe.wAz, qe.wEl);
      const fe = sub(He, mul(Ue, qe.pt));
      const gb: Bit[] = [];
      const gput: Put = (part, piece, shape) => {
        gb.push({ part, piece, shape });
      };
      staffBits(gput, fe, Ue, s.chest[1], 0, te < S.hit ? 1 : 0.9, 'ghost');
      ghostInto(st, gb, [0, 0, 0], te > S.hit + 0.05 ? 0.7 : 1, s.pelvis, true);
      // its streak
      for (let i = 1; i <= 6; i++) {
        const qa = posedOfMob(CANTOR, 'attack', te - i * 0.012);
        const ha = add(sub([qa.rhx, qa.rhy, qa.rhz], mul(heading(qa.wAz, qa.wEl), qa.pt)), mul(heading(qa.wAz, qa.wEl), STAFF_LONG));
        if (te - i * 0.012 > S.swing + 0.03 && te - i * 0.012 < S.hit) put('streak', 'streak', { k: 'mote', p: ha, c: i < 3 ? SOUND[2] : SOUND[1], size: 2 });
      }
    }
    const te2 = t - S.hit - S.echo;
    for (let j = 0; j < 2; j++) soundRing(st, put, feet, spot, te2 - j * 0.08, 0.5, 4, 60 + j * 14, 5241 + j, 0.6);
    dustOf(put, spot, te2, 0.45, 16, 30, 5245, 16);
  }

  // HIS SHOUT
  if (m.move === NAME_SHOUT) {
    const S = CANTOR_SHOUT;
    const draw = smooth((t - 0.1) / 0.5) * (1 - smooth((t - S.lunge) / 0.06));
    if (draw > 0) pipes.forEach(({ top }, i) => drawIn(put, top, t, draw, 5301 + i * 7));
    const tau = t - S.hit;
    // all nine pipes blast pink, and his mouth with them, forward at you
    const way = norm(add(mul([Math.cos(fwd), Math.sin(fwd), 0], 1), [0, 0, 0.25]));
    pipes.forEach(({ foot, top }, i) => {
      const d = norm(add(mul(norm(sub(top, foot)), 0.5), way));
      blastOut(put, top, d, t, S.hit, 0.3, 300, 5321 + i * 3, 0.7);
      airRing(st, top, tau - (i % 3) * 0.05, 0.3, 2, 12, 5351 + i, 0.7);
    });
    blastOut(put, add(s.head, mul(s.face[0], 6)), way, t, S.hit, 0.3, 320, 5381);
    soundCone(st, add(s.head, mul(s.face[0], 6)), way, t, S.hit, 5, 0.06, 300, 5385);
    // the shockwave rolls out at you, and comes back off the far wall a beat later
    soundRing(st, put, feet, feet, tau, S.out, 16, S.reach, 5391, 1, { toward: fwd, half: 1.15, rows: 3 });
    dustOf(put, add(feet, [Math.cos(fwd) * 40, Math.sin(fwd) * 40, 0]), tau, 0.5, 24, 90, 5393, 14);
    soundRing(st, put, feet, feet, t - S.back, S.out, 30, S.reach, 5395, 0.9, { toward: fwd, half: 1.0, rows: 3 }, true);
    if (tau >= 0 && tau < 0.35) put('glow', 'glow', { k: 'glow', p: add(s.head, mul(cf, 8)), c: FLAME[2], r: 40, a: 0.4 * (1 - tau / 0.35) });
  }

  // HIS SOUND-COPIES: the bell rung over his head; his copies tear away to each side, see-through, each a beat behind
  if (m.move === NAME_COPIES) {
    const C = CANTOR_COPIES;
    const mouth = bellMouth(sf.foot, sf.up, s.chest[1], bell.swing, 0);
    C.rings.forEach((r0, j) => airRing(st, mouth, t - r0, 0.45, 3, 30, 5401 + j));
    C.rings.forEach((r0, j) => soundRing(st, put, feet, feet, t - r0, 0.6, 20, 60, 5411 + j, 0.6));
    if (t > C.raise && t < 1.25) put('glow', 'glow', { k: 'glow', p: mouth, c: FLAME[2], r: 22, a: 0.35 });
    const mv = CANTOR.more?.copies;
    if (mv) {
      C.tear.forEach((t0, j) => {
        if (t < t0) return;
        const side = j === 0 ? 1 : -1;
        const out = 1 - Math.pow(1 - clamp01((t - t0) / 0.42), 3);
        const left: V3 = [-Math.sin(fwd), Math.cos(fwd), 0];
        const shift = mul(left, side * C.reach * out);
        const mc = momentOf(CANTOR, mv, Math.max(0, t - C.delay[j]));
        ghostInto(st, bodyBits(mc, true), shift, smooth((t - t0) / 0.2), s.pelvis);
        // (a ring where it lands)
        soundRing(st, put, feet, shift, t - t0 - 0.3, 0.45, 6, 30, 5421 + j, 0.7);
      });
    }
  }

  // HIS ROCKFALL
  if (m.move === NAME_ROCKFALL) {
    const F = CANTOR_ROCKFALL;
    soundRing(st, put, feet, FOOT0, t - F.plant, 0.6, 4, 70, 5501);
    dustOf(put, FOOT0, t - F.plant, 0.4, 14, 20, 5503, 10);
    // his pipes and his mouth blast pink straight up at the rim
    const loud = smooth((t - F.sing) / 0.1) * (1 - smooth((t - F.hush) / 0.15));
    if (loud > 0) {
      pipes.forEach(({ foot, top }, i) => {
        const d = norm(add(norm(sub(top, foot)), [0, 0, 1.5]));
        blastOut(put, top, d, t, F.sing, F.hush - F.sing, 520, 5511 + i * 3, 0.7 * loud);
      });
      blastOut(put, add(s.head, mul(s.face[2], 4)), [0, 0, 1], t, F.sing, F.hush - F.sing, 520, 5541, loud);
      soundCone(st, add(s.head, mul(s.face[2], 6)), [0, 0, 1], t, F.sing, 10, 0.11, 260, 5545);
    }
    // dust pours down from the rim in streams, grit sifts down all round, and rocks come down round him, each smashing on the floor
    const pours: V3[] = [[40, 70, 0], [-30, -50, 0], [86, -14, 0], [-64, 22, 0], [20, -96, 0], [-10, 90, 0]];
    pours.forEach((p, j) => {
      const on = clamp01((t - F.pour - j * 0.1) / 0.2) * (1 - clamp01((t - 2.15) / 0.35));
      if (on <= 0) return;
      for (let i = 0; i < 26; i++) {
        if (hash(i, 1, 5600 + j) > on) continue;
        const ph = (t * 1.1 + hash(i, 2, 5600 + j)) % 1;
        const z = 1 + 320 * (1 - ph * ph);
        const w = 4 + 8 * ph;
        put('pour', 'pour', { k: 'mote', p: [p[0] + (hash(i, 3, 5600 + j) - 0.5) * w, p[1] + (hash(i, 4, 5600 + j) - 0.5) * w, z], c: SAND[i % 4], size: i % 4 === 0 ? 4 : 2 });
      }
      if (on > 0.5) dustOf(put, p, (t - F.pour - j * 0.1) % 0.5, 0.5, 8, 16, 5660 + j, 8);
    });
    const grit = clamp01((t - F.pour) / 0.3) * (1 - clamp01((t - 2.2) / 0.3));
    for (let i = 0; i < 50; i++) {
      if (hash(i, 1, 5690) > grit) continue;
      const ph = (t * 0.6 + hash(i, 2, 5690)) % 1;
      put('pour', 'pour', { k: 'mote', p: [(hash(i, 3, 5690) - 0.5) * 240, (hash(i, 4, 5690) - 0.5) * 240, 1 + 300 * (1 - ph)], c: SAND[1 + (i % 3)], size: 2 });
    }
    F.rocks.forEach((r, j) => {
      const t0 = r.at - F.fall;
      const tau = t - t0;
      const spot: V3 = [r.x, r.y, 0];
      // its shadow on the floor, darkening as it comes (the warning)
      if (tau > -0.2 && tau < F.fall) {
        const k = clamp01((tau + 0.2) / (F.fall + 0.2));
        const rr = 5 + 9 * k;
        for (let a = 0; a < 40; a++) for (let rad = 0; rad < rr; rad += 2) {
          const p: V3 = [spot[0] + Math.cos((a / 40) * Math.PI * 2) * rad, spot[1] + Math.sin((a / 40) * Math.PI * 2) * rad, 0];
          const [x, y] = st.at(p);
          if (((Math.round(x / 2) + Math.round(y / 2)) & 1) === 0 || k > 0.7) floorDot(st, feet, p, CRACK[0], 2);
        }
      }
      if (tau >= 0 && tau < F.fall) {
        const z = 2 + 290 * (1 - (tau / F.fall) * (tau / F.fall));
        const size = r.r;
        // (a lump of the rim's red rock, turning as it falls, a trail of grit behind it)
        const a = tau * 9 + j;
        const ax: V3 = [Math.cos(a) * size, Math.sin(a) * size, 0];
        put('rock', `rock${j}`, { k: 'ball', c: [spot[0], spot[1], z + size * 0.8], ax: [ax, [-Math.sin(a) * size * 0.8, Math.cos(a) * size * 0.8, 0], [0, 0, size * 0.75]], skin: ROCK });
        for (let i = 0; i < 9; i++) put('pour', 'pour', { k: 'mote', p: [spot[0] + (hash(i, 1, j) - 0.5) * size, spot[1] + (hash(i, 2, j) - 0.5) * size, Math.min(330, z + size * 2 + 4 + i * 6)], c: SAND[i % 4], size: i % 3 === 0 ? 4 : 2 });
      }
      // it smashes: a burst of dust and chips of red rock, a flat ring of dust across the floor
      dustOf(put, spot, t - r.at, 0.6, 44, 30 + r.r * 3, 5611 + j, 36);
      chipsOf(put, spot, t - r.at, 0.6, 26, 5621 + j, 130, 180);
      if (t - r.at >= 0 && t - r.at < 0.45) for (let i = 0; i < 24; i++) {
        const k = (t - r.at) / 0.45;
        const a = (i / 24) * Math.PI * 2;
        const rr = 6 + 50 * (1 - (1 - k) * (1 - k));
        if (hash(i, 9, 5641 + j) < k) continue;
        floorDot(st, feet, [spot[0] + Math.cos(a) * rr, spot[1] + Math.sin(a) * rr, 0], SAND[i % 2], 2);
      }
    });
  }

  // STRUCK: his pipes clatter, spitting a burst of pink
  if (m.move === NAME_REEL) {
    pipes.forEach(({ foot, top }, i) => blastOut(put, top, norm(add(sub(top, foot), [0, 0, 8])), t, 0, 0.12, 200, 5701 + i * 3, 0.45));
  }

  // HIS DEATH: his last note; his pipes bursting one by one; pink light splitting through him; he shatters; his echoes
  if (m.move === NAME_DIE) {
    const Dd = CANTOR_DIE;
    if (t < Dd.shatter) for (let j = 0; j < 5; j++) airRing(st, add(s.head, mul(s.face[0], 5)), t - 0.08 - j * 0.24, 0.5, 4, 34, 5801 + j, 0.9);
    const all = pipesOf(s);
    all.forEach(({ foot, top }, i) => {
      const tau = t - Dd.burst[i];
      if (tau < 0) return;
      const pts: V3[] = [];
      for (let k = 0; k < 6; k++) pts.push(lerp3(foot, top, 0.2 + 0.8 * (k / 5)));
      shards(put, pts, s.ribs, tau, 5811 + i * 13, PIPE, 75, `pshard${i}`);
      if (tau < 0.15) put('glow', 'glow', { k: 'glow', p: top, c: FLAME[2], r: 22, a: 0.5 * (1 - tau / 0.15) });
      airRing(st, top, tau, 0.25, 2, 12, 5831 + i, 0.8);
    });
    // pink light splitting through him
    if (t >= Dd.split && t < Dd.shatter) {
      const grow = clamp01((t - Dd.split) / (Dd.shatter - Dd.split));
      const [c0, c1, c2] = s.chest;
      const starts: [V3, number][] = [[s.ribs, B.ribDeep + 1.6], [lerp3(s.ribs, s.pelvis, 0.6), B.waistDeep + 1.8], [s.neck, 2.2], [s.head, B.headR[0] * 0.9]];
      starts.forEach(([o, deep], j) => {
        let a = hash(j, 1, 5851) * Math.PI * 2;
        let y = 0;
        let z = 0;
        const L = 26 * grow;
        for (let d = 0; d < L; d += 1.5) {
          a += (hash(j, 10 + Math.round(d), 5851) - 0.5) * 0.9;
          y += Math.cos(a) * 1.5;
          z += Math.sin(a) * 1.5;
          const p = add(add(add(o, mul(c0, deep)), mul(c1, y)), mul(c2, z));
          put('split', 'split', { k: 'mote', p, c: d > L - 4 ? FIRE[2] : FIRE[1], size: 2 });
        }
      });
      put('glow', 'glow', { k: 'glow', p: s.ribs, c: FLAME[2], r: 20 + 30 * grow, a: 0.3 + 0.3 * grow });
    }
    // he shatters: shards of him flung out, a flash of pink
    const tau = t - Dd.shatter;
    if (tau >= 0) {
      const sNow = s;
      const origins: V3[] = [];
      const hc = sNow.head;
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2;
        origins.push(add(hc, [Math.cos(a) * 4.5, Math.sin(a) * 4, (k % 3) * 3 - 3]));
      }
      for (const [a, b] of [[sNow.elbowL, sNow.handL], [sNow.elbowR, sNow.handR], [sNow.neck, sNow.head], [sNow.heelL, sNow.toeL], [sNow.heelR, sNow.toeR]] as const) for (let k = 0; k < 4; k++) origins.push(lerp3(a, b, (k + 0.5) / 4));
      shards(put, origins, sNow.ribs, tau, 5871, SKIN, 110, 'shard');
      const sparks: V3[] = [];
      for (let k = 0; k < 18; k++) sparks.push(lerp3(sNow.pelvis, sNow.head, k / 17));
      if (tau < 0.5) sparks.forEach((p, i) => {
        const o = norm([hash(i, 1, 5891) - 0.5, hash(i, 2, 5891) - 0.5, hash(i, 3, 5891) - 0.2]);
        put('split', 'split', { k: 'mote', p: add(p, mul(o, 180 * tau)), c: tau < 0.2 ? FIRE[2] : FIRE[1], size: tau < 0.25 ? 4 : 2 });
      });
      if (tau < 0.3) put('glow', 'glow', { k: 'glow', p: sNow.ribs, c: FLAME[2], r: 70, a: 0.6 * (1 - tau / 0.3) });
      // his staff comes down, and the bell clangs a last time
      soundRing(st, put, feet, add(sf.foot, mul(norm([0.35, -1, 0.04]), STAFF_LONG)), t - Dd.down, 0.4, 4, 30, 5895, 0.7);
      // his echoes ring on and fade
      Dd.echoes.forEach((e, j) => soundRing(st, put, feet, feet, t - e, 0.4, 10, 90 - j * 12, 5901 + j, 1 - j * 0.22));
    }
  }
  return bits;
}

/** Where the staff's bell comes down in his strike: worked out once from the move. */
let SPOT: V3 | null = null;
function strikeSpot(): V3 {
  if (SPOT) return SPOT;
  const q = posedOfMob(CANTOR, 'attack', CANTOR_STRIKE.hit);
  const U = heading(q.wAz, q.wEl);
  const foot = sub([q.rhx, q.rhy, q.rhz], mul(U, q.pt));
  const head = add(foot, mul(U, STAFF_LONG));
  SPOT = [head[0] + 4, head[1], 0];
  return SPOT;
}
/** A STREAK OF PINK SOUND where the staff's head has been as it comes down (the move's `trails`). */
function streaksOf(put: Put, m: Moment): void {
  if (!m.trails) return;
  for (const tr of m.trails) {
    for (let i = 1; i < tr.length; i++) {
      const a = tr[i - 1];
      const b = tr[i];
      const n = Math.max(1, Math.ceil(len(sub(b, a)) / 2));
      for (let j = 0; j < n; j++) {
        const p = lerp3(a, b, j / n);
        if (p[2] < 2) continue;
        put('streak', 'streak', { k: 'mote', p, c: i < tr.length / 3 ? SOUND[2] : i < (tr.length * 2) / 3 ? SOUND[1] : SOUND[0], size: 2 });
      }
    }
  }
}

// =============================================================================================
// HIM AS A MONSTER OF THE BONES

function move(name: string, motion: Motion): MobMove {
  return { name, motion, rest: CANTOR_REST };
}

export const CANTOR: Mob = {
  id: 'cantor',
  name: 'The Cantor',
  size: 'a boss: tall and gaunt, half again the knight',
  build: B,
  stand: move(NAME_STAND, cantorStand()),
  attack: { ...move(NAME_STRIKE, cantorStrike()), trail: (sk, q) => [staffOf(sk, q).head], trailOver: (t) => t > CANTOR_STRIKE.swing + 0.03 && t <= CANTOR_STRIKE.hit, trailSpan: 3, jaw: (t) => jawOf(NAME_STRIKE, t) },
  idleFrames: 32,
  idleFps: 10,
  walk: { ...move(NAME_WALK, cantorWalk()), period: WALK_T, ground: CANTOR_PACE * TILE3 },
  walkFrames: CANTOR_WALK.frames,
  walkFps: CANTOR_WALK.fps,
  pace: CANTOR_PACE,
  reel: { ...move(NAME_REEL, cantorReel()), jaw: (t) => jawOf(NAME_REEL, t) },
  reelTime: CANTOR_REEL_LONG,
  hit: CANTOR_STRIKE.hit,
  warn: CANTOR_STRIKE.warn,
  dieTime: CANTOR_DIE.long,
  dying: { ...move(NAME_DIE, cantorDie()), jaw: (t) => jawOf(NAME_DIE, t) },
  more: {
    shout: { ...move(NAME_SHOUT, cantorShout()), jaw: (t) => jawOf(NAME_SHOUT, t) },
    copies: { ...move(NAME_COPIES, cantorCopies()), jaw: (t) => jawOf(NAME_COPIES, t) },
    rockfall: { ...move(NAME_ROCKFALL, cantorRockfall()), jaw: (t) => jawOf(NAME_ROCKFALL, t) },
  },
  aura: { x: CANTOR_CANVAS.ax, y: CANTOR_CANVAS.ay - 120, r: 110, color: '#ff3a78', a: 0.14 },
  shadow: 30,
  canvas: CANTOR_CANVAS,
  trueBack: true,
  bits: (st, m) => cantorBits(st, m),
};

/** One picture of him standing, `t` seconds into his breath, as the game holds a figure. */
export function cantorStanding(t: number, view: GameView = 'front'): Sprite {
  return toSprite(paintMob(CANTOR, 'stand', t, view, ENEMY_RIM), null, CANTOR_CANVAS.ax, CANTOR_CANVAS.ay);
}
/** One picture of him in a move, `t` seconds in, as the game holds a figure. */
export function cantorFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(paintMob(CANTOR, which, t, view, ENEMY_RIM), null, CANTOR_CANVAS.ax, CANTOR_CANVAS.ay);
}
/** The same, as painted (for the checks). */
export function cantorPainted(t: number, view: GameView = 'front', which = 'stand'): Painted {
  return paintMob(CANTOR, which, t, view, ENEMY_RIM);
}

/**
 * ONE OF HIS SOUND-COPIES, as the game would hold one once it has torn away from him (his sound-copies: “Two
 * see-through pink copies of him tear away to either side”): him in a move, `t` seconds in, see-through in the
 * cult's pink, as they are painted beside him in that move. For the main chat, if the copies come in as figures of
 * their own.
 */
export function cantorEchoPainted(which: string, t: number, view: GameView = 'front'): Painted {
  const mv = which === 'stand' || which === 'walk' || which === 'attack' || which === 'reel' ? CANTOR[which] : CANTOR.more?.[which];
  if (!mv) throw new Error(`the Cantor has no move ${which}`);
  const st = stage(paintViewOf(CANTOR, view), CANTOR_CANVAS.ax, CANTOR_CANVAS.ay, CANTOR_CANVAS);
  const m = momentOf(CANTOR, mv, t);
  ghostInto(st, bodyBits(m, true), [0, 0, 0], 1, m.s.pelvis);
  return { px: st.whole(ENEMY_RIM), lights: [] };
}

