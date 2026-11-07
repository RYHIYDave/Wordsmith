// THE WARRIOR BROUGHT UP, AS THE BOSSES' REVIEW SEES HIM (the art chat's helper, 6 Nov 2026). A MOCK-UP TOOL: nothing of the
// game imports this file (tests/warrior_up.test.ts holds that). It hands his new moves (art/warrior_up_moves.ts) to the review
// every boss and mob goes through (art/boss_checks.ts checkBoss; his rulebook's How art is made 7), every frame the game shows
// of each, from in front and from behind: his outside as painted (art/warrior_up.ts), the great sword he carries, its point as
// the end he strikes with, each Movement 9 strike and its smear, and the game's step on each swing of Strike.

import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import type { Mob, MobMove } from './new_mobs3';
import { GREAT_BLADE, GRIP_SPEED, KNIGHT_BODY, UNITS_PER_TILE } from './moves3';
import type { Move3 } from './moves3';
import { onBack } from './carried';
import { add, mul, trunkOf } from './skeleton';
import type { Posed, Skeleton, V3 } from './skeleton';
import { wuSmeared } from './warrior_up_art';
import { WU_MAIL, WU_SPIN, spun } from './warrior_up';
import type { WuSide } from './warrior_up';
import type { WuFrame } from './warrior_up';
import { primDist } from '../dev/sculpt';
import { WU_DRAW3, WU_FALL3, WU_LOOK3, WU_LURCH3, WU_REAR3, WU_REEL3, WU_RUN3, WU_SLAM3, WU_SLASH3, WU_STRIKE3, WU_STRIKE_POISE, WU_THRUST3, WU_TOWN3, WU_TOWN_RUN3, WU_WHIRL3, swingCarried } from './warrior_up_moves';

const FR = 1 / 30;
const B = KNIGHT_BODY;
const mv = (m: Move3): MobMove => ({ name: m.name, motion: m.motion, rest: m.rest });
const walking = (m: Move3): MobMove => ({ ...mv(m), ground: GRIP_SPEED * UNITS_PER_TILE, period: (m.stride ?? 1) / GRIP_SPEED });

/** His moves under the review's names (the stand, walk, attack, reel and dying, and the rest by the game's own short names). */
export const WU_REVIEWED: Readonly<Record<string, Move3>> = {
  stand: WU_REAR3, walk: WU_RUN3, attack: WU_STRIKE3, reel: WU_REEL3, dying: WU_FALL3,
  kslash: WU_SLASH3, slam: WU_SLAM3, whirl: WU_WHIRL3, kthrust: WU_THRUST3, klurch: WU_LURCH3,
  ktown: WU_TOWN3, ktownrun: WU_TOWN_RUN3, klook: WU_LOOK3, kdraw: WU_DRAW3,
};

/** HIS OUTSIDE AS PAINTED: his legs, greaves and shoes, his arms in mail and steel, his neck and helm; his trunk in the tabard. */
export function wuBody(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [lH, lK] = B.legR;
  const [aS, aE] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    limbs.push({ name: `leg${side}`, a: hip, b: knee, r: lH * 0.9 });
    limbs.push({ name: `shin${side}`, a: knee, b: ankle, r: lK + 0.3 });
    limbs.push({ name: `foot${side}`, a: side === 'L' ? s.heelL : s.heelR, b: side === 'L' ? s.toeL : s.toeR, r: 1.6 });
    limbs.push({ name: `upper${side}`, a: side === 'L' ? s.shoulderL : s.shoulderR, b: side === 'L' ? s.elbowL : s.elbowR, r: aS * 0.9 });
    limbs.push({ name: `fore${side}`, a: side === 'L' ? s.elbowL : s.elbowR, b: side === 'L' ? s.handL : s.handR, r: aE });
  }
  limbs.push({ name: 'neck', a: s.neck, b: s.skull, r: 2.4 });
  // (the snout of his pig-faced helm, out from his face and a little down: art/warrior_up.ts)
  {
    const [hf, , hu] = s.face;
    const R0 = B.headR;
    const root = add(s.head, add(mul(hf, R0[0] * 0.5), mul(hu, -R0[2] * 0.2)));
    const tip = add(s.head, add(mul(hf, R0[0] * 2.65), mul(hu, -R0[2] * 0.6)));
    limbs.push({ name: 'snout', a: root, b: tip, r: 2.0 });
  }
  const [ribs, belly, pel] = trunkOf(B, s);
  const R = B.headR;
  const lumps: CheckLump[] = [
    { name: 'ribs', c: ribs.c, rot: ribs.r, h: [ribs.h[0] + 0.6, ribs.h[1] + 0.6, ribs.h[2]] },
    { name: 'belly', c: belly.c, rot: belly.r, h: [belly.h[0] + 0.6, belly.h[1] + 0.6, belly.h[2]] },
    { name: 'pelvis', c: pel.c, rot: pel.r, h: [pel.h[0] + 0.8, pel.h[1] + 0.8, pel.h[2]] },
    { name: 'head', c: s.head, rot: s.face, h: [R[0] * 1.15, R[1] * 1.2, R[2] * 1.1] },
  ];
  return { limbs, lumps };
}

/** The great sword at a moment: in his hands, or on his back. */
export function wuSword(s: Skeleton, q: Posed): { grip: V3; guard: V3; tip: V3; away: boolean } {
  const away = q.stow > 0.5;
  const c = away ? onBack(B, s, 'sword') : { grip: s.handR, point: s.point };
  const guard = add(c.grip, mul(c.point, 1.3));
  return { grip: c.grip, guard, tip: add(guard, mul(c.point, GREAT_BLADE)), away };
}

/**
 * THE REVIEW OF HIM: the mob the review is given, his shape, and which of his moves (every one). From a SIDE of his other than
 * the two the game has always had (art/warrior_up.ts WuSide), the review follows him as he is turned for it: what it follows
 * from frame to frame (his head, chest, hips, hands, elbows, knees and feet) and the point of his sword, turned, so that its
 * own two views see him from that side; what is in the floor, through him or slides is the same whichever side he is seen from.
 */
export function warriorReview(side: WuSide = 'front'): { mob: Mob; shape: BossShape; moves: string[] } {
  const more: Record<string, MobMove> = {};
  for (const [k, m] of Object.entries(WU_REVIEWED)) if (!['stand', 'walk', 'attack', 'reel', 'dying'].includes(k)) more[k] = k === 'ktownrun' ? walking(m) : mv(m);
  const mob = {
    id: 'warrior_up',
    name: 'the Warrior, brought up',
    size: 'hero',
    build: B,
    stand: mv(WU_REAR3),
    walk: walking(WU_RUN3),
    attack: mv(WU_STRIKE3),
    reel: mv(WU_REEL3),
    dying: mv(WU_FALL3),
    more,
    idleFrames: 60,
    idleFps: 30,
    walkFrames: 27,
    walkFps: 60,
    pace: GRIP_SPEED,
    reelTime: 7 * FR,
    hit: WU_STRIKE3.motion.hit ?? 0,
    warn: 8 * FR,
    dieTime: 46 * FR,
    aura: { x: 0, y: 0, r: 46, color: '#28dcf0', a: 0.2 },
    shadow: 14,
    bits: () => [],
  } as unknown as Mob;
  const swung = new Set(['attack', 'kslash', 'slam', 'whirl', 'kthrust']);
  const turn = WU_SPIN[side].spin;
  const handovers: Handover[] = [
    // (the game's own: Strike from his stance, the second swing from the first's poise, the rest from his stance and back)
    { from: 'stand', at: 0, to: 'attack', toAt: 0 },
    { from: 'attack', at: 'end', to: 'stand', toAt: 0 },
    { from: 'attack', at: WU_STRIKE_POISE, to: 'kslash', toAt: 0 },
    { from: 'kslash', at: 'end', to: 'stand', toAt: 0 },
    { from: 'stand', at: 0, to: 'slam', toAt: 0 },
    { from: 'slam', at: 'end', to: 'stand', toAt: 0 },
    { from: 'stand', at: 0, to: 'reel', toAt: 0 },
    { from: 'reel', at: 'end', to: 'stand', toAt: 0 },
    { from: 'stand', at: 0, to: 'klurch', toAt: 0 },
    { from: 'klurch', at: 'end', to: 'stand', toAt: 0 },
    { from: 'stand', at: 0, to: 'dying', toAt: 0 },
    { from: 'stand', at: 0, to: 'kthrust', toAt: 0 },
    { from: 'kthrust', at: 'end', to: 'stand', toAt: 0 },
    { from: 'ktown', at: 0, to: 'klook', toAt: 0 },
    { from: 'klook', at: 'end', to: 'ktown', toAt: 0 },
    { from: 'ktown', at: 0, to: 'kdraw', toAt: 0 },
  ];
  const shape: BossShape = {
    body: (s) => wuBody(s),
    things: (_which, _t, s, q) => {
      const w = wuSword(s, q);
      // (the blade from its guard to its point; what holds it, his hands, may touch it; on his back it lies on him)
      const pts: V3[] = [];
      for (let i = 0; i <= 8; i++) pts.push(add(w.guard, mul(add(w.tip, mul(w.guard, -1)), i / 8)));
      return [{ name: 'sword', pts, r: 1.2, may: w.away ? ['ribs', 'belly', 'pelvis', 'upperR', 'foreR', 'upperL', 'foreL', 'neck', 'head', 'legL', 'legR'] : ['foreR', 'foreL'] } as CheckThing];
    },
    tip: (which, _t, s, q) => (swung.has(which) ? spun(wuSword(s, q).tip, turn) : null),
    ...(turn ? { follow: (_w: string, _t: number, s: Skeleton) => ({ head: spun(s.head, turn), chest: spun(s.ribs, turn), pelvis: spun(s.pelvis, turn), handL: spun(s.handL, turn), handR: spun(s.handR, turn), elbowL: spun(s.elbowL, turn), elbowR: spun(s.elbowR, turn), kneeL: spun(s.kneeL, turn), kneeR: spun(s.kneeR, turn), toeL: spun(s.toeL, turn), toeR: spun(s.toeR, turn), heelL: spun(s.heelL, turn), heelR: spun(s.heelR, turn) }) } : {}),
    strikes: { attack: [8 * FR, 10 * FR], kslash: [8 * FR, 10 * FR], slam: [13 * FR, 15 * FR] },
    smeared: (which, t) => wuSmeared(WU_REVIEWED[which], t),
    carried: (which, t) => (which === 'attack' || which === 'kslash' ? swingCarried(t) : 0),
    handovers,
  };
  return { mob, shape, moves: Object.keys(WU_REVIEWED) };
}

// ---------------------------------------------------------------------------------------------
// NOTHING OF HIM THROUGH WHAT HE WEARS (as tests/veteran_checks.ts coverFindings): in one picture of him, every pixel of his MAIL
// (what he wears under the rest: his thighs, his upper arms, his coif) is put back where it is on him (the point of him the eye
// sees there), and asked whether it lies INSIDE something worn over it: the tabard on his trunk, its skirt closed round his hips
// and its panels, each pauldron's lames, the scarf round his neck. A pixel of mail seen from inside one of those is mail come
// through it. Not one may be.

/** How far inside a thing worn a point of mail must be to be through it (the figure's own lengths: past the melt of their edges). */
export const WU_THROUGH = 0.6;
const COVERING = new Set(['ribs', 'belly', 'pelvis', 'skirt', 'panel', 'cap', 'wrap', 'knot']);

/** For one picture of him (art/warrior_up.ts paintWarriorUp's): for each thing worn, how many pixels of his mail show from inside it (and where the first is). */
export function wuCoverFindings(f: WuFrame, ax: number, ay: number): string[] {
  const d = f.drawn;
  const w = d.px.w;
  const mail = f.sc.mats.findIndex((m) => m.ramp === WU_MAIL);
  const covers = f.sc.prims.filter((q) => !q.carve && COVERING.has(q.tag ?? '') && (q.tag !== 'lame' || q.piece.startsWith('pauld')));
  const found = new Map<string, { n: number; first: string }>();
  for (let k = 0; k < d.stuff.length; k++) {
    if (d.stuff[k] !== mail || d.px.d[k * 4 + 3] === 0) continue;
    const x = k % w;
    const y = (k - x) / w;
    const sx = x + 0.5 - ax;
    const sy = y + 0.5 - ay;
    const t = d.z[k];
    const bk = d.st.back;
    // (back to him as he is built, from as he was turned for this side)
    const p: V3 = spun([bk[0][0] * sx + bk[0][1] * sy + bk[0][2] * t, bk[1][0] * sx + bk[1][1] * sy + bk[1][2] * t, bk[2][0] * sx + bk[2][1] * sy + bk[2][2] * t], -f.spin);
    for (const q of covers) {
      if (primDist(q, p) >= -WU_THROUGH) continue;
      const by = q.piece.startsWith('pauld') ? 'a pauldron' : q.piece === 'scarf' ? 'his scarf' : q.piece === 'skirt' ? 'the skirt of his tabard' : 'his tabard';
      const e = found.get(by);
      if (e) e.n++;
      else found.set(by, { n: 1, first: `at ${x},${y}` });
      break;
    }
  }
  return [...found].map(([by, e]) => `${e.n} pixels of mail through ${by} (${e.first})`);
}
