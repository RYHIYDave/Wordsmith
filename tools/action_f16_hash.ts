// THE FLOORS 16 TO 19 ACTION MOCK-UPS (docs/mockups/action_f16): a hash of every frame the game shows of the Hushed gardener, the groom,
// the palace guard (both looks), the masked dancer (its first look) and the king's knight, move by move, as the game's own makers hand
// them over (art/act1_figs/), so that what is added behind GARDENER_HEDGE, GROOM_HORSE, GUARD_DRILL, DANCER_THROW and KNIGHT_BANNER is
// shown to change nothing, pixel for pixel. It imports only the game's own files, so that it runs the same on the branch this one came
// from. Nothing of the game imports it.
//   npx tsx tools/action_f16_hash.ts
import { Px } from '../src/engine/px';
import { act1Fig } from '../src/art/act1_figs/index';
import { hashMoves, whole } from './action_f3_hash';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out: Record<string, unknown> = {};
for (const k of ['gardener', 'groom', 'pguard', 'dancer', 'kknight'] as const) {
  const fig = act1Fig(k);
  if (!fig) throw new Error(`no figure for ${k}`);
  out[k] = whole(hashMoves(fig.make()));
  if (k === 'pguard' && fig.looks) out['pguard:1'] = whole(hashMoves(fig.looks[0].make()));
}
console.log(JSON.stringify(out, null, 1));
