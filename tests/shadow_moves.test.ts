// THE LIVING SHADOW MOVING (dev/shadow_moves.ts; the Warlock chat, 11 Nov 2026): ITS BONES ONLY, quick (no picture is painted:
// its pictures are looked at, and are to have the picture's own checks as the game's demon's have, tests/demon_moves.test.ts,
// once he has said yes to how it moves). What his words and his rulebook ask of the moves that can be counted:
//   its run is the game's own (his “A new design, same moves”), its slashes to the game's rake's frames;
//   each move begins and ends where the next takes it up (its stand comes round; its slashes and its rearing up end in its
//   stance; its dropping down ends as the run is at the moment it leads into);
//   feet grip the floor (Movement 8), and its claws too on all fours, as far as the game has carried it;
//   heavy blows land with a freeze (Movement 7); the strike itself the fastest of it by far (Movement 9);
//   and its slashes are REALLY WIDE (his word, 11 Nov);
//   and it can move around on two legs as it slashes (his word of the film, 11 Nov): each slash made walking, each of the
//   four ways, from its stance and back to it legs and all, a hoof on the floor staying where it is as the game carries it,
//   a hoof coming down as the blow lands;
//   and every other move of its begins and ends up on two legs (his word, 11 Nov: “Yes, all on two legs (Recommended)”):
//   Damning, the smoke step's two ends, its roar as the change into it ends, its burning out, struck hard and from behind:
//   each the game's own move to the game's own frames; from its stance and (but its burning out) back to it; its hooves
//   where they stand; its claws, once in the floor, staying there; and Damning with no rear-up and slam (his word of the
//   first Damning, 27 Oct, what was worst of it: “The rear-up and slam (Recommended),The effects”).

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { solve } from '../src/art/skeleton';
import type { Posed, Skeleton, V3 } from '../src/art/skeleton';
import { UNITS_PER_TILE } from '../src/art/moves3';
import { BURN_OUT_LONG, DAMN_HIT, DAMN_LONG, DM, RAKE_HIT, RAKE_LONG, RK, SS, STEP_LONG, demonMoves, demonRun } from '../src/dev/demon_moves';
import { WOLF_B, burning } from '../src/dev/demon_new';
import { CHANGE_ALL, ROAR_AT } from '../src/dev/warlock_change';
import { WSTRUCK } from '../src/dev/warlock_hits';
import { DAMN_DIG, DROP_INTO, DROP_PICTURES, FR, OTHER_MOVES, REARS, ROAR_F, ROAR_LONG, SHADOW_CARRY, SHADOW_RUN_ROUND, SHADOW_STANCE, SLASH_WAYS, STEP_SLAM, shadowMoves, shadowOthers, shadowPose } from '../src/dev/shadow_moves';
import type { ShadowMove } from '../src/dev/shadow_moves';
import { ROAR_OUT, clawsLight, mouthAt, roarLight, slashTips } from '../src/dev/shadow_fx';
import { damningLight, digSpots } from '../src/dev/demon_fx';
import { paintWithoutCanvas } from './helpers';

const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { deepEqual(a: unknown, b: unknown, m?: string): void; ok(v: unknown, m?: string): void } = nodeAssert;

const moves = shadowMoves();
const [stand, run, slashL, slashR, drop] = moves;
const rears = moves.slice(5, 5 + REARS);
const walking = moves.slice(5 + REARS, 5 + REARS + 2 * SLASH_WAYS.length);
const [damning, step, roar, burnOut, reel, lurch] = shadowOthers();
const at = (m: ShadowMove, t: number): Skeleton => solve(WOLF_B, shadowPose(m, t));
const STANCE = solve(WOLF_B, SHADOW_STANCE as Posed);
const far = (a: V3, b: V3): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
/** How far two poses' joints are apart at the most. */
const JOINTS: (keyof Skeleton)[] = ['pelvis', 'neck', 'head', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'handL', 'handR', 'kneeL', 'kneeR', 'toeL', 'toeR'];
const apart = (a: Skeleton, b: Skeleton): number => Math.max(...JOINTS.map((j) => far(a[j] as V3, b[j] as V3)));
/** How high a claw's wrist is when the claw is flat on the floor (the run's), a hoof's toe when it stands on it; and how far one may give in a picture. */
const CLAW_DOWN = 7.3;
const HOOF_DOWN = 0.4;
const GIVE = 0.6;
/** Every claw and hoof that is on the floor in two pictures running: how far it slid between them, the floor gone by under it as far as the game carried it. */
function slides(m: ShadowMove, fps: number, n: number): string[] {
  const found: string[] = [];
  const carry = m.carry ?? 0;
  let was: Skeleton | null = null;
  for (let f = 0; f <= n; f++) {
    const s = at(m, f / fps);
    if (was) {
      for (const [name, floor] of [['handL', CLAW_DOWN], ['handR', CLAW_DOWN], ['toeL', HOOF_DOWN], ['toeR', HOOF_DOWN]] as const) {
        const a = was[name] as V3;
        const b = s[name] as V3;
        if (a[2] > floor || b[2] > floor) continue;
        const d = Math.hypot(b[0] + carry / fps - a[0], b[1] - a[1]);
        if (d > GIVE) found.push(`${name} slides ${d.toFixed(2)} at picture ${f}`);
      }
    }
    was = s;
  }
  return found;
}

test('its stand: comes round with no jump, begins in its stance, its hooves where they stand all the while', () => {
  const n = Math.round(stand.long * 30);
  assert.ok(apart(at(stand, 0), STANCE) < 1e-6, 'begins in its stance');
  assert.ok(apart(at(stand, stand.long), at(stand, 0)) < 1e-6, 'comes round');
  assert.ok(apart(at(stand, stand.long - FR), at(stand, 0)) < 1.2, 'no jump into its start');
  for (let f = 0; f <= n; f++) assert.ok(far(at(stand, f * FR).toeL, STANCE.toeL) < 0.3 && far(at(stand, f * FR).toeR, STANCE.toeR) < 0.3, `hooves still at ${f}`);
});

test("its run: the game's own, bone for bone but its elbows (found again for its longer arms)", () => {
  const game = demonRun();
  assert.deepEqual(run.motion.keys.length, game.keys.length);
  assert.deepEqual(run.long, SHADOW_RUN_ROUND);
  run.motion.keys.forEach((k, i) => {
    const a = { ...k.pose, le: 0, re: 0 };
    const b = { ...game.keys[i].pose, le: 0, re: 0 };
    assert.deepEqual(a, b, `key ${i}`);
  });
  assert.deepEqual(slides(run, 60, Math.round(run.long * 60)), []);
});

for (const m of [slashL, slashR]) {
  test(`${m.name}: to the game's rake's frames; from its stance and back to it; its hooves planted; a freeze as it lands; the swing by far its fastest; really wide`, () => {
    assert.deepEqual([m.hit, m.long], [RAKE_HIT, RAKE_LONG]);
    assert.ok(apart(at(m, 0), STANCE) < 1e-6, 'begins in its stance');
    assert.ok(apart(at(m, m.long), STANCE) < 1e-6, 'ends in its stance');
    assert.deepEqual(slides(m, 30, 31), []);
    // (Movement 7: held from the frame it lands to the end of the freeze, a tenth of a second)
    assert.ok(apart(at(m, RK.hit * FR), at(m, RK.freeze * FR)) < 1e-6, 'held through the freeze');
    const hand = (f: number): V3 => (m.slash?.side === 1 ? at(m, f * FR).handL : at(m, f * FR).handR);
    const pace = Array.from({ length: 31 }, (_, f) => far(hand(f + 1), hand(f)));
    const swing = Math.min(...pace.slice(RK.held, RK.hit));
    const rest = Math.max(...pace.slice(0, RK.held), ...pace.slice(RK.hit));
    // (Movement 9: the strike a flash, the wind-up and the wind-down slow beside it)
    assert.ok(swing > 4 * rest, `the swing ${swing.toFixed(1)} a frame, the rest at most ${rest.toFixed(1)}`);
    // (really wide: its talons from one side of it to the other, and how far ahead of it they reach)
    const tips = Array.from({ length: (RK.hit - RK.held) * 4 + 1 }, (_, i) => slashTips(m, (RK.held + i / 4) * FR)[0]);
    const wide = (Math.max(...tips.map((p) => p[1])) - Math.min(...tips.map((p) => p[1]))) / UNITS_PER_TILE;
    const ahead = Math.max(...tips.map((p) => p[0])) / UNITS_PER_TILE;
    assert.ok(wide > 4.5 && ahead > 3, `${wide.toFixed(1)} tiles from side to side, ${ahead.toFixed(1)} ahead`);
    // (never down into the floor)
    assert.ok(Math.min(...tips.map((p) => p[2])) > 8, 'its talons clear of the floor');
  });
}

test('its dropping down: from its stance; every claw and hoof on the floor stays where it is as the game carries it; ends as the run is where it leads into', () => {
  assert.deepEqual(drop.carry, SHADOW_CARRY);
  assert.ok(apart(at(drop, 0), STANCE) < 1e-6, 'begins in its stance');
  assert.deepEqual(slides(drop, 60, DROP_PICTURES), []);
  assert.ok(apart(at(drop, DROP_PICTURES / 60), at(run, DROP_INTO * run.long)) < 1e-6, 'ends as the run');
  // (and into it at the run's own pace: its last pictures the run's own, so there is no jump as the run takes it up)
  for (let back = 1; back <= 4; back++) assert.ok(apart(at(drop, (DROP_PICTURES - back) / 60), at(run, DROP_INTO * run.long - back / 60)) < 1e-6, `${back} before its end, as the run`);
});

test(`its rearing up: one for each of ${REARS} moments of the run, each from the run as it is then into its stance; a hoof on the floor stays until it is lifted`, () => {
  assert.deepEqual(rears.length, REARS);
  rears.forEach((m, i) => {
    // (as the run is then, to within a third of a picture pixel: between two of the run's pictures its elbows are found for
    // the moment itself, where the run goes from the one picture's to the other's)
    const off = apart(at(m, 0), at(run, (i / REARS) * run.long));
    assert.ok(off < 0.35, `${i}: begins as the run (${off.toFixed(3)} off)`);
    assert.ok(apart(at(m, m.long), STANCE) < 1e-6, `${i}: ends in its stance`);
    assert.deepEqual(slides(m, 30, Math.round(m.long / FR)), [], `${i}`);
    // (slow to stop: its last frame's step small)
    assert.ok(apart(at(m, m.long), at(m, m.long - FR)) < 2, `${i}: settles`);
  });
});

test(`its slashes made walking on two legs: both claws, each of ${SLASH_WAYS.length} ways; from its stance and back to it, legs and all; its arms as they are standing; a hoof on the floor stays where it is as the game carries it the way it goes; a hoof down as the blow lands`, () => {
  assert.deepEqual(walking.length, 2 * SLASH_WAYS.length);
  walking.forEach((m, i) => {
    const still = i < SLASH_WAYS.length ? slashL : slashR;
    const way = SLASH_WAYS[i % SLASH_WAYS.length];
    assert.deepEqual([m.way, m.hit, m.long], [way, RAKE_HIT, RAKE_LONG], m.name);
    assert.ok(apart(at(m, 0), STANCE) < 1e-6, `${m.name}: begins in its stance`);
    assert.ok(apart(at(m, m.long), STANCE) < 1e-6, `${m.name}: ends in its stance`);
    const th = (way * Math.PI) / 180;
    const along = m.along as (t: number) => number;
    const found: string[] = [];
    let was: Skeleton | null = null;
    for (let f = 0; f <= 31; f++) {
      const s = at(m, f * FR);
      // (its claws from its shoulders as in the slash made standing: the reach keeps its direction)
      const a = at(still, f * FR);
      for (const [h, sh] of [['handL', 'shoulderL'], ['handR', 'shoulderR']] as const) {
        const d = far([s[h][0] - s[sh][0], s[h][1] - s[sh][1], s[h][2] - s[sh][2]], [a[h][0] - a[sh][0], a[h][1] - a[sh][1], a[h][2] - a[sh][2]]);
        if (d > 0.6) found.push(`${h} ${d.toFixed(1)} off the standing slash's at frame ${f}`);
      }
      if (was) {
        const g = along(f * FR) - along((f - 1) * FR);
        for (const name of ['toeL', 'toeR'] as const) {
          const p = was[name];
          const q = s[name];
          if (p[2] > HOOF_DOWN || q[2] > HOOF_DOWN) continue;
          const d = Math.hypot(q[0] + g * Math.cos(th) - p[0], q[1] + g * Math.sin(th) - p[1]);
          if (d > GIVE) found.push(`${name} slides ${d.toFixed(2)} at frame ${f}`);
        }
      }
      was = s;
    }
    assert.deepEqual(found, [], m.name);
    // (weight first: a hoof on the floor as the blow lands and through the freeze)
    for (const f of [RK.hit, RK.freeze]) assert.ok(Math.min(at(m, f * FR).toeL[2], at(m, f * FR).toeR[2]) <= HOOF_DOWN, `${m.name}: a hoof down at frame ${f}`);
  });
});

// ---- ITS OTHER MOVES, ALL UP ON TWO LEGS

/** Its hooves where they stand in its stance through frames `a` to `b` of a move. */
function hoovesStill(m: ShadowMove, a: number, b: number): string[] {
  const found: string[] = [];
  for (let f = a; f <= b; f++) {
    const s = at(m, f * FR);
    for (const name of ['toeL', 'toeR'] as const) if (far(s[name], STANCE[name]) > 0.3) found.push(`${name} ${far(s[name], STANCE[name]).toFixed(2)} off at frame ${f}`);
  }
  return found;
}
/** A claw's wrist where it is driven into the floor (`spot`, for its left; its right's the same, its sides swapped) through frames `a` to `b`. */
function clawsDug(m: ShadowMove, spot: V3, a: number, b: number): string[] {
  const found: string[] = [];
  for (let f = a; f <= b; f++) {
    const s = at(m, f * FR);
    for (const [name, side] of [['handL', 1], ['handR', -1]] as const) {
      const d = far(s[name], [spot[0], side * spot[1], spot[2]]);
      if (d > GIVE) found.push(`${name} ${d.toFixed(2)} off where it bit at frame ${f}`);
    }
  }
  return found;
}

test('its other moves: after the rest in its list, so that each of those is where it was', () => {
  assert.deepEqual(moves.length, 5 + REARS + 2 * SLASH_WAYS.length + OTHER_MOVES.length);
  assert.deepEqual(moves.slice(-OTHER_MOVES.length).map((m) => m.name), [damning, step, roar, burnOut, reel, lurch].map((m) => m.name));
  assert.deepEqual(moves[0].name, 'The Living Shadow standing');
});

test("Damning, up on two legs: to the game's frames; from its stance and back to it; its hooves where they stand; no rear-up and slam; its claws bite and stay; torn up in a flash; a freeze; risen up on two legs", () => {
  assert.deepEqual([damning.hit, damning.long], [DAMN_HIT, DAMN_LONG]);
  assert.ok(apart(at(damning, 0), STANCE) < 1e-6, 'begins in its stance');
  assert.ok(apart(at(damning, damning.long), STANCE) < 1e-6, 'ends in its stance');
  assert.ok(apart(at(damning, damning.long - FR), STANCE) < 1, 'settles into it');
  assert.deepEqual(hoovesStill(damning, 0, 48), []);
  // (his word of the first Damning, what was worst: “The rear-up and slam”: before its claws go down it never rises more
  // than a little, and they are never lifted as high as its shoulders)
  for (let f = 0; f <= DM.dig; f++) {
    const s = at(damning, f * FR);
    assert.ok(s.pelvis[2] < STANCE.pelvis[2] + 2.5, `not reared up at frame ${f}`);
    assert.ok(Math.max(s.handL[2], s.handR[2]) < Math.min(s.shoulderL[2], s.shoulderR[2]) - 15, `its claws below its shoulders at frame ${f}`);
  }
  // (its claws in the floor from where they bite until it tears them up: feet grip the floor, and so do its claws)
  assert.deepEqual(clawsDug(damning, DAMN_DIG, DM.dig, DM.held), []);
  // (Movement 9: torn up in a flash, two frames, by far its fastest; Movement 7: a freeze as it lands)
  const hand = (f: number): V3 => at(damning, f * FR).handL;
  const pace = Array.from({ length: 48 }, (_, f) => far(hand(f + 1), hand(f)));
  const rip = Math.min(...pace.slice(DM.held, DM.rip));
  const rest = Math.max(...pace.slice(0, DM.held), ...pace.slice(DM.rip));
  assert.ok(rip > 2.5 * rest, `the tearing up ${rip.toFixed(1)} a frame, the rest at most ${rest.toFixed(1)}`);
  assert.ok(apart(at(damning, DM.rip * FR), at(damning, DM.freeze * FR)) < 1e-6, 'held through the freeze');
  // (and it is up on two legs again as the blow lands: its hips as high as in its stance, its claws over its head)
  const up = at(damning, DM.rip * FR);
  assert.ok(up.pelvis[2] >= STANCE.pelvis[2] && Math.min(up.handL[2], up.handR[2]) > up.head[2], 'risen, its claws flung up');
});

test("the smoke step's two ends, up on two legs: to the game's frames, as far and as gone as the game's; from its stance and back to it; its hooves where they stand while it is on the floor; its claws slammed down stay", () => {
  const game = demonMoves().find((m) => !!m.gone);
  assert.ok(game, "the game's smoke step");
  assert.deepEqual([step.hit, step.long, step.air], [game?.hit, STEP_LONG, game?.air]);
  for (let f = 0; f <= 46; f += 0.5) {
    assert.deepEqual(step.along?.(f * FR), game?.along?.(f * FR), `as far as the game's at frame ${f}`);
    assert.deepEqual(step.gone?.(f * FR), game?.gone?.(f * FR), `as far gone as the game's at frame ${f}`);
  }
  assert.ok(apart(at(step, 0), STANCE) < 1e-6, 'begins in its stance');
  assert.ok(apart(at(step, step.long), STANCE) < 1e-6, 'ends in its stance');
  assert.ok(apart(at(step, step.long - FR), STANCE) < 1, 'settles into it');
  assert.deepEqual(hoovesStill(step, 0, SS.coiled), []);
  assert.deepEqual(hoovesStill(step, SS.slam + 2, 46), []);
  // (its right claw comes down half a frame after its left)
  assert.deepEqual(clawsDug(step, STEP_SLAM, SS.slam + 1, SS.low), []);
  // (all smoke between its ends: nothing of it is seen from the frame it is gone to the frame it comes out)
  for (let f = SS.gone; f <= SS.out; f++) assert.deepEqual(step.gone?.(f * FR), 1, `all smoke at frame ${f}`);
});

test('its roar as the change into it ends: as long as the game gives it; from its stance and back to it; its hooves where they stand; reared up tall, its arms flung wide', () => {
  assert.ok(Math.abs(ROAR_LONG - (CHANGE_ALL - ROAR_AT)) < 1e-9, "as long as the game's change gives its roar");
  assert.deepEqual(roar.long, ROAR_LONG);
  assert.ok(apart(at(roar, 0), STANCE) < 1e-6, 'begins in its stance');
  assert.ok(apart(at(roar, roar.long), STANCE) < 1e-6, 'ends in its stance');
  assert.deepEqual(hoovesStill(roar, 0, 42), []);
  const up = at(roar, 10 * FR);
  assert.ok(up.pelvis[2] > STANCE.pelvis[2] + 2.5 && up.handL[1] - up.handR[1] > 110, 'reared up, its claws flung wide');
});

// HIS WORDS OF THE FIRST ROAR SHOWN HIM, 11 Nov 2026 by 22:08: “The roar is so bad.  His face doesn’t even move?  No animations
// out of the mouth?  No spittle or action lines or screen shake on the roar?”
test('its roar, made again: its face moves (its jaws thrown wide open and held, its head shaking from side to side); the roar leaves its mouth; the screen is shaken; a big wind-up first', () => {
  const jaw = roar.jaw as (t: number) => number;
  const shake = roar.shake as (t: number) => number;
  assert.ok(roar.jaw !== undefined && roar.shake !== undefined, 'it has jaws to open and a shake to ask for');
  // (its jaws: shut in its grin as it begins, as it draws its breath and as it ends; thrown open in under three frames;
  // wide all the while it roars; shut again before it is in its stance)
  assert.deepEqual([jaw(0), jaw(ROAR_F.coiled * FR), jaw(roar.long)], [0, 0, 0]);
  for (let f = ROAR_F.burst; f <= ROAR_F.held; f++) assert.ok(jaw(f * FR) > 0.9, `its jaws wide at frame ${f} (${jaw(f * FR).toFixed(2)})`);
  for (let f = ROAR_F.shut; f <= 42; f++) assert.deepEqual(jaw(f * FR), 0, `its jaws shut at frame ${f}`);
  // (quivering as it is held: never still two frames running)
  for (let f = ROAR_F.burst; f < ROAR_F.held - 1; f++) assert.ok(Math.abs(jaw((f + 1) * FR) - jaw(f * FR)) > 0.003, `its jaws quiver at frame ${f}`);
  // (its head: ducked as it draws its breath, thrown up as it roars, and shaking: turned to its left and to its right by
  // six degrees and more, and back and forth at least three times)
  const turn = (f: number): number => shadowPose(roar, f * FR).faceTurn;
  const up = (f: number): number => shadowPose(roar, f * FR).faceUp;
  assert.ok(up(ROAR_F.coiled) < SHADOW_STANCE.faceUp - 8 && up(ROAR_F.burst + 1) > SHADOW_STANCE.faceUp + 18, 'ducked, then thrown up');
  const turns = Array.from({ length: (ROAR_F.held - ROAR_F.burst) * 2 + 1 }, (_, i) => turn(ROAR_F.burst + i / 2));
  assert.ok(Math.max(...turns) > 6 && Math.min(...turns) < -6, `its head shaken ${Math.min(...turns).toFixed(1)} to ${Math.max(...turns).toFixed(1)}`);
  let swings = 0;
  for (let i = 1; i < turns.length; i++) if (turns[i] * turns[i - 1] < 0) swings++;
  assert.ok(swings >= 3, `from side to side ${swings} times`);
  // (the screen: not shaken before the roar bursts out; hardest as it does; kept shaking while it is held; let go after)
  assert.deepEqual([shake(0), shake(ROAR_F.coiled * FR), shake((ROAR_F.held + 2) * FR), shake(roar.long)], [0, 0, 0, 0]);
  assert.ok(shake(ROAR_OUT * FR) >= 5, 'hardest as it bursts out');
  for (let f = ROAR_F.burst; f <= ROAR_F.held - 1; f++) assert.ok(shake(f * FR) >= 3, `shaken at frame ${f}`);
  // (OUT OF ITS MOUTH: nothing in the air before it bursts out; rings, lines and spittle from then until after its breath
  // has run out; and they leave it the way it faces, from before its head)
  paintWithoutCanvas();
  const lit = (f: number, view: 'front' | 'back'): number => {
    const a = roarLight(roar, f * FR, view).air.d;
    let n = 0;
    for (let i = 3; i < a.length; i += 4) if (a[i]) n++;
    return n;
  };
  for (const view of ['front', 'back'] as const) {
    assert.deepEqual(lit(ROAR_F.coiled, view), 0, `nothing leaves it as it draws its breath, from ${view}`);
    for (const f of [ROAR_F.burst, 12, 16, 20, ROAR_F.held]) assert.ok(lit(f, view) > 150, `the roar is seen at frame ${f} from ${view} (${lit(f, view)} pixels)`);
    assert.deepEqual(lit(42, view), 0, `gone by its end, from ${view}`);
  }
  const mouth = mouthAt(roar, 12 * FR);
  const head = at(roar, 12 * FR).head;
  assert.ok(mouth.way[0] > 0.7 && mouth.way[2] > 0.2, 'it roars ahead of it and up');
  // (out of its mouth: before the middle of its head, no further from it than its head is big)
  assert.ok(mouth.at[0] > head[0] + 4 && far(mouth.at, head) > 10 && far(mouth.at, head) < 22, `out of its mouth (${far(mouth.at, head).toFixed(1)} from the middle of its head)`);
  // (from in front what leaves its mouth is nearer the eye than it is, and laid over it; from behind beyond it, under it)
  assert.deepEqual([roarLight(roar, 12 * FR, 'front').over, roarLight(roar, 12 * FR, 'back').over], [true, false]);
});

test('wherever else it roars its jaws open too: as it tears its claws up in Damning, as it rises out of the smoke step; a snarl as it is struck; shut as each begins and ends', () => {
  const j = (m: ShadowMove, f: number): number => (m.jaw as (t: number) => number)(f * FR);
  for (const m of [damning, step, reel, lurch]) assert.deepEqual([j(m, 0), j(m, Math.round(m.long / FR))], [0, 0], m.name);
  assert.ok(j(damning, DM.rip) > 0.9 && j(damning, DM.freeze) > 0.9, 'roaring as it tears them up, through the freeze');
  assert.ok(j(step, SS.roar) > 0.9, 'roaring as it rises out of the smoke');
  assert.ok(j(reel, WSTRUCK.snapped) > 0.5 && j(lurch, WSTRUCK.snapped) > 0.5, 'a snarl as the blow snaps it');
  for (const m of [damning, step, reel, lurch]) for (let f = 0; f <= Math.round(m.long / FR); f++) assert.ok(j(m, f) >= 0 && j(m, f) <= 1, `${m.name}: a jaw from shut to wide at frame ${f}`);
});

test("its burning out, from up on two legs: as long as the game's; from its stance; it only sinks; its front hoof and its rear hoof's toes where they stand; what burns on it gutters and dies, in his cyan's own tones", () => {
  assert.deepEqual(burnOut.long, BURN_OUT_LONG);
  assert.ok(apart(at(burnOut, 0), STANCE) < 1e-6, 'begins in its stance');
  const n = Math.round(burnOut.long / FR);
  for (let f = 1; f <= n; f++) {
    const s = at(burnOut, f * FR);
    assert.ok(far(s.toeL, STANCE.toeL) < 0.3, `its front hoof still at frame ${f}`);
    assert.ok(far(s.toeR, STANCE.toeR) < GIVE, `its rear hoof's toes still at frame ${f} (${far(s.toeR, STANCE.toeR).toFixed(2)})`);
    // (but for its last heavy breath, which lifts it a little)
    assert.ok(s.pelvis[2] < STANCE.pelvis[2] + 2.5, `never rises at frame ${f}`);
    assert.ok(Math.min(s.kneeL[2], s.kneeR[2]) > 1, `no knee through the floor at frame ${f}`);
  }
  const end = at(burnOut, burnOut.long);
  assert.ok(end.pelvis[2] < STANCE.pelvis[2] - 25 && end.head[2] < STANCE.head[2] - 35, 'sunk down, its head dropped');
  // (onto its rear knee, its right: on the floor, before the hoof that stays where it stands; its front knee up)
  assert.ok(end.kneeR[2] < 5 && end.kneeR[0] > end.toeR[0] && end.kneeL[2] > 20, `on one knee (its rear knee ${end.kneeR[2].toFixed(1)} up, its front ${end.kneeL[2].toFixed(1)})`);
  assert.ok(apart(end, at(burnOut, burnOut.long - 4 * FR)) < 0.6, 'still as it ends (the same picture crumbles)');
  const glow = burnOut.glow as (t: number) => number;
  assert.ok(glow(0) === 1 && glow(burnOut.long) < 0.2, 'burning as ever at its start, all but out at its end');
  // (flaring once on the way: brighter at frame 14 than at frame 10)
  assert.ok(glow(14 * FR) > glow(10 * FR), 'flares once');
  // (as bright as ever, the still's own colours; dying, nothing but his cyan's own tones)
  assert.deepEqual(burning(undefined), { hot: '#e8ffff', rest: '#22d0e0', core: true });
  assert.deepEqual(burning(1), burning(undefined));
  for (const g of [0.7, 0.5, 0.3, 0.1]) for (const c of [burning(g).hot, burning(g).rest]) assert.ok(['#0c6a80', '#22d0e0', '#b8fff8'].includes(c), `${c} at ${g}`);
});

for (const m of [reel, lurch]) {
  test(`${m.name}: 13 frames, as the game's; from its stance and back to it; its hooves where they stand; rocked by the third frame`, () => {
    assert.deepEqual(m.long, WSTRUCK.end * FR);
    assert.ok(apart(at(m, 0), STANCE) < 1e-6, 'begins in its stance');
    assert.ok(apart(at(m, m.long), STANCE) < 1e-6, 'ends in its stance');
    assert.deepEqual(hoovesStill(m, 0, WSTRUCK.end), []);
    // (struck hard it is rocked back; from behind, driven forward)
    const d = at(m, WSTRUCK.snapped * FR).neck[0] - STANCE.neck[0];
    assert.ok(m === reel ? d < -6 : d > 6, `rocked ${d.toFixed(1)}`);
  });
}

test("Damning's light at its claws is the game's demon's own: for the demon's own claws, the same picture, pixel for pixel", () => {
  paintWithoutCanvas();
  const game = demonMoves().find((m) => m.name.includes('Damning'));
  assert.ok(game, "the game's Damning");
  if (!game) return;
  const same = (a: Uint8ClampedArray | Uint8Array, b: Uint8ClampedArray | Uint8Array): boolean => a.length === b.length && a.every((v, i) => v === b[i]);
  for (const view of ['front', 'back'] as const) {
    for (const f of [6, 12, 20, DM.rip, DM.rip + 3, DM.down, 46]) {
      const theirs = damningLight(game, f * FR, view);
      const mine = clawsLight(digSpots(game), f * FR, view);
      assert.ok(same(mine.claws.d, theirs.claws.d), `at its claws, frame ${f}, from ${view}`);
      assert.deepEqual(mine.clawsNear, theirs.clawsNear);
      // (on the floor: the same until the blow; from then the game's has the ground broken under the ones it damns too)
      if (f < DM.rip) assert.ok(same(mine.floor.d, theirs.floor.d), `on the floor, frame ${f}, from ${view}`);
    }
  }
});
