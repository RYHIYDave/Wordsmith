// THE LIVING SHADOW MOVING (dev/shadow_moves.ts; the Warlock chat, 11 Nov 2026): ITS BONES ONLY, quick (no picture is painted:
// its pictures are looked at, and are to have the picture's own checks as the game's demon's have, tests/demon_moves.test.ts,
// once he has said yes to how it moves). What his words and his rulebook ask of the moves that can be counted:
//   its run is the game's own (his “A new design, same moves”), its slashes to the game's rake's frames;
//   each move begins and ends where the next takes it up (its stand comes round; its slashes and its rearing up end in its
//   stance; its dropping down ends as the run is at the moment it leads into);
//   feet grip the floor (Movement 8), and its claws too on all fours, as far as the game has carried it;
//   heavy blows land with a freeze (Movement 7); the strike itself the fastest of it by far (Movement 9);
//   and its slashes are REALLY WIDE (his word, 11 Nov).

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { solve } from '../src/art/skeleton';
import type { Posed, Skeleton, V3 } from '../src/art/skeleton';
import { UNITS_PER_TILE } from '../src/art/moves3';
import { RAKE_HIT, RAKE_LONG, RK, demonRun } from '../src/dev/demon_moves';
import { WOLF_B } from '../src/dev/demon_new';
import { DROP_INTO, DROP_PICTURES, FR, REARS, SHADOW_CARRY, SHADOW_RUN_ROUND, SHADOW_STANCE, shadowMoves, shadowPose } from '../src/dev/shadow_moves';
import type { ShadowMove } from '../src/dev/shadow_moves';
import { slashTips } from '../src/dev/shadow_fx';

const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { deepEqual(a: unknown, b: unknown, m?: string): void; ok(v: unknown, m?: string): void } = nodeAssert;

const moves = shadowMoves();
const [stand, run, slashL, slashR, drop] = moves;
const rears = moves.slice(5);
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
