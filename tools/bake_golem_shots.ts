// BAKES src/art/golem_shots_points.ts: where the Golem's gun's mouth, its coil, its stacks and its braced fist and feet are
// at each frame of its charged shots, and where the energy Contraption's ball is as it fires, as the art chat's sculptures
// put them (dev/sculpt_golem.ts GOLEM_MUZZLE, GOLEM_VENTS, GOLEM_FIST; dev/sculpt_contraption.ts CONTRAPTION_MOUTH). The
// game-ready effects (src/art/golem_shots_fx.ts) are laid from these without sculpting the Golem a second time;
// tests/golem_shots_fx.test.ts sculpts it again and checks every number. Run: npx tsx tools/bake_golem_shots.ts
import { writeFileSync } from 'node:fs';
import { paintWithoutCanvas } from '../tests/helpers';
paintWithoutCanvas();
import { measureGolem, measureBall } from '../tests/golem_shots_measure';

const r = (v: number): number => Math.round(v * 1000) / 1000;
const lines: string[] = [];
lines.push('// MADE BY tools/bake_golem_shots.ts (do not edit by hand): where the Golem\'s gun\'s mouth and the way it points, its');
lines.push('// coil\'s foot and tip (the tesla coil), its two stacks\' mouths, and its two feet and braced fist are, in the measure it');
lines.push('// is built in (before it is turned), at each frame of its charged shots from the frame it aims (12) to its end; and the energy');
lines.push('// Contraption\'s ball and the way it points as it fires. tests/golem_shots_fx.test.ts sculpts them again and checks them.');
lines.push('');
lines.push('/** Per frame from `from`: muzzle (3), way (3), coil foot and tip (6, the tesla coil only), stacks (6), feet and fist (9). */');
lines.push('export const GOLEM_SHOT_POINTS: Record<\'cannon\' | \'tesla\', { from: number; per: number; n: number; v: readonly number[] }> = {');
for (const gun of ['cannon', 'tesla'] as const) {
  const m = measureGolem(gun);
  const per = m.frames[0].length;
  lines.push(`  ${gun}: { from: ${m.from}, per: ${per}, n: ${m.frames.length}, v: [${m.frames.map((fr) => fr.map(r).join(',')).join(',')}] },`);
}
lines.push('};');
const b = measureBall();
lines.push('/** The energy Contraption\'s ball as it fires (its frame 11) and the way it points, as it is built. */');
lines.push(`export const CONTRAPTION_BALL: { p: readonly [number, number, number]; way: readonly [number, number, number] } = { p: [${b.p.map(r).join(', ')}], way: [${b.way.map(r).join(', ')}] };`);
lines.push('');
writeFileSync('src/art/golem_shots_points.ts', lines.join('\n'));
console.log('baked', lines.join('\n').length, 'bytes');
