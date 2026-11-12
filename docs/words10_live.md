# The ten new words, ready to go live (branch `build/words10`)

Queue item `put-ten-new-words-live`, pulled 11 Nov 2026 by a chat of its own ("Ten words chat"). His words for the job: “Put
the ten new words live with their looks, sounds and Lexicon pages”. This chat is not the main chat, so by the project's rule it
built on a branch and hands it back: **nothing here is published, and `main` is untouched.** The main chat brings the branch in,
makes the release build and publishes.

The ten: Piercing, Bleeding, Reaping, Culling, Surging, Plundering, Mirroring (found from floor 16) and Lasting, Fleeting, Vast
(from floor 6).

## What the branch is

- Begun from `origin/main` at 95eefb7 (25.3.5), with `origin/art/words10` at 44f836a4 brought in (a clean merge: the ten
  words' rules, their looks and the Lexicon in pages), then this chat's work; then **today's `main` at a8d9111d (25.3.6)
  merged in**, so the branch is `main` as last released plus the ten words. One place was in two minds (`game.ts`, `hurtHero`:
  the unique items' answer to a blow, and the three words' poison); both kept.
- The switches are ON: `WORDS7_LOOK`, `WORDS10_LOOK` (the art chat's looks, his yes of 9 Nov in the art chat), `LEX28.way =
  'groups'` (the Lexicon in five pages: Damage, Strike, Time, Control, Spoils; his yes of 9 Nov), and a new one, `WORD_SOUNDS`
  (the sound chat's sixth batch).

## What was done

1. **What the art chat asked the rules to say** (chat board, 9 Nov 14:11 and 19:01), all in `src/game/game.ts`:
   - `vastSplash` (where, how far, whom it reaches, its element) in place of the plain ring Vast behind sent; the look's own
     guess from a ring is gone (the Brawler's Aftershock sends the same ring and was taken for it).
   - a ring says how wide it was before Vast (`burst.r0`).
   - `goldSpray` where Plundering in front makes a kill spill more (and whether an item came with it).
   - `cullBlow`: which monster's Culling struck him.
   - `hero.dotBy`: whose poison, burning or chill is on him, and whether Lasting or Fleeting made it; `hero.boostBy`: which
     ability gave his might, haste, frenzy or shield.
   - the lance's picture begins a step in front of him (`PIERCE.lanceLead`, 1.5 tiles); what it strikes is as it was.
   - his reflection stands where its picture stands (below).
   - while the looks are on, the plain stand-ins in `render/fx.ts` are left out (`ownsEventW7`, `ownsEventW10`).
2. **The sounds**: the sixth batch's 52 files (25 sounds of the words and the Lexicon's page turn, two takes each) are in
   `assets/sound/`, each checked against the Sound Handoff's own file by its sha256. `src/game/word_sounds.ts` says which word
   each belongs to, how loud, and how soon it may be heard again; the rules ask for each at its moment (`wordRec`). They are a
   pack of their own (`words-pack.mp3`, about 850 KB), fetched a word at a time as a word comes into play (his abilities', the
   place's monsters'), never with the heroes' skills as a game begins. The page turn is in the town's pack. The sound chat's
   own account, as it came: the foot of `assets/sound/README.md`.
3. **The Lexicon's pages work**: a tab is pressed and its page opens, with the page turn; a word newly found has a cyan stud on
   its page's tab and on its stone until that page has been opened, and that is kept in his save (`Meta.seen`; an old save's
   words all count as seen, so nothing lights up on words he has known a long while).
4. **Tests mended and added**: `tests/words.test.ts` (every loadout; the ten are sampled, 6,933 loadouts an ability where the
   eighteen were 6,003), `tests/word_room.test.ts`, `tests/sides.test.ts` and the art chat's own (`words7*`, `words10*`) for
   the switches being on. New: `tests/words10_live.test.ts` (16 tests: what joins the rules, the looks and the sounds) and a
   playtest, `tools/scenarios/words10_live.mjs`, that plays every moment of the ten in the practice room by the real rules and
   checks what is sent, drawn and heard, then the Lexicon's pages.

## How things were read (each one line to change)

- **His reflection stands 2.4 tiles to his side and attacks from there**, as in the film he approved; the rules had it 0.9
  tiles off, so the picture and the blow were in two places. `MIRRORING.side` in `src/game/defs.ts` (the look reads the same
  number). Where a wall is there, the rules attack from where he stands; the look still draws it to the side (not changed).
- **One of the Hushed that is culled is not shown cut in two** (it dies of it all the same; the scythe's blade still shows).
  His brief for them was “Not undead or gory (Recommended)”, and the art chat's note said the main chat may leave them out.
  `CULL.hushedWhole` and the list `HUSH_LEAVES` in `src/game/defs.ts`.
- **The sounds' levels and gaps** are this chat's starting points from the sound chat's notes: `WORD_SOUND` in
  `src/game/word_sounds.ts`. `WORD_SOUNDS.on = false` silences all 25 at once.

## Two small looks that 28 words needed, with his yes

Shown a picture of each from this chat, 11 Nov 2026, by 22:37 (Eastern); each is one switch.

1. **The book on the starting screen in the same five pages** (`LEX_BOOK.pages` in `src/ui/lexicon28.ts`, on). With 28 words
   its old list ran off the foot of its panel (14 lines where there is room for 10). Asked “Use it?”, his pick: “Yes, five
   pages (Recommended)”. Pictures again: `tools/scenarios/words10_book.mjs`.
2. **Stones a pixel closer where more than 44 different words are carried** (`TIGHT_STONE` in `src/ui/inventory.ts`): with the
   ten there are 48 words and melded words, and four lines held 44. Asked “OK?”, his pick: “Yes, a pixel closer
   (Recommended)”. Picture again: `tools/scenarios/words10_pouch.mjs`.

## What was checked (11 Nov 2026)

- `tsc --noEmit`: clean but for `tests/relief.test.ts(378,16)`, which is `main`'s own.
- **The unit tests of what changed, and the core, once, on the merged branch** (`node tools/unit.mjs --only ...`, at 8ac1b643):
  52 files, 560 tests; 50 files passed, 2 failed, each for a small thing mended in the next commit (a saying of Surging's the
  wand already had; the sixth batch's notes standing after the eighth's in the sound README). At c57c4c8a those two and the
  core again: 25 files, 326 tests, all passed. The whole account: `.unit/<commit>/summary.txt` on the machine that ran it.
  - Named: `words10_live, words, words7, words7_beats, words7_fixes, words7_names, words7_shade, words10, words10_beats,
    three_words, last_words, sides, word_room, inventory, guide, scene_sounds, recorded_sounds, sounds2, city_words,
    word_tiers, attr_split, uniques, uniques_words, uniques_game, uniques_drops, uniques_heroes, runes_on_gear, volatile3,
    binding3`.
  - `tests/words.test.ts` (every loadout) took 19 minutes of the 20 a file is given: give it `--each 2400000`.
- **The playtest of the ten words** (`tools/scenarios/words10_live.mjs`, on a page served with its sounds, at c57c4c8a): every
  moment as it should be, 180 checks: each word in front, behind and on a monster, by the real rules; what is sent, what is
  drawn, what is heard; the Lexicon's pages; the book on the starting screen.
- **Other playtests on the merged page**, all finished clean: `look2` (phone), `lexicon` (phone), `words10_lexpages`,
  `words` (warrior), `words7_looks`, `words10_looks`, `sounds`; `words10_book` (the starting screen's book: PC, phone
  sideways, phone upright; every tab and line on the screen), `words10_pouch` (48 words at a service on a phone: every one
  has its stone).
- Before `main` was merged in, on the 25.3.5 base: `look2` at four sizes, `look` at three, `lexicon`, `pouch_look`, `words`
  (warrior, mage), `town` (PC, phone upright), `words10_lexpages`, `words10_lexicon`, `words7_looks`, `words10_looks`,
  `look13`, `sounds`. Clean but for these, **which flag the very same lines on today's `main` (a8d9111d) built by itself, so
  they are `main`'s own and not the ten words'**:
  - `town.mjs` (18 lines): at the armourer the prompt reads “Armourer: a task” and opens nothing, and all that follows at
    his counter fails with it.
  - `look.mjs` on a PC and on a phone upright (2 lines): “the inventory never opened for the word”.
  - `look13.mjs` (1 line): nothing on screen called `button:CANCEL`.

NOT checked, and why: the whole unit suite and the whole regression (his rule of 7 Nov: test only what the change is about).
The main chat's own checks before a release apply as always.

## What is left for the main chat

1. Bring `build/words10` into `main` (it holds `main` at a8d9111d, 25.3.6; if `main` has moved since, merge).
2. `node tools/build.mjs`, and publish **the new sounds folder beside the page**: the sounds' mark changed (52 new files, the
   packs' index with them). `tools/build_served.mjs` here makes a page with its sounds folder for playtests only.
3. The published page's own playtests; `tools/scenarios/words10_live.mjs` is the one for this.
4. The handoff, the design notes and the version number: not touched here (they are the main chat's record).
5. **The three unique items: done here**, as the unique items came in with 25.3.6. The Headsman's Hood (`'culling'`), The
   Queen's Glass (`'mirroring'`) and The Long Echo (`'lasting'`) add the words by the words' own ids; with the ten in the game
   their cards no longer say “Its word is not in the game yet.” and each works (the unique items themselves are still dark
   in `main`, `UNIQUES` off: this is for when they go on). `tests/uniques_words.test.ts` now holds it
   firmly (each a word of the game, added with no slot used, and at work in what the attack resolves to). Their words' sounds
   are fetched ahead while the piece is worn (`main.ts`, `warmWords`).

## Found on the way, and mended

- **A saying of Surging's was the wand's already** (“Wave goodbye.”, in `QUIPS`; `tests/guide.test.ts` wants no line in two
  lists). Surging's is now “Third time's the charm.” (its shockwave comes every third use). One line in `src/game/defs.ts`.
- The Brawler's Aftershock was drawn as Vast's splash (the same plain ring): the rules now say which is which.

## Found on the way, not changed

- Surging and Mirroring in front do nothing on a held attack (Whirlwind, Beam) nor on the evasive move: their work is done as
  an attack is delivered, and those are not delivered that way. As it was on `words10`.
- `src/art/action_f16_dancer.ts:376`: esbuild warns of a comparison (`main`'s own).
- All 52 new sounds decoded at once would be about 10 MB; they are fetched a word at a time and let go with the place (in the
  playtest: 2 held, 48 let go).
