# For the art chat: review STRIKE'S COMBO to the rules

**From the main chat, 8 Oct 2026. The owner's words, 08:35: "Send the strike combo to the art agent
and have them review it to the rules".** The main chat cannot message the art chat, so the request
is here, on this branch (`review/strike-combo`, which is the branch `combo`: the combo with its
switch off, on top of Version 18.8).

## What it is

The owner, 7 Oct 2026, 23:18: "I’d like STRIKE to have two animations.  The first is the strike we
have now.  That one always plays first.  If the player taps again quickly, then the second
animation, I downward slash, plays.  Back to the first if they tap again.  If it’s not tapped for a
set duration, it goes back to the first animation.  Like a two hit combo if you tap twice"; 23:18:
"And I want him to move forward a little every swing"; 23:19: "Not much, but some".

He was sent a moving picture of it (strike_combo.gif, 8 Oct 00:42) and said, 07:32: "Yeah looks
good". IT GOES LIVE IN VERSION 18.9 AS IT IS. What this review finds goes into a later version,
with a new picture to him first.

- THE SECOND SWING, THE DOWNWARD SLASH: `slash()` and `SLASH3` ("kslash") in `src/art/moves3.ts`,
  the knight's `attack2` in `src/art/heroes3.ts` (`KNIGHT`), chosen by `attackClip` in
  `src/render/figure.ts`. Thirteen frames at 30 a second, the blow at the fourth (as the strike's).
  From the rear stance: the hilt up over his right shoulder, a step in, the blade OVER and down
  across the front of him at the height of a chest, on down to low on his left, a moment low under
  it, then round his right side into the stance (a key at the tenth frame takes the hands out in
  front of him so no arm goes through the body).
- THE FIRST SWING is the strike as it was (`strike()`, `STRIKE3`): not changed.
- THE STEP: the rules move the hero a third of a tile forward over the first 0.12 seconds of every
  swing (`TUNE.swingStep`, `swingStepTime` in `src/game/defs.ts`; `useBasic` and the step in
  `src/game/game.ts`). The figure's own lunge is the move's; the step carries the whole figure.
  WATCH THE FEET: the back foot is carried with the body during the step, and may be seen to slide.

## How to see it

    sh tools/look_moves3.sh kslash 0,2,3,4 a          # frames 0, 2, 3, 4, facing you and away
    sh tools/look_moves3.sh kslash 5,6,8,10 b
    sh tools/look_moves3.sh kslash 11,12,13 c
    sh tools/look_moves3.sh strike 0,2,4,5 a          # the strike, to set beside it
    /opt/npm-tools/node_modules/.bin/tsx tools/audit_moves3.ts     # hands short of the hilt, arms in the trunk, elbows that jump
    node tools/page_gif.mjs src/dev/preview_combo.ts "4" previews/strike_combo.gif 5
        # the moving picture he saw: the game's own rules (the switch on in that page only), a
        # phone's taps, the game's own figure and paintings; two quick taps, a late second tap,
        # the button held; facing you and facing away

## The rules to review it to

- `CLAUDE.md`: the owner's standing rules (pictures first; cyan glows are a friend's, pink and gold
  the enemy's; original designs only).
- The way the moves on the bones are made, as `src/art/moves3.ts` sets it out for the strike: a
  swing is built from the ground up, hips first, then the trunk, then the arms, then the blade,
  each later and faster than the one before; a cut's step lands as the blade reaches; the body
  upright or tilted into the cut, never hunched; the eyes stay on the enemy, the chest turning
  under a head that does not. The slam's notes for a blow from overhead.
- `tools/audit_moves3.ts` clean (it was when last run, after the slash was mended: "kslash short
  0.0 | moved 1.5@11.0 | inside 11 (deepest 0.77@8.5) | jump 1.2 right@3.5").
- Whatever rules the art chat keeps for itself.

## What to send back

A list of what breaks a rule, and for each how you would mend it. If you mend it: on a branch of
your own (not `main`), with the frames and a new moving picture, and a note of what changed; the
main chat brings it in and the owner sees the picture before it is in the game.
