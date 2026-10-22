# Binding at work: bands of written words

A mock-up on `mockup/binding` (from v23 at 85484ab), behind `BINDING3` in `src/render/binding3.ts`,
**off**. With it off nothing of it is drawn or called, and the game is as it was. Its rules are the main
chat's, written once its look has his yes.

## His words

- His pick for new words on floors 11 to 15 (the main chat's board post of 21 Oct, 22:34 Eastern):
  “Binding”, one of the words kept on his page "Wordsmith: Words, Crafting, Ranks": Control; in front,
  holds enemies in place; behind, leaves a snare for the next enemy to cross; on a monster, monsters root
  you.
- To the art chat, 21 Oct (Pacific), asked “Binding holds enemies in place, leaves a snare behind, and on a
  monster it roots you. What should its hold look like?”, his pick: “Bands of written words
  (Recommended)”, offered as: ribbons of glowing script whip out and wrap round the enemy, pinning it in
  place; the snare a written sigil that lashes up at whoever crosses it.
- Shown its stone and colours and a film of it in the practice room (in front, behind, on a monster), and
  asked “Is Binding right as shown: its rune stone, colour and animations?”, by 22:00: “Yes, send to main
  (Recommended)”, offered as: the main chat writes its rules, puts it in behind a switch, and tells him when
  it is live.

## What it looks like

- **Its colour:** parchment, `#c8b48a` (glow `#f2e8cc`): the written word. Six tones, `BIND_RAMP`. As the eye
  sees colour (CIEDE2000) it is 13.0 from the enemy's gold, its nearest; 13.9 from Heavy; further from
  every other word, the ten melds, the five Volatile melds and the friend's cyan.
- **Its rune:** a band tied in a knot (`BIND_GLYPH`, 7 by 7); `bindRune()` cuts its stone as the others are.
- **The bands:** a dark ribbon four pixels deep, its upper edge lit, and written along it in light, letter
  after letter with gaps between words, script that crawls along the band.
- **In front, the hold:** three bands leap up out of the floor round what it strikes (0.16 s), whip over
  and wrap it at its feet, its middle and its chest, closing in and SNAPPING TIGHT at 0.3 s (a flash, it is
  lit white an instant, letters burst off, a small kick and a hold of 0.04 s), and are pinned to the floor
  at three pegs of light. While it is held, the script crawls round the bands, they strain and shudder now
  and then, and letters are shaken off. In the last 0.35 s of the hold they loosen and unravel, the letters
  peeling off and falling away.
- **Behind, the snare:** a sigil written on the floor: a ring of script turning slowly round a coiled band
  whose end lifts and falls as if it breathed, three pegs round it, a pool of pale light under it. The
  first to cross it: the coil lashes up out of it and binds them as above (the bands leap from the snare,
  not round them), and the sigil flares and burns out (0.6 s).
- **On a monster, rooted:** the monster's own bands, dark ink written in the enemy's pink burning to gold
  (`BIND_ENEMY`), are flung from it at the hero and bind his legs, at his feet and his knees, pinned to the
  floor; they unravel as the root ends.

## For the main chat: what it needs from the rules

`eventsB3(g.events, g, fx)` (main.ts, while `BINDING3.on`, hooked) reads:

- `{ t: 'bind', id, secs }`: monster `id` held by Binding in front, for `secs`;
- the snare: a zone carrying `look: 'binding'` (or the word 'binding' in its `words`), any kind; drawn by
  `floorB3` and left out of the renderer's own (`ownsZoneB3`, hooked);
- `{ t: 'snareSprung', id, x, y, secs }`: the snare at (x, y) springing on monster `id`;
- `{ t: 'rooted', x, y, secs }`: the hero rooted by a monster's Binding, cast from where it stands;
- `{ t: 'unbind', id }`: a hold broken early (`id` -1 for the hero's).

What the pictures want of the timings (`BIND_TIME`): the bands take 0.3 s to wrap and snap tight, so a hold
of 0.65 s or more shows whole; the snare's burn-out 0.6 s. How long each holds, how far the snare's reach
is (drawn up to 1.4 tiles round), and whether a boss can be held are the rules'.

## How it was made and checked

- `tools/scenarios/binding_look.mjs`: in the practice room, in front (two struck and held), behind (a snare
  laid and a skeleton walking across it) and on a monster (a cultist rooting the hero), a picture each
  thirtieth of a second of the game's own clock; `tools/binding_film.py` makes the MP4.
  `src/dev/preview_binding_rune.ts`: its stone, colours and band.
- `tests/binding3.test.ts` (7): the switch off and every hook behind it; nothing at all with it off; its
  colours (each other word at least 12 away; nothing cyan or pink; a monster's the enemy's own); its rune;
  the hold's three bands, pegs, snap and unravelling; the snare drawn here and burning out when sprung; the
  hero rooted in the enemy's colours, a hold broken early, all forgotten on a new level.
- Not run: the regression; a real phone; Binding with real rules.
