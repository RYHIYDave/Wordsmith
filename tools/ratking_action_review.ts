// THE RAT KING DONE THE ACTION WAY: the helper's own look at what the review finds (docs/mockups/action_f12_ratking). Prints every
// finding of the review for the old rigs (art/action_f1_checks.ts checkKit) on every new move, both ways round, each pair of feet as
// his soles; and of the whole-figure checks the game's own test of him makes (tests/rat_king.test.ts): FLOOR (nothing of him under
// the floor), SLIDE (no foot that is down moves, every rat's every foot), JUMP (his stand into each move, and back). Nothing of the
// game imports it.
//   npx tsx tools/ratking_action_review.ts
import { LONG9, MOVES9, STRIKES9, pose9 } from '../src/art/ratking_action';
import type { Move9 } from '../src/art/ratking_action';
import { review, whole } from '../tests/ratking_action_shapes';

/** The biggest step of any rat's middle from one frame to the next outside the strike (his own lengths). */
export function steps(m: Move9): { d: number; at: string } {
  const n = Math.round(LONG9[m] * 30);
  const [s0, s1] = STRIKES9[m];
  let best = { d: 0, at: '' };
  for (let i = 0; i < n; i++) {
    const t = i / 30;
    if (t >= s0 - 1e-6 && t < s1 - 1e-6) continue;
    const a = pose9(m, t).rats;
    const b = pose9(m, (i + 1) / 30).rats;
    a.forEach((r, k) => {
      if (r.gone > 0.5) return;
      const d = Math.hypot(b[k].c[0] - r.c[0], b[k].c[1] - r.c[1], b[k].c[2] - r.c[2]);
      if (d > best.d) best = { d, at: `rat ${k} at ${((i + 1) / 30).toFixed(3)}` };
    });
  }
  return best;
}
if (process.argv[1]?.endsWith('ratking_action_review.ts')) {
  const r = review();
  const w = whole();
  console.log([...r, ...w].join('\n') || 'nothing found');
  for (const m of MOVES9) console.log(m, 'biggest step outside the strike', JSON.stringify(steps(m)));
}
