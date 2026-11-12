# THE ENDLESS TOWN, THE SHAFT'S RIM: THE BUILD (in the game, behind a switch that is OFF)

The queue's `bring-in-endless-town`, pulled by a chat of its own ("Endless town build chat") at his word, 11 Nov 2026, 19:21
(Eastern): “Work on this task from the Wordsmith Queue: “Bring in the Endless town, the Shaft's Rim””.

Branch `build/endless-town`, cut from `main` at 95eefb7 (25.3.5) with the art chat's `art/endless-town` (3be8b16c) merged in
(clean). NOT ON `main`, NOT PUBLISHED. Everything is behind `ENDLESS_TOWN` (`src/art/shaft_rim.ts`), which is OFF: with it
off the game is as it was (checked: below). The main chat brings the branch in and sets the switch on: his yes to the
pictures of it from the game is given (below).

## His words and picks

- His queue item, 11 Nov 2026, 10:31: “A town that is different from the two we currently have, with all the bells and whistles
  needed for the endless run.  I’d like maybe 5 different towns, they can be themed after the current levels, or new designs,
  but I want one for the new town, then the rest will be unlockable or purchasable.  I need mockups until they’re locked in,
  then drawn to the standard of the game”.
- The art, in the art chat (all of it in `docs/mockups/endless_town/README.md`): “1 The Shaft's Rim (Recommended)”; “Yes, lock
  it in and draw it (Recommended)”; of the stair, “Make it slope more”, then “Yes, draw the rest (Recommended)”; of the whole,
  by 13:43, “Yes, hand it to main (Recommended)”. Of the record stone (“how deep you've gone in endless”) and the trophies wall
  (“the bosses whose tablet quarters you hold”): “Keep both (Recommended)”.
- His picks to the main chat, as pop-ups, 11 Nov by 15:40: when it is his town, “Once endless opens (Recommended)” (offered as:
  from the moment a hero beats floor 20 and endless opens, the Shaft's Rim is his town from then on); what the record stone's
  notches count, “Every endless level (Recommended)” (offered as: one notch for each endless level he has reached, every fifth
  notch longer).
- Of the gate's words, his rulebook (`docs/gameplay/RULEBOOK.md`): “Words laid on the gate go for now, to come back later as
  endgame”, from his words of 9 Oct 2026, 22:50: “Let’s have the door words go for now.  I think that’ll be endgame stuff”.

## HIS YES TO IT IN THE GAME (11 Nov 2026, by 20:31, Eastern): HANDED TO THE MAIN CHAT

Sent five of the pictures and the film (below), and asked four things as one pop-up:
- “The Shaft's Rim is built and running in the game behind its switch (pictures 01_home_before_the_gate.png,
  05_on_the_portals_landing.png, 06_in_the_wordsmiths_ring.png and the film rim_town_game.mp4). Is it right as the Endless
  town?”: “Yes, hand it to main (Recommended)” (offered as: it goes to the main chat to bring in, switch on and publish).
- “The gate has three word sockets (02_at_the_gate_three_words.png, 03_the_gates_panel.png). Should burning up to three spare
  words into the next endless level come back, in this town only?”: “Yes, back in this town (Recommended)” (offered as: words
  laid on the gate show in its sockets and are burned into the next endless level).
- “The record stone cuts a notch for each endless level the hero you are playing has reached, and writes your best ever beside
  it (ENDLESS 5, BEST 12). Is that the count you want?”: “Yes, this hero's (Recommended)” (offered as: each hero cuts his own
  stone; your best ever is written over it).
- “The work is on a branch in this chat only: this chat was refused permission to push to your GitHub (RYHIYDave/Wordsmith).
  May I send the branch build/endless-town there, so the main chat can bring it in?”: “Yes, send it to GitHub (Recommended)”.

SO: THE TOWN IN THE GAME HAS HIS YES, with the gate's words back in this town and the record stone as built. The switch stays
off on this branch: the main chat sets it on as it brings the branch in. (Told to him, not asked: the torches on posts hold
nobody; past its seventy notches the stone is full; the trophies wall is empty until the tablet's quarters are built.)

## What is built

1. **THE PLACE** (`src/game/rim.ts` `makeRim`): a Level as a town's is, 24 tiles by 24, laid as the art laid it
   (`rimPlace()`, `rimPieces()`): every station on its locked tile; nothing moved.
2. **WHEN IT IS HIS TOWN** (`Game.rimTown`, `Game.enterTown`): once endless is open to him (`Game.endless > 0`): as the last
   floor is beaten he comes home to it (after the splash and the card, as now), a saved hero wakes in it, and the waypoint
   brings him back to it. From then on the camp and the first town are behind him: the game's twenty floors are reached only as
   endless levels.
3. **WHERE HE WAKES** (`RIM_ARRIVE`): before the gate, the pit before him. Back by the waypoint: on it, at the stair's head.
   (The art's `rimPlace().hero` is not used: it lies over the pit.)
4. **THE WAY DOWN**: the waypoint at the stair's head, awake; used as the towns' waypoint is now, it takes him to the endless
   level he has reached. The stair is how it looks: nobody walks on it.
5. **ITS SERVICES**: the armourer, the mystic (across his table), the wordsmith, the Lexicon, the stash, the stranger, as in
   the game's two towns; and THE GATE (6).
6. **THE GATE'S WORDS, BACK, HERE ONLY** (`RIM_RULES.gateWords`; his yes, above): the gate stands free and leads nowhere, so here
   it is used (the game's other gates are walked through): its panel is the game's own gate panel (up to three spare words
   burned into the next dungeon), reading GATE: ENDLESS N and ENTER ENDLESS N. The words laid on it show in its three sockets at
   once (a small round of the word's own colour in each hollow, its light the friend's cyan). ENTER takes him down to the
   endless level he has reached, as the waypoint does, and so does the waypoint itself: either way the words are burned into
   that level (`Game.enterDungeon`, as it always did). Floor 1 as an endless level takes them too.
7. **THE RECORD STONE**: a notch for each endless level THIS HERO has reached (`Game.endless`), cut as he comes home
   (`Game.comeToRim`): the newest glows the friend's cyan on the visit it is cut, and that visit only; a line says so (“A notch
   is cut in the record stone: Endless N.”) and the game sends `{ t: 'notch', x, y, n, cut }` (for its sound). How far it is cut
   is kept in the save (`rimSeen`). Over the stone, written as the services' names are: ENDLESS N; and where a hero of his
   before this one went deeper, his best too (ENDLESS 5, BEST 12). PAST ITS SEVENTY NOTCHES the stone is full and stays full,
   and its name says the level.
8. **THE TROPHIES WALL**: four mounts, the bosses of floors 5, 10, 15 and 20 in order (`trophyOf`): a mount is filled while he
   holds that boss's quarter of the tablet (what his yes was to). THE QUARTERS ARE NOT BUILT (the queue's
   `build-endless-tablet-and-final-boss`), so `Game.quartersHeld()` says none and the four mounts are empty. It is named
   TROPHIES.
9. **THE BENCH'S SOCKET**: the wordsmith's slab is the art chat's, with the tablet's socket (eight frames), empty. The column
   of light the game stands over the slab is not stood here (it stands on the master rune-stone's place, which is the socket).
10. **WALKING** (`rounds`, `Level.fence`, `roundStep`; `Level.errand`, `src/game/nav.ts` FineGrid): the town is round, and so
    are things on it. THE PIT'S BRINK, THE SIX STANDING STONES AND THE SIX BRAZIERS hold him off by their own round, not by a
    whole tile: he walks up to the kerb all the way round, out along the tongue to the portal's landing, and into the
    wordsmith's ring between its stones. The bulky things (the forge, the rack, the tent, the gate, the wall, the record, the
    Lexicon, the stash, the people) hold him by their tiles, as in the towns. THE FOUR TORCHES ON POSTS HOLD NOBODY (a post is
    thinner than he is; he passes before or behind it): the tent's stands in the one way between the pit and the smithy.
    A step a round thing refuses is taken round it, so that pushed at the pit he goes round its brink and does not stop dead.
    A TOUCH'S ERRAND goes by a finer grid here (eight cells to a tile, a cell open only where his whole body may stand), since
    these ways are narrower than a tile; it makes for the cell he can walk to that is nearest what was touched, and he walks
    straight for the furthest part of the way he can see, so he does not turn to and fro at every cell.
11. **HOW IT IS DRAWN** (`src/render/rim.ts` RimView, one of the renderer's looks): the ground one picture, painted once under
    the town's loading screen (430 ms in this session's headless Chromium, one painting); past its edges the same dark rock goes on; the shadows, the far fire
    breathing and the shaft's torches over it; the gate, the record, the wall, the torches and the 27 low posts in depth with
    everything else; the town's own things in the rim's stone (`src/art/shaft_town.ts` RIM_THEME: the art chat's dev page's own
    theme). No dark is laid over it: the ground is painted as the night has it, and the fires' pools and the cyan are added, as
    in the pictures he said yes to.
12. **SMALL THINGS**: the top of the screen says The Shaft's Rim; the hall's owl and the hall's air are not heard here; “Speak
    to the MYSTIC” says “She keeps the tent by the forge.” here.

## Decisions taken in the build (each one line to change)

| what | as built | where |
| --- | --- | --- |
| where he wakes | before the gate | `RIM_ARRIVE` |
| the gate's words back, in this town | yes | `RIM_RULES.gateWords` |
| whose levels the stone counts | this hero's; his best ever written beside it | `Game.comeToRim`, `recordLine` |
| past seventy | full, its name says the level | `notchesFor` |
| the trophies | while the quarter is held (none yet) | `Game.quartersHeld` |
| the torches on posts | hold nobody | `makeRim` |
| the standing stones, the braziers | their own round (0.18 of a tile) | `STONE_R`, `FIRE_R` |

## Pictures and film, from the game (`docs/mockups/endless_town/game/`)

A phone held sideways (844 x 390, the game's own size there), the switch on by the test hook, a hero with 23 endless levels
reached. Made by `node tools/build_to.mjs dist/rim.html`, then `node tools/playtest.mjs --file dist/rim.html --touch --size
844x390 --dpr 2 --scenario tools/scenarios/rim_town_look.mjs --out shots/rim_look/phone --video <dir>`.

- `01_home_before_the_gate.png`: as he comes home: before the gate, the record's newest notch glowing.
- `02_at_the_gate_three_words.png`: three words laid on the gate, one in each socket.
- `03_the_gates_panel.png`: its panel: GATE: ENDLESS 23, ENTER ENDLESS 23.
- `04_at_the_brink_by_the_way_down.png`, `05_on_the_portals_landing.png`, `06_in_the_wordsmiths_ring.png`,
  `07_before_the_bazaar.png`, `08_by_the_stash_and_the_lexicon.png`.
- `rim_town_game.mp4` (18 s, 844 x 390, H.264): he is sent round the town by touches: the stash, into the wordsmith's ring
  from its side, round the front to the mystic, up past the tent's torch to the armourer, to the waypoint and down.

WHAT IS NEW TO HIS EYE in these (the art itself has his yes): the words in the gate's sockets; the names over the record stone
and the trophies wall; the gate's panel reading ENDLESS N; the town with the game's own screen over it.

## To try it

In a built page: `__dbg.endlessTown(true, 7)` (the switch on, the hero set at endless level 7 and brought home).
`__dbg.endlessTown(false)` and `game.enterTown()`: the game's own town again.

## Checked

- `tsc --noEmit`: as `main` (the one line it says of `tests/relief.test.ts` is `main`'s own with this machine's TypeScript).
- `tests/rim_town.test.ts` (9): the switch off and the game as it was; home, the waypoint; the place as the art laid it; the
  record; the trophies; the gate; walking (never over the drop, round things by their round, the step round a round thing);
  a touch's errand from where he wakes and from every service to every other and the waypoint, from hard by the brink all
  round it, from the landing; the finer grid (every open cell a place his whole body may stand).
- `tests/shaft_rim.test.ts` (13; its first now names the town's own files as the ones that may import the art) and
  `tests/endless_town_options.test.ts` (1).
- THE UNIT RUN, `node tools/unit.mjs --only rim_town,shaft_rim,endless_town_options,endless,camp,hub2,act1_camp,castle_hall,
  floor_looks_game,town_look,townart,still_pictures,errand_stairs,ways,guide,speak_new,scene_sounds,gates,items_a_game,onward,
  modes,trades,cut,height,mix,dungeon,hold_altar,sunken` (what this touches) and the core, on c07719af0a: 51 files, 596 tests,
  all passed (374 files not run).
- In the browser, on a phone's screen (touch) and at 960 x 540 (mouse and keys), `tools/scenarios/rim_town.mjs`: 22 checks,
  all as it should be, both: endless opening into the town (with the splash and the card too, by hand); each service touched
  and walked to, its panel opening; the gate's word, ENTER; the waypoint home and down; the switch off. The keys held at the
  pit in the game's own loop: he goes round its brink.

## Not checked

- His phone: the cost there (the ground is one picture of about 4.2 MB, painted once; a frame then lays it and what stands
  on it). Here, headless, the town ran at 55 frames a second on a phone's screen.
- The whole unit suite and the whole regression: the main chat's, as it brings it in.
- A long session in and out of the town (its pictures are let go as he leaves, `RimView.forget`, and made again).

## For the main chat, bringing it in

- The branch touches these files of the game, a few lines each, all behind `Level.rim` or the switch: `src/game/game.ts`
  (enterTown, rimTown, comeToRim, quartersHeld, enterEndless, stationNear, interactHint, planProblem, the hero's step, the
  save), `src/game/state.ts` (Level.rim, Level.errand, the `notch` event), `src/game/nav.ts` (FineGrid: added at its end),
  `src/main.ts` (the errand, the town's pictures in `placeFrame`, the gate's ENTER, the test hook), `src/render/render.ts` and
  `src/render/looks.ts` (the look and five small hooks: `behind`, `own`, `names`, a stand's `alpha`, the waypoint's art),
  `src/render/castle.ts` and `src/game/castle_way.ts` (the hall is not the rim), `src/ui/town.ts` (the gate panel's words),
  `src/ui/hud.ts`, `src/ui/guide.ts`, `src/game/quest_marks.ts`, `src/game/world_sounds.ts`.
- To set it live (his yes is given: above): `ENDLESS_TOWN.on = true`; test 1 of `tests/rim_town.test.ts` and test 1 of
  `tests/shaft_rim.test.ts` assert it off.
- FOUND, NOT CHANGED (the live game's, yours): (a) in the camp a service's name is written at a height of its own
  (`StationSpot.lift`) but touched at the first town's (`main.ts` `named`); (b) in the camp a touch on GATE opens the old gate
  panel, whose ENTER DUNGEON N calls `enterDungeon()` as it stood before the ways; (c) `tools/scenarios/endless_look.mjs`
  fails its step 3 on a phone's screen on `main`'s own page (95eefb7) as on this branch (the waypoint's button pressed, he is
  not on the endless level when it looks): the playtest's, not the game's, as far as was looked.
- ALSO RUN ON THIS BRANCH'S PAGE, THE SWITCH OFF, all clean: `towntap` (phone and 960 x 540), `endless_opens` (phone).

## For the tablet's build (`build-endless-tablet-and-final-boss`)

- `Game.quartersHeld()` is where the four held quarters are told: the wall fills its mounts from it.
- The bench's socket: `BENCH_SOCKET` (`src/art/shaft_props.ts`); the slab is the prop `runeSlab` of the level.
- The portal's place: the landing, `LANDING` (`src/art/shaft_rim.ts`), walked onto by the tongue (`onWayOut`, `src/game/rim.ts`).

## For the sound chat

The art chat's list stands (`docs/mockups/endless_town/README.md`, "For the sound chat"). In the game today the town has the
towns' own sounds (the fires, the forge, the ring's hum, footsteps on stone) and nothing of its own. The moment a notch is
cut is the game's event `{ t: 'notch', x, y, n, cut }`, sent as he comes home.
