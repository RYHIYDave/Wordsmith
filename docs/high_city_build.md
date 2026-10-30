# Act 2, part two, the High City (floors 16 to 20): the build's working notes (the main chat's)

## His words

- 28 Oct 2026, to the main chat: the plan, his doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)"
  (https://claude.ai/artifact/Vk5k8RPTdwyMhdpSUd4fuX): four royal bosses (the Princess, the Prince, the Queen, the King) and the
  Moth; his event, the Royal Cards.
- 29 Oct, 18:09: “Levels are ready to add” (the art chat's floors 16 to 20, `mockup/high-city-all`, every part with his yes:
  docs/mockups/high_city/HANDBACK.md, and each part's README).
- His picks then: the three new classes go live with the floors, “Release with the floors”; the floors built “One floor at a
  time” (each shown him in play before the next); the camp inside Vellum's gate stays the town, “The camp stays the town
  (Recommended)”; the Royal Cards, “With floor 16 (Recommended)”.
- His rules that bear on every part (the art chat's notes quote them): his art rulebook's Movement 9 (a big wind-up held, the
  strike a flash of one or two frames, a big wind-down); 28 Oct, “Start from now on, but every enemy is going to need that
  change eventually.  And bigger AOE to compensate for the extra time the player gets to evade” (the areas the game's: make
  them bigger than the old enemies'); bosses fast and big from their first pass (“I could tell you I want a cheetah boss and
  it would walk around like an old dog.”); a boss's fight made long by what it throws, not by more life (his gameplay
  rulebook, "Fights": each phase harder than the last).

## Where the work is

- Branch `high-city`: from `companions` (the three new classes and the Ranger's companions, all behind their switches), the
  art chat's `mockup/high-city-all` merged in (floors 16 to 20's art whole, nothing of the game importing it), then THE FRAME.
- Each part is built by a helper on a branch of its own from `high-city`, merged back here by the main chat.

## The frame (what every part is built in)

- `game/act1.ts`: `HIGH_CITY` ({ on: false, built: 1 }: off; tests switch it on). Floor 16 is the LandKind 'swangardens'
  (an Act2LandKind, so the Hush's machinery lays it: game/act2_layout.ts MAKERS, act2_dress.ts DRESSERS, act2_mobs.ts);
  `ACT1_FLOORS[16]` (The Swan Gardens; her floor The Swan Pavilion; the boss 'princess'; the dawn's light). `act1Floor(16)` is
  16 (laid as open ground, painted by the descent's painter with the art chat's look); `highFloor(d)` the High City's alone;
  `cityFloor(d)` the Hush's or the High City's (its own map-maker, dresser and kinds); `act2Floor(d)` stays the Hush's alone
  (THE BELLS and the Hush's moments are theirs, not these floors'). `lastFloor()` is 16 with it on.
- The way: from floor 15 home to the camp (its payoff as it was: “The stolen words fly home...”), and the camp's waypoint on
  up the hill to 16 (game.ts takeWay 'on'); from 16, while it is the last built, home.
- `game/act2/swangardens.ts`: its map-maker (`BUILT`, `generate`) and dresser (`dress`), empty.
- The five new MonsterKinds (game/types.ts HIGH_MOBS, HIGH_BOSSES): 'swan', 'gardener', 'groom', 'pguard' (the palace guard,
  both its looks: partisan and sword), 'princess'. Their stats (game/defs.ts MONSTERS, first picks); EMPTY FILES FOR EACH,
  registered: `game/act1_rules/<kind>.ts` (RULES), `art/act1_figs/<kind>.ts` (FIG), `render/act1_fx/<kind>.ts` (FX). A kind is
  built by filling its three files. Their sizes (art/bestiary.ts FIGURE_SIZE), death colours (render/fx.ts), matter
  (render/wild.ts). `bossKind(16)` is the Princess once built (the Warden until then). Floor 16's packs: game/act2_mobs.ts
  ACT2_OWN[16], its lair's guardian ACT2_GUARD[16] the palace guard.
- `render/outdoor.ts` `landLook` 'swangardens' (the art's look, without what the map-maker lays yet), its deep colour;
  `render/act1_pieces.ts` `act1Pieces(16)`: the High City's 25, the Swan Gardens' 25 and her vines.
- tests/high_city.test.ts.

## His word on helpers

- 30 Oct 2026, 15:02: “Don’t go too crazy with helpers.  I just got my usage, I don’t want to blow through it”; the two at
  work then (floor 16's ground, the Princess) finish, “Let them finish (Recommended)”; after them, NO NEW HELPERS: the main
  chat builds the rest itself.

## How a helper works (every helper: read this)

- YOUR OWN WORKING COPY AND BRANCH: you are given a folder (a git worktree of the repo) on a branch of your own from
  `high-city`. Work and commit there only; push your branch (`git push -u origin <branch>`). Never touch `main`, `v23`,
  `gh-pages`, `high-city`, `heroes6` or `companions`; never merge others' branches.
- THE MACHINE IS SHARED by the main chat and up to three helpers and has TWO processors: WRAP EVERY HEAVY COMMAND (tsc, tsx
  --test, a build, a playtest) in the slot lock:
  `/tmp/claude-0/-home-claude/3bf85a52-ed2f-50aa-9a0a-9f7642fe47a9/scratchpad/heavy.sh <command>`. Run only your own tests and
  the ones nearest yours, never the whole unit suite (it takes over an hour) and never the regression. Do not install packages
  (everything needed is installed; node_modules is linked in your folder).
- STAY IN YOUR FILES. Each brief names what is yours. A shared file you must touch (game.ts, render.ts, main.ts, defs.ts,
  state.ts, types.ts): as little as you can, each change marked with a comment naming the part ("(THE HIGH CITY, FLOOR 16:
  ...)"), so the main chat can bring the branches together.
- THE PROJECT'S RULES (CLAUDE.md): the owner does no coding; pictures first (everything here is behind HIGH_CITY, off: keep
  it so); what glows on a friend is cyan, pink and gold glows are the enemy's; the Hushed make no sound with their mouths;
  nothing gory; original designs only; his words quoted only exactly. The art is the art chat's: use its numbers (every
  move's timing and reach is in its README and its *_moves.ts / *_fx.ts files) and do not repaint it; where the art leaves a
  number to the game, pick and say what you picked.
- HOW THE CODE IS WRITTEN HERE: TypeScript in this project's long-comment style (read a few files of the Hush's first, e.g.
  game/act1_rules/carter.ts, censor.ts, game/act2/millrace.ts: each rule says whose word it is, in plain words). Keep
  `npx --no-install tsc --noEmit -p tsconfig.json` clean (under heavy.sh).
- WHEN DONE: commit, push, and end with a short report: what is built, the numbers you chose, what is NOT done or not sure,
  every file outside your own you changed and why, the tests you ran and their counts.
