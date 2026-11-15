# THE TINKERER'S UNIQUE WRENCHES IN HER HAND: FOR THE MAIN CHAT (14 Nov 2026)

A chat of his of 13 and 14 Nov (the skins chat), on `art/wrench-skins`, from `art/bow-skins` (the Ranger's bows, which holds the
Mage's staves and the bake made quicker: on the ship list; read docs/staff_skins.md and docs/bow_skins.md first). Not the main
chat: `main` is untouched, nothing is published.

## His words

- 14 Nov 2026, of the Mage's staves done: “then do it for the rest of the cast”; asked whether to start, by pop-up: “Start the
  rest of the cast (Recommended)”.
- Shown the four wrenches on her (docs/mockups/wrench_skins/pictures/wrenches_moves.mp4, wrenches_stills.png), by pop-up:
  “Yes, all four (Recommended)”.
- Shown her in the game holding each wrench (docs/mockups/wrench_skins/pictures/wrenches_in_game.mp4, put on from her bag as a
  player does, on floor 11, and in town), asked whether to turn them on for the next update, by 21:25 Eastern: “Yes, switch
  them on (Recommended)”.

## What it is

- HER WRENCH A SKIN (src/dev/sculpt_tinkerer.ts): `WrenchAt` (her fist, the way her hand runs, the way the wrench runs, how far
  its head is, how big, her up), `WrenchSkin`, `PLAIN_WRENCH` her own wrench (painted with it she is the very frame she was: 528
  frames, every fifth of every list from her eight sides, hashed the same as before), and `TINK_WRENCH`, the wrench she is painted
  holding, set by art/tinkerer_art.ts only while it paints her with a unique one (`makeTinkererArt(skin)`).
- THE FOUR WRENCHES (src/art/wrench_skins.ts), each to its bag picture (art/items_unique.ts):
  - THE SECOND WHISTLE (`secondwhistle`): her wrench, its grip wrapped red, two brass whistles hung beside it on red cords.
  - TARWRENCH (`stickywrench`): its jaw clotted with green paste, runs of it down the shaft, a vial stuck fast in it.
  - THE FOREMAN'S WRENCH (`foremanswrench`): its shaft striped yellow and black, its jaw dark, a brass gear at its throat, a
    brass star on its jaw.
  - THE BORROWED SPANNER (`borrowedspanner`, the levelling unique of floor 13): old tin-grey, a little thinner, someone else's
    name tag tied on.
  Nothing of them glows. Each keeps its parts as `wrench` and a `jaw` (her ponytail swings clear of them).
- IN THE GAME (art/heroes.ts `WRENCH_SKINS`, ON at his yes in play): `wrenchWorn(item)` and `wornSkin` for her; her places
  with each wrench (`WRENCH_PLACES`, town and dungeon, one set of her for both as her own); heroes3 paints her with it; a bake
  group for each (`tinkerer-secondwhistle` ...), her own wrench's and a wrench's sets let go of as she swaps.
- tools/bake_marks.mjs: art/wrench_skins.ts is the Tinkerer's own (HERO_ROOTS).

## What the main chat must do

- Bring in `art/wrench-skins` (it holds `art/bow-skins` and `art/staff-skins`: take this one in their place, or after them).
  THE HEROES' BAKE: four more groups, `tinkerer-secondwhistle`, `tinkerer-stickywrench`, `tinkerer-foremanswrench`,
  `tinkerer-borrowedspanner` (her group is 3 files: about 12 more in heroes/<mark>/), each fetched only when she holds that
  wrench. dev/sculpt_tinkerer.ts and art/tinkerer_art.ts changed (her pictures the same), so her group and the cards' are baked
  again.
- On the release page: tools/scenarios/baked.mjs (CLS=tinkerer), and the Tinkerer with a unique wrench put on.

## Checked

- tsc clean.
- Her own wrench as a skin: 528 frames (every fifth of every list, from her eight sides) hashed the same as before.
- tests/wrench_skins.test.ts (5: the switch; her own wrench the same frames; each wrench its own; the four worn, their places,
  looks, her art painted with each, one set of her for town and a dungeon, a bake group each; her sets let go of as she swaps,
  not by the Ranger's places). With the bow and staff tests, bake_marks, baked, hero_cards_baked, tinkerer and the core: 30 of 30
  on e1eb337.
- In the game (dist/wrench_look.html, unbaked): her with each wrench put on from her bag, on floor 11 and in town, filmed
  (wrenches_in_game.mp4 and _sides.png): his yes.
- NOT CHECKED: her groups baked in a real browser (the let-go is the staves', checked so); a whole bake; the release page; his
  phone.
