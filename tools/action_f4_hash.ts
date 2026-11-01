// THE FLOOR 4 ACTION MOCK-UPS (docs/mockups/action_f4): a hash of every frame the game shows of the Ossuary Golem and the dagger
// cultist, move by move, with the game's own switches, so that what is added behind GOLEM_HURL (art/action_f4_fx.ts) and
// DAGGER_FRENZY (art/cultists.ts) is shown to change nothing, pixel for pixel. It imports only the game's own files, so that it runs
// the same on the branch this one came from. Nothing of the game imports it.
//   npx tsx tools/action_f4_hash.ts [moves]
import { createHash } from 'node:crypto';
import { Px } from '../src/engine/px';
import { makeBestiary, useMonsterAttacks } from '../src/art/bestiary';
import { hashMoves, whole } from './action_f3_hash';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out: Record<string, unknown> = {};
for (const moves of [true, false]) {
  useMonsterAttacks(moves);
  const be = makeBestiary();
  for (const f of ['golem', 'dagger'] as const) {
    const m = hashMoves(be.of(f));
    out[`${f}${moves ? '' : ' (their moves off)'}`] = whole(m);
    if (process.argv[2] === 'moves') out[`${f}${moves ? '' : ' (their moves off)'} by move`] = Object.fromEntries(Object.entries(m).map(([k, v]) => [k, `${v.length} ${createHash('sha256').update(v.join()).digest('hex').slice(0, 10)}`]));
  }
}
useMonsterAttacks(true);
console.log(JSON.stringify(out, null, 1));
