// Where the Golem's sculpture puts its stacks' mouths, the way each points and each one's foot, its two feet and its giant
// fist at each frame of its rocket jump (dev/golem_rocket.ts golemRocket), in the measure it is built in, before it is
// turned. For tools/bake_golem_rocket.ts and tests/golem_rocket.test.ts.
import type { V3 } from '../src/art/skeleton';
import { LAST } from '../src/dev/sculpt';
import type { Sculpt } from '../src/dev/sculpt';
import { GOLEM_FIST, GOLEM_PICK, GOLEM_POSE, GOLEM_STACKS, sculptGolemBuild } from '../src/dev/sculpt_golem';
import { ROCKET, golemRocket } from '../src/dev/golem_rocket';

const REST = { swing: 0, fold: 0, lean: 0, bob: 0, feet: [0, 0, 0, 0] as [number, number, number, number], level: 0, dim: 0, crumple: 0 };

/** The Golem at frame `f` of its rocket jump: its points, flat (see ROCKET_POINTS). */
export function rocketPointsAt(f: number, turn = 45): number[] {
  Object.assign(GOLEM_POSE, REST, golemRocket(f));
  try {
    sculptGolemBuild('front', GOLEM_PICK.build, turn, -14, GOLEM_PICK.giant, 'cannon');
  } finally {
    Object.assign(GOLEM_POSE, REST);
    delete GOLEM_POSE.stacks;
    delete GOLEM_POSE.splay;
    delete GOLEM_POSE.flare;
    delete GOLEM_POSE.hips;
  }
  const sc = LAST.sc as Sculpt;
  const feet = sc.prims.filter((p) => p.tag === 'foot' && p.k === 'box').map((p) => [...(p as unknown as { c: V3 }).c]);
  if (GOLEM_STACKS.pts.length !== 2 || feet.length !== 2) throw new Error(`golem_rocket_measure: ${GOLEM_STACKS.pts.length} stacks and ${feet.length} feet at frame ${f}`);
  return [...GOLEM_STACKS.pts.flat(), ...GOLEM_STACKS.ways.flat(), ...GOLEM_STACKS.feet.flat(), ...feet.flat(), ...GOLEM_FIST.c];
}
/** Every frame of its rocket jump. */
export function measureRocket(turn = 45): number[][] {
  const out: number[][] = [];
  for (let f = 0; f <= ROCKET.end; f++) out.push(rocketPointsAt(f, turn));
  return out;
}
