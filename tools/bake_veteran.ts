// THE VETERAN'S STEPS BAKED FOR THE RULES (src/game/veteran_baked.ts). The art chat's moves (src/dev/veteran_moves.ts) carry
// him as the game should (his feet held on the floor of the scene while the game carries him); the rules carry him by these
// numbers, frame by frame, so that his feet never slide. Plain data: nothing of src/dev is imported by the file it writes.
// For every move by its id, frame 0 to `long`:
//   carry   how far the art has carried him, tiles along his forward and to his left as the move began (carryAt / VET_TILE)
//   place   where the floor point under him is, tiles, from where he stood (placeOf: the carry, and the swing of a turn made
//           about a pivot foot; the spinning elbow's), which is where his frame is drawn from
//   spin    his whole turn, degrees to his left (spinAt)
// Run again whenever his moves change (tests/veteran_art.test.ts checks the file against them):
//   npx tsx tools/bake_veteran.ts
import { writeFileSync } from 'node:fs';
import { VET_MOTIONS, VET_TILE, carryAt, placeOf, spinAt } from '../src/dev/veteran_moves';

const OUT = 'src/game/veteran_baked.ts';
const r = (v: number, k = 1e5): number => {
  const x = Math.round(v * k) / k;
  return Object.is(x, -0) ? 0 : x;
};
const lines: string[] = [];
lines.push('// THE VETERAN\'S STEPS, BAKED FROM THE ART CHAT\'S MOVES (src/dev/veteran_moves.ts) by tools/bake_veteran.ts: DO NOT EDIT BY');
lines.push('// HAND; run `npx tsx tools/bake_veteran.ts` again when his moves change (tests/veteran_art.test.ts checks them against the art).');
lines.push('// For every move by its id, frame 0 to `long` (thirty a second at his pace), along his forward and to his left as the move');
lines.push('// began, in TILES (the art\'s measure / VET_TILE):');
lines.push('//   carry   how far the art has carried him (carryAt)');
lines.push('//   place   where the floor point under him is, from where he stood (placeOf: the carry, and the swing of a turn made about');
lines.push('//           a pivot foot, the spinning elbow\'s): carry him HERE, and his frame, drawn from his floor point, is where the art has');
lines.push('//           him, his feet held on the floor');
lines.push('//   spin    his whole turn, degrees to his left (spinAt)');
lines.push('// On the game\'s floor his forward is (fx, fy) and his left (fy, -fx); a picture drawn mirrored (fx - fy < 0, as the game');
lines.push('// mirrors a hero facing screen-left) has his left on the world\'s right: (-fy, fx).');
lines.push('');
lines.push("import type { VetMoveId } from './veteran';");
lines.push('');
lines.push('export interface VetBaked {');
lines.push('  /** Frames (the art\'s `long`). */');
lines.push('  long: number;');
lines.push('  /** Frame 0 to `long`: how far the art has carried him, tiles [forward, left]. */');
lines.push('  carry: readonly (readonly [number, number])[];');
lines.push('  /** Frame 0 to `long`: where the floor point under him is, tiles [forward, left] from where he stood. */');
lines.push('  place: readonly (readonly [number, number])[];');
lines.push('  /** Frame 0 to `long`: his whole turn, degrees to his left. */');
lines.push('  spin: readonly number[];');
lines.push('}');
lines.push('');
lines.push('export const VET_BAKED: Record<VetMoveId, VetBaked> = {');
for (const m of VET_MOTIONS) {
  const carry: string[] = [];
  const place: string[] = [];
  const spin: number[] = [];
  for (let f = 0; f <= m.long; f++) {
    const c = carryAt(m, f);
    const p = placeOf(m, f).at;
    carry.push(`[${r(c[0] / VET_TILE)}, ${r(c[1] / VET_TILE)}]`);
    place.push(`[${r(p[0] / VET_TILE)}, ${r(p[1] / VET_TILE)}]`);
    spin.push(r(spinAt(m, f), 1e3));
  }
  lines.push(`  ${m.id}: {`);
  lines.push(`    long: ${m.long},`);
  lines.push(`    carry: [${carry.join(', ')}],`);
  lines.push(`    place: [${place.join(', ')}],`);
  lines.push(`    spin: [${spin.join(', ')}],`);
  lines.push('  },');
}
lines.push('};');
lines.push('');
writeFileSync(OUT, lines.join('\n'));
console.log(`wrote ${OUT} (${VET_MOTIONS.length} moves)`);
