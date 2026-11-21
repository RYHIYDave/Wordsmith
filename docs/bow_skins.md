# THE RANGER'S UNIQUE BOWS IN HIS HAND: FOR THE MAIN CHAT (14 Nov 2026)

A chat of his of 13 and 14 Nov (the skins chat), on `art/bow-skins`, from `art/staff-skins` (the Mage's staves and the bake made
quicker, on the ship list: read docs/staff_skins.md first). Not the main chat: `main` is untouched, nothing is published.

## His words

- 14 Nov 2026, of the Mage's staves done: “then do it for the rest of the cast”; asked whether to start, by pop-up: “Start the
  rest of the cast (Recommended)”.
- Shown the four bows on him (docs/mockups/bow_skins/pictures/bows_moves.mp4, bows_stills.png), by pop-up: “Yes, all four
  (Recommended)”.
- Shown him in the game holding each bow (docs/mockups/bow_skins/pictures/bows_in_game.mp4, put on from his bag as a player does,
  on floor 11, and in town), asked whether to turn them on for the next update, by 20:06 Eastern: “Yes, switch them on
  (Recommended)”.

## What it is

- HIS BOW A SKIN (src/art/ranger_up.ts): `BowAt` (where his bow is a frame: his left hand or his back, the way the arrow points,
  along the bow, each tip at this draw, the moment), `BowSkin` (its solids and nocks; `fan`, the arrows on the string; `extras`),
  `PLAIN_BOW` his own bow: painted with it he is the very frame he was (1000 frames, his twenty moves from eight sides, hashed
  the same as before).
- THE FOUR BOWS (src/art/bow_skins.ts), each to its bag picture (art/items_unique.ts):
  - THE RAINWALKER (`rainwalker`): storm-grey limbs, a grey rain cloud caught on the upper tip (level whichever way the bow is
    held, its underside dark), raining all the time.
  - THREEFOLD (`fan`): pale ash bound in brass (caps on the tips, bands at the grip); three arrows on the string, spread 24
    degrees each way along the bow.
  - THE POACHER'S BOW (`poachersbow`): rough dark wood, no recurve, three iron trap's teeth along the back of each limb, and a
    snare (a loop of cord on a short line) hung from the lower tip, swinging.
  - THE FLEDGLING (`fledgling`, the levelling unique of floor 5): young green-gold wood, a little thinner, three bright leaves
    sprouting from the limbs.
  Nothing of them glows (his lights with each are his own bow's): his string the friend's cyan as ever.
- IN THE GAME (art/heroes.ts `BOW_SKINS`, ON at his yes in play): `bowWorn(item)`, and `wornSkin(cls, item)` for the
  Mage's staves and his bows alike; his places with each bow (`BOW_PLACES`, in town and a dungeon); heroes3 paints him with it;
  render.ts, the loading screen and the painter ask for those places; a bake group for each (`ranger-rainwalker` ...), and his
  own bow's and a bow's sets let go of as he swaps (render/baked.ts holdOnly, as hers).
- tools/bake_marks.mjs: art/bow_skins.ts is the Ranger's own (HERO_ROOTS).

## What the main chat must do

- Bring in `art/bow-skins` (it holds `art/staff-skins`: take this one in its place, or after it). THE HEROES' BAKE: four more
  groups, `ranger-rainwalker`, `ranger-threefold`, `ranger-poachers`, `ranger-fledgling` (24 more files in heroes/<mark>/,
  counted in the claude.ai page's 511), each fetched only when he holds that bow. art/ranger_up.ts changed (his pictures the
  same), so his groups and the cards' are baked again.
- On the release page: tools/scenarios/baked.mjs (CLS=ranger), and the Ranger with a unique bow put on.

## Checked

- tsc clean.
- His own bow as a skin: 1000 frames (his twenty moves, every few frames, from eight sides) hashed the same as before.
- tests/bow_skins.test.ts (5: the switch; his own bow the same frame; each bow its own, nothing of it glowing; the four worn,
  their places, looks, his art painted with each, a bake group each; his sets let go of as he swaps, not by the Mage's places).
  With bake_marks, the staff tests, baked, hero_cards_baked and the core: 28 of 28 on 3442f94.
- In the game (dist/bow_look.html, unbaked): him with each bow put on from his bag, on floor 11 and in town, filmed
  (bows_in_game.mp4 and _sides.png): his yes.
- NOT CHECKED: his groups baked in a real browser (the let-go is the staves', checked so: docs/staff_skins.md); a whole bake;
  the release page; his phone.
