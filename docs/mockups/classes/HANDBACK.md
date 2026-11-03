# The new classes, handed back (the art chat, 28 Oct 2026)

His word, 28 Oct, asked what next once every class had its moves, falls and hits: “Hand it back (Recommended)”. This is the
note that goes with branch `mockup/classes`. The whole story, every pick and every word of his, is in `BRIEF.md` next to
this file. Here: what is on the branch, what he has said yes to (his exact words), what he has seen but not judged, and
how to bring it in. Every word of his quoted here was checked against `BRIEF.md`, where each is recorded as he picked it.

## What the branch is

- `mockup/classes`, forked from v24.0 (618ccbe), pushed. MOCK-UPS: nothing of the game imports
  any of it. Its pictures and moves are in `src/dev/` (42 files), their checks in `tests/`, the notes here.
- Outside `src/dev/` it touches three files:
  - `src/art/skeleton.ts`: two new joints high in the spine, `hunch` and `shrug` (his word, 25 Oct, for the warlock:
    “Can you put some articulation points in the spine in the wire frame the character sprites are being built with?”).
    They do nothing unless a pose names them, proved by `tests/spine_upper_back.test.ts`, and once by solving every pose
    the unit suite solves before and after: the same in every number.
  - `src/art/cultists.ts`: one cast, `(FM_REST[k] as number)`, needed by the type checker once those joints are optional.
  - `docs/art/RULEBOOK.md`: his Movement rule 9, “Big wind-up, lightning strike” (his words, 24 Oct, by 19:05: “Like the
    wind up and wind down are big but the actual punch is lightning quick”; its reach, “All attacks, melee most
    (Recommended)”). The main chat said on the board, 25 Oct, that it would come to main with the next version.
- `tests/sculpt_checks.ts`, the shared picture and body checks, has grown with the work; every check on the branch uses it.

## Bringing it in

- Against `origin/v23` (e157c71) a merge has ONE conflict, `docs/art/RULEBOOK.md`. The branch's copy is v23's with
  Movement 9 added (its line in the changes list at the top, and rule 9 under Movement), nothing else different: take
  the branch's copy. Checked with `git merge-tree`.
- The new classes are pictures and moves only. Making them heroes in the game (art/heroes3.ts plans, their abilities and
  numbers) is the main chat's work, and what they do the planning chat's: the BRIEF's design sections give his words for
  each ability.

## Each class: what he has said yes to

THE BRAWLER (`dev/sculpt_classes.ts`, `dev/brawler_moves.ts`, `brawler_punches.ts`, `brawler_fx.ts`, `brawler_fall.ts`,
`brawler_hits.ts`).
- His look: build B, outfit 11 without its hood: “Yes, this is him (Recommended)”. His face: “Yes, keep them
  (Recommended)” (all the faces).
- Standing: “The step and follow is weird but I think the rest is okay” (the step and follow then gave way to his run).
- Running: “Good, move on (Recommended)”.
- His punches, eight combos by position (tap jab, hook, uppercut; hold cross, body blow, overhand, or after two holds the
  haymaker): the combos' jobs, “Jobs good, names need work”; the names floating over him, after the fixes: “Good for now,
  I feel like with repeated combos the really big names might get repetitive and annoying but let me test it myself once
  he’s in the game and we’ll see.  Good for now”.
- His swipe, the slip and counter: “Good, keep it (Recommended)”.
- Struck hard and struck from behind: “Good (Recommended)”.
- Seen, not judged: his fall (down on his knees). It was among the deaths he was shown; asked which needed work, he named
  only the Golem's.

THE TINKERER (`dev/sculpt_tinkerer.ts`, `tinkerer_moves.ts`, `tinkerer_hold.ts`, `tinkerer_fall.ts`, `tinkerer_hits.ts`,
`blast_fx.ts`).
- Her look: the wrench on her shoulder, “1. Wrench on shoulder (Recommended)”; her face, “Yes, keep them (Recommended)”.
- Her backpack: “C, the vial rack (Recommended)”; on her in every move (`TINK_PACK`, a switch, now the rack), shown in a
  film: “Good (Recommended)”.
- Her run, a quick light sprint: “Good (Recommended)”. Her stand: asked which of her moves needed work, he named “Stand and
  run”, and of them “The skipping run,Her non wrench arm is going crazy”; read as the run's free arm (told him so), the run
  remade and her stand left as it was; the stand was shown again in the sprint's film.
- Struck hard and struck from behind: “Good (Recommended)”.
- Seen, not judged: her tap (a Contraption thrown down), her swipe (the blast jump), her tap and hold (she whistles her
  Golem on), her fall. Asked which of her moves needed work he named only her stand and run, and of the deaths only
  the Golem's.

HER CONTRAPTION (`dev/sculpt_contraption.ts`, `contraption_fx.ts`): the tripod mortar, “1. Tripod mortar”. Seen, not
judged: it lobbing a vial (in her tap's film) and broken (among the deaths; not named).

HER GOLEM (`dev/sculpt_golem.ts`, `golem_moves.ts`, `golem_gun_fx.ts`, `golem_pound_fx.ts`, `golem_down_fx.ts`).
- The boiler ape with one giant arm: “Boiler ape”. Its ranged arm: “Cannon” (`GOLEM_GUN`, now the cannon).
- Its cannon attack: “Good (Recommended)”. Its end, crashing down: “Good (Recommended)”.
- Seen, not judged: its ground pound, walk and punch. His word of them was of the view from behind: “It seems like every
  time we get drawings from behind the arms switch sides.  I don’t understand why that happens” (see Views, below).

THE WARLOCK (`dev/sculpt_warlock.ts`, `warlock_moves.ts`, `warlock_spells.ts`, `warlock_fx.ts`, `warlock_change.ts`,
`warlock_hits.ts`).
- Hunched standing and running: “Yes, on to his attacks (Recommended)”; the fire in his claws: “Yes, keep it
  (Recommended)”.
- The hellfire bolt: “Good, on to the Curse (Recommended)”. The Curse: “Good, show the spread next (Recommended)”. The
  spread: “Good, on to the smoke step (Recommended)”. The smoke step: “Good, on to the change (Recommended)”.
- The change into the demon: “The change is good.  I’m not sure about the demon’s face” (its face then picked, below).
- Struck hard and struck from behind, the man and the demon: “Good (Recommended)”.

THE DEMON (`dev/sculpt_demon_rig.ts`, `demon_moves.ts`, `demon_fx.ts`, `demon_swipe_fx.ts`, `demon_return.ts`).
- On all fours; its face: “A, beast sharpened (Recommended)”.
- Running: “Good, on to claw rakes (Recommended)”. The claw rakes: “Good, on to Damning (Recommended)”. Damning: “Good, on
  to the swipe (Recommended)”, and “Really nice job on the DAMN”. Its swipe: “Smoke step (Recommended)”, and “That smoke
  step is very good.  Excellent work” (the pounce stays in the code, not chosen). Burning out back into him: “Good
  (Recommended)”.
- Seen, not judged by itself: its standing (shown with the first run).

THE WARRIOR, a side picture (`dev/sculpt_warrior.ts`): the new rendering with the beak helm. No word on it yet.

## Things to know

- VIEWS. His pick, 28 Oct: “Draw them true (Recommended)”. Every class film from behind since is drawn truly from behind
  (the figure in front turned +90°, no mirror; `art/skeleton.ts` project 'rear' is the same picture). The game draws its
  heroes from behind as a mirror; whether the new classes go in that way or truly is the main chat's call.
- HITS ARE LONGER THAN THE GAME'S. The new struck moves are 13 frames (0.43 s), the blow landing on the second. The game's
  heroes' reels are 7 frames, and `render/figure.ts` shows `clips.reel` and `clips.lurch` for their own length while a
  hero stands or walks. Worth feeling in play.
- THE GOLEM'S TAP AND HOLD FILM (her whistling it on) was made with the pincer arm, before he picked the cannon. The moves
  themselves are drawn with `GOLEM_GUN`, now the cannon, and checked so.
- His ideas for later, all passed on the board: her skill tree partly gold based (“For future reference I’d like some of
  her skill tree to be gold based like increased % damage based on 1% gold stash amount or something like that”); a
  unique chest armour, “a backpack with one of her turrets in it”; the brawler's skill tree (a counter that sets up the
  combo's finisher; a bigger uppercut; body blows that always bleed).

## The checks

Every move is checked in every frame from in front and from behind (the game's view) and, for the films, truly from
behind: crisp, the friend's edge, no pixel alone, nothing pink, nothing cut off; a clean body; feet on the floor and none
sliding; nothing jerky (the strike or blow itself, a flash, excepted, by his Movement 9); and what each wears or holds
clear of it (the warlock's coat, her wrench and her rack). The test files: `brawler_moves`, `tinkerer_moves`,
`contraption_tap`, `golem_moves`, `golem_gun`, `warlock_moves`, `demon_moves`, `classes_sculpt`, `spine_upper_back`.
The demon's file is very slow here (a demon picture takes many seconds on this machine): the full file did not finish
inside two hours; its new moves were run on their own and pass.

THE WHOLE UNIT SUITE ON THE BRANCH AS HANDED BACK (each file on its own): every test file but the demon's, 222 of 222
clean, 2578 tests passed, none failed; the type check clean.
