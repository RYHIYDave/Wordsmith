# THE BRAWLER'S UNIQUE WRAPS AND THE WARLOCK'S UNIQUE TOMES: FOR THE MAIN CHAT (14 Nov 2026)

A chat of his of 13 and 14 Nov (the skins chat), on `art/wrap-tome-skins`, from `art/warrior-skins` (the Warrior's weapons, which
holds the Tinkerer's wrenches, the Ranger's bows, the Mage's staves, the bake made quicker and the Warrior's bascinet: on the ship
list; read docs/staff_skins.md, docs/bow_skins.md, docs/wrench_skins.md and docs/warrior_skins.md first). Not the main chat:
`main` is untouched, nothing is published.

## His words

- 14 Nov 2026, of the Mage's staves done: “then do it for the rest of the cast”; asked whether to start, by pop-up: “Start the
  rest of the cast (Recommended)”.
- Shown the Brawler's four unique wraps (docs/mockups/wrap_skins/pictures/wraps_moves.mp4, wraps_stills.png), by pop-up: “Yes,
  all four (Recommended)”.
- Shown the Warlock's four unique tomes (docs/mockups/tome_skins/pictures/tomes_moves.mp4, tomes_stills.png; told the Restless
  Tome is not at his hip, as it flies round him in play, only its chain hanging empty), by pop-up: “Yes, all four (Recommended)”.
- Told, as the pictures were sent, that each weapon is a whole set of the hero baked, as the other heroes' are, and not a layer of
  only the fists or the book laid over his own (which cannot take the Restless Tome's book away), and that a hero's packs go in
  one file to keep the page under its files.

## What it is

- HIS WRAPS A SKIN (src/dev/sculpt_veteran.ts `WrapAt`, `WrapSkin`, `PLAIN_WRAPS`, `VET_WRAPS`): the straps round his knuckles,
  hand and wrist, a pattern on them, and what is added to each fist, laid last, after his headband's tails (which keep clear of
  every solid before them). His own wraps paint him exactly as before: 1,654 frames of his eight sides hashed the same.
  src/art/wrap_skins.ts: THE LAST ROUND (straps charred, embers, fire licking up off both fists), THE FOURTH GLOBE (a punch's
  green, a kick's orange, a jump's white and a fourth on the knuckles of both fists, in dark steel), HOT STREAK (white linen
  gilt at the knuckles, a blue rosette on his lead wrist), TAPED KNUCKLES (white tape, two red bands). Only the fire glows.
  art/veteran_art.ts: `makeVeteranArt(wraps)`, each frame painted with them and kept apart from his own (vetFrame).
- HIS BOOK A SKIN (src/dev/sculpt_warlock.ts `TomeAt`, `TomeSkin`, `PLAIN_TOME`, `WARLOCK_TOME`): its cover, its own colours (of
  the book's stuff, so the change tears it away as it does his own), none at all (`gone`), or what is added (only of the book's
  stuff and the chain's steel: a stuff of its own would put every stuff after it out of its number); a unique one hangs further
  out over his coat's skirts and bigger, to be seen (his own is half under them). His own book paints him exactly as before: 717
  frames hashed the same. src/art/tome_skins.ts: THE LEDGER OF DEBTS, THE RESTLESS TOME (no book: its chain empty, a link broken
  open), THE BURNING VERSE, THE HORNBOOK. art/warlock_up_art.ts: the man brought up with a tome (`look.tome`), his change into the
  Living Shadow painted with it too (art/shadow_art.ts shadowChangeClipOf takes `around`). The demon, his class card: as ever.
- IN THE GAME (art/heroes.ts `WRAP_SKINS`, `TOME_SKINS`, BOTH OFF until his yes in play): `wrapWorn`, `tomeWorn`, `wornSkin`
  for both; their places (`WRAP_PLACES`: town and dungeon; `TOME_PLACES`: town, dungeon and his arm blazing); heroes3 paints
  them; render.ts asks for the Warlock's places with his tome, the loading screen waits for his demon too; the painter paints a
  tome's places as any hero's (render/painter.ts).
- THE BAKE (render/baked.ts): a group for each, `brawler-<wraps>` (the Veteran's only) and `warlock-<tome>` (town, dungeon,
  blazing), kept in packs as their own pictures are; while TOME_SKINS is on, THE WARLOCK'S DEMON IS A GROUP OF ITS OWN,
  `warlock-demon`, kept whatever book he wears. A packed group may now be let go of whole (letGoGroup: its packs let go and
  forgotten, one being unpacked thrown away), so he holds only the set he wears, as the Mage her staff's. A hero's packs in hand
  are let go of when ANOTHER CLASS is played (by the class, not the group: his demon and the man are two groups of one run).
  `wantOf(cls, ...)` asks whichever of his groups is in hand (main.ts: the Brawler's and the Warlock's asks ahead).
- A HERO'S PACKS IN ONE FILE (tools/bake_heroes.mjs; render/baked.ts takePacks): a group's packs are one file,
  `<group>-packs.png`, each pack's PNG whole one after another, each pack's `sheet` that file and `off`, `len` where its bytes
  lie; each opened from its own bytes. The Brawler's and the Warlock's ~100 files each become one; their unique sets would have
  been ~700 files more, past the page's 511. A bake of the old way (a file a pack) is read as before.
- tools/bake_marks.mjs: wrap_skins.ts the Brawler's own, tome_skins.ts the Warlock's (HERO_ROOTS).

## What the main chat must do

(below, as done)

## Checked

- tsc clean.
- His own wraps and his own book as skins: 1,654 and 717 frames hashed the same as before.
- tests/wrap_skins.test.ts (4), tests/tome_skins.test.ts (5), tests/packs_one_file.test.ts (2: one file fetched once, each pack
  its own bytes, the old way as before; a packed group let go of whole and fetched again, wantOf).
