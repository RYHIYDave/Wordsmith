# THE HERO CARDS ALL FACE DOWN AND TO THE RIGHT: FOR THE MAIN CHAT (13 Nov 2026)

A chat of his of 13 Nov (the skins chat), on `fix/cards-face-down-right`, from `main` 31394d9. Not the main chat: `main` is
untouched, nothing is published.

## His words

- 13 Nov 2026, 20:53 (Eastern): “The idle animations on the character selection screen snap the sprites to the side.  All the
  sprites should be facing the same way.  Probably down right like the brawler”.
- Shown a film of the cards before and after (the old on top, the new below: cards_facing.mp4, sent in his chat), asked by
  pop-up whether to send it to the next update: “Yes, ship it (Recommended)”.

## What it was

On the cards the Warrior, the Ranger, the Mage and the Warlock (painted from eight sides) faced down the screen (`toward`), and
the Brawler and the Tinkerer (two sides on their cards) down and to the right (their front). What a hero does left standing
(idleA, idleB) and his making ready are painted from the front only, so for each of them the eight-sided heroes snapped round
to their front and back again.

## What it is

- `src/art/sides.ts` CARD_FACING: `{ fx: 1, fy: 0 }` (was 0.7071, 0.7071): every card's hero seen from his front. Nothing else
  of the game reads it but `ui/panels.ts` (the card's figure) and `art/heroes3.ts` cardLists (what the cards' bake group holds).
- `art/heroes3.ts` cardLists: unchanged in code; with every hero seen from his front, the cards' bake holds the front's
  standing, running and comings to a stand, and no single frames (`one` is empty).
- `tests/hero_cards_baked.test.ts`: told of it (the side is the front; the card played facing CARD_FACING).

## What the main chat must do

- THE HEROES' BAKE HAS A NEW MARK (the cards' group changes: the front's lists in place of `toward`'s). Bake again as for any
  change to the heroes' art (tools/bake_heroes.mjs, as the build does). Every hero's own sheets for the town and the dungeon
  are unchanged; only the cards' group differs.
- The playtest `tools/scenarios/hero_cards_baked.mjs` on the release page with its bake (not run here: no bake made here).

## Checked

- tsc clean; `tests/hero_cards_baked.test.ts` 2 of 2, `tests/baked.test.ts` 5 of 5.
- Filmed on pages built from `main` and from this branch (tools/build_to.mjs, not baked: the cards painted as they are shown),
  the cards left standing, then the Ranger, the Warrior and the Mage chosen and the Mage confirmed: on the new page all six
  face down and to the right throughout; none turns.
