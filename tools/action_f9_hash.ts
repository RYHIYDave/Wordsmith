// THE FLOOR 6 TO 8 ACTION MOCK-UPS (docs/mockups/action_f6): a hash of every frame the game shows of the Firepot Thrower, the
// Chanter, the quarry golem, the canyon scorpion and the dust devil, move by move, as the game's own makers hand them over
// (art/act1_figs/), so that what is added behind FIREPOT_BLAZE, CHANTER_LIGHTNING, GOLEM_BOULDER, SCORPION_SPIT and DEVIL_TWISTER
// is shown to change nothing, pixel for pixel. It imports only the game's own files, so that it runs the same on the branch this one
// came from. Nothing of the game imports it.
//   npx tsx tools/action_f6_hash.ts [moves]
import { createHash } from 'node:crypto';
import { Px } from '../src/engine/px';
import { act1Fig } from '../src/art/act1_figs/index';
import { hashMoves, whole } from './action_f3_hash';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out: Record<string, unknown> = {};
for (const k of ['deer', 'wolf', 'drowned'] as const) {
  const fig = act1Fig(k);
  if (!fig) throw new Error(`no figure for ${k}`);
  const m = hashMoves(fig.make());
  out[k] = whole(m);
  if (process.argv[2] === 'moves') out[`${k} by move`] = Object.fromEntries(Object.entries(m).map(([n, v]) => [n, `${v.length} ${createHash('sha256').update(v.join()).digest('hex').slice(0, 10)}`]));
}
console.log(JSON.stringify(out, null, 1));
