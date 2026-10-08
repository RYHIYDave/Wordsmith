// The scenes of the still renders (src/dev/look3d.ts).
//
// A scene is built in the 3D painter's own axes: X runs down and to the LEFT of the screen, Y down
// and to the RIGHT, Z up; the camera stands off toward +X +Y and looks down at 30 degrees, which
// is the game's own view (a square of floor is a diamond twice as wide as it is tall). The game's
// (x, y) is this (Y, X).

import { Mesh, box, hex, lathe, tone } from './mesh';
import type { RGB } from './mesh';
import type { Camera, PointLight, Scene } from './gl';
import { C, at, barrel, bones, brazier, candles, chest, drum, floor, gargoyle, hanging, moss, pillar, rubble, sarcophagus, sconce, steps, stone, urn, wall } from './kit3';
import { bat, brute, bruteBuild, cultist, fallen, figure, knight, knightBuild, mage, ranger, skeleton, stand, warden } from './figures';
import { mats, rotZ, scale, translate } from './vec';
import type { V3 } from './vec';

/** The game's camera: looking at `at`, seeing `half` tiles above and below it. */
export function gameCam(look: V3, half: number): Camera {
  const e = (30 * Math.PI) / 180;
  const d = 60;
  const k = (d * Math.cos(e)) / Math.SQRT2;
  return { at: look, eye: [look[0] + k, look[1] + k, look[2] + d * Math.sin(e)], half };
}

const WARM: RGB = [3.0, 1.35, 0.42];
const k = (c: RGB, s: number): RGB => [c[0] * s, c[1] * s, c[2] * s];

/** A wall that faces +X (it runs down the screen to the right), from (x, y1) back to (x, y0). */
const wallX = (x: number, y0: number, y1: number, high: number, seed: number, plain = false, thick = 0.7): [Mesh, ReturnType<typeof mats>] => [wall(y1 - y0, { high, seed, plain, thick }), mats(translate(x, y1, 0), rotZ(-90))];
/** A wall that faces +Y (it runs down the screen to the left), from (x0, y) to (x1, y). */
const wallY = (y: number, x0: number, x1: number, high: number, seed: number, plain = false, thick = 0.7): [Mesh, ReturnType<typeof mats>] => [wall(x1 - x0, { high, seed, plain, thick }), translate(x0, y, 0)];

/** What a page that moves about in the hall needs to know of it: how high its upper level is, and where its two braziers stand. */
export const TOMB = { up: 0.9, braziers: [[7.7, 6.3], [7.7, 10.7]] as const };

/**
 * A hall of the tomb, and a fight in it: the floor in two levels with steps between them and a
 * ledge along the upper one, a coffin on the upper level, hangings, a spouting beast's head,
 * fires. The knight below; two of the dead and a bat on him; a cultist at the head of the steps.
 */
function tomb(variant: string, _aspect: number): Scene {
  const m = new Mesh();
  const UP = TOMB.up;
  const HIGH = 3.5;
  // ---- the lower floor (with the foot of the steps left out of it), and the upper
  const onSteps = (x: number, y: number): boolean => x >= 5 && x < 7 && y >= 7 && y < 10;
  m.add(floor(5, 0, 14, 15, { skip: onSteps, seed: 3, cracked: 0.1, gone: 0.045 }));
  m.add(floor(0, 0, 5, 15, { z: UP, seed: 8, cracked: 0.06, gone: 0, tones: C.wall }));
  m.add(box(0, 0, 0, 4.96, 15, UP - 0.3, { side: C.gap }));
  m.add(steps(4, 3, UP / 4, 0.5, 2), mats(translate(7, 7, 0), rotZ(90)));
  // the ledge: a face of coursed stone either side of the steps, with a kerb along its top
  m.add(...wallX(5, 0, 7, UP, 21, false, 0.5));
  m.add(...wallX(5, 10, 15, UP, 22, false, 0.5));
  // ---- the two back walls
  m.add(...wallX(0, 0, 15, HIGH, 5));
  m.add(...wallY(0, 0, 14, HIGH, 6));
  m.add(box(-0.7, -0.7, 0, 0.02, 0.02, HIGH + 0.16, { side: tone(C.wall[1], 0.8), top: tone(C.dressed[0], 0.55) }));
  // piers against them, a pillar's width, with a head each
  for (const y of [2.5, 6.5, 10.5, 14.2]) {
    m.add(stone(0, y - 0.4, 0, 0.32, y + 0.4, HIGH + 0.02, 0.05, { side: C.dressed[0], top: tone(C.dressed[0], 0.6) }));
    m.add(stone(0, y - 0.5, HIGH - 0.4, 0.42, y + 0.5, HIGH + 0.1, 0.05, { side: C.dressed[1], top: tone(C.dressed[0], 0.6) }));
  }
  for (const x of [5.0, 9.5, 13.6]) {
    m.add(stone(x - 0.4, 0, 0, x + 0.4, 0.32, HIGH + 0.02, 0.05, { side: tone(C.dressed[0], 0.9), top: tone(C.dressed[0], 0.6) }));
    m.add(stone(x - 0.5, 0, HIGH - 0.4, x + 0.5, 0.42, HIGH + 0.1, 0.05, { side: tone(C.dressed[1], 0.9), top: tone(C.dressed[0], 0.6) }));
  }
  // the near sides, cut down to a kerb so that the room is seen into
  m.add(box(14, 0, 0, 14.5, 15.5, 0.36, { side: tone(C.wall[0], 0.7), top: tone(C.wall[0], 0.5) }));
  m.add(box(0, 15, 0, 14.5, 15.5, 0.36, { side: tone(C.wall[0], 0.7), top: tone(C.wall[0], 0.5) }));
  m.add(box(0, 15, 0, 5, 15.5, UP + 0.36, { side: tone(C.wall[0], 0.7), top: tone(C.wall[0], 0.5) }));

  // ---- the upper level: the coffin, its candles, the great hanging behind it
  m.add(sarcophagus(true, false, 4), mats(translate(2.3, 4.5, UP), rotZ(90)));
  m.add(candles(3), at(3.5, 3.2, UP));
  m.add(candles(7), at(3.6, 5.9, UP));
  m.add(candles(5), at(1.0, 6.3, UP));
  m.add(hanging(1.5, 2.1, C.crimson, C.crimsonDark, C.goldLight, 0.5, 2), mats(translate(0.36, 4.5, HIGH - 0.35), rotZ(-90)));
  m.add(hanging(1.0, 1.7, C.tealDark, hex('#0a4450'), C.sparkWhite, 0.7, 5), mats(translate(0.06, 8.5, HIGH - 0.4), rotZ(-90)));
  m.add(hanging(1.0, 1.7, C.tealDark, hex('#0a4450'), C.sparkWhite, 0.35, 9), mats(translate(0.06, 12.4, HIGH - 0.4), rotZ(-90)));
  m.add(urn(2), at(0.9, 13.9, UP));
  m.add(urn(5), at(1.5, 14.3, UP));
  m.add(bones(4), at(3.9, 12.6, UP));
  m.add(moss(0.5, 7, 3), at(0.5, 0.6, UP));
  // ---- the lower floor
  // (`bare`: no fight, and the braziers without their fires, for a page that makes them move)
  const bare = variant === 'bare';
  m.add(brazier(1, !bare), at(TOMB.braziers[0][0], TOMB.braziers[0][1], 0));
  m.add(brazier(2, !bare), at(TOMB.braziers[1][0], TOMB.braziers[1][1], 0));
  m.add(pillar(3.2, 0, 1), at(9, 3, 0));
  m.add(pillar(3.2, 0, 2), at(12.4, 3, 0));
  m.add(pillar(3.2, 1.25, 3), at(12.4, 12, 0));
  m.add(drum(0.62, 4), mats(translate(11.2, 13.3, 0), rotZ(28)));
  m.add(drum(0.5, 6), mats(translate(12.6, 13.9, 0), rotZ(-50)));
  m.add(rubble(0.9, 12, 5), at(12.0, 13.0, 0));
  m.add(rubble(0.5, 6, 9), at(5.8, 13.6, 0));
  m.add(bones(2), at(10.3, 11.4, 0));
  m.add(bones(8), at(6.2, 2.6, 0));
  m.add(chest(), mats(translate(13.1, 1.0, 0), rotZ(-30)));
  m.add(urn(1), at(5.7, 0.9, 0));
  m.add(urn(3), at(6.4, 0.75, 0));
  m.add(barrel(), at(5.75, 1.75, 0));
  m.add(moss(0.6, 9, 1), at(5.6, 14.4, 0));
  m.add(moss(0.5, 6, 2), at(13.4, 0.6, 0));
  // on the left-hand wall: two hangings, a beast's head spouting into a trough, torches
  m.add(hanging(1.1, 1.9, C.crimson, C.crimsonDark, C.goldLight, 0.75, 11), translate(7.2, 0.06, HIGH - 0.45));
  m.add(hanging(1.1, 1.9, C.crimson, C.crimsonDark, C.goldLight, 0.3, 14), translate(11.6, 0.06, HIGH - 0.45));
  m.add(gargoyle(true, 2), mats(translate(9.5, 0.33, 1.9), scale(1.5)));
  m.add(lathe([[0.5, 0.36, 0], [0.56, 0.42, 0.34]], 8, { side: C.dressed[0], vary: 0.06, top: C.gap }, 22.5), translate(9.5, 0.86, 0));
  m.add(lathe([[0.46, 0.33, 0.24], [0.46, 0.33, 0.27]], 8, { side: C.water, top: tone(C.water, 1.3), glow: 0.25 }, 22.5), translate(9.5, 0.86, 0));
  m.add(sconce(1), translate(8.35, 0.03, 2.0));
  m.add(sconce(2), translate(12.6, 0.03, 2.0));
  m.add(sconce(3), mats(translate(0.03, 10.5, UP + 1.9), rotZ(-90)));
  m.add(sconce(4), mats(translate(0.33, 2.5, UP + 1.5), rotZ(-90)));

  // ---- the fight
  const heroAt: V3 = [9.3, 8.5, 0];
  // (figures are drawn a fifth larger than life against the tiles, as the pixel ones are: they must read on a phone)
  const BIG = 1.22;
  if (variant !== 'empty' && !bare) {
    m.add(stand(knight({ lean: 8, twist: -14, headYaw: 10, armR: [150, 24, 34], wristR: -146, armL: [44, 24, 70], legR: [30, 16], legL: [-26, 30] }), heroAt[0], heroAt[1], 0, -72, BIG));
    m.add(stand(skeleton({ lean: 12, twist: 20, armR: [150, 16, 26], wristR: -130, armL: [-20, 22, 40], legR: [-20, 26], legL: [30, 12] }), 11.3, 7.3, 0, 76, BIG));
    m.add(stand(skeleton({ lean: 6, armR: [70, 30, 60], wristR: -110, armL: [30, 14, 50], legR: [22, 10], legL: [-18, 22], headYaw: -14 }), 11.6, 10.0, 0, 122, BIG));
    m.add(stand(skeleton({ lean: 4, armR: [30, 10, 80], armL: [14, 30, 8], plantL: true, legR: [6, 4], legL: [-6, 6] }, hex('#b02a4a'), 'bow'), 12.7, 5.3, 0, 64, BIG));
    m.add(stand(bat(0.7), 8.1, 4.6, 2.0, -20, BIG));
    m.add(stand(cultist({ armR: [84, 30, 44], plantR: true, armL: [18, 20, 36], headPitch: -6, legR: [8, 4], legL: [-8, 8] }), 4.1, 8.5, UP, -90, BIG));
  }

  const lights: PointLight[] = [
    // (the left-hand brazier; the right-hand one is the fire that throws shadows. A page that moves lights both itself.)
    ...(variant === 'bare' ? [] : [{ at: [7.7, 6.3, 1.3] as V3, color: k(WARM, 0.85), reach: 6.5 }]),
    { at: [8.5, 0.5, 2.4], color: k(WARM, 0.5), reach: 4.5 },
    { at: [12.6, 0.5, 2.4], color: k(WARM, 0.5), reach: 4.5 },
    { at: [0.5, 10.5, UP + 2.3], color: k(WARM, 0.5), reach: 4.5 },
    { at: [0.6, 2.5, UP + 1.9], color: k(WARM, 0.45), reach: 4 },
    { at: [2.3, 4.5, UP + 1.5], color: [0.25, 1.1, 1.2], reach: 3.6 },
    { at: [3.5, 3.2, UP + 0.5], color: k(WARM, 0.3), reach: 2.4 },
    { at: [3.6, 5.9, UP + 0.5], color: k(WARM, 0.3), reach: 2.4 },
    { at: [1.0, 6.3, UP + 0.5], color: k(WARM, 0.3), reach: 2.4 },
  ];
  if (variant !== 'empty' && !bare) {
    lights.push({ at: [heroAt[0] + 0.7, heroAt[1] - 0.1, 1.2], color: [0.35, 1.3, 1.45], reach: 3.4 });
    lights.push({ at: [4.5, 8.9, UP + 1.5], color: [1.6, 0.3, 0.8], reach: 3.6 });
  }
  const cam = variant === 'game' ? gameCam([heroAt[0], heroAt[1], 0.55], 7.29) : variant === 'steps' ? gameCam([6.6, 8.3, 0.9], 3.1) : gameCam([7.0, 7.4, 0.9], 6.3);
  return {
    mesh: m,
    cam,
    sky: [0.105, 0.11, 0.24],
    ground: [0.035, 0.032, 0.08],
    moonFrom: [0.75, -0.55, 1.15],
    moon: [0.38, 0.42, 0.72],
    fire: { at: [7.7, 10.7, 1.25], toward: [9.5, 7.5, 0.2], color: k(WARM, 1.0), reach: 9.5 },
    lights,
    bounds: { at: [7, 7.5, 1.2], half: 13 },
    vignette: 0.55,
    mist: { color: [0.004, 0.003, 0.014], at: [7.5, 7.5, 0], near: 9, far: 15 },
  };
}

/** A plain floor and a low step for figures to be looked at on. */
function stage(m: Mesh, wide: number): void {
  m.add(floor(-4, -4, wide + 4, wide + 4, { seed: 4, cracked: 0.05, gone: 0 }));
  m.add(...wallY(-4, -4, wide + 4, 2.6, 9));
  m.add(...wallX(-4, -4, wide + 4, 2.6, 12));
}

/** The three heroes, side by side, close. */
function heroes(_variant: string, _aspect: number): Scene {
  const m = new Mesh();
  stage(m, 6);
  // (they stand in a row across the screen: along the line where X + Y is the same)
  const face = -45;
  const place = (i: number): [number, number] => [3.4 - i * 1.25, 0.2 + i * 1.25];
  m.add(stand(knight({ lean: 2, armR: [16, 52, 28], plantR: true, armL: [30, 22, 62], legR: [6, 4], legL: [-6, 6], headYaw: -10 }), ...place(0), 0, face));
  m.add(stand(ranger({ armL: [16, 36, 12], plantL: true, armR: [20, 12, 50], legR: [8, 4], legL: [-8, 8], headYaw: -12 }), ...place(1), 0, face));
  m.add(stand(mage({ armR: [34, 30, 28], plantR: true, armL: [14, 14, 34], legR: [4, 2], legL: [-4, 4], headYaw: 12 }), ...place(2), 0, face));
  m.add(brazier(3), at(4.6, -1.6, 0));
  m.add(urn(4), at(-0.9, 3.4, 0));
  const mid: V3 = [2.2, 1.4, 0.75];
  return {
    mesh: m,
    cam: gameCam(mid, 1.62),
    sky: [0.12, 0.125, 0.26],
    ground: [0.04, 0.038, 0.09],
    moonFrom: [0.75, -0.5, 1.1],
    moon: [0.42, 0.46, 0.78],
    fire: { at: [4.6, -1.6, 1.25], toward: [2.2, 1.4, 0.4], color: k(WARM, 0.85), reach: 9 },
    lights: [{ at: [3.4, 1.4, 1.5], color: [0.35, 1.0, 1.1], reach: 3 }, { at: [0.4, 3.2, 2.3], color: [0.6, 0.95, 1.1], reach: 3 }],
    bounds: { at: [2, 1.5, 1], half: 8 },
    vignette: 0.45,
  };
}

/** The monsters, side by side, close. */
function monsters(_variant: string, _aspect: number): Scene {
  const m = new Mesh();
  stage(m, 7);
  const face = -45;
  const place = (i: number): [number, number] => [4.5 - i * 1.12, 0.0 + i * 1.12];
  m.add(stand(skeleton({ lean: 6, armR: [70, 60, 40], wristR: -100, armL: [10, 16, 40], legR: [14, 8], legL: [-12, 14] }), ...place(0), 0, face));
  m.add(stand(skeleton({ armL: [16, 36, 12], plantL: true, armR: [40, 10, 90], legR: [6, 4], legL: [-6, 6] }, hex('#b02a4a'), 'bow'), ...place(1), 0, face));
  m.add(stand(cultist({ armR: [84, 30, 44], plantR: true, armL: [16, 16, 36], legR: [4, 2], legL: [-4, 4] }), ...place(2), 0, face));
  m.add(stand(bat(0.6), ...place(3), 1.3, face));
  m.add(stand(brute({ lean: 10, armR: [140, 30, 30], wristR: -150, armL: [20, 26, 40], legR: [10, 6], legL: [-10, 10] }), place(4)[0] - 0.35, place(4)[1] + 0.35, 0, face));
  const mid: V3 = [1.85, 2.65, 0.75];
  return {
    mesh: m,
    cam: gameCam(mid, 2.4),
    sky: [0.11, 0.11, 0.25],
    ground: [0.04, 0.035, 0.09],
    moonFrom: [0.75, -0.5, 1.1],
    moon: [0.4, 0.42, 0.75],
    fire: { at: [5.8, 1.2, 1.7], toward: [2.0, 2.4, 0.4], color: k(WARM, 0.7), reach: 12 },
    lights: [{ at: [2.6, 2.6, 1.9], color: [1.2, 0.25, 0.6], reach: 3 }],
    bounds: { at: [2, 2, 1], half: 9 },
    vignette: 0.45,
  };
}

/** The figures made after the first stills: the guardian, the Warden, the knight with the great sword, the fallen wordsmith. */
function more(_variant: string, _aspect: number): Scene {
  const m = new Mesh();
  stage(m, 8);
  const face = -45;
  m.add(stand(figure(knightBuild(true), { lean: 4, armR: [40, 30, 50], wristR: -40, armL: [50, -20, 70], legR: [8, 4], legL: [-8, 8] }), 5.2, -0.4, 0, face, 1.22));
  m.add(stand(brute({ lean: 10, armR: [140, 30, 30], wristR: -150, armL: [20, 26, 40], legR: [10, 6], legL: [-10, 10] }), 3.9, 0.9, 0, face, 1.22));
  m.add(stand(figure(bruteBuild(true), { lean: 8, armR: [60, 30, 40], wristR: -80, armL: [20, 26, 40], legR: [10, 6], legL: [-10, 10] }), 2.3, 2.5, 0, face, 1.22 * 1.33));
  m.add(stand(warden({ lean: 3, armR: [30, 26, 50], wristR: -30, armL: [14, 18, 30], legR: [6, 3], legL: [-6, 6] }), 0.2, 4.6, 0, face, 1.22 * 1.48));
  m.add(fallen(false), mats(translate(4.6, 2.6, 0), rotZ(30)));
  m.add(fallen(true), mats(translate(2.6, 4.8, 0), rotZ(-20)));
  const mid: V3 = [2.6, 2.4, 1.2];
  return {
    mesh: m,
    cam: gameCam(mid, 3.3),
    sky: [0.11, 0.11, 0.25],
    ground: [0.04, 0.035, 0.09],
    moonFrom: [0.75, -0.5, 1.1],
    moon: [0.4, 0.42, 0.75],
    fire: { at: [6.4, 1.6, 2.0], toward: [2.4, 2.6, 0.5], color: k(WARM, 0.7), reach: 13 },
    lights: [{ at: [2.6, 3.6, 2.2], color: [1.2, 0.25, 0.6], reach: 3.4 }],
    bounds: { at: [2.5, 2.5, 1.2], half: 10 },
    vignette: 0.45,
  };
}

export const SCENES: Record<string, (variant: string, aspect: number) => Scene> = { room: tomb, tomb, heroes, monsters, more };
