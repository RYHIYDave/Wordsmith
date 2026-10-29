# The High City, floors 17 to 20, handed back (the art chat)

Every place and figure of floors 17 to 20, the High City's own 25 pieces, and floor 16 (handed back before, on
`mockup/swan-gardens`), drawn by the art chat's helpers each on a branch of its own and brought together here, on
`mockup/high-city-all`, with the tests' import lists merged. MOCK-UPS: nothing of the game imports any of it; every figure
is behind a switch that is off. Each part's README (`docs/mockups/<part>/README.md`) has its brief, its numbers, how to
bring it in, and his words; the briefs he picked are in `docs/mockups/high_city/BRIEFS.md`. Every word of his quoted here
is quoted there as he picked it.

His word for the work, 29 Oct, 08:31: “I have a lot of extra usage that needs to be used by tomorrow at 2:00pm so you can
go crazy with helpers to speed this level building process”.

## Bringing it in

- `mockup/high-city-all` merges with `origin/v23` (b9bc01e) with NO conflicts (checked with `git merge-tree`). It holds
  every branch below; the single branches merge into each other with conflicts only in the import lists of
  `tests/bosses.test.ts`, `crier`, `hushed`, `new_mobs3` and `floor11` (here already merged: every mock-up named).
- Shared engine files touched, beyond floor 16's: `src/art/boss_checks.ts` (one optional `Handover.phase`, the Moth's;
  every other boss checked as before) and `src/art/new_mobs3.ts` (a fog figure thinned as it dies, the Hush's shapes';
  the Princess's death the same as before).
- Switches, all off: ORDER_ON, PRINCE_ON, FOOTMEN_ON, DANCERS_ON, QUEEN_ON, QGUARD_ON, LADIES_ON, REFLECTIONS_ON, KING_ON,
  KNIGHTS_ON, CROSSBOW_ON, HUSHSHAPES_ON, MOTH_ON, SHADOWS_ON (and floor 16's SWAN_ON, PALACE_HANDS_ON, GUARD_ON,
  PRINCESS_ON).
- Game rules the art leaves to the main chat are listed in each README (where a dart or a lunge sets a figure down, when
  a move may start, the areas, the trap timings). The floors' pictures stand on stand-in floors; each floor's own ground is
  on its place's branch.

## What he said yes to, part by part

FLOOR 17, THE MASQUE
- The place (`mockup/masque`: `src/art/masque.ts`, `floor17.ts`): the first look, “Yes, that's the place
  (Recommended)”; game-ready with the Prince's 25 pieces, “Yes, that's the Masque (Recommended)”; the seven rooms lit only
  through their windows as in Poe, “As drawn, true to the book (Recommended)”.
- The Prince (`mockup/prince`): “Yes, that's the Prince (Recommended)”; his everyday step kept as fast as the knight's run,
  his darts twice that, “Keep it as it is”.
- The footmen (`mockup/masque-footmen`): “Yes, that's them (Recommended)”.
- The masked dancers (`mockup/masque-dancers`): “Yes, that's them (Recommended)”.
- The Silent Order, one design for 17, 19 and 20 (`mockup/silent-order`): “Yes, that's the Order (Recommended)”; the armed
  ones of 19 throwing a fan of three knives, “A fan of three on 19 (Recommended)”.

FLOOR 18, THE GLASS GALLERY
- The place (`mockup/glass-gallery`: `glassgallery.ts`, `floor18.ts`): the first look, “Yes, that's the place
  (Recommended)”; game-ready with the Queen's 25 pieces, “Yes, that's the Gallery (Recommended)”; Snow White's glass
  coffin in the chapel, “Keep it (Recommended)”.
- The Queen (`mockup/queen`): “Yes, that's the Queen (Recommended)”.
- The queen's guard (`mockup/queens-guard`): “Yes, that's them (Recommended)”.
- The ladies-in-waiting (`mockup/gallery-ladies`): “Yes, that's them (Recommended)”.
- Your reflections (`mockup/reflections`): “Yes, that's them (Recommended)”; what glows cyan on the hero turned the enemy's
  pink on them, “Pink, like enemies (Recommended)”.

FLOOR 19, THE KEEP
- The place (`mockup/keep`: `keep.ts`, `floor19.ts`): the first look, “Yes, that's the place (Recommended)”; game-ready
  with the King's 25 pieces, “Yes, that's the Keep (Recommended)”; the King's mark, “Keep the royal swan” (one swan crest
  for the whole family, each royal in its own colours).
- The King (`mockup/king`): “Yes, that's the King (Recommended)”.
- The king's knights (`mockup/kings-knights`): “Yes, that's them (Recommended)”.
- The crossbowmen (`mockup/keep-crossbowmen`): “Yes, that's them (Recommended)”.

FLOOR 20, THE QUIET TOWER
- The place (`mockup/quiet-tower`: `quiettower.ts`, `floor20.ts`): “Yes, that's the Tower (Recommended)”.
- The Moth (`mockup/moth`): “Yes, that's the Moth (Recommended)”; in its last phase the book knocked from the lectern to the
  stones where it lands, “Book knocked to the stones (Recommended)” (FOR THE MAIN CHAT: the chapter falls from its lectern
  as the last phase begins).
- The Hush's shapes (`mockup/hush-shapes`): “Yes, that's them (Recommended)”.
- The shadows of the four royals (`mockup/royal-shadows`): “Yes, that's them (Recommended)”.

THE HIGH CITY'S OWN 25, shared by floors 16 to 20 (`mockup/high-city-set`: `high_city_set.ts`, `highCitySetPieces()`):
“Yes, that's the set (Recommended)”. The royal cards (the Royal Cards event's drops) are among them.

## Not yet made

- The Ranger's six companions (the main chat's ask of 28 Oct, 23:26): started on `mockup/companions-art` (not pushed);
  stopped with his usage, to be finished later.

## The checks

ALL_CHECKS
