# Strike's combo reviewed to the rules: the art chat's answer

**To the main chat, from the art chat, 8 Oct 2026**, for your request on `review/strike-combo`
(`docs/requests/strike_combo_review.md`; the owner's words, 08:35: "Send the strike combo to the art
agent and have them review it to the rules"). Reviewed as it is live in Version 18.9 (`main`).
Nothing in the game was changed. The numbers below were measured on the bones and on the game's own
moving picture; the scripts that measure them are in `tools/review_combo/` (run from the root:
`node node_modules/tsx/dist/cli.mjs tools/review_combo/<script>.ts`).

The rules: `docs/art/RULEBOOK.md` as the owner approved it and as it now stands on `art/rulebook`.
**THE COPY ON `main` IS AN OLDER ONE**: it lacks Movement 7 ("Heavy blows land with a freeze") and 8
("Feet grip the floor"), Places 6 ("Old, broken and burnt"), the rules of "Words in the world" as he
chose them at 09:21, and the bone archer in Monsters 8. Please bring in `art/rulebook` again (its
`docs/art/RULEBOOK.md` and `docs/art/interview.md`); the project's copy (`claude/art_rulebook.md`)
is the current one.

## What breaks a rule (worst first), and the mend

**A. HIS FEET SLIDE. Both swings, both views.** Movement 8: "Feet grip the floor. A foot stays where
it lands"; Movement 1: "A blow plants the feet". At 60 steps a second of the game's own rules
(`feet60.ts`): the back foot's ball never leaves the floor yet moves 8.7 game px forward in every
swing; the front foot is carried 4.1 game px while still flat (frames 0 to 2); after it lands it is
dragged back 4.1 (strike) or 3.6 (slash) game px in the recovery. The causes: the game's step
(`TUNE.swingStep`, a third of a tile over 0.12 s) carries feet the picture keeps planted; the back
foot turns about its ankle (`rft` from -55 to -8), so its ball sweeps the floor; the recovery slides
the front foot from `lfx` 19.5 to 10.5 (strike) and 18.5 to 10.5 (slash) with `lfz` 0 throughout.
- **Mend (`strike()` and `slash()` in `src/art/moves3.ts`, the same way): both feet off the floor
  while the step carries him, landing in his stance at the blow.** At the 2*FR key the front foot is
  already lifting (`lfz` about 2, `lfp` about -10) and the back foot pushes off with its ball just
  clear (`rfp` 30, `rfz` = onToes(30) + 1.2, `rft` -30); at the 3*FR key both are still in the air;
  from the 4*FR key on, the front foot is flat at `lfx` 10.5 and the back foot on its ball (`rfp`
  36, `rfz` onToes(36), `rft` -8; `rfx`, `rfy` set so that the ball sits where the stance has it,
  about -9.1 and -6.0); the lunge becomes the hips over the front foot (`px` about 4) instead of
  today's long stance (`px` 10.5 and 9); in the recovery nothing moves on the floor but the back heel
  coming down about the ball. Tested on the strike's bones (`feet_mend.ts`): both legs reach in every
  frame, and the most a planted ball then moves over the floor (the step counted) is 0.2 figure units
  for the front foot and 2.4 for the back (today, as above, 4.1 and 8.7 game px). Why in the air and not planted: a back foot kept planted through a
  third of a tile and the lunge is beyond his leg's reach, and the step is often cut short by a
  monster and goes the true way of the aim; feet in the air are right whatever the step does.
- **A look to settle with him:** his stride becomes the step itself, so the blow's stance is shorter
  than today's.

**B. AN ARM THROUGH HIS HEAD. The slash, frames 1.5 to 3.** Heroes 6: "Clean bodies. Arms never pass
through clothing or the body, in any frame." The left forearm is inside the head from frame 1.5 to 3,
deepest at frame 2 (`head_all.ts`: 0.65, where 1 is the two skins touching); from in front the helm
is gone at frames 2 and 3. `tools/audit_moves3.ts` tests arms against the trunk only, so it said
nothing.
- **Mend (tested, `mend_check.ts`):** the top key (2*FR): the hilt at `rhx` 6, `rhy` 2, `rhz` 12
  (was 2, 2, 16) and `faceTilt` -10; the 3*FR key: the hilt at 12, 6, 9 (was 8, 3, 14) and `faceTilt`
  -10. No arm in the head (the nearest 1.24), both hands on the hilt, the trunk as before; the helm
  shows at frame 2 from both sides.
- **And:** give `tools/audit_moves3.ts` a test of arms against the head (allowing the ranger's string
  hand at his jaw: Shot and Volley are flagged by `head_all.ts` for that, rightly).
- **The same fault elsewhere, outside this review:** the slam's top (frames 3.5 to 6.5, deepest 0.48:
  the helm vanishes the same way) and the leap (frames 3.5 to 13, deepest 0.48; not looked at).

**C. THE SLASH'S BLADE MOVES BEFORE HIS BODY.** The method `moves3.ts` sets out for the strike: "hips
first, then the trunk, then the arms, then the blade, each later and faster". Degrees a frame
(`mend_check.ts none`): frames 2 to 3, hips 0, chest 0, blade 48; then all three together (hips 30,
chest 50, blade 58). The strike does it right (36, 16, 42, then 38, 106, 133).
- **Mend at the 3*FR key:** `yaw` 0 (was -20), `twist` -32 (was -12: the chest stays back), `wEl` 85
  (was 110). Tested: hips +20, chest 0, blade 23; then hips +10, chest +50, blade 83.

**D. THE SLASH JERKS.** Movement 5: "nothing jerky"; Movement 1: "Something heavy is slow to start and
slow to stop." The raise starts at its fastest (frame 0 to 1, the blade turns 76.5 degrees, more than at
the blow, 58: ease 'out' on the 2*FR key); the recovery goes from a dead hold straight to 34 a frame,
then hitches at frame 10 (32, 22, 39: two 'io' segments meeting at the 10*FR key).
- **Mend:** 2*FR ease 'io' (the raise 51, 51); 10*FR ease 'in' and 13*FR ease 'out' (the recovery 17,
  48, 45, 27, 9). Tested with B and C together: still clean.

**E. LESSER, BY EYE: THE STREAK STOPS READING AS A SWORD.** Effects 3: "a bright crescent"; Heroes 2:
"Big readable pieces: ... weapon". Slash frame 3: the streak bends the blade like a scythe; frame 12:
a broad wedge at the tip like an axe head; frame 13: the tip hooked; strike frame 12 the same wedge.
- **Mend:** `paintMove3` (`src/art/heroes3.ts`) draws the streak on every frame the blade moves; draw
  it only through the cut (frames 3 to 5 of each swing), so the way back shows a clean blade.

## What passes

Only cyan glows on him (blade, streak, visor, buckle), nothing pink or gold. Both swings wind up (the
strike's coil, the slash's raise) and follow through with a hold (strike frames 5 to 8, slash 6 to
8). His hips turn into each blow (the strike 74 degrees from the coil to the blow; the slash 30 from
the top to the blow); the front foot lands at frame 4 as the game's step ends; the landing sinks (the
pelvis 4.0 units down in the slash, 2.6 in the strike). The scarf streams back and settles; the skirt
lags. Nothing covers him for more than a frame. Arms keep out of the trunk within the audit's own
limit (strike 0.79 at frame 9, slash 0.77 at 8.5; it flags below 0.7), and by eye no arm shows
through the tabard. The strike's own build: hips first, clear of the head (nearest 1.36). His face
never turns away from the enemy (`faceTurn` 0 throughout). He leans 22 to 24 degrees into the slash
and 20 into the strike: tilted, not hunched. Movement 7 (the freeze) is for heavy blows, not Strike.

## Side note

`src/dev/preview_skin.ts` (lines 139 and 184) titles every still "not in the game", so stills of
these two moves, which are live, say so. Worth mending before stills of live moves go to him.

## What happens next

The art chat will make the mends on a branch of its own with the frames and a new moving picture,
and send him the picture first (he was told the review is done). If you would rather make them
yourself, the numbers above are tested.
