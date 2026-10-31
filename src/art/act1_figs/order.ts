// ACT 2, PART TWO, THE HIGH CITY: FLOOR 17: THE SILENT ORDER: their pictures as the game holds a monster (art/act1_figs/types.ts),
// the art chat's (art/silent_order.ts, silent_order_moves.ts; his yes, “Yes, that's the Order (Recommended)”), as handed over:
// makeOrderArt3(ORDER_GUEST), floor 17's dressing of the one design (cloaked guests at the ball): their stillness (stand), the run
// (walk), the hushing palm (attack), the knife and the rush (clips.moves), struck, and the mask cracking and the cloak falling
// empty (die). The knight's size.
import { ORDER_ON } from '../silent_order';
import { ORDER_ARMED, ORDER_GUEST, makeOrderArt3 } from '../silent_order_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makeOrderArt3(ORDER_GUEST),
  size: { top: 29, half: 9 },
  switches: [ORDER_ON],
  // (FLOOR 19, THE KEEP: the Order's armed last, cloaks over mail, a little taller and broader: Monster.form 1 there,
  // game/act1_rules/order.ts; their knife clip three knives fanned in the fist, his “A fan of three on 19 (Recommended)”)
  looks: [{ make: () => makeOrderArt3(ORDER_ARMED), size: { top: 30, half: 10 }, switches: [ORDER_ON] }],
};
