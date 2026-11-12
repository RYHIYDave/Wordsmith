# The ten new words, ready to go live (branch `build/words10`)

Queue item `put-ten-new-words-live`, pulled 11 Nov 2026 by a chat of its own ("Ten words chat"). His words for the job: “Put
the ten new words live with their looks, sounds and Lexicon pages”. This chat is not the main chat, so by the project's rule it
built on a branch and hands it back: **nothing here is published, and `main` is untouched.** The main chat brings the branch in,
makes the release build and publishes.

The ten: Piercing, Bleeding, Reaping, Culling, Surging, Plundering, Mirroring (found from floor 16) and Lasting, Fleeting, Vast
(from floor 6).

## What the branch is

- `origin/main` at 95eefb7 (25.3.5), with `origin/art/words10` at 44f836a4 brought in (a clean merge), then this chat's work.
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

## Two things that change how the game looks and are NOT yet his yes

Both are needed because there are now 28 words; both are one switch.

1. **The book on the starting screen in the same five pages** (`LEX_BOOK.pages` in `src/ui/lexicon28.ts`, on in this branch).
   With 28 words its old list runs off the foot of its panel (14 lines where there is room for 10). Picture:
   `shots/words10_live/w_book_2_strike.png`. Off, the list is as it was (and runs off).
2. **Stones a pixel closer where more than 44 different words are carried** (`TIGHT_STONE` in `src/ui/inventory.ts`): with the
   ten there are 48 words and melded words, and four lines held 44. Only seen by someone carrying more than 44 kinds at once.

He was asked about both from this chat on 11 Nov; his answers are on the queue item and the chat board.

## What was checked

- `tsc --noEmit`: clean but for `tests/relief.test.ts(378,16)`, which is `main`'s own.
- `tests/words.test.ts`, whole: 29 of 29 (20 minutes here beside other work; the suite's limit a file is 20 minutes, so give
  it `--each 2400000` or run it alone).
- `node tools/unit.mjs --only ...` on the commit: see the foot of this note.
- The playtest `words10_live` on a page served with its sounds: every moment as it should be (180 checks).
- The playtests that touch the Lexicon, the inventory, the words and the town: see the foot of this note.

NOT checked, and why: the whole unit suite and the whole regression (his rule of 7 Nov: test only what the change is about).
The main chat's own checks before a release apply as always.

## What is left for the main chat

1. Bring `build/words10` into `main` (it is `main` at 95eefb7 plus the work; if `main` has moved, merge).
2. `node tools/build.mjs`, and publish **the new sounds folder beside the page**: the sounds' mark changed (52 new files, the
   packs' index with them). `tools/build_served.mjs` here makes a page with its sounds folder for playtests only.
3. The published page's own playtests; `tools/scenarios/words10_live.mjs` is the one for this.
4. The handoff, the design notes and the version number: not touched here (they are the main chat's record).
5. **The three unique items** (branch `uniques`) add words by id: `'culling'`, `'mirroring'`, `'lasting'`. Those are the words'
   own ids here (`src/game/types.ts`). When `uniques` is in `main` too, add the check the queue item asks for in
   `tests/uniques_words.test.ts`.

## Found on the way, not changed

- Surging and Mirroring in front do nothing on a held attack (Whirlwind, Beam) nor on the evasive move: their work is done as
  an attack is delivered, and those are not delivered that way. As it was on `words10`.
- `src/art/action_f16_dancer.ts:376`: esbuild warns of a comparison (`main`'s own).
- All 52 new sounds decoded at once would be about 10 MB; they are fetched a word at a time and let go with the place (in the
  playtest: 2 held, 48 let go).
