// THE REVIEWS OF FLOORS 9 AND 10'S NEW MOVES, said (the helper's own, while drawing): what checkKit and checkBoss find. Nothing of the game imports it.
//   npx tsx tools/action_f9_review.ts [deer|wolf|drowned]
import { Px } from '../src/engine/px';
import { checkKit } from '../src/art/action_f1_checks';
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { FROST_DROWNED } from '../src/art/action_f9_fen';
import { deerKit, frostDrownedShape, wolfKit } from '../tests/action_f9_shapes';
(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const only = process.argv[2];
const said: string[] = [];
for (const v of ['front', 'back'] as const) {
  if (!only || only === 'deer') for (const pair of [0, 1] as const) for (const m of ['attack', 'charge'] as const) for (const f of checkKit(deerKit(v, m, pair), deerKit(v, 'stand', pair))) said.push(`deer ${v} ${f.move} (pair ${pair}): ${f.kind} ${f.what}, ${f.by.toFixed(1)} at ${f.t.toFixed(2)} s`);
  if (!only || only === 'wolf') for (const f of checkKit(wolfKit(v, 'attack'), wolfKit(v, 'stand'))) said.push(`wolf ${v} ${f.move}: ${f.kind} ${f.what}, ${f.by.toFixed(1)} at ${f.t.toFixed(2)} s`);
}
console.log(said.join('\n') || 'kits: nothing found');
if (!only || only === 'drowned') {
  const found = checkBoss(FROST_DROWNED, frostDrownedShape(), ['attack', 'retch']);
  console.log(findingsSaid(found).join('\n') || 'drowned: nothing found');
}
