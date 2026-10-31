// Where the Golem's sculpture puts its gun's mouth, its coil, its stacks, its feet and its braced fist at each frame of its
// charged shots, and where the energy Contraption's ball is as it fires: measured as the art chat's films measured them
// (dev/golem_charge_fx.ts ChargeAt, tests/golem_charge.test.ts sceneOf; tests/contraption_shots.test.ts sceneOf), in the
// measure each is built in, before it is turned. For tools/bake_golem_shots.ts and tests/golem_shots_fx.test.ts.
import type { V3 } from '../src/art/skeleton';
import { LAST } from '../src/dev/sculpt';
import type { Sculpt } from '../src/dev/sculpt';
import { GOLEM_FIST, GOLEM_MUZZLE, GOLEM_PICK, GOLEM_POSE, GOLEM_VENTS, sculptGolemBuild } from '../src/dev/sculpt_golem';
import { GCHARGE, GCHARGE_BEAM, GCHARGE_SHELL, golemChargeBeam, golemChargeShell } from '../src/dev/golem_moves';
import { CONTRAPTION_MOUTH, CONTRAPTION_POSE, sculptContraptionBuild } from '../src/dev/sculpt_contraption';
import { CBOLT, boltShot } from '../src/dev/contraption_shots';

const REST = { swing: 0, fold: 0, lean: 0, bob: 0, feet: [0, 0, 0, 0] as [number, number, number, number], level: 0, dim: 0, crumple: 0 };

/** The Golem with arm `gun` at frame `f` of its charged shot, turned `turn`: its points, flat (see GOLEM_SHOT_POINTS). */
export function golemPointsAt(gun: 'cannon' | 'tesla', f: number, turn = 45): number[] {
  const q = gun === 'tesla' ? golemChargeBeam(f) : golemChargeShell(f);
  Object.assign(GOLEM_POSE, REST, q);
  try {
    sculptGolemBuild('front', GOLEM_PICK.build, turn, -14, GOLEM_PICK.giant, gun, q.aim, q.kick, q.charge, q.gunLevel);
  } finally {
    Object.assign(GOLEM_POSE, REST);
  }
  const sc = LAST.sc as Sculpt;
  const stacks = sc.prims.filter((p) => p.tag === 'mouth' && p.k === 'cone').map((p) => {
    const m = p as unknown as { a: V3; b: V3 };
    return [(m.a[0] + m.b[0]) / 2, (m.a[1] + m.b[1]) / 2, Math.max(m.a[2], m.b[2])];
  });
  const feet = sc.prims.filter((p) => p.tag === 'foot' && p.k === 'box').map((p) => [...(p as unknown as { c: V3 }).c]);
  if (stacks.length !== 2 || feet.length !== 2) throw new Error(`golem_shots_measure: ${stacks.length} stacks and ${feet.length} feet at frame ${f}`);
  const coil = gun === 'tesla' ? [...GOLEM_VENTS.pts[2], ...GOLEM_VENTS.pts[3]] : [];
  return [...GOLEM_MUZZLE.p, ...GOLEM_MUZZLE.way, ...coil, ...stacks.flat(), ...feet.flat(), ...GOLEM_FIST.c];
}

/** Every frame of its charged shot from GCHARGE.aimed (before it, it throws off nothing) to its end. */
export function measureGolem(gun: 'cannon' | 'tesla', turn = 45): { from: number; frames: number[][] } {
  const end = gun === 'tesla' ? GCHARGE_BEAM.end : GCHARGE_SHELL.end;
  const frames: number[][] = [];
  for (let f = GCHARGE.aimed; f <= end; f++) frames.push(golemPointsAt(gun, f, turn));
  return { from: GCHARGE.aimed, frames };
}

/** The energy Contraption's ball as it fires, and the way it points (as it is built: tests/contraption_shots.test.ts turns it after). */
export function measureBall(turn = 315): { p: V3; way: V3 } {
  const q = boltShot(CBOLT.fire);
  Object.assign(CONTRAPTION_POSE, q.pose);
  try {
    sculptContraptionBuild('front', 'tripod', turn, 'energy', q.shot);
  } finally {
    Object.assign(CONTRAPTION_POSE, { open: 1, kick: 0, lit: 1, broke: 0 });
  }
  return { p: [...CONTRAPTION_MOUTH.p] as V3, way: [...CONTRAPTION_MOUTH.way] as V3 };
}
