# THE HERO CARDS FROM THE BAKE: FOR THE MAIN CHAT (12 Nov 2026)

The Eight-sides merge chat (a new chat of his, working from the queue; the queue's `stop-hero-cards-sculpting-heroes`). Not
the main chat: `main` is untouched, nothing is published.

## His words

- 11 Nov 2026, of the eight-sides test page on his phone (between 22:10 and 22:23, Eastern): “First of all the title screen
  lags.  It’s the first thing you see.  How can it lag?  Then, character screen lags.  Selecting a character lags.  60 SECOND
  LOAD TIME to enter THE TOWN.  There’s not even a single enemy in the town why in gods name would I take that long to load”
- 12 Nov, asked by pop-up whether to build the hero cards fix next, by 06:48: “Yes, build it (Recommended)”; 07:41: “Go”.
- 12 Nov, after the third phone check, 08:11: “Ran it”. Told him by 08:20: the hero cards fixed on his phone, being handed to
  the main chat to bring in and publish.

## What is on GitHub

- `bring-in/hero-cards`: `main` 0da5127e (25.3.9) with `fix/hero-cards-from-bake` (4f49c885) merged in (no conflicts), one
  commit after it (ceab67ef: a hero's making ready kept out of heroLists, so that THE MONSTERS' BAKE KEEPS MAIN'S MARK,
  4f510caa1c9d; nothing painted or baked differs), and this note. A FAST-FORWARD FOR `main` while it stands at 0da5127e.
- MARKS of `bring-in/hero-cards`, each worked out from the work copy's own folder: heroes 5482604e8eb0 (new); townsfolk
  d4c898fe370d, monsters 4f510caa1c9d (both main's); sounds e4b9ee1ccd00 and the Colossus 7cf0996e564d (main's: no file
  touched).
- `bake/5482604e8eb0`: its heroes' bake (README there), so that it need not be baked again.
- `fix/hero-cards-from-bake` (4f49c885): the work itself, on `fix/frames-from-sheets` de6fea61 (in `main` since 25.3.9).

## Why the cards were slow, and what it is

The bake's cards group held only each hero's FRONT standing and running. A hero painted from eight sides (the Warrior, the
Ranger, the Mage) is seen on his card from the side for the way he faces there (`toward`), not his front: so nothing their
cards showed was in the bake, and every frame of theirs was painted where the game is drawn, as it was shown. Of every hero,
what he does left standing (his gestures), his coming to a stand out of his run and his making ready were in no bake either.

- `art/heroes3.ts` cardLists: everything a class card shows; READY_LIST: a hero's making ready is a list of its own, the last
  of heroLists (every other list keeps its place), a card's only (never baked nor painted ahead for a place).
- `render/baked.ts` bakedPlaces: all of it baked for a card (1,261 frames for 1,278 places on 2 sheets, 4,793,320 pixels,
  where 471 frames on one); bakedFirst: each hero's standing and running laid first (`dev/bake_heroes_page.ts`).
- `main.ts`: the cards' group asked for as the game starts; all six heroes left to the bake on their cards; their gestures
  held until it has come (`ui/panels.ts` cardsComing). `__dbg.stoodIn()`.
- `render/painter.ts`: the worker paints no making ready for a place. Where there is no bake, the cards are as before.
- NO PICTURE CHANGES. Every hero's own sheets are the same as `main`'s bake (1fdc8d09059a, from `gh-pages`) byte for byte, and
  their frames, parts and places; their lists one more (the making ready, empty in every place but a card's). Only the cards'
  group is new.
- (`art/heroes3.ts` bakeLists: the bake's lists are heroLists and the making ready after them. heroLists itself is as `main`
  has it: the monsters' bake page carries it, and a line added there gave the monsters a new mark, f031de47df7f, for the same
  pictures. The painter's worker is as `main` has it.)
- `tests/hero_cards_baked.test.ts` (new): each hero's card played through a figure with the bake's places given: nothing
  painted, nothing stood in for. `tests/baked.test.ts`. `tools/scenarios/hero_cards_baked.mjs` (new; SLOW=<s> the cards' file
  held back).

## His phone (the phone check, https://claude.ai/artifact/7Wu15vuPMZHJb2ZsbSBZ65; `docs/requests/phone_check.md` on `test/phone-check`)

The third run (`runs/rmwdkfnt74o2`, 12 Nov 08:10; an iPhone, iOS 18.7, in the Claude app): the release build of
`fix/hero-cards-from-bake` (25.3.7 with the frames kept in their sheets and this). He picked the Brawler.

- THE HERO CARDS: 3.6 s, 106 frames, 29 to 30 a second, the game's own frame 3.4 and 3.7 ms, where in the second run
  (06:40) 9.2 s, 38 frames, 3 to 5 a second, the game's own frame 302 ms. Frames painted where the game is drawn on the title
  and the cards: 0 on every screen; none stood in for.
- The cards' pictures came in 721 ms, during the title, before NEW GAME.
- The load into town 3.5 s. 125 of the Brawler's frames every pixel the same.
- NOT SEEN ON HIS PHONE: a hero's making ready (the Brawler has none on his card); seen here, clean.

## Checked here

- tsc clean. `unit.mjs --only` baked, hero_cards_baked, class_cards_paint, figure, heroes3, heroes, reflections, sheet_sprite,
  sides_more, veteran_art, title, cheap_heroes, monsters_baked and the core on ceab67ef1e: 34 files, 384 tests, all passed (on
  5d86820936, the merge before ceab67ef, without monsters_baked: 33 files, 371 tests, all passed).
- THE BAKE: baked whole on 5d868209 (79ea28e6e46e, 13:19 to 13:56 UTC; every sheet read back and checked against every frame as
  painted); then the code changed by ceab67ef, which paints nothing differently: the files of 79ea28e6e46e under the mark
  5482604e8eb0, the mark in each file changed, after checking that every key of every group asks for the same lists' lengths
  and the same places in the same order, and the cards' group baked again with that code, the same byte for byte. Its
  `done.json` says so.
- On the release build (`tools/build.mjs --no-monsters`: the monsters are untouched and keep main's mark), served, a phone's
  screen: `hero_cards_baked.mjs`: the cards' group in 514 ms with nothing pressed; the cards up 14 s, 57 frames a second, no
  wait over 100 ms, NOTHING PAINTED, none stood in for; every card chosen in turn, nothing; the Mage made ready, nothing.
  SLOW=6: one frame of each hero painted while it was awaited (6, 1,334 ms), nothing after. `sheet_frames.mjs` as the Mage and
  as the Warrior, 10 checks each: their groups whole, every pixel the same as the old way (318 frames each, and 310 of the
  townsfolk's), never over the budget. All finished clean.

## What is left, main chat

1. Fast-forward `main` to `bring-in/hero-cards` (or merge it, if main has moved).
2. The bake: `mkdir -p .bake/5482604e8eb0 && git archive origin/bake/5482604e8eb0 | tar -x -C .bake/5482604e8eb0 && rm .bake/5482604e8eb0/README.md`,
   IF THE MARK IS STILL 5482604e8eb0 (`tools/bake_heroes.mjs` bakeCode); else `tools/build.mjs` bakes again (about 38 minutes).
3. The release build; heroes/5482604e8eb0 beside the page in place of heroes/1fdc8d09059a.
4. The published page's playtests: `tools/scenarios/hero_cards_baked.mjs` (--serve, a phone's screen), and SLOW=6; the
   wrap's own (its sheet_frames among them).
5. Publish; the records.

## To know

- `build/brawler-packed` (the Brawler memory chat's, 73c77f90; not in `main`, waiting for his word from the phone) MEETS THIS
  IN TWO FILES (tried, not kept): `src/main.ts`, two blocks side by side after `painter.baked = ...` (keep both: they are
  apart); and `src/dev/bake_heroes_page.ts` group(), which that branch rewrote for its packs. To join them: keep that branch's
  group(), and walk the keys' places in this order: first each key's places `[0, bakedFirst)`, then each key's
  `[bakedFirst, end)` (render/baked.ts bakedFirst), recording each with its key, as its `all` does; its held frames take their
  order from `all`, so the cards' standing and running stay first. `lens` gains one list (READY_LIST, empty but on a card).
  Whichever comes second takes a new bake.
- `try/uniques` merges with it clean (tried, not kept).
