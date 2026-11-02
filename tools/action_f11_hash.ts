// THE FLOORS 11 TO 15 ACTION MOCK-UPS (docs/mockups/action_f11): a hash of every frame the game shows of the Hushed watchman, the
// reaper, the orderly and the Bookwarden, move by move, as the game's own makers hand them over
// (art/act1_figs/), so that what is added behind WATCH_LANTERN, FIELD_HARVEST, ORDERLY_GURNEY and WARDEN_BARRAGE
// is shown to change nothing, pixel for pixel. It imports only the game's own files, so that it runs the same on the branch this one
// came from. Nothing of the game imports it.
//   npx tsx tools/action_f11_hash.ts [moves]
import { createHash } from 'node:crypto';
import { Px } from '../src/engine/px';
import { act1Fig } from '../src/art/act1_figs/index';
import { hashMoves, whole } from './action_f3_hash';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out: Record<string, unknown> = {};
for (const k of ['watch', 'fieldhand', 'orderly', 'bookwarden'] as const) {
  const fig = act1Fig(k);
  if (!fig) throw new Error(`no figure for ${k}`);
  const m = hashMoves(fig.make());
  out[k] = whole(m);
  if (process.argv[2] === 'moves') out[`${k} by move`] = Object.fromEntries(Object.entries(m).map(([n, v]) => [n, `${v.length} ${createHash('sha256').update(v.join()).digest('hex').slice(0, 10)}`]));
}
console.log(JSON.stringify(out, null, 1));
