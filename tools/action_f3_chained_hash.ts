// THE CHAINED ONE'S MOVES DONE THE ACTION WAY (docs/mockups/action_f3_chained): a hash of every frame the game shows of the
// Chained One, in all three of his states (all his chains on him, his left one broken, free of the ball too), move by move, both
// ways round, as the game makes him (art/bosses3.ts makeChainedArt3), so that what is added behind CHAINED_ACTION is shown to
// change nothing, pixel for pixel. It imports only the game's own files, so that it runs the same on the branch this one came
// from. Nothing of the game imports it.
//   npx tsx tools/action_f3_chained_hash.ts [moves]
import { createHash } from 'node:crypto';
import { Px } from '../src/engine/px';
import { makeChainedArt3 } from '../src/art/bosses3';
import { hashMoves, whole } from './action_f3_hash';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
if (process.argv[1]?.endsWith('action_f3_chained_hash.ts')) {
  const out: Record<string, unknown> = {};
  for (const freed of [0, 1, 2] as const) {
    const m = hashMoves(makeChainedArt3(undefined, freed));
    out[`chained${freed || ''}`] = whole(m);
    if (process.argv[2] === 'moves') out[`chained${freed || ''} by move`] = Object.fromEntries(Object.entries(m).map(([k, v]) => [k, `${v.length} ${createHash('sha256').update(v.join()).digest('hex').slice(0, 10)}`]));
  }
  console.log(JSON.stringify(out, null, 1));
}
