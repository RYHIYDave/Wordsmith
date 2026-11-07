// THE RANGER BROUGHT UP, AS THE BOSSES' REVIEW SEES HIM (the art chat's helper, 7 Nov 2026). A MOCK-UP TOOL: nothing of the game
// imports this file (tests/ranger_up.test.ts holds that). As art/warrior_up_review.ts does the Warrior: his new moves
// (art/ranger_up_moves.ts) handed to the review every boss and mob goes through (art/boss_checks.ts checkBoss), from each of his
// eight sides; and the measures the owner's last words asked for: his legs true (warrior_up_review.ts wuLegs, on his build), no
// knee come up in his runs (wuThighs), and his bow seen from every side.

import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import type { Mob, MobMove } from './new_mobs3';
import { BOW_BRACE, BOW_HALF, GRIP_SPEED, RANGER_BODY, UNITS_PER_TILE } from './moves3';
import type { Move3 } from './moves3';
import { add, mul, trunkOf } from './skeleton';
import type { Posed, Skeleton, V3 } from './skeleton';
import { WU_SPIN, spun } from './warrior_up';
import type { WuSide } from './warrior_up';
import { ruSmeared } from './ranger_up_art';
import type { RuFrame } from './ranger_up';
import { wuLegs, wuThighs, WU_LEG_SEEN, WU_THIGH_MOST } from './warrior_up_review';
import { ruOnBack, RU_DRAW3, RU_FALL3, RU_LURCH3, RU_REEL3, RU_ROLL3, RU_ROLL_CARRY, RU_RUN3, RU_SHOT3, RU_SHOT_HIT, RU_SIGHTING3, RU_SQUIRREL3, RU_STAND3, RU_TOWN3, RU_TOWN_RUN3, RU_TSIGHTING3, RU_TSQUIRREL3, RU_VOLLEY3, RU_VOLLEY_HIT } from './ranger_up_moves';

const FR = 1 / 30;
const B = RANGER_BODY;
const mv = (m: Move3): MobMove => ({ name: m.name, motion: m.motion, rest: m.rest });
const walking = (m: Move3): MobMove => ({ ...mv(m), ground: GRIP_SPEED * UNITS_PER_TILE, period: (m.stride ?? 1) / GRIP_SPEED });

/** What he does when left standing and his card's unslinging: painted from in front only (art/ranger_up_art.ts setOf), as the
 * game shows them (it turns him to face the camera for them), and so reviewed from there. */
export const RU_FRONT_ONLY: readonly string[] = ['squirrel', 'sighting', 'tsquirrel', 'tsighting', 'rdraw'];
export const RU_REVIEWED: Readonly<Record<string, Move3>> = {
  stand: RU_STAND3, walk: RU_RUN3, attack: RU_SHOT3, reel: RU_REEL3, dying: RU_FALL3,
  volley: RU_VOLLEY3, roll: RU_ROLL3, rlurch: RU_LURCH3, rtown: RU_TOWN3, rtownrun: RU_TOWN_RUN3,
  squirrel: RU_SQUIRREL3, sighting: RU_SIGHTING3, tsquirrel: RU_TSQUIRREL3, tsighting: RU_TSIGHTING3, rdraw: RU_DRAW3,
};

/** HIS OUTSIDE AS PAINTED: his legs in hose and soft boots, his arms, his neck and head; his trunk in the jerkin. */
export function ruBody(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [lH, lK] = B.legR;
  const [aS, aE] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    limbs.push({ name: `leg${side}`, a: side === 'L' ? s.hipL : s.hipR, b: side === 'L' ? s.kneeL : s.kneeR, r: lH * 0.9 });
    limbs.push({ name: `shin${side}`, a: side === 'L' ? s.kneeL : s.kneeR, b: side === 'L' ? s.ankleL : s.ankleR, r: lK + 0.2 });
    limbs.push({ name: `foot${side}`, a: side === 'L' ? s.heelL : s.heelR, b: side === 'L' ? s.toeL : s.toeR, r: 1.5 });
    limbs.push({ name: `upper${side}`, a: side === 'L' ? s.shoulderL : s.shoulderR, b: side === 'L' ? s.elbowL : s.elbowR, r: aS * 0.9 });
    limbs.push({ name: `fore${side}`, a: side === 'L' ? s.elbowL : s.elbowR, b: side === 'L' ? s.handL : s.handR, r: aE });
  }
  limbs.push({ name: 'neck', a: s.neck, b: s.skull, r: 1.8 });
  const [ribs, belly, pel] = trunkOf(B, s);
  const R = B.headR;
  const lumps: CheckLump[] = [
    { name: 'ribs', c: ribs.c, rot: ribs.r, h: [ribs.h[0] + 0.5, ribs.h[1] + 0.5, ribs.h[2]] },
    { name: 'belly', c: belly.c, rot: belly.r, h: [belly.h[0] + 0.5, belly.h[1] + 0.5, belly.h[2]] },
    { name: 'pelvis', c: pel.c, rot: pel.r, h: [pel.h[0] + 0.6, pel.h[1] + 0.6, pel.h[2]] },
    { name: 'head', c: s.head, rot: s.face, h: [R[0] * 0.92, R[1] * 0.92, R[2] * 0.9] },
  ];
  return { limbs, lumps };
}

/** His bow at a moment: its grip and its two tips, in his hand or on his back. */
export function ruBow(s: Skeleton, q: Posed): { grip: V3; tips: [V3, V3]; away: boolean } {
  const away = q.stow > 0.5;
  const c = away ? ruOnBack(s) : { grip: s.handL, point: s.point, across: s.across };
  const tip = (sgn: 1 | -1): V3 => add(c.grip, add(mul(c.across, sgn * BOW_HALF * (1 - 0.13 * q.draw)), mul(c.point, -(BOW_BRACE + 0.05 * B.tall * q.draw))));
  return { grip: c.grip, tips: [tip(1), tip(-1)], away };
}

/** THE REVIEW OF HIM from a side of his (as art/warrior_up_review.ts warriorReview). */
export function rangerReview(side: WuSide = 'front'): { mob: Mob; shape: BossShape; moves: string[] } {
  const more: Record<string, MobMove> = {};
  for (const [k, m] of Object.entries(RU_REVIEWED)) if (!['stand', 'walk', 'attack', 'reel', 'dying'].includes(k)) more[k] = k === 'rtownrun' ? walking(m) : mv(m);
  const mob = {
    id: 'ranger_up',
    name: 'the Ranger, brought up',
    size: 'hero',
    build: B,
    stand: mv(RU_STAND3),
    walk: walking(RU_RUN3),
    attack: mv(RU_SHOT3),
    reel: mv(RU_REEL3),
    dying: mv(RU_FALL3),
    more,
    idleFrames: 72,
    idleFps: 30,
    walkFrames: 25,
    walkFps: 60,
    pace: GRIP_SPEED,
    reelTime: 7 * FR,
    hit: RU_SHOT_HIT,
    warn: 7 * FR,
    dieTime: 46 * FR,
    aura: { x: 0, y: 0, r: 46, color: '#28dcf0', a: 0.2 },
    shadow: 14,
    bits: () => [],
  } as unknown as Mob;
  const shot = new Set(['attack', 'volley']);
  const turn = WU_SPIN[side].spin;
  const handovers: Handover[] = [
    { from: 'stand', at: 0, to: 'attack', toAt: 0 },
    { from: 'attack', at: 'end', to: 'stand', toAt: 0 },
    { from: 'stand', at: 0, to: 'volley', toAt: 0 },
    { from: 'volley', at: 'end', to: 'stand', toAt: 0 },
    { from: 'stand', at: 0, to: 'reel', toAt: 0 },
    { from: 'reel', at: 'end', to: 'stand', toAt: 0 },
    { from: 'stand', at: 0, to: 'rlurch', toAt: 0 },
    { from: 'rlurch', at: 'end', to: 'stand', toAt: 0 },
    { from: 'stand', at: 0, to: 'dying', toAt: 0 },
    { from: 'roll', at: 'end', to: 'stand', toAt: 0 },
    { from: 'stand', at: 0, to: 'squirrel', toAt: 0 },
    { from: 'squirrel', at: 'end', to: 'stand', toAt: 0 },
    { from: 'stand', at: 0, to: 'sighting', toAt: 0 },
    { from: 'sighting', at: 'end', to: 'stand', toAt: 0 },
    { from: 'rtown', at: 0, to: 'tsquirrel', toAt: 0 },
    { from: 'tsquirrel', at: 'end', to: 'rtown', toAt: 0 },
    { from: 'rtown', at: 0, to: 'tsighting', toAt: 0 },
    { from: 'tsighting', at: 'end', to: 'rtown', toAt: 0 },
    { from: 'rtown', at: 0, to: 'rdraw', toAt: 0 },
  ];
  const shape: BossShape = {
    body: (s) => ruBody(s),
    things: (_which, _t, s, q) => {
      const b = ruBow(s, q);
      const pts: V3[] = [];
      for (const tip of b.tips) for (let i = 1; i <= 5; i++) pts.push(add(b.grip, mul(add(tip, mul(b.grip, -1)), i / 5)));
      return [{ name: 'bow', pts, r: 0.9, may: b.away ? ['ribs', 'belly', 'pelvis', 'upperR', 'foreR', 'upperL', 'foreL', 'neck', 'head'] : ['foreL', 'foreR', 'upperL'] } as CheckThing];
    },
    // (the end he looses with: his string hand, drawn back to his cheek, held, and flying back as the string goes)
    tip: (which, _t, s) => (shot.has(which) ? spun(s.handR, turn) : null),
    ...(turn ? { follow: (_w: string, _t: number, s: Skeleton) => ({ head: spun(s.head, turn), chest: spun(s.ribs, turn), pelvis: spun(s.pelvis, turn), handL: spun(s.handL, turn), handR: spun(s.handR, turn), elbowL: spun(s.elbowL, turn), elbowR: spun(s.elbowR, turn), kneeL: spun(s.kneeL, turn), kneeR: spun(s.kneeR, turn), toeL: spun(s.toeL, turn), toeR: spun(s.toeR, turn), heelL: spun(s.heelL, turn), heelR: spun(s.heelR, turn) }) } : {}),
    strikes: { attack: [RU_SHOT_HIT - FR, RU_SHOT_HIT], volley: [RU_VOLLEY_HIT - FR, RU_VOLLEY_HIT] },
    // (his roll: the game carries him along the floor through its first `tumble`, so a foot down then goes back with the floor)
    carried: (which, t) => (which === 'roll' ? RU_ROLL_CARRY * Math.min(1, t / (RU_ROLL3.tumble ?? Infinity)) : 0),
    smeared: (which, t) => ruSmeared(RU_REVIEWED[which], t),
    handovers,
  };
  return { mob, shape, moves: Object.keys(RU_REVIEWED).filter((k) => side === 'front' || !RU_FRONT_ONLY.includes(k)) };
}

// ---------------------------------------------------------------------------------------------
// HIS LEGS TRUE (the owner: “Can you make sure his leg ratio is correct cause it seems like all these guys have long upper legs
// and short legs below the knee”): every frame of his stances and held poses at 1.05 or more from all eight sides, each leg whose
// shin is seen; his runs at 1 where a foot is flat on the floor, bearing him.

// (HIS GUARD AND HIS TOWN STANCE AT THE GAME'S WIDTH: the owner, 7 Nov, 07:10, of the wide guard that read true, “You just need
// to fix the rangers wide leg stance, that’s all that’s weird”. At the game's width and crouch his legs bend, and no way of
// placing them reads 1.05 from every side (ranger_up_moves.ts, HIS GUARD): what stands in his guard is held to what that width
// gives, RU_LEG_GUARD_LEAST, its worst from his right, where his back knee points, 0.78; what stands in his town stance to
// RU_LEG_TOWN_LEAST, its worst 0.95. The game's crouch read 0.43 at its worst, its town stance 0.85.)
export const RU_LEG_GUARD_LEAST = 0.75;
export const RU_LEG_TOWN_LEAST = 0.92;
export const RU_LEGS_HELD: ReadonlyArray<{ key: string; what: string; from: number; to: number; kneel?: boolean; sideOn?: number; least?: number }> = [
  { key: 'rstand', what: 'his guard', from: 0, to: 71, least: RU_LEG_GUARD_LEAST },
  { key: 'rtown', what: 'his town stance', from: 0, to: 71, least: RU_LEG_TOWN_LEAST },
  { key: 'squirrel', what: 'the squirrel', from: 0, to: 108, least: RU_LEG_GUARD_LEAST },
  { key: 'sighting', what: 'sighting along an arrow', from: 0, to: 108, least: RU_LEG_GUARD_LEAST },
  { key: 'tsquirrel', what: 'the squirrel, in town', from: 0, to: 108, least: RU_LEG_TOWN_LEAST },
  { key: 'tsighting', what: 'sighting along an arrow, in town', from: 0, to: 108, least: RU_LEG_TOWN_LEAST },
  { key: 'rdraw', what: "his card's ready, in his guard", from: 26, to: 41, least: RU_LEG_GUARD_LEAST },
  { key: 'shot', what: "the Shot's held draw", from: 7, to: 9, least: RU_LEG_GUARD_LEAST },
  // (the Volley is loosed from one knee, as the owner asked of it: “The rogue drops to a knee when he fires Volley”. The shin of
  // the knee he is down on lies along the floor, and a shin along the floor is seen end-on from some side whatever is done; that
  // leg is not held to the measure (its knee is within 2.5 of the floor); his other leg, the one he stands on, is. That leg's
  // thigh lies level by the kneel's nature: seen side-on, the game's camera, looking down, draws a level length longer than an
  // upright one, so it is held there to 1, as the Warrior's kneel is (warrior_up_review.ts WU_LEGS_HELD))
  { key: 'volley', what: "the Volley's held draw", from: 9, to: 11, kneel: true, sideOn: 1 },
];
export const RU_LEGS_RUNS: readonly string[] = ['rrun', 'rtownrun'];
export const RU_LEG_HELD_LEAST = 1.05;
export const RU_LEG_RUN_LEAST = 1;
export function ruLegFaults(key: string, frame: number, f: RuFrame, side: WuSide): string[] {
  const held = RU_LEGS_HELD.filter((h) => h.key === key && frame >= h.from && frame <= h.to);
  const runs = RU_LEGS_RUNS.includes(key);
  if (!held.length && !runs) return [];
  const out: string[] = [];
  for (const l of wuLegs(f.s, side, B.ankle, { z: f.drawn.z, w: f.px.w, h: f.px.h })) {
    if (l.seen < WU_LEG_SEEN) continue;
    const knee = l.leg === 'L' ? f.s.kneeL : f.s.kneeR;
    if (runs) {
      const toe = l.leg === 'L' ? f.s.toeL : f.s.toeR;
      const heel = l.leg === 'L' ? f.s.heelL : f.s.heelR;
      if (Math.max(toe[2], heel[2]) > 0.6) continue;
      if (l.ratio < RU_LEG_RUN_LEAST) out.push(`${key} ${frame}/60 ${side}: his ${l.leg === 'L' ? 'left' : 'right'} leg, bearing him, ${l.ratio.toFixed(2)}`);
    } else {
      if (held.some((h) => h.kneel) && knee[2] < 2.5) continue;
      const sideOn = side === 'side' || side === 'sideL';
      const least = Math.min(...held.map((h) => (sideOn && h.sideOn !== undefined ? h.sideOn : h.least ?? RU_LEG_HELD_LEAST)));
      if (l.ratio < least) out.push(`${key} ${frame} (${held[0].what}) ${side}: his ${l.leg === 'L' ? 'left' : 'right'} leg ${l.ratio.toFixed(2)}`);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// HIS BOW SEEN FROM EVERY SIDE (the coordinator, 7 Nov 2026: "a good length of the bow, the string and, when nocked, the arrow
// must be clearly seen from every one of the 8 sides in every list he stands, runs or holds in, never wholly behind his body").
// Counted at the game's size: a game pixel (two picture pixels across) counts when half of it or more is the bow's wood; the
// string and the arrow on it (the part drawn first beside the sculpture: stuff 1000) the same.

/** At least this many game pixels of the bow's wood seen; the whole bow, side-on, is 20 to 30 of them. And of its string and
 * arrow together. (5: in his guard, canted over as it is so that it shows from behind him, from his right side, `side`, its limbs
 * point nearly at the eye and the wood is seen end-on, 5 or 6 pixels, its string and arrow 14 or more; no one cant shows it
 * both from behind and from there: README) */
export const RU_BOW_LEAST = 5;
export const RU_STRING_LEAST = 4;
export function ruBowSeen(f: RuFrame): { wood: number; string: number } {
  const { w, h } = f.px;
  const stuff = f.drawn.stuff;
  const is = (x: number, y: number, k: number): number => (x < 0 || y < 0 || x >= w || y >= h ? 0 : stuff[y * w + x] === k && f.px.d[(y * w + x) * 4 + 3] === 255 ? 1 : 0);
  let wood = 0;
  let string = 0;
  for (let y = 0; y + 1 < h; y += 2) for (let x = 0; x + 1 < w; x += 2) {
    if (is(x, y, f.bowMat) + is(x + 1, y, f.bowMat) + is(x, y + 1, f.bowMat) + is(x + 1, y + 1, f.bowMat) >= 2) wood++;
    if (is(x, y, 1000) + is(x + 1, y, 1000) + is(x, y + 1, 1000) + is(x + 1, y + 1, 1000) >= 2) string++;
  }
  return { wood, string };
}
/** Where his bow must be seen: every list he stands, runs or holds in (frames at 30 a second; a run's at 60), from all eight sides
 * (those painted from in front only, from there): his guard, his town stance, his runs and their other ways, the held draws, his
 * habits left standing in a fight and in town, his card's ready, and every frame of his settles and his setting off. */
export const RU_BOW_HELD: ReadonlyArray<{ key: string; what: string; from?: number; to?: number; front?: boolean }> = [
  { key: 'rstand', what: 'his guard' },
  { key: 'rtown', what: 'his town stance' },
  { key: 'rrun', what: 'his run' },
  { key: 'rtownrun', what: 'his town run' },
  { key: 'shot', what: "the Shot's held draw", from: 7, to: 9 },
  { key: 'volley', what: "the Volley's held draw", from: 9, to: 11 },
  { key: 'squirrel', what: 'the squirrel', front: true },
  { key: 'sighting', what: 'sighting along an arrow', front: true },
  { key: 'tsquirrel', what: 'the squirrel, in town', front: true },
  { key: 'tsighting', what: 'sighting along an arrow, in town', front: true },
  { key: 'rdraw', what: "his card's ready", from: 26, to: 41, front: true },
];
/** Where the string is seen end-on (his runs, where he carries the bow level at his side as the owner liked it, “i like where the
 * bow is at tho”; in town, where it is slung across his back), the wood alone: at least this many game pixels of it. */
export const RU_BOW_WOOD_ALONE = 7;
export function ruBowHeld(key: string | undefined, name: string, frame: number, side: WuSide): string | null {
  // (his stops, his setting off and his run's other ways: every frame)
  if (key === undefined) return /: coming to a stand|: setting off|backing away|going across/.test(name) ? name : null;
  const h = RU_BOW_HELD.find((x) => x.key === key && (x.from === undefined || (frame >= x.from && frame <= (x.to as number))));
  if (!h || (h.front && side !== 'front')) return null;
  return h.what;
}
/** Whether enough of the bow is seen: a good length of its wood and of its string and arrow, or, the string end-on, of its wood. */
export function ruBowEnough(b: { wood: number; string: number }): boolean {
  return (b.wood >= RU_BOW_LEAST && b.string >= RU_STRING_LEAST) || b.wood >= RU_BOW_WOOD_ALONE;
}
/** REPORTED, NOT MENDED (the rule of 7 Nov 2026, “BRINGING A HERO UP CHANGES ONLY WHAT HE ASKED”: never move a weapon, a pose or
 * a gait to pass a check; report it with the numbers and leave the motion alone). With his feet back at the game's width, one
 * frame of his setting off from his guard, seen from behind, shows one pixel less of the bow than the run's 7: the bow passing
 * behind his back on its way from his guard to where he carries it (6 of its wood, 1 of its string). Held to what it shows. */
export const RU_BOW_SHORT: ReadonlyArray<{ name: string; frame: number; side: WuSide; wood: number }> = [
  { name: 'The ranger runs (brought up): setting off', frame: 4, side: 'away', wood: 6 },
];
export function ruBowFaults(key: string | undefined, name: string, frame: number, f: RuFrame, side: WuSide): string[] {
  const what = ruBowHeld(key, name, frame, side);
  if (!what) return [];
  const b = ruBowSeen(f);
  if (ruBowEnough(b)) return [];
  if (RU_BOW_SHORT.some((x) => x.name === name && x.frame === frame && x.side === side && b.wood >= x.wood)) return [];
  return [`${what} ${frame} ${side}: ${b.wood} of the bow's wood seen, ${b.string} of its string and arrow`];
}

// ---------------------------------------------------------------------------------------------
// NO PRANCING (the owner, 7 Nov 2026, of the Warrior's re-posed run: “all that time and you screwed up his run.  why is he high
// stepping with his knees up?”): in every frame of his runs, his stops and his setting off, each thigh whose foot is off the
// floor at most WU_THIGH_MOST (50) degrees from hanging straight down.
export function ruRunning(key: string | undefined, name: string): boolean {
  return key === 'rrun' || key === 'rtownrun' || /: coming to a stand|: setting off|backing away|going across/.test(name);
}
export function ruThighFaults(key: string | undefined, name: string, frame: number, s: Skeleton, side: WuSide): string[] {
  if (!ruRunning(key, name)) return [];
  return wuThighs(s)
    .filter((t) => t.swinging && t.deg > WU_THIGH_MOST)
    .map((t) => `${name} ${frame} ${side}: his ${t.leg === 'L' ? 'left' : 'right'} thigh ${t.deg.toFixed(1)} degrees from straight down`);
}
