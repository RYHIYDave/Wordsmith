// THE RANGER BROUGHT UP, AS THE BOSSES' REVIEW SEES HIM (the art chat's helper, 7 Nov 2026). A MOCK-UP TOOL: nothing of the game
// imports this file (tests/ranger_up.test.ts holds that). As art/warrior_up_review.ts does the Warrior: his new moves
// (art/ranger_up_moves.ts) handed to the review every boss and mob goes through (art/boss_checks.ts checkBoss), from each of his
// eight sides, on his bones (RU_BODY); and the measures the owner's last words asked for: never bow-legged, no knee come up in
// his runs (wuThighs), and his bow seen from every side.

import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import type { Mob, MobMove } from './new_mobs3';
import { BOW_BRACE, BOW_HALF, GRIP_SPEED, MOVES3, RANGER_BODY, UNITS_PER_TILE } from './moves3';
import type { Move3 } from './moves3';
import { add, bonesAt, dot, mul, norm, solve, sub, trunkOf } from './skeleton';
import type { Posed, Skeleton, V3 } from './skeleton';
import { WU_SPIN, spun, turnedStage } from './warrior_up';
import { stage } from './skin';
import type { WuSide } from './warrior_up';
import { ruSmeared } from './ranger_up_art';
import type { RuFrame } from './ranger_up';
import { wuThighs, WU_THIGH_MOST } from './warrior_up_review';
import { ruOnBack, RU_BODY, RU_DRAW3, RU_FALL3, RU_LURCH3, RU_REEL3, RU_ROLL3, RU_ROLL_CARRY, RU_RUN3, RU_SHOT3, RU_SHOT_HIT, RU_SIGHTING3, RU_SQUIRREL3, RU_STAND3, RU_TOWN3, RU_TOWN_RUN3, RU_TSIGHTING3, RU_TSQUIRREL3, RU_VOLLEY3, RU_VOLLEY_HIT } from './ranger_up_moves';

const FR = 1 / 30;
const B = RU_BODY;
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

/** THE GAME'S OWN RANGER by the same names (moves3.ts, on his own bones, RANGER_BODY): reviewed the same way, for what is
 * reported and not mended (RU_REPORTED: a check that fails on the game's own motion). */
export const RU_GAME_REVIEWED: Readonly<Record<string, Move3>> = {
  stand: MOVES3.rstand, walk: MOVES3.rrun, attack: MOVES3.shot, reel: MOVES3.rreel, dying: MOVES3.rfall,
  volley: MOVES3.volley, roll: MOVES3.roll, rlurch: MOVES3.rlurch, rtown: MOVES3.rtown, rtownrun: MOVES3.rtownrun,
  squirrel: MOVES3.squirrel, sighting: MOVES3.sighting, tsquirrel: MOVES3.tsquirrel, tsighting: MOVES3.tsighting, rdraw: MOVES3.rdraw,
};
/**
 * REPORTED, NOT MENDED (the rule of 7 Nov 2026: “never move a weapon, a pose or a gait to pass a check. If a check fails on the
 * game's own motion, REPORT it with the numbers and leave the motion alone”). THE SIGHTING is the game's own motion
 * (moves3.ts sightingOnString), and his legs are the game's own again: as he holds the arrow before his eye, the bow let down by
 * his left side (its `lowBow`) passes into his front thigh, as the game's own does on the game's own legs (as deep: about 0.9
 * game pixels past the thigh's skin, seen from in front, where it is painted). This morning's guard, its front foot set further
 * over, hid it. Held to no deeper than the game's own (tests/ranger_up.test.ts, 3).
 */
export const RU_REPORTED: ReadonlyArray<{ move: string; kind: string; what: string }> = [
  { move: 'sighting', kind: 'through', what: 'bow in legL' },
];

/** THE REVIEW OF HIM from a side of his (as art/warrior_up_review.ts warriorReview); or of the game's own Ranger (`game`). */
export function rangerReview(side: WuSide = 'front', game = false): { mob: Mob; shape: BossShape; moves: string[] } {
  const R = game ? RU_GAME_REVIEWED : RU_REVIEWED;
  const more: Record<string, MobMove> = {};
  for (const [k, m] of Object.entries(R)) if (!['stand', 'walk', 'attack', 'reel', 'dying'].includes(k)) more[k] = k === 'rtownrun' ? walking(m) : mv(m);
  const mob = {
    id: game ? 'ranger' : 'ranger_up',
    name: game ? 'the Ranger, as the game has him' : 'the Ranger, brought up',
    size: 'hero',
    build: game ? RANGER_BODY : B,
    stand: mv(R.stand),
    walk: walking(R.walk),
    attack: mv(R.attack),
    reel: mv(R.reel),
    dying: mv(R.dying),
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
    smeared: (which, t) => (game ? false : ruSmeared(RU_REVIEWED[which], t)),
    handovers: game ? [] : handovers,
  };
  return { mob, shape, moves: Object.keys(R).filter((k) => side === 'front' || !RU_FRONT_ONLY.includes(k)) };
}

// ---------------------------------------------------------------------------------------------
// NEVER BOW-LEGGED (the owner, 7 Nov 2026, of this morning's guard: “Cmon.  He’s not a gunfighter why is he so bow legged.  Just
// please do it right, I don’t want to have to correct every single one of these because we made a minuscule change to the leg
// length”). Seen from in front and from behind, each knee lies on or inside the straight line from his hip to his foot, within a
// game pixel, in every frame of every list he stands in, from all eight sides. The game's own guard already bows a little (his
// front knee, turned out over its foot): there he is held to no worse than the game's own.

/** How far each knee lies OUT TO THE SIDE of the straight line from its hip to its foot (the ankle joint), as one of his sides
 * shows it, in game pixels (below 0: inside it). Out to the side is along the line through his two hips, away from the other leg:
 * what is seen of a leg from in front of him and from behind him; each of his eight sides shows as much of it as it shows of that
 * line (from in front all of it, side-on next to none). A knee bent forward over its foot is not out to the side, however it is
 * seen. */
const bowAt = new Map<WuSide, (p: V3) => readonly [number, number]>();
export function ruBowLegs(s: Skeleton, side: WuSide): { leg: 'L' | 'R'; out: number }[] {
  let at = bowAt.get(side);
  if (!at) {
    const { spin, camera, ax } = WU_SPIN[side];
    const st = turnedStage(stage(camera, ax), spin);
    at = (p: V3) => st.at(p);
    bowAt.set(side, at);
  }
  return ruBowLegsBy(s, at);
}
/** The same, as any picture's projection shows it (`P`: a point of him to picture pixels). */
export function ruBowLegsBy(s: Skeleton, P: (p: V3) => readonly [number, number]): { leg: 'L' | 'R'; out: number }[] {
  return (['L', 'R'] as const).map((leg) => {
    const hip = leg === 'L' ? s.hipL : s.hipR;
    const other = leg === 'L' ? s.hipR : s.hipL;
    const knee = leg === 'L' ? s.kneeL : s.kneeR;
    const foot = leg === 'L' ? s.ankleL : s.ankleR;
    const outward = norm(sub(hip, other));
    const down = norm(sub(foot, hip));
    const onLine = add(hip, mul(down, dot(sub(knee, hip), down)));
    const lat = dot(sub(knee, onLine), outward);
    const [x0, y0] = P(onLine);
    const [x1, y1] = P(add(onLine, mul(outward, lat)));
    return { leg, out: (Math.sign(lat) * Math.hypot(x1 - x0, y1 - y0)) / 2 };
  });
}
/** The lists he stands in, by the game's short names: his guard, his town stance, the squirrel and the sighting in a fight and in
 * town, his card's ready, the Shot and the Volley. */
export const RU_STANDING: readonly string[] = ['rstand', 'rtown', 'squirrel', 'sighting', 'tsquirrel', 'tsighting', 'rdraw', 'shot', 'volley'];
/** Within this many game pixels outside the line counts as on it. */
export const RU_BOW_LEGS_MOST = 1;
/** The most each knee of a list lies outside its line from one side, through every frame (30 a second). */
export function ruBowLegsMost(m: Move3, side: WuSide, fps = 30): { L: number; R: number; atL: number; atR: number } {
  const end = m.motion.keys[m.motion.keys.length - 1].at;
  const most = { L: -Infinity, R: -Infinity, atL: 0, atR: 0 };
  for (let i = 0; i <= Math.round(end * fps); i++) {
    for (const b of ruBowLegs(solve(m.build, bonesAt(m.motion.keys, m.rest, i / fps)), side)) {
      if (b.out > most[b.leg]) {
        most[b.leg] = b.out;
        if (b.leg === 'L') most.atL = i;
        else most.atR = i;
      }
    }
  }
  return most;
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
