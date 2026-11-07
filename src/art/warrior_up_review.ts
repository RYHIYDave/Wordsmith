// THE WARRIOR BROUGHT UP, AS THE BOSSES' REVIEW SEES HIM (the art chat's helper, 6 Nov 2026). A MOCK-UP TOOL: nothing of the
// game imports this file (tests/warrior_up.test.ts holds that). It hands his new moves (art/warrior_up_moves.ts) to the review
// every boss and mob goes through (art/boss_checks.ts checkBoss; his rulebook's How art is made 7), every frame the game shows
// of each, from in front and from behind: his outside as painted (art/warrior_up.ts), the great sword he carries, its point as
// the end he strikes with, each Movement 9 strike and its smear, and the game's step on each swing of Strike.

import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import type { Mob, MobMove } from './new_mobs3';
import { GREAT_BLADE, GRIP_SPEED, KNIGHT_BODY, UNITS_PER_TILE } from './moves3';
import type { Move3 } from './moves3';
import { add, bonesAt, mul, solve, trunkOf } from './skeleton';
import type { Posed, Skeleton, V3 } from './skeleton';
import { wuSmeared } from './warrior_up_art';
import { WU_MAIL, WU_SPIN, spun, turnedStage } from './warrior_up';
import { onBack } from './carried';
import { girdle, stage } from './skin';
import type { WuSide } from './warrior_up';
import type { WuFrame } from './warrior_up';
import { primDist } from '../dev/sculpt';
import { WU_DRAW3, WU_FALL3, WU_LOOK3, WU_LURCH3, WU_REAR3, WU_REEL3, WU_RUN3, WU_SLAM3, WU_SLASH3, WU_STRIKE3, WU_STRIKE_POISE, WU_THRUST3, WU_TOWN3, WU_TOWN_RUN3, WU_WHIRL3, swingCarried } from './warrior_up_moves';

const FR = 1 / 30;
const B = KNIGHT_BODY;
const mv = (m: Move3): MobMove => ({ name: m.name, motion: m.motion, rest: m.rest });
/** A run as the game shows it: carried over the floor at the game's pace (4.6 tiles a second), a turn of it in its own time (the
 * game's knight's run is played by the clock, half a second a turn: it has no stride to grip by). */
const walking = (m: Move3): MobMove => ({ ...mv(m), ground: GRIP_SPEED * UNITS_PER_TILE, period: m.stride !== undefined ? m.stride / GRIP_SPEED : m.motion.keys[m.motion.keys.length - 1].at });

/** His class card's lists: painted from in front only (art/warrior_up_art.ts setOf), and so held to every check from there. */
export const WU_FRONT_ONLY: readonly string[] = ['kdraw', 'klook'];
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
    walkFrames: 15,
    walkFps: 30,
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
  // (his class card's lists, drawing his sword and looking about him, are painted from in front only, as the card shows him:
  // art/warrior_up_art.ts setOf. From every other side the review looks at the rest)
  return { mob, shape, moves: Object.keys(WU_REVIEWED).filter((k) => side === 'front' || !WU_FRONT_ONLY.includes(k)) };
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

// ---------------------------------------------------------------------------------------------
// HIS LEGS AS THE SCREEN SHOWS THEM (the owner, 6 Nov 2026, of the Ranger: “Can you make sure his leg ratio is correct cause it
// seems like all these guys have long upper legs and short legs below the knee”; tools/legs_measure.ts)

/** Each of his legs as one of his sides draws it, in game pixels (two picture pixels to one): hip to knee, and knee to the floor
 * (the shin to the ankle, and the ankle's own height above the sole under it); and how near the eye its knee is. */
export interface WuLeg {
  leg: 'L' | 'R';
  thigh: number;
  lower: number;
  /** lower / thigh. */
  ratio: number;
  /** How much of its shin the picture shows (0 to 1): points down it from the knee to the ankle not hidden behind something
   * nearer the eye (the other leg, his body, his sword); 1 when no picture is given. */
  seen: number;
}
/** How thick a shin is in its greave (its radius, and its calf). */
const SHIN_SKIN = 3.8;
const legStages = new Map<WuSide, (p: V3) => readonly [number, number]>();
export function wuLegs(s: Skeleton, side: WuSide, ankleUp = KNIGHT_BODY.ankle, picture?: { z: Float32Array; w: number; h: number }): WuLeg[] {
  let at = legStages.get(side);
  if (!at) {
    const { spin, camera } = WU_SPIN[side];
    const st = turnedStage(stage(camera, WU_SPIN[side].ax), spin);
    at = (p: V3) => st.at(p);
    legStages.set(side, at);
  }
  const d = (a: V3, b: V3): number => {
    const [x0, y0] = (at as (p: V3) => readonly [number, number])(a);
    const [x1, y1] = (at as (p: V3) => readonly [number, number])(b);
    return Math.hypot(x1 - x0, y1 - y0) / 2;
  };
  const { spin, camera } = WU_SPIN[side];
  const st = turnedStage(stage(camera, WU_SPIN[side].ax), spin);
  const seenOf = (knee: V3, ankle: V3): number => {
    if (!picture) return 1;
    // (a shin seen along its length shows its face further toward the eye than its middle: by its greave's thickness over the
    // sine of the angle it makes with the eye's line)
    const long = Math.hypot(ankle[0] - knee[0], ankle[1] - knee[1], ankle[2] - knee[2]) || 1;
    const along = Math.min(0.95, Math.abs(st.near(ankle) - st.near(knee)) / long);
    const skin = SHIN_SKIN / Math.sqrt(1 - along * along) + 1.5;
    let n = 0;
    const N = 7;
    for (let i = 1; i <= N; i++) {
      const p: V3 = [knee[0] + ((ankle[0] - knee[0]) * i) / (N + 1), knee[1] + ((ankle[1] - knee[1]) * i) / (N + 1), knee[2] + ((ankle[2] - knee[2]) * i) / (N + 1)];
      const [x, y] = st.at(p);
      const X = Math.round(x);
      const Y = Math.round(y);
      if (X < 0 || Y < 0 || X >= picture.w || Y >= picture.h) continue;
      // (the shin's own skin is nearer the eye than its middle by its greave's thickness: anything nearer still hides it)
      if (picture.z[Y * picture.w + X] <= st.near(p) + skin) n++;
    }
    return n / N;
  };
  const leg = (name: 'L' | 'R', hip: V3, knee: V3, ankle: V3): WuLeg => {
    const thigh = d(hip, knee);
    const lower = d(knee, ankle) + d(ankle, [ankle[0], ankle[1], ankle[2] - ankleUp]);
    return { leg: name, thigh, lower, ratio: lower / thigh, seen: seenOf(knee, ankle) };
  };
  return [leg('L', s.hipL, s.kneeL, s.ankleL), leg('R', s.hipR, s.kneeR, s.ankleR)];
}

/**
 * WHERE HIS LEGS MUST READ TRUE: every frame of his stances, and of each pose he holds (frames, at 30 a second), at 1.05 or more
 * (his lower leg on the screen at least 1.05 times his thigh; side-on, a pose whose thigh lies level, 1); his runs (at 60 a
 * second) at 1 or more wherever a foot is flat on the floor, bearing him. Each leg from each of his eight sides where at least half its shin is seen.
 */
export const WU_LEGS_HELD: ReadonlyArray<{ key: string; what: string; from: number; to: number; sideOn?: number }> = [
  { key: 'rear', what: 'his guard', from: 0, to: 59 },
  { key: 'ktown', what: 'his town stance', from: 0, to: 71 },
  { key: 'klook', what: 'looking about him in town', from: 0, to: 108 },
  { key: 'kdraw', what: "his card's ready, in his guard", from: 31, to: 41 },
  { key: 'strike', what: "Strike's held wind-up", from: 6, to: 8 },
  { key: 'strike', what: 'the first swing held up, waiting', from: 20, to: 21 },
  { key: 'kslash', what: "the second swing's held wind-up", from: 6, to: 8 },
  { key: 'slam', what: "the Slam's held wind-up", from: 11, to: 13 },
  { key: 'slam', what: "the Slam's landing", from: 15, to: 17 },
  // (two poses whose front thigh lies level by their nature, the Lunge's deep landing and the kneel: seen side-on, the game's
  // camera, looking down, draws a level length 1.15 times as long as an upright one, so a level thigh over an upright shin reads
  // about as long as it, and no place of the feet or knees changes that, only lifting his hips would. Held there to 1)
  { key: 'kthrust', what: "the Lunge's landing", from: 17, to: 21, sideOn: 1 },
  { key: 'kfall', what: 'the kneel in his fall', from: 21, to: 46, sideOn: 1 },
];
/** His runs, held to the measure of his legs: none now. His runs are the game's own (art/warrior_up_moves.ts WU_RUN3), and the
 * owner's word is that they move as they used to: their legs are measured and reported (README, "His run, as he used to"), not
 * held (`wuRunLegs`). */
export const WU_LEGS_RUNS: readonly string[] = [];
/** At least this much of a shin seen, for its leg to be held to the measure from that side. */
export const WU_LEG_SEEN = 0.5;
export const WU_LEG_HELD_LEAST = 1.05;
export const WU_LEG_RUN_LEAST = 1;
/** What is wrong with his legs in one picture of him: the move's short name, and the frame (at 30 a second; a run's at 60). */
export function wuLegFaults(key: string, frame: number, f: WuFrame, side: WuSide): string[] {
  const held = WU_LEGS_HELD.filter((h) => h.key === key && frame >= h.from && frame <= h.to);
  const runs = WU_LEGS_RUNS.includes(key);
  if (!held.length && !runs) return [];
  const out: string[] = [];
  for (const l of wuLegs(f.s, side, KNIGHT_BODY.ankle, { z: f.drawn.z, w: f.px.w, h: f.px.h })) {
    if (l.seen < WU_LEG_SEEN) continue;
    if (runs) {
      const toe = l.leg === 'L' ? f.s.toeL : f.s.toeR;
      const heel = l.leg === 'L' ? f.s.heelL : f.s.heelR;
      if (Math.max(toe[2], heel[2]) > 0.6) continue;
      if (l.ratio < WU_LEG_RUN_LEAST) out.push(`${key} ${frame}/60 ${side}: his ${l.leg === 'L' ? 'left' : 'right'} leg, bearing him, ${l.ratio.toFixed(2)}`);
    } else {
      const sideOn = side === 'side' || side === 'sideL';
      const least = Math.min(...held.map((h) => (sideOn && h.sideOn !== undefined ? h.sideOn : WU_LEG_HELD_LEAST)));
      if (l.ratio < least) out.push(`${key} ${frame} (${held[0].what}) ${side}: his ${l.leg === 'L' ? 'left' : 'right'} leg ${l.ratio.toFixed(2)}`);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// HOW MUCH OF HIS SWORD IS SEEN, at the game's size: a measure, reported (README). Held where the game holds it, low and trailing
// behind him (below), the blade is hidden by him from some of his sides; the owner's word is that it stays there: “Don't lift
// the sword”, as the coordinator put it.

/** The blade's light: its two lightest tones (art/kit.ts BLADE: used for nothing else). */
const GLOW = [[0x8a, 0xf6, 0xf0], [0xff, 0xff, 0xff]] as const;
/** How much of the blade's light is seen in one picture of him: game pixels of it, and whether its point is among them. */
export function wuBladeSeen(f: WuFrame): { seen: number; point: boolean } {
  const { d, w, h } = f.px;
  const lit = (x: number, y: number): number => {
    if (x < 0 || y < 0 || x >= w || y >= h) return 0;
    const i = (y * w + x) * 4;
    if (d[i + 3] === 0) return 0;
    return GLOW.some((c) => d[i] === c[0] && d[i + 1] === c[1] && d[i + 2] === c[2]) ? 1 : 0;
  };
  let seen = 0;
  for (let y = 0; y + 1 < h; y += 2) for (let x = 0; x + 1 < w; x += 2) if (lit(x, y) + lit(x + 1, y) + lit(x, y + 1) + lit(x + 1, y + 1) >= 2) seen++;
  // (its point: the blade's light within three pixels of the last two of its length)
  const { x0, y0, x1, y1 } = f.blade;
  const L = Math.hypot(x1 - x0, y1 - y0) || 1;
  const px = x1 - ((x1 - x0) / L) * 2;
  const py = y1 - ((y1 - y0) / L) * 2;
  let n = 0;
  for (let y = Math.floor(py - 3); y <= Math.ceil(py + 3); y++) for (let x = Math.floor(px - 3); x <= Math.ceil(px + 3); x++) if (Math.hypot(x + 0.5 - px, y + 0.5 - py) <= 3) n += lit(x, y);
  return { seen, point: n >= 2 };
}

/**
 * HIS SWORD WHERE THE GAME HOLDS IT (the owner, 7 Nov 2026: “His sword is too high and when he runs it's up at his neck.  You have
 * a picture for sword stances as a reference”; docs/ref/two_handed_stances_from_owner_2026-10-06.jpg, his “Rear stance”: side-on,
 * both hands low at his right hip, the blade trailing down and back behind him). In his guard and his runs (where his sword is in
 * his hands): his hands at or below his belt, and the point of the blade below its hilt and behind him.
 */
export const WU_SWORD_LOW: readonly string[] = ['rear', 'krun'];
/** The top of his belt, as he is painted (art/warrior_up.ts: the belt round the tabard at his waist, 1.25 either side of its
 * middle), and the bottom of his chest (his ribs). */
export function wuBeltTop(s: Skeleton): number {
  return girdle(trunkOf(B, s)[2], 0.55, 1.6).c[2] + 1.25;
}
export function wuChestBottom(s: Skeleton): number {
  const [ribs] = trunkOf(B, s);
  return ribs.c[2] - ribs.h[2];
}
/** What is wrong with where his sword is held in one moment: in his guard a hand above his belt; in his run (the game's own, whose
 * left hand rides on the hilt a little above his belt) a hand up at his chest; and in both the point not below the hilt, or not
 * behind him (the way his hips face). */
export function wuSwordLowFaults(key: string, frame: number, s: Skeleton, q: Posed): string[] {
  if (!WU_SWORD_LOW.includes(key) || q.stow > 0.5) return [];
  const out: string[] = [];
  const top = key === 'krun' ? wuChestBottom(s) : wuBeltTop(s);
  const where = key === 'krun' ? 'up at his chest' : 'above his belt';
  for (const [name, h] of [['right', s.handR], ['left', s.handL]] as const) if (h[2] > top) out.push(`${key} ${frame}: his ${name} hand ${where} (${(h[2] - top).toFixed(1)})`);
  const w = wuSword(s, q);
  if (w.tip[2] >= w.guard[2]) out.push(`${key} ${frame}: the point not below the hilt`);
  const f = s.hips[0];
  if ((w.tip[0] - w.guard[0]) * f[0] + (w.tip[1] - w.guard[1]) * f[1] >= 0) out.push(`${key} ${frame}: the point not behind him`);
  return out;
}

/** IN TOWN, HIS SWORD ON HIS BACK AS THE GAME HAS IT (art/carried.ts onBack: its hilt up over his right shoulder, its point down
 * behind him): what is wrong with it in one moment of a town list where it is put away. */
export function wuStowedFaults(key: string, frame: number, s: Skeleton, q: Posed): string[] {
  if (q.stow <= 0.5) return [];
  const w = wuSword(s, q);
  const game = onBack(B, s, 'sword');
  const out: string[] = [];
  if (Math.hypot(w.grip[0] - game.grip[0], w.grip[1] - game.grip[1], w.grip[2] - game.grip[2]) > 1e-6) out.push(`${key} ${frame}: not where the game has it`);
  if (w.grip[2] < s.shoulderR[2]) out.push(`${key} ${frame}: its hilt below his shoulder`);
  if (w.tip[2] >= w.grip[2]) out.push(`${key} ${frame}: its point not down`);
  if ((w.tip[0] - s.neck[0]) * s.chest[0][0] + (w.tip[1] - s.neck[1]) * s.chest[0][1] >= 0) out.push(`${key} ${frame}: its point not behind him`);
  return out;
}

// ---------------------------------------------------------------------------------------------
// A KNEE COME UP (the owner, 7 Nov 2026: “why is he high stepping with his knees up?”): each leg whose foot is off the floor, how
// far its thigh is from hanging straight down. His runs are the game's own now (the owner: “Just make him move like he used
// to.”): this measures them, and is reported (README); it does not hold them.

/** The most a swinging thigh was to be from hanging straight down in a run: the measure the game's run is reported against. */
export const WU_THIGH_MOST = 50;
/** Each of his thighs: how many degrees it is from hanging straight down (from the hip joint to the knee joint, as he truly is: the
 * same from every side he is seen from), and whether its foot is off the floor (its heel and its toe both above it). */
export function wuThighs(s: Skeleton): { leg: 'L' | 'R'; deg: number; swinging: boolean }[] {
  return (['L', 'R'] as const).map((leg) => {
    const h = leg === 'L' ? s.hipL : s.hipR;
    const k = leg === 'L' ? s.kneeL : s.kneeR;
    const v: V3 = [k[0] - h[0], k[1] - h[1], k[2] - h[2]];
    const deg = (Math.acos(Math.max(-1, Math.min(1, -v[2] / (Math.hypot(...v) || 1)))) * 180) / Math.PI;
    const toe = leg === 'L' ? s.toeL : s.toeR;
    const heel = leg === 'L' ? s.heelL : s.heelR;
    return { leg, deg, swinging: Math.min(toe[2], heel[2]) > 0.6 };
  });
}
/** The most a swinging thigh comes up in a run (every frame of a turn of it, at `fps`), degrees from hanging straight down. */
export function wuThighMost(m: Move3, fps: number): number {
  const end = m.motion.keys[m.motion.keys.length - 1].at;
  let most = 0;
  for (let i = 0; i < Math.round(end * fps); i++) {
    const s = solve(m.build, bonesAt(m.motion.keys, m.rest, i / fps));
    for (const t of wuThighs(s)) if (t.swinging) most = Math.max(most, t.deg);
  }
  return most;
}
