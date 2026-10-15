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
// READ AS (the pictures show whether it is right): one of the cult's, its violet and its pink; bare-headed, no
// hat and no hood (the flock wear cowls; he is their master and shows his face): a long, gaunt, hairless head,
// its eyes the cult's pink, its mouth a dark slot that burns when he sings; a mantle over his shoulders and a
// robe to the floor; the cult's pink stole; long bony hands, the left raised as if to lead a choir; the staff in
// his right hand planted beside him, a crook at its head and a bronze bell hung in it; seven pipes of bone rising
// from between his shoulder blades in a fan behind his head, the middle one tallest, each open at its top, their
// mouths glowing faintly as he breathes. What glows on him is the enemy's. Nothing cyan. His pink edge while he
// lives.
//
// THIS FIRST STEP: his look, standing (his rulebook: a sheet of him standing, front and back, beside a hero,
// before anything moves); his stand breathing. His other moves are his stand for now, placeholders, not for use.

import { INK, PINK } from './kit';
import type { Painted, Ramp } from './kit';
import { FLAME, SOCKET } from './mkit';
import { TILE3, paintMob, sphere } from './new_mobs3';
import type { Bit, Mob, MobCanvas, MobMove, Moment, Put } from './new_mobs3';
import { toSprite } from './kit';
import { ENEMY_RIM } from './mkit';
import type { GameView, Ring, Stage } from './skin';
import type { Sprite } from '../engine/px';
import { add, buildOf, cross, dot, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const CANTOR_ON = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const fr = (t: number): number => t - Math.floor(t);

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

// =============================================================================================
// HIS BODY, HIS REST

/** His body: half again the knight's height (58), gaunt: narrow in the chest and waist, long in the arm. */
export const CANTOR_BODY: Build = buildOf(86, 1.05, { shoulders: 0.9, chest: 0.82, depth: 0.82, waist: 0.72, hips: 0.88, arms: 1.12, trunk: 1.04, limbs: 0.74, legs: 1.0 });
const B = CANTOR_BODY;
/** His canvas: room for his pipes over his head and his staff, and for his moves to come. */
export const CANTOR_CANVAS: MobCanvas = { w: 420, h: 460, ax: 210, ay: 360 };

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

/** HIS STAND (3.2 s round): stately. He breathes deep and slow, his chest rising, his weight going over from foot to foot; his raised hand beats a slow time, sweeping; his head turns a little to look over his flock and back; his pipes' mouths glow and dim with his breath (`draw`). */
export const CANTOR_STAND_LONG = 3.2;
function cantorStand(): Motion {
  const R = CANTOR_REST;
  const keys: Key3[] = [];
  const N = 32;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * CANTOR_STAND_LONG;
    const a = (t / CANTOR_STAND_LONG) * Math.PI * 2;
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
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
      },
    });
  }
  return { loop: 0, keys };
}

// =============================================================================================
// HIM AS SOLIDS

/** Where his pipes rise from: between his shoulder blades, and the way his back looks. */
function pipeRoot(s: Skeleton): { at: V3; back: V3; up: V3; left: V3 } {
  const [cf, cl, cu] = s.chest;
  return { at: add(add(s.ribs, mul(cf, -(B.ribDeep + 0.6))), mul(cu, B.chest * 0.42)), back: mul(cf, -1), up: cu, left: cl };
}

/** HIS PIPES: seven of bone in a fan behind his head, the middle tallest; each banded, a slot cut in its front near its foot as an organ pipe's mouth, open at its top. `sing` 0 to 1: how their mouths glow. Returns their tops. */
export function pipesOf(s: Skeleton): { foot: V3; top: V3; r: number }[] {
  const { at, back, up, left } = pipeRoot(s);
  const out: { foot: V3; top: V3; r: number }[] = [];
  // (nine, side by side as an organ's are, a little fanned; the middle tallest, falling away to each side)
  for (let i = -4; i <= 4; i++) {
    const k = Math.abs(i);
    const foot = add(add(at, mul(left, i * 3.4)), mul(back, 0.9 + k * 0.2));
    const dir = norm(add(add(mul(up, 1), mul(left, i * 0.05)), mul(back, 0.14)));
    const long = 50 - k * 5.5;
    out.push({ foot, top: add(foot, mul(dir, long)), r: 1.45 });
  }
  return out;
}

/** HIS STAFF: its foot, its head (where its crook begins), and the way it points: held in his right hand, along the way the pose points what he holds, its foot down to the floor when it points up. */
export function staffOf(s: Skeleton): { foot: V3; head: V3; up: V3 } {
  const grip = s.handR;
  const up = norm(s.point, [0, 0, 1]);
  const foot: V3 = sub(grip, mul(up, Math.max(4, grip[2] / Math.max(0.2, up[2]))));
  return { foot, head: add(grip, mul(up, 30)), up };
}

function cantorBits(st: Stage, m: Moment): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const sing = lit * clamp01(q.draw);
  const ph = m.wind * Math.PI * 2;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const lag = mul(m.come, -1.2);

  // --- his feet, bare and bony, under the hem ---
  for (const side of ['L', 'R'] as const) {
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    put(`foot${side}`, `foot${side}`, { k: 'rod', a: add(heel, [0, 0, 1.1]), b: add(toe, [0, 0, 0.7]), ra: 1.3, rb: 0.8, ramp: SKIN, far: true });
  }

  // --- HIS ROBE to the floor: narrow at the chest and waist, widening to its hem ---
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
  const robe: Ring[] = [
    { c: add(s.neck, mul(cu, 0.6)), u: mul(cf, 3.6), v: mul(cl, 4.2) },
    { c: lerp3(s.ribs, s.neck, 0.65), u: mul(cf, B.ribDeep + 2.0), v: mul(cl, B.shoulderHalf + 0.6) },
    { c: s.ribs, u: mul(cf, B.ribDeep + 1.6), v: mul(cl, B.ribHalf + 1.6) },
    { c: waistC, u: mul(be[0], B.waistDeep + 1.4), v: mul(be[1], B.waistHalf + 1.4) },
    { c: [s.pelvis[0], s.pelvis[1], s.pelvis[2] - 1.2], u: mul(f, B.pelvisDeep + 2.4), v: mul(l, B.pelvisHalf + 2.6) },
    { c: [kneeMid[0] * 0.6 + hemC[0] * 0.4, kneeMid[1] * 0.6 + hemC[1] * 0.4, kneeMid[2]], u: mul(f, (B.pelvisDeep + 2.4 + hemDeep) / 2), v: mul(l, (B.pelvisHalf + 2.6 + hemWide) / 2) },
    { c: hemC, u: mul(f, hemDeep), v: mul(l, hemWide), pts: hemPts },
  ];
  put('robe', 'robe', { k: 'cloth', rings: robe, ramp: ROBE, look: { folds: [20, -20, 60, -60, 110, -110, 160, -160], lift: 0.06, hem: STOLE } });

  // --- THE CULT'S PINK STOLE: over his neck and down his front to his shins ---
  for (const sd of [1, -1]) {
    const top = add(add(s.neck, mul(cl, sd * 2.4)), mul(cf, 2.0));
    const chest = add(add(s.ribs, mul(cl, sd * 2.0)), mul(cf, B.ribDeep + 1.9));
    const belly = add(add(waistC, mul(be[1], sd * 1.9)), mul(be[0], B.waistDeep + 1.6));
    const end = add(add(lerp3(kneeMid, hemC, 0.55), mul(l, sd * 2.2)), add(mul(f, B.pelvisDeep + 3.6), mul(lag, 0.7)));
    put('stole', 'stole', { k: 'rod', a: top, b: chest, ra: 1.0, rb: 1.05, ramp: STOLE });
    put('stole', 'stole', { k: 'rod', a: chest, b: belly, ra: 1.05, rb: 1.1, ramp: STOLE });
    put('stole', 'stole', { k: 'rod', a: belly, b: end, ra: 1.1, rb: 1.2, ramp: STOLE });
  }

  // --- HIS MANTLE: a short cape over his shoulders to his elbows, its edge the cult's pink; split at the back where his pipes rise ---
  const mantle: Ring[] = [
    { c: add(s.neck, mul(cu, 1.4)), u: mul(cf, 3.8), v: mul(cl, 4.4) },
    { c: add(lerp3(s.ribs, s.neck, 0.8), mul(cu, 0.6)), u: mul(cf, B.ribDeep + 3.0), v: mul(cl, B.shoulderHalf + 2.4) },
    { c: add(s.ribs, mul(cu, 0.4)), u: mul(cf, B.ribDeep + 4.2), v: mul(cl, B.shoulderHalf + 4.4) },
  ];
  put('mantle', 'mantle', { k: 'cloth', rings: mantle, ramp: MANTLE, look: { folds: [35, -35, 90, -90], lift: 0.08, ragged: true, hem: STOLE } });

  // --- HIS SLEEVES, wide; his long bony forearms and hands out of them ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
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
    // his hand: long, the fingers spread (the raised left) or closed round the staff (the right)
    put(`hand${side}`, `hand${side}`, { k: 'ball', c: hand, ax: [mul(fore, 1.4), mul(e1, 1.1), mul(e2, 0.7)], skin: SKIN, far: true });
    if (side === 'L') {
      for (let k = -2; k <= 2; k++) {
        const dirF = norm(add(add(fore, mul(e2, k * 0.32)), mul(e1, 0.35)));
        put('handL', 'handL', { k: 'rod', a: add(hand, mul(fore, 0.9)), b: add(hand, mul(dirF, 4.2 - Math.abs(k) * 0.5)), ra: 0.42, rb: 0.3, ramp: SKIN, far: true });
      }
    }
  }

  // --- HIS STAFF, planted beside him, a crook at its head and the bell hung in it ---
  const { foot, head, up } = staffOf(s);
  put('staff', 'staff', { k: 'rod', a: foot, b: head, ra: 0.95, rb: 0.8, ramp: STAFF, far: true });
  // the crook: over and down, a hook the bell hangs in
  const side = norm(sub(cl, mul(up, dot(cl, up))), [0, 1, 0]);
  const out = mul(side, -1);
  const hook = [head, add(add(head, mul(up, 2.6)), mul(out, 1.6)), add(add(head, mul(up, 3.0)), mul(out, 4.4)), add(add(head, mul(up, 1.4)), mul(out, 6.6)), add(add(head, mul(up, -1.0)), mul(out, 7.0))];
  for (let i = 1; i < hook.length; i++) put('staff', 'crook', { k: 'rod', a: hook[i - 1], b: hook[i], ra: 0.8, rb: 0.72, ramp: STAFF, far: true });
  // the bell, swinging a little in its hook
  const swing = Math.sin(ph * 2) * 0.12;
  const hang = add(hook[hook.length - 1], [0, 0, -1.2]);
  const bellUp = norm(add(up, mul(out, swing)));
  const bellH = 6.4;
  for (let k = 0; k <= 8; k++) {
    const t = k / 8;
    const c = add(hang, mul(bellUp, -t * bellH));
    const r = bellH * (0.3 + 0.12 * t + 0.3 * Math.pow(t, 4));
    const e1 = norm(cross(bellUp, [1, 0, 0]), [0, 1, 0]);
    const e2 = norm(cross(bellUp, e1));
    put('bell', 'bell', { k: 'ball', c, ax: [mul(e1, r), mul(e2, r), mul(bellUp, 0.9)], skin: k === 8 ? () => HOLLOW : BRONZE });
  }

  // --- HIS PIPES, rising from between his shoulder blades in a fan behind his head; their mouths glowing with his breath ---
  const pipes = pipesOf(s);
  const root0 = pipeRoot(s);
  pipes.forEach(({ foot: pf, top, r }, i) => {
    // its body, straight; its foot narrowing to the bone it grows from
    put('pipes', `pipe${i}`, { k: 'rod', a: lerp3(pf, top, 0.16), b: top, ra: r, rb: r, ramp: PIPE, far: true });
    put('pipes', `pipe${i}`, { k: 'rod', a: pf, b: lerp3(pf, top, 0.16), ra: r * 0.55, rb: r, ramp: PIPE, far: true });
    // its open top: dark, and the cult's fire glowing in it as he breathes and sings
    const dir = norm(sub(top, pf));
    // its mouth, the slot cut in its back near its foot, as an organ pipe's (seen from behind him), burning as he sings
    const slot = add(lerp3(pf, top, 0.24), mul(root0.back, r * 0.95));
    put('pipes', `slot${i}`, { k: 'dot', p: slot, c: sing > 0.4 ? FLAME[2] : HOLLOW, facing: root0.back, c2: sing > 0.4 ? FLAME[1] : HOLLOW });
    const e1 = norm(cross(dir, [1, 0, 0]), [0, 1, 0]);
    const e2 = norm(cross(dir, e1));
    // (its open top: the dark inside it, and the cult's fire in it)
    put('pipes', `lip${i}`, { k: 'rod', a: add(top, mul(dir, -1.2)), b: add(top, mul(dir, -0.3)), ra: r * 1.2, rb: r * 1.2, ramp: PIPE, far: true });
    put('pipes', `mouth${i}`, { k: 'ball', c: add(top, mul(dir, 0.5)), ax: [mul(e1, r * 1.0), mul(e2, r * 1.0), mul(dir, 0.15)], skin: () => (sing > 0.55 ? FLAME[2] : sing > 0.2 ? FLAME[1] : HOLLOW) });
    if (sing > 0.15) put('glow', 'glow', { k: 'glow', p: add(top, mul(dir, 2)), c: FLAME[2], r: 6 + 6 * sing, a: 0.22 + 0.28 * sing });
  });
  // the bone they grow from, through his mantle at his back
  const root = pipeRoot(s);
  put('pipes', 'root', { k: 'ball', c: add(root.at, mul(root.back, 0.4)), ax: [mul(root.left, 9.4), mul(root.back, 2.8), mul(root.up, 3.4)], skin: PIPE });

  // --- HIS HEAD: long, gaunt, hairless; his eyes the cult's pink; his mouth a dark slot that burns when he sings ---
  const [ff, fl, fu] = s.face;
  const hr = B.headR;
  const hc = add(s.head, mul(fu, 0.6));
  // (his eyes sunk in dark sockets under a hard brow; his cheeks hollow)
  const headSkin = (u: V3, tone: number): string => {
    if (u[0] > 0.5 && Math.abs(Math.abs(u[1]) - 0.42) < 0.24 && u[2] > -0.12 && u[2] < 0.26) return SKIN[0];
    if (u[0] > 0.55 && Math.abs(u[1]) > 0.5 && u[2] < -0.2) return SKIN[Math.min(tone, 2)];
    return SKIN[tone];
  };
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0] * 0.92), mul(fl, hr[1] * 0.88), mul(fu, hr[2] * 1.12)], skin: headSkin });
  // his hard brow over the sockets, and his long hooked nose
  put('head', 'brow', { k: 'rod', a: add(add(add(hc, mul(ff, hr[0] * 0.7)), mul(fu, hr[2] * 0.3)), mul(fl, hr[1] * 0.55)), b: add(add(add(hc, mul(ff, hr[0] * 0.7)), mul(fu, hr[2] * 0.3)), mul(fl, -hr[1] * 0.55)), ra: 0.7, rb: 0.7, ramp: SKIN });
  put('head', 'nose', { k: 'rod', a: add(add(hc, mul(ff, hr[0] * 0.82)), mul(fu, hr[2] * 0.12)), b: add(add(hc, mul(ff, hr[0] * 1.2)), mul(fu, -hr[2] * 0.32)), ra: 0.65, rb: 0.45, ramp: SKIN });
  // his long jaw and hollow cheeks
  const jawC = add(add(hc, mul(ff, hr[0] * 0.38)), mul(fu, -hr[2] * 0.72));
  put('head', 'jaw', { k: 'ball', c: jawC, ax: [mul(ff, hr[0] * 0.6), mul(fl, hr[1] * 0.62), mul(fu, hr[2] * 0.5)], skin: SKIN });
  // his neck, long and corded
  put('neck', 'neck', { k: 'rod', a: s.neck, b: add(hc, mul(fu, -hr[2] * 0.6)), ra: 1.5, rb: 1.3, ramp: SKIN, far: true });
  // his eyes: deep, the cult's pink
  for (const sd of [1, -1]) {
    // (on the skull's face: its point that far round, pushed out to its skin)
    const e = add(add(add(hc, mul(ff, hr[0] * 0.92 * 0.93)), mul(fl, sd * hr[1] * 0.88 * 0.4)), mul(fu, hr[2] * 1.12 * 0.06));
    put('head', `eye${sd}`, { k: 'dot', p: e, c: lit > 0.3 ? SOCKET : INK, facing: ff, c2: lit > 0.3 ? FLAME[1] : INK });
    if (lit > 0.3) put('glow', 'glow', { k: 'glow', p: e, c: SOCKET, r: 4, a: 0.35 * lit });
  }
  // his mouth: a dark slot, burning when he sings
  const mouthP = add(add(jawC, mul(ff, hr[0] * 0.62)), mul(fu, -hr[2] * 0.06));
  put('head', 'mouth', { k: 'dot', p: mouthP, c: sing > 0.6 ? FLAME[3] : sing > 0.25 ? FLAME[1] : HOLLOW, facing: ff, c2: HOLLOW });

  return bits;
}

// =============================================================================================
// HIM AS A MONSTER OF THE BONES (his moves to come: his stand for each, for now)

const NAME_STAND = 'The Cantor stands over his flock';
function move(name: string, motion: Motion): MobMove {
  return { name, motion, rest: CANTOR_REST };
}

export const CANTOR: Mob = {
  id: 'cantor',
  name: 'The Cantor',
  size: 'a boss: tall and gaunt, half again the knight',
  build: B,
  stand: move(NAME_STAND, cantorStand()),
  attack: move(NAME_STAND, cantorStand()),
  idleFrames: 32,
  idleFps: 10,
  walk: { ...move(NAME_STAND, cantorStand()), period: CANTOR_STAND_LONG, ground: 0 },
  walkFrames: 16,
  walkFps: 16,
  pace: 0.9,
  reel: move(NAME_STAND, cantorStand()),
  reelTime: 0.4,
  hit: 0.6,
  warn: 0.3,
  dieTime: 2.0,
  dying: move(NAME_STAND, cantorStand()),
  aura: { x: CANTOR_CANVAS.ax, y: CANTOR_CANVAS.ay - 120, r: 110, color: '#ff3a78', a: 0.14 },
  shadow: 30,
  canvas: CANTOR_CANVAS,
  trueBack: true,
  bits: (st, m) => cantorBits(st, m),
};
void TILE3;
void fr;
void sphere;

/** One picture of him standing, `t` seconds into his breath, as the game holds a figure. */
export function cantorStanding(t: number, view: GameView = 'front'): Sprite {
  return toSprite(paintMob(CANTOR, 'stand', t, view, ENEMY_RIM), null, CANTOR_CANVAS.ax, CANTOR_CANVAS.ay);
}
/** The same, as painted (for the checks). */
export function cantorPainted(t: number, view: GameView = 'front', which = 'stand'): Painted {
  return paintMob(CANTOR, which, t, view, ENEMY_RIM);
}
