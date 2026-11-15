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
- Shown them in the game (docs/mockups/wrap_skins/pictures/wraps_in_game.mp4, docs/mockups/tome_skins/pictures/tomes_in_game.mp4,
  and their `_sides.png`: put on from the bag as a player does, on floor 11 and in town), told their pictures load and swap from
  the bake in a real browser, asked whether to turn them on for the next update, by pop-up, by 09:16 Eastern, 15 Nov: “Yes,
  switch them on (Recommended)”.
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
- IN THE GAME (art/heroes.ts `WRAP_SKINS`, `TOME_SKINS`, BOTH ON at his yes in play): `wrapWorn`, `tomeWorn`, `wornSkin`
  for both; their places (`WRAP_PLACES`: town and dungeon; `TOME_PLACES`: town, dungeon and his arm blazing); heroes3 paints
  them; render.ts asks for the Warlock's places with his tome, the loading screen waits for his demon too; the painter paints a
  tome's places as any hero's, and lets the Veteran's last set go as the Veteran (render/painter.ts: it had asked as the Brawler
  of old, found in a real browser with both his sets held).
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

- Bring in `art/wrap-tome-skins` (it holds `art/warrior-skins`, with main 25.3.20 merged in: bring in this one in its place, or
  after it).
- THE HEROES' BAKE: every packed group's packs are now ONE FILE (`<group>-packs.png`): the Brawler's group is 3 files where it was
  98, the Warlock's man 3 and his demon 5 where the two were 109; the bake's page knows to read them (render/baked.ts), and a bake
  of the old way is read as before. NEW GROUPS: `brawler-lastround`, `brawler-fourthglobe`, `brawler-winningstreak`,
  `brawler-tapedknuckles` (each 3 files, about 4.4 MB, about 7 minutes to paint), `warlock-ledgerofdebts`,
  `warlock-restlesstome`, `warlock-burningverse`, `warlock-hornbook` (each 3 files, about 4.1 MB, about 10 minutes), and
  `warlock-demon` (5 files, about 4 MB, 5 minutes): the eight unique sets 24 files, and the Brawler's and the Warlock's own 11 where
  they were 207. Measured here, two at
  once: the Brawler 409 s, the Last Round 425 s, the Warlock's man 622 s, his demon 320 s, the Hornbook 613 s. The Brawler's and
  the Warlock's own groups are baked again (their art files changed, their pictures the same), and the cards'.
- On the release page: tools/scenarios/wraps_swap_baked.mjs and tools/scenarios/tomes_swap_baked.mjs (each flags only the cards'
  404 on a page with only these groups baked; on the release page, none), and tools/scenarios/baked.mjs (CLS=brawler, warlock).

## Checked

- tsc clean.
- His own wraps and his own book as skins: 1,654 and 717 frames hashed the same as before.
- tests/wrap_skins.test.ts (4), tests/tome_skins.test.ts (5), tests/packs_one_file.test.ts (2: one file fetched once, each pack
  its own bytes, the old way as before; a packed group let go of whole and fetched again, wantOf); tests/baked.test.ts (his demon's
  group), tests/veteran.test.ts (his wraps reach his sculptor). Before the switches went on, with them and the pack tests, baked,
  hero_cards_baked, warlock_up, veteran and the core: 30 of 30 on ad79f31f; with the switches on, those and the bow, wrench, warrior and staff skins' tests and the core: 36 of 36 on d8887293.
- In the game (dist/wraptome_look.html, unbaked): each put on from the bag, on floor 11 and in town, filmed: his yes.
- BAKED, IN A REAL BROWSER (tools/bake_some.mjs dist/wraps_baked.html brawler,brawler-lastround,warlock,warlock-demon,
  warlock-hornbook, the switches on): the Brawler with his own wraps, the Last Round and his own again, throwing his combo; the
  Warlock with his own book, the Hornbook and his own again, casting, changing into his demon and burning out: each group's packs
  from its one file, fetched once; one set of the man held at a time (his last let go of whole), the demon's kept and fetched
  once; no pack missed; nothing painted where the game is played.
- NOT CHECKED: a whole bake; the release page; his phone.
