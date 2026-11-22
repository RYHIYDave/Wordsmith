# What the Godot game still needs (22 Nov 2026)

His words: “So now the game runs well, the game is balanced, and with all the classes running at 30fps it looks good.  So now
we gotta make sure it's fun and feature complete and we're good to go”; asked to start with a list of what is missing, “Yeah
let's do that”.

How it was checked: every feature the browser game has switched on (199 switches in `src/`) against the Godot copy's code and
notes; the browser game's parts with no Godot file of the same name read one by one; the Godot copy's own "left out" and
"not yet" notes checked against its code now (most turned out done since they were written); the screens' buttons and options
side by side; and what a phone app needs that a browser game never did.

## 1. In the browser game, not in the Godot copy

1. **The exits' names** (game/exit_labels.ts, EXIT_LABELS on). Once a floor's boss dies and its way out opens, a label over it
   like the stash's says what it is: STAIRS, CAVE, CAGE, CAUSEWAY. The Godot copy has none. Changes the look: pictures first.
2. **Splitting breaks every arrow** (game/defs.ts SPLIT_EACH on, his pick of 12 Nov 2026, “Every arrow splits, 21
   (Recommended)”). Each arrow of the Fan's three or a Twin pair splits once of its own. The Godot copy splits only the first
   hit of each use (city_words.gd split_first). Rules only.

Everything else switched on in the browser game is in the Godot copy (some under other names): the floors and their stories,
bosses, packs and their colours, the words by floor, melds, uniques, companions, the town's services, quests and their
markers, the scene, world, word and enemy sounds, the heroes' own voices, the modes, endless, practice, level select, touch,
controller, upright play, the pause menu (END RUN included).

## 2. What a phone app needs, that the browser game never did

3. **The export setup for a phone** (no `export_presets.cfg` yet): Android can be built here; an iPhone needs an Apple
   developer account and a Mac step. Waits on which phone he has.
4. **The phone's notch and rounded corners**: nothing keeps the HUD out from under them yet (no safe-area handling).
5. **The app's icon** at the sizes a phone wants (one `icon.png` now).
6. Already in: the game pauses and saves when the app is put away or closed (main.gd).

## 3. Quirks that make it less fun (from the porting notes, TO_LOOK_AT.md; in both versions, the Godot copy plays as the game)

7. **No evade on floor 1.** The Lunge opens at level 5, but all of floor 1 and its boss bring a new hero to about level 3.
8. **Floor 10's boss is named after the old boss**: “The Drowned Eye” (with his words) over the Swamp Colossus.
9. **The skeleton champion never rallies on floor 1** (his cry reaches only pack-mates carrying words; none do on floor 1).
10. **The red trolls never charge in their small lairs on floor 1** (the charge needs a run longer than the lair).
11. **The Carrion Queen's Eclipse goes on after she dies**; her rake and gust marks are cut off early.
12. **The crash of the Colossus's two waves never slows the hero**, as it is meant to.
13. **Fervor never makes him faster**, though its card says it does.
14. **Twin does nothing on most of the Wilds' monsters**, and Vast on a monster mostly only widens its red circles.
15. **The stronghold's altar still promises “a yellow pack of the cult's best”**, an older hall.

(These are from notes made while porting; 7 and 8 checked again in the Godot copy now, the rest not yet.)
