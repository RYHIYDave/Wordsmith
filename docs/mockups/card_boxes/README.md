# Every hero's portrait the whole card, as the Warlock's (the queue's item of his own, 12 Nov 2026)

Branch `fix/hero-card-boxes`, from `main` at d39dcde8 (25.3.13). The Queue chat of 12 Nov (14:39), at his word to start it, asked
by pop-up whether to take the next queue item: “Yes, start it (Recommended)”.

HIS WORDS, the queue's item (added from his phone, 12 Nov 2026), “expand character model box in character selection screen”: **“the
warlock has the entire box for his idle animations and i can see the line in all the other portraits where the cutoff is.  go
ahead and make all of them like the warlock”**.

WHAT IT WAS: on the class cards (`src/ui/panels.ts`, CARDS3: each card on its side, the portrait at its left), each hero was drawn
cut to the portrait's own box, the left 70 of the card's width. Only the Warlock had the whole card (since 1 Nov, his words then:
“Oh and the warlock gets cut off in the character select screen”). So for the five others the pool of light behind them, and
anything of theirs that went past it (the Ranger's bow, a scarf as it swings, a staff, a step as they walk on the spot), stopped at
a straight line down the card.

THE MEND: every hero is cut only by the card's own edge, as the Warlock is. The card's words and icons beside them are drawn after
them, over anything of theirs that reaches that far, as over the Warlock's fire. The Warlock still stands a little further in. One
line of `src/ui/panels.ts`.

PICTURE: `cards_now_and_mended.png` (1860 x 1285): the cards as the game shows them now, above, and mended, below, at a phone's
size (844 x 390 at 3), the same moment; made with `tools/scenarios/card_boxes.mjs` on pages of the game before and after
(`node tools/build_to.mjs`).

CHECKED: tsc clean; `tools/scenarios/cards3.mjs` on the page mended: the cards three to a row in two rows, clear of the buttons,
a card pressed starts nothing; its last check (CONFIRM starts the hero within four seconds) failed on the page mended AND ON THE
PAGE AS `main` IS, the same way: a page with no bake beside it, where the heroes' pictures are painted as they are shown; not of
this. `node tools/unit.mjs --only class_cards_paint,hero_cards_baked` and the core on 5dcc5721c1: 25 files, all passed.

**HIS YES, 12 Nov 2026**, sent `cards_now_and_mended.png` and asked by pop-up whether it is right: **“Yes, hand it to main
(Recommended)”**. On the queue's ship list as `expand-hero-card-boxes`.

FOR THE MAIN CHAT: merge `fix/hero-card-boxes` (one line of `src/ui/panels.ts`, the README and picture, a scenario). The heroes'
bake is not touched: the cards' pictures are the same, only where they are cut.
