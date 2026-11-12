# The Pack Collar's companion, picked on the collar

Branch `build/pack-collar-picker`, cut from main 10161fc (25.3.10). Built by the Pack Collar chat (session ...VetztYx), a chat
of his working from the queue (item `add-pack-collar-companion-picker`), 12 Nov 2026. Not the main chat: main untouched,
nothing published.

## His words

- Asked by pop-up how she picks the collar's companion (our pick was a second row on the companion talent's card), by 12:26
  Eastern: “Pick it on the collar” (offered as: tap the collar in the bag, in town, to pick its companion).
- Asked whether it may be the animal she already has: “No, one of the other two (Recommended)”.
- Shown pictures 2, 3 and 4 below, and told the two readings (both talents: either list; no companion talent: the hunting
  list), by 12:37: “Yes, hand it to main (Recommended)”.

## What it is

Behind UNIQUES (off): nothing he sees in the game changes.

- `game/companions.ts`: `PetPicks` (the picks kept, now with `collar`); `collarChoices` (the lists of the companion talents
  she has taken, none taken: the hunting list; never one of her own picks); `collarPick` (the one picked while it may be;
  else, as first built, the next in the list after her own; no talent: the hawk). `cleanPicks` keeps `collar` from a save.
- `game/game.ts`: `petsWanted` takes the collar's from `collarPick`; `collarChoices()`, `collarCompanion()`,
  `pickCollarCompanion(kind)` (town only). Her own pick changed to the collar's: the collar's goes back to the next after
  hers (never twins). The collar's keeps the third place, behind her, as built.
- `ui/panels.ts`: the collar's card says what it brings, in the companions' own words (as a companion talent's card does),
  and nothing of where it is picked.
- `ui/inventory.ts`: on the collar's card, worn or in the bag, a row of the companions it may bring above its buttons, the
  one it brings lit (marks `collar:<kind>`). In town a tap picks; out of town a tap picks nothing and the inventory's note
  says “Choose companion in town”. One letter size for the whole row.
- HIS WORDS, 12 Nov, 12:41, told the card said PICK ANOTHER IN TOWN out of town: “I’d rather it not say anything until you
  tap on it or something then a message says “Choose companion in town” or something like that”. Read as: no line about
  it on the card; the row shown out of town too; a tap there gives that message. Picture 5. Shown it, 12:43: “Yes, hand it
  to main (Recommended)”.
- THE COMPANION TALENTS' CARDS THE SAME (ui/talents.ts): asked, 12:43, whether they should work the same way, “Yes, same on
  those (Recommended)”. Their PICK ANOTHER IN TOWN line is gone; their row of three is shown out of town too, and a tap there
  picks nothing and says “Choose companion in town”. Picture 6. NOT BEHIND UNIQUES: COMPANIONS is on in the release, so this
  part shows in the live game once merged.

## Checked

- tsc clean.
- `tests/pack_collar_pick.test.ts` (new, 4); `unit --only pack_collar_pick,companions,uniques_heroes,uniques_game` and the
  core on 6de0bab492: 27 files, 336 tests, all passed (the foot of this note).
- `tools/scenarios/pack_collar_pick.mjs` (new) on `node tools/build_to.mjs dist/collar.html`, a phone's screen
  (`--touch --size 844x390 --dpr 3`): finished clean. Pictures in `pictures/`.

Not checked: a phone; the published page's playtests.

## For the main chat

Merge it (it touches `ui/inventory.ts` near the card's buttons and `game/game.ts` by the companions); nothing to switch on,
nothing to bake. It goes live with the uniques, at his yes to them (queue item `build-unique-items`).

## Unit run

`node tools/unit.mjs --only pack_collar_pick,companions,uniques_heroes,uniques_game` on 6de0bab492 (the code commit):
UNIT DONE 6de0bab492: 27 files, 27 passed, 0 failed (336 tests; the core among them).
