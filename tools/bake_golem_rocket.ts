// BAKES src/art/golem_rocket_points.ts: where the Golem's stacks' mouths (and the way each points, and each one's foot), its
// feet and its giant fist are at each frame of its rocket jump, as the art's sculpture puts them (dev/sculpt_golem.ts
// GOLEM_STACKS, GOLEM_FIST). The game-ready pieces (src/art/golem_rocket_fx.ts) are laid from these without sculpting the
// Golem a second time; tests/golem_rocket.test.ts sculpts it again and checks every number.
// Run: npx tsx tools/bake_golem_rocket.ts
import { writeFileSync } from 'node:fs';
import { paintWithoutCanvas } from '../tests/helpers';
paintWithoutCanvas();
import { measureRocket } from '../tests/golem_rocket_measure';

const r = (v: number): number => Math.round(v * 1000) / 1000;
const m = measureRocket();
const lines = [
  '// MADE BY tools/bake_golem_rocket.ts (do not edit by hand): where the Golem\'s two stacks\' mouths are, the way each points',
  '// and each one\'s foot, and its two feet and its giant fist, in the measure it is built in (before it is turned), at each',
  '// frame of its rocket jump (dev/golem_rocket.ts ROCKET, 0 to its end). tests/golem_rocket.test.ts sculpts them again.',
  '',
  '/** Per frame: mouths (6), ways (6), stacks\' feet (6), its feet (6), its fist (3). */',
  `export const ROCKET_POINTS: { per: number; n: number; v: readonly number[] } = { per: ${m[0].length}, n: ${m.length}, v: [${m.map((fr) => fr.map(r).join(',')).join(',')}] };`,
  '',
];
writeFileSync('src/art/golem_rocket_points.ts', lines.join('\n'));
console.log('baked', m.length, 'frames');
