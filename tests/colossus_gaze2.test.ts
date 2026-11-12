// PHASE 2'S GAZE AIMED AT THE HERO (the queue's aim-colossus-phase-2-gaze; game/colossus_fight.ts GAZE2_AIMED, off till his yes). Held
// here: off, the gaze as before; on, laid along the nearest aim pictured, as phase 3's; the aims cover every spot on the stone; the art's
// own aimed gaze (art/eye_body.ts bodyFrame's aim) turns about the same water and sweeps the same way at the same time, so that his eye
// looks where the beam goes; what the game draws (his body and his tongue apart). The pack's pictures: tests/colossus_gaze2_pack.test.ts.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { RNG } from '../src/engine/rng';
import { BODY2, ColossusFight, ENTRANCE, GAZE, GAZE2_AIMED, STONE, WAKE, gaze2AimNear } from '../src/game/colossus_fight';
import type { FightEvent, HeroOnStone } from '../src/game/colossus_fight';
import { GAZE as ART_GAZE, GAZE_FIRE, GAZE_LIM, TILE, beamAngle, eyeAngle, gazeArc, gazeArcAt } from '../src/art/eye_body';
import { STONE as ART_STONE } from '../src/art/eye_colossus';
import { P2_BAKE } from '../src/render/colossus_baked';
import { colossusGaze2 } from '../src/render/act1_fx/colossus';

const DT = 1 / 60;
const D = Math.PI / 180;
const near = (a: number, b: number, by: number): boolean => Math.abs(a - b) <= by;

function run(f: ColossusFight, secs: number, hero: () => HeroOnStone): FightEvent[] {
  const all: FightEvent[] = [];
  for (let i = 0; i < Math.round(secs / DT); i++) all.push(...f.step(DT, hero()));
  return all;
}
function inPhase2(seed: number): ColossusFight {
  const f = new ColossusFight(new RNG(seed));
  f.begin();
  run(f, WAKE.rise + DT, () => ({ u: 8.5, v: 6, dodging: true }));
  for (const a of [...f.arms]) f.armKilled(a.id);
  run(f, 1 + 3 + ENTRANCE.long + 0.1, () => ({ u: 8.5, v: 6, dodging: true }));
  assert.equal(f.ph, 2);
  f.shovelIn = Infinity;
  f.waterIn = Infinity;
  f.body2Next = 'gaze';
  f.body2In = 0;
  return f;
}
/** Run until his gaze begins (the hero at `at`). */
function toGaze(f: ColossusFight, at: HeroOnStone): void {
  for (let i = 0; i < 60 * 6; i++) {
    if (f.step(DT, at).some((e) => e.t === 'gazeWarn')) return;
  }
  assert.fail('no gaze');
}

test('the switch is off in the game; off, the gaze is as before: laid exactly toward the hero, no picture of its own', () => {
  assert.equal(GAZE2_AIMED.on, false, 'off till his yes');
  const f = inPhase2(5);
  const at = { u: 13.3, v: 7.1, dodging: false };
  toGaze(f, at);
  const B = f.body2!;
  const toward = Math.atan2(at.u - BODY2.gazeAt.u, at.v - BODY2.gazeAt.v) / D;
  assert.ok(near(B.a0, toward - GAZE.half, 1e-9) && near(B.a1, toward + GAZE.half, 1e-9));
  assert.equal(B.pic, undefined);
  assert.equal(colossusGaze2(f), null, 'nothing new drawn');
});

test('on: laid along the nearest aim pictured, his left to his right, its sides held where the art holds them; the beam hurts him once as it crosses; rolled through, nothing', () => {
  GAZE2_AIMED.on = true;
  try {
    for (const [u, v] of [[0.3, 0.4], [3, 9], [8.2, 5], [12, 2], [16.7, 0.4], [16.5, 10.5]] as const) {
      const f = inPhase2(7);
      const at = { u, v, dodging: false };
      toGaze(f, at);
      const B = f.body2!;
      const j = gaze2AimNear(at);
      assert.equal(B.pic, j);
      const aim = BODY2.aims[j];
      assert.ok(near(B.a0, Math.max(-BODY2.lim, aim - GAZE.half), 1e-9) && near(B.a1, Math.min(BODY2.lim, aim + GAZE.half), 1e-9), `${u}, ${v}: ${B.a0} to ${B.a1}`);
      assert.ok(B.a0 < B.a1, 'his left to his right');
      const hurt = run(f, GAZE.long + 0.2, () => at).filter((e) => e.t === 'hurt' && e.by === 'gaze');
      assert.equal(hurt.length, 1, `standing at ${u}, ${v}: the beam once`);
    }
    const r = inPhase2(7);
    toGaze(r, { u: 4, v: 4, dodging: true });
    assert.equal(run(r, GAZE.long + 0.2, () => ({ u: 4, v: 4, dodging: true })).filter((e) => e.t === 'hurt').length, 0);
  } finally {
    GAZE2_AIMED.on = false;
  }
});

test('the aims cover the stone: from every spot on it the nearest aim is within 10 degrees of the line to him, deep inside the arc', () => {
  let worst = 0;
  for (let u = 0; u <= STONE.w; u += 0.25) {
    for (let v = 0; v <= STONE.d; v += 0.25) {
      const toward = Math.atan2(u - BODY2.gazeAt.u, v - BODY2.gazeAt.v) / D;
      worst = Math.max(worst, Math.abs(BODY2.aims[gaze2AimNear({ u, v })] - toward));
    }
  }
  assert.ok(worst <= 10 + 1e-9, `the worst ${worst.toFixed(2)} degrees off`);
  assert.ok(GAZE.half - worst >= 20, 'never near the arc\'s side');
});

test("the art's own aimed gaze turns about the same water and sweeps the same arc at the same time: his eye looks where the beam goes", () => {
  const A = gazeArc();
  // (the art's water under his eye, in the game's tiles)
  assert.ok(near(8.5 + A.ox / TILE, BODY2.gazeAt.u, 0.01) && near((A.oy - ART_STONE.edge) / TILE, BODY2.gazeAt.v, 0.01), `${8.5 + A.ox / TILE}, ${(A.oy - ART_STONE.edge) / TILE}`);
  assert.equal(BODY2.lim, Math.round(GAZE_LIM / D), "the art's hold on its sides");
  assert.ok(near(GAZE_FIRE / 30, GAZE.warn, 1e-9) && near(ART_GAZE.sweep / 30, GAZE.sweep, 1e-9) && near(ART_GAZE.half, GAZE.half, 1e-9) && near(ART_GAZE.frames / 30, GAZE.long, 1e-9));
  for (const aim of BODY2.aims) {
    const G = gazeArcAt(aim * D);
    const a0 = Math.max(-BODY2.lim, aim - GAZE.half);
    const a1 = Math.min(BODY2.lim, aim + GAZE.half);
    assert.ok(near(G.a0 / D, a0, 1e-6) && near(G.a1 / D, a1, 1e-6), `aim ${aim}`);
    // (each frame of its beam: the game's beam at that time, the art's eye on the same line)
    for (let f = GAZE_FIRE; f < GAZE_FIRE + ART_GAZE.sweep; f++) {
      const game = a0 + (a1 - a0) * Math.min(1, (f / 30 - GAZE.warn) / GAZE.sweep);
      assert.ok(near(beamAngle(f, G)! / D, game, 1e-6) && near(eyeAngle(f, G) / D, game, 1e-6), `aim ${aim}, frame ${f}`);
    }
  }
});

test('what the game draws: his body at his stand\'s frame run on from the frame the gaze began on, his tongue and eye of its aim over it', () => {
  assert.equal(P2_BAKE.at, BODY2.at);
  assert.deepEqual(P2_BAKE.aims, BODY2.aims);
  GAZE2_AIMED.on = true;
  try {
    const f = inPhase2(9);
    toGaze(f, { u: 2, v: 3, dodging: false });
    run(f, 1.5, () => ({ u: 2, v: 3, dodging: false }));
    const g = colossusGaze2(f)!;
    assert.equal(g.mv, `gaze2.${f.body2!.pic}`);
    assert.equal(g.k, Math.floor(f.body2!.t * 30 + 1e-6));
    assert.equal(g.body, (BODY2.at + g.k) % 90);
    assert.ok(Math.abs((((f.body * 30) % 90) - g.body + 135) % 90 - 45) <= 1, 'his stand there');
  } finally {
    GAZE2_AIMED.on = false;
  }
});
