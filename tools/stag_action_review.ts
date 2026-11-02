// THE HOLLOW STAG'S NEW MOVES THROUGH THE REVIEW FOR THE OLD RIGS (the helper's own, while drawing): every finding, both ways round.
// Nothing of the game imports it.
//   npx tsx tools/stag_action_review.ts
import { checkKit } from '../src/art/action_f1_checks';
import { MOVES9 } from '../src/art/stag_action';
import { stagKit, standKit } from '../tests/stag_action_shapes';

const said: string[] = [];
for (const v of ['front', 'back'] as const) {
  for (const pair of [0, 1] as const) {
    for (const m of MOVES9) {
      const into = m === 'stare' ? { ...stagKit(v, 'walk', pair), name: 'walk' } : standKit(v, pair);
      for (const f of checkKit(stagKit(v, m, pair), into)) {
        // (standing to stare begins as a bound lands: its handing over is from his walk's landing, and back into his stand)
        if (m === 'stare' && (f.move === 'stare > stand' || f.move === 'stand > stare')) continue;
        said.push(`${v} ${f.move} (${pair ? 'hind' : 'fore'}): ${f.kind} ${f.what}, ${f.by.toFixed(1)} at ${f.t.toFixed(2)} s`);
      }
      if (m === 'stare') for (const f of checkKit(stagKit(v, m, pair), standKit(v, pair))) if (f.move === 'stare > stand') said.push(`${v} ${f.move} (${pair ? 'hind' : 'fore'}): ${f.kind} ${f.what}, ${f.by.toFixed(1)}`);
    }
  }
}
console.log(said.length ? said.join('\n') : 'nothing found');
