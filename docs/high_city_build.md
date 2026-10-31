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

## Floor 16: done (30 Oct 2026)

Merged on `high-city`: the place (hc/f16-place), the kinds (hc/f16-kinds), the Princess (hc/f16-princess), the Royal Cards
(hc/royal-cards); filmed (tools/scenarios/floor16_film.mjs, princess_film.mjs WHERE=floor16); his yes by 17:52, “Yes, on to
17 (Recommended)”. The companions' pictures merged too (`companions`), his “Yes, they're good (Recommended)”.

## Floor 17, the Masque: the main chat's plan (no helpers: his word of 30 Oct, 15:02)

The art: docs/mockups/masque/README.md (the place: art/masque.ts `masqueLook`, `MQ_ZONE`, `masqueWindows`; art/floor17.ts
`masquePieces()`, `CLOCK_FRAMES`), docs/mockups/prince, masque_footmen, masque_dancers, silent_order (each README has its
numbers and what the game must pick). His doc's level 17: seven rooms in colour order (blue, purple, green, orange, white,
violet, black), galleries, card rooms and servants' passages between; the hazard, the ebony clock's chime (every dancer stops
and turns to look at him, then all come at once); the masked dancers (waltz until they notice him), footmen, the Silent Order
among the guests; the Prince in the Black Room, dancing the whole fight.

In order, each committed on `high-city` as it is done:
1. THE FRAME: LandKind 'masque' (act1.ts, ACT1_FLOORS[17]: The Masque, The Black Room, boss 'prince'); kinds 'footman',
   'dancer', 'order', 'prince' (types, defs, empty rules/figs/fx); MAKERS, DRESSERS, ACT2_OWN[17], ACT2_GUARD[17]; landLook.
   HIGH_CITY.built stays 1 until the map-maker lays the floor.
2. THE PLACE: game/act2/masque.ts (from housequiet.ts's way of laying rooms): the seven in order, each a turn; galleries,
   card rooms, the servants' passage with the braziers behind the windows; the Black Room last (the clock on its west wall);
   the windows' light; the dresser; the clock's chime (the hazard). Then built: 2.
3. THE KINDS: the footmen, the dancers, the Order (their READMEs' numbers).
4. THE PRINCE.
5. Films to him; his yes; then floor 18.

## Floor 18, the Glass Gallery (the main chat alone; his yes to floor 17, 30 Oct: “Yes, on to 18 (Recommended)”)

The art: docs/mockups/glass_gallery, queen, reflections (READMEs: every number). HELD, the art chat's ask on the board (30 Oct,
18:26): the queen's guard (being remade as mirror duellists) and the ladies-in-waiting (new deaths, new rhythms), until it posts
them done; until then they are stood in for. The reflections exist for the first three classes only (art/reflections.ts, made
from paintMove3's frames): the Warlock's, the Tinkerer's and the Brawler's are the art chat's to make (asked on the board).
Kinds: `lady`, `qguard`, `reflection`, boss `gqueen` (floor 5's Carrion Queen is `queen`).
1. THE FRAME: the kinds, their stats, the light; land 'glassgallery' (its look with zones, runners and skylights broken
   through; the ground painted by paintGlassGallery, the hall below in the holes); the 25 pieces and the High City set; the
   skylight the floor's trap (ACT1_SETS[18]).
2. THE PLACE: game/act2/glassgallery.ts: long galleries of mirrors (a runner down each), dressing rooms off them, the chapel,
   the glasshouse, the Mirror Hall last (the Queen's arena, its twelve pier glasses along its long sides, her talking mirror
   at its end); silver gates between; skylights broken through (the ground's drop) and whole ones (the trap).
3. THE HAZARDS: a tall mirror cracks at a blow near it and bursts at the next, its shards hurting what stands before it;
   a skylight cracks under a step and gives way (the trap's beat).
4. THE REFLECTIONS: a copy of the hero's own class (its look by the hero's class: Monster.form), its tap and its hold as
   his (a strike and a whirl; an arrow and a volley; a wave and an orb), stepping out of the mirrors.
5. THE QUEEN: the comb (lunge, the poison), the looking glass (into one mirror, out of one behind you), reflections, Shatter
   (six lanes, the gaps safe); each phase another mirror wakes; her mirror at the hall's end, speaking, then the truth.
6. Films to him; his yes; the guard and the ladies when the art chat posts them; then floor 19.

## Floor 19, the Keep (the main chat alone; his yes to floor 18, 30 Oct: “No that looks great”)

The art: docs/mockups/keep, king, keep_crossbowmen, kings_knights, silent_order (READMEs: every number). HELD at the art
chat's ask (board, 30 Oct 18:26): the king's knights (being remade “huge and slow, one or two at a time”) stood in for until
it posts them; the crossbowmen built with their pictures as they are, their death to be swapped for the art chat's new one.
The Silent Order's armed last on 19 (a fan of three knives: “A fan of three on 19 (Recommended)”). Kinds: `kknight`,
`xbow`, the Order `order` (its armed look here), boss `gking`.
1. THE FRAME: the kinds, stats, the light (night, the moon, honest fire); land 'keep' (the art's keepLook with KP_ZONE);
   the King's 25 pieces and the High City set; the murder hole the floor's trap (ACT1_SETS[19]).
2. THE PLACE: game/act2/keep.ts: the bailey (the great doors where he comes in), the gate passage (its murder holes), halls,
   the barracks, the armoury, the wall walk (battlements, the sky beyond), the gallery, the throne hall (the King's), the
   bedchamber at the top (the bed, the songbird's cushion, the broken songbird: the quest), the way on beyond the throne.
3. THE HAZARDS: the murder holes (the trap's beat: still, warning, pouring, its pool); the portcullises (a row across a hall
   or a doorway slamming down at a beat, cutting it in two a while, hurting what is under it).
4. THE CROSSBOWMEN, THE ORDER'S ARMED LAST.
5. THE KING: the sweep (its wave 235 degrees, 10 tiles), the Decree (three lines of his fog knights across the hall, gaps to
   slip through), the Crown (a leap 5 tiles at you and a ring 10 tiles out), the Curtains (faces streaming at you); his last
   phase, the Hush climbs off and stands at his side (its own moves his to decide); his death, the songbird winds itself up
   and sings, the way on opens.
6. Films to him; his yes; the knights and the crossbowmen's death when the art chat posts them; then floor 20.

Where it stands (31 Oct 2026, about 03:00 Eastern): 1 to 5 built on `high-city` (8b4a093 the Keep laid and dressed, its
portcullises; 0ff1721 the crossbowmen, planted turrets at his pick “Stand and shoot”, and the Order's armed last with their
fan of three; 70e92ae the King). The main chat's picks where the art left them open, for him to see in the films: the way
through climbs away from the eye; the throne hall entered from the side toward the eye, the throne facing him; the great
doors hung open over the bailey's way in; armour and barrels the floor's breakables; the songbird lies broken before the
throne (the bedchamber's cushion empty) so that it can sing as he dies; the wave and the ring drawn in the game's own pixels
from the art's sweepPainted and crownPainted; the knights and the faces as sprites from knightPainted and facePainted (the
art's KN_CANVAS and FACE_CANVAS exported for it); the Hush at his side stands (its moves his to decide). Held: the king's
knights (stood in for by the Hushed), the crossbowmen's new death. Films: tools/scenarios/floor19_film.mjs,
high19_king.mjs (STILLS=0).
