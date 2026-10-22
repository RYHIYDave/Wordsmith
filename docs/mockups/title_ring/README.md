# The start screen made new: the Ring on the Hill

A mock-up on `mockup/title-redo` (from v23 at c656832), behind `TITLE_RING` in `src/art/title_ring.ts`,
**off**. Nothing of the game imports it. Handed back to the main chat with his yes.

## His words

To the art chat, 21 Oct 2026 (Pacific time):

- 17:26: “I’d like to scrap the title screen and start again.  I like the moving picture style, but I
  don’t like the current art.  Can you give me 10 low res options to choose from?  Doesn’t have to have
  a wordsmith in the picture, but I could, go in any direction with it.  They don’t need to be animated
  before I see them.”
- Shown ten stills (`src/dev/title_options.ts`, the sheets made by `src/dev/preview_title_options.ts`),
  asked which to paint full size and bring to life, by 17:50: “9”, the Ring on the Hill.
- Shown it full size, then moving, with the wordsmith standing in the ring and a surge of light every
  8 s, and asked whether it was right (offered: “Yes, send it to main (Recommended)”, “Yes, but no
  surge”, “Change something”): “Yes, but no surge”. Then, before anything was changed, at 18:10: “No
  hang on don’t do anything with that”, and at 18:11: “I like the surge, take the wordsmith out”.
- Shown it moving without him, asked “Is this the new title screen?”, by 18:15: “Yes, send it to main
  (Recommended)”, offered as: the main chat puts it in place of the old wordsmith picture, then tells
  him when it is live.

## What it is

Night. A hill, and on its crown the wordsmith's ring of ten standing stones, a rune burning in each,
a gap in the front where a path of flags comes up the hill. Off the slab in the middle, a column of
light goes up into the sky and breaks there into an aurora of the same light, two curtains of it,
letters drifting up in it. A thin old moon high on the left, the river of stars across the sky, a dark
range of mountains with snow on the highest peaks, mist in the valleys, pines on the far hills. No one
is in it. What glows is the friend's cyan; nothing warm, nothing pink.

## Its life

- The aurora drifts and ripples (its hem in long slow waves, its folds and rays moving).
- Letters climb the column (18 picture pixels a second) and drift up in the aurora (3 to 7).
- Each stone's rune swells in turn, a wave going round the ring (a round of about 3.9 s).
- Stars twinkle; motes of light rise off the hill.
- **THE SURGE** (his “I like the surge”): first 3 s in, then every 8 s. A burst of light runs up the
  column (0 to 0.55 s); at its top the aurora flares outward from the middle across the sky (0.55 to
  2.2 s); a ring of light runs out across the hill from the slab (0 to 1.3 s); every rune in the ring
  flares at once and dies back; a faint cyan flash over the whole picture at 0.55 s (0.14, gone by
  0.95 s). No screen kick.

## For the main chat: putting it in

`makeRingTitle()` gives the picture as `drawSmithMenu` (ui/panels.ts) holds one, a `SmithPicture`:
`w`, `h` (640 by 360), `lip` 312 (just under the front stones' feet), `lift` 30, `headTop` 150 (so the
name sits up in the sky), `still`, `life(t)` (the whole picture at time `t` on a sheet the picture's
size, the same sheet each call) and `flash(t)` (the surge's flash). No `kick`.

In `src/main.ts`, a fourth look, say `'ring'`, chosen while `TITLE_RING.on`, with
`smithTitle ??= makeRingTitle()`; `TITLE_RING.on = true`. Two tests will need telling:
`tests/title_ring.test.ts` test 1 (the switch off, nothing importing it) and
`tests/titlesmith3.test.ts` test 1 (it looks for `TITLE_SMITH3.on ? 'smith3' : 'floor'` in main.ts).

Laid out by `smithLayout` it was looked at on a phone held sideways (507 by 234), a small phone
(379 by 214), a phone upright (234 by 507), and 480 by 360: the ring and the column whole on every one,
the name in the sky, the buttons under the front stones. On a screen taller than the picture its foot
and top sink into the screen's own dark (`#05040f`), dithered in.

How it is drawn, for its cost: the layers are painted once (120 to 180 ms headless, measured twice), into ten canvases
the picture's size (about 9 MB). Each frame lays them up with the canvas's own tools: the sky with
its stars and aurora laid up afresh 12 times a second (every frame while the surge runs through it),
the aurora a column of pixels at a time stretched from strips painted once, never smoothed; light
added where light is. A frame took 4 to 5 ms headless (about 11 ms when the sky is laid up every frame, as while the surge is in it).

## Checks

- `tests/title_ring.test.ts` (5): the switch off and nothing of the game using it; the picture whole
  and sunk into the dark at its foot and top; nothing warm or pink glows, every bright coloured pixel
  cyan (or the night's blue where his light falls); it lives (the sky changes, the foot of the hill
  does not); no one stands in the ring, the column whole from the slab up.
- `tests/titlesmith3.test.ts` passing (it reads every file for the old picture's name).
- `tsc` clean. The whole unit suite: see the hand-back post on the board.
- Not run: the regression; a real phone.

## Files

- `src/art/title_ring.ts`: the picture, its layers and its life.
- `src/dev/preview_title_ring.ts`: the dev page (the whole picture; any screen with the name and
  buttons on it; `film=<seconds>` for `tools/page_gif.mjs`).
- `src/dev/title_options.ts`, `src/dev/title_options_kit.ts`, `src/dev/preview_title_options.ts`: the
  ten sketches he chose from.
- `tests/title_ring.test.ts`.
