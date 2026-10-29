# Floor 16, the Swan Gardens, handed back (the art chat)

His word, asked whether her vines in the gardens were right, so that floor 16 could go back to the main chat: “Yes, that's
it (Recommended)”. This is the note that goes with branch `mockup/swan-gardens`. The whole story, every brief and every
word of his in order, is in `README.md` next to this file; every word of his quoted here is quoted there as he picked it.

## What the branch is

- `mockup/swan-gardens`, forked from `origin/v23` at 457661b, pushed. MOCK-UPS: nothing of the game imports any of it (each
  part's test proves it). Every figure is behind a switch that is off: `SWAN_ON` (art/garden_swans.ts), `PALACE_HANDS_ON`
  (art/palace_hands.ts), `GUARD_ON` (art/palace_guard.ts), `PRINCESS_ON` (art/princess.ts).
- New: `src/art/swangardens.ts` (the ground), `src/art/floor16.ts` (the Princess's 25 pieces, `swanGardensPieces()`, and her
  vines in the gardens, `herVinesPieces()`), `src/art/garden_swans.ts` (the swans), `src/art/palace_hands*.ts` (the Hushed
  gardeners and grooms), `src/art/palace_guard*.ts` (the palace guard), `src/art/princess*.ts` and
  `src/art/spectral_steed.ts` (the Princess and her steed; `princess_vine.ts`, her vine's one recipe, also drawing the
  gardens' vines); the dev pages in `src/dev/`; their checks in `tests/`.
- It touches four files the game has:
  - `src/art/boss_checks.ts`: his lightning strike (Movement 9) as a check a boss opts into, move by move (`strikes`,
    `smeared` in `BossShape`; the strike one or two frames, far faster than its wind-up and wind-down, smeared, and not
    held to JERK). Every boss reviewed before is reviewed as before: 279 of 279 of their checks unchanged.
  - `src/art/new_mobs3.ts`: `Mob.finish`, a figure may thin its own finished frame (her steed's mist), and `partOrder`.
    Nothing else uses it; every other figure paints as before.
  - `src/art/skin.ts`: `whole(rim, seen)`, telling `Mob.finish` which part won each pixel.
  - The import checks of `tests/bosses.test.ts`, `crier`, `dredgers`, `hushed` and `hushed_watch` told of these mock-ups.

## Bringing it in

- Against `origin/v23` (b9bc01e) a merge has NO conflicts (checked with `git merge-tree`).
- What the game needs to make of it (the main chat's): floor 16's ground as floor 15's stacks are hooked in
  (`paintSwanGardens` in place of `paintTerrain`); the level laid as `src/dev/swan_lay.ts` lays its corner (the terraces,
  stairs and piers by the rule in README, "HOW THE TERRACES GO IN"); the four figures' switches; the yew's vine played as
  the hero passes (below); the Princess's moves and their areas (README, "The Princess": every blow's timing, `PR_STRIKES`,
  and his “And bigger AOE to compensate for the extra time the player gets to evade”); her cage's HP (README, "THE VINE
  SNARE": `SnareState`, his “The cage could have a HP bar and you can destroy it but it stays longer if you don’t destroy
  it”); her steed's laps (the first 8 leaps round the arena, the last 7 at you).

## What he has said yes to (his words)

- THE PLACE. The first look: “Yes, go on (Recommended)”. The ground and its 25 pieces, game-ready: “Good, on to the swans
  (Recommended)”.
- THE SWANS (`SWAN_ON`): “Yes, they're the swans (Recommended)”, after his “The wings are weird looking, like they’re in two
  separate pieces?” was fixed.
- THE HUSHED GARDENERS AND GROOMS (`PALACE_HANDS_ON`): “Yes, they're right (Recommended)”.
- THE PALACE GUARD (`GUARD_ON`): “Yes, that's the guard (Recommended)”, after his “Kinda bland aren’t they?” (“Bold tabard
  and crest (Recommended)”) and “what’s the thing that flips around like crazy on the death animation?” were answered.
- THE PRINCESS (`PRINCESS_ON`): her look, “Yes, that's her (Recommended)”; her steed, “Yes, that's the steed
  (Recommended)”, and of its leaps, “The horse is perfect”; her whip, once it read as a vine, “Yes, lock it
  (Recommended)”.
- HER VINES IN THE GARDENS (his ask: “Can you put some of these vines into the map as well?  Around where the hushed
  gardeners are at.  So you’re like “huh those vines are weird” then the boss has the big vine”): “Yes, that's it
  (Recommended)”.

## Seen, not judged

- The Princess's other moves at the arena's size: her glide, the vine snare and its cage (struck, worn down to stumps,
  burst; and left alone, holding 6 s), the Eleven, the Vow, being struck, her death. Asked of the arena-sized film what
  needed work, he named only “The lash sweep” and “The steed's laps”; of the films after it, only the whip (and the
  cage's HP, his idea, made).
- The sizes he set and I measured to (README, "His words"): the lash a quarter turn, 7.5 tiles long; the snare 5 tiles
  across; the Vow's ring 10 tiles (told him it was his to change); the glide 4 tiles a second; 15 leaps in 15 seconds.

## The rule he added

At 22:43, 28 Oct: “Put in a rule, enemies and bosses movement style is a question asked during creation”. In his art
rulebook doc (rev 87, "A new character", question 4) and the project's copy (`claude/art_rulebook.md`, with its CHANGED
entry). The repo's `docs/art/RULEBOOK.md` is NOT changed on this branch, so as not to clash with the classes branch's
Movement 9: the entry to add is in the project copy.

## The checks

TEST_COUNTS
