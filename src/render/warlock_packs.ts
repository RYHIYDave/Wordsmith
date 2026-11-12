// THE WARLOCK'S PACKS ASKED FOR A MOMENT AHEAD (render/baked.ts warlockPacksOf: his moves, from each side, kept packed; the
// queue's finish-mage-and-warlock-eight-sides, 12 Nov 2026, at his word: “Why don’t you pack him away?”). As the Brawler's are
// (render/veteran_fx.ts askAhead): what he shows now, and what a press may make him show next, from the side he faces, so that
// its sheet is read before it is wanted. What is not asked for ahead is opened as it is first shown (art/asked.ts), its first
// frame shown meanwhile. Where he is not baked in packs, asking does nothing.
//
// (NO IMPORTS of the art: the side is worked out as art/sides_more.ts moreSideOf works it out, its numbers as art/sides.ts
// EIGHT_ORDER has them; the demon's two sides as render/figure.ts chooses them.)

import { MORE_SIDES, moreSideOf } from '../art/sides_more';

/** Ask for a pack of his: its name (render/baked.ts warlockPacksOf), the side (as art/sides.ts numbers them), and whether it is shown now. */
export type AskPack = (pack: string, side: number, now: boolean) => void;

/** What of the hero is read here. */
export interface WarlockAsked {
  fx: number;
  fy: number;
  form?: 'man' | 'demon';
  pact?: number;
  change?: { to: 'demon' | 'man'; t: number; dur: number } | null;
}

/**
 * Ask for his packs: `full`, his pact is full (his arm blazing; a tap changes him); `town`, in a town (nothing is fought); `over`,
 * his life has run out (his fall).
 */
export function warlockAskAhead(ask: AskPack, h: WarlockAsked, full: boolean, town: boolean, over: boolean, at = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000): void {
  const eight = MORE_SIDES.indexOf(moreSideOf(h.fx, h.fy));
  // (how long he has faced this side)
  if (eight !== FACING.side) {
    FACING.side = eight;
    FACING.since = at;
  }
  // (the demon from its two sides: from behind while it faces up the screen, render/figure.ts)
  const two = h.fx + h.fy < -0.2 ? 1 : 0;
  const demon = h.form === 'demon';
  // CHANGING: the change from his side, then the demon's stand; changing back, the demon's burning out, then his stand
  if (h.change) {
    if (h.change.to === 'demon') {
      ask('change', eight, true);
      ask('it-stand', two, false);
    } else {
      ask('it-burn', two, true);
      ask('stand', eight, false);
    }
    return;
  }
  if (over) {
    ask(demon ? 'it-stand' : 'fall', demon ? two : eight, true);
    return;
  }
  // WHAT IS ASKED FOR AHEAD IS KEPT SMALL: a pack asked for within the last 1.5 s is never let go (render/baked.ts PACKS.fresh), and
  // he turns from side to side as he fights, so whatever is asked ahead from his side is held from every side he has faced. First
  // tried (a bot fighting floors 1 and 2): the change too while his pact was full, and the demon's two slashes and Damning; open
  // packs came to 90 MB at the most where the budget is 32. Now only his stand and what a tap makes him do, and the change once he
  // has faced one way a moment (below); the rest (his curse, the demon's other moves) opened as each is first shown, its first
  // frame shown meanwhile, a few hundredths of a second.
  if (demon) {
    ask('it-stand', two, true);
    if (town) return;
    ask('it-slashL', two, false);
    return;
  }
  ask(full ? 'standBlaze' : 'stand', eight, true);
  if (town) return;
  ask('bolt', eight, false);
  // (HIS PACT FULL, a tap on him changes him: the change from his side, once he has faced it CHANGE_AHEAD seconds. Its sheet takes
  // the longest of his to read, up to 0.4 s seen here, and shown not yet in hand it would stand on its first frame that long; but
  // asked for from every side he faced as he turned, one of 8 MB each, they would all be held)
  if (full && at - FACING.since >= CHANGE_AHEAD) ask('change', eight, false);
}

/** How long he has faced a side before the change from it is asked for ahead (seconds). */
export const CHANGE_AHEAD = 0.4;
/** The side he faced last, and since when (seconds). */
const FACING = { side: -1, since: 0 };
