# Act 1's other levels: how they could look (mock-up, 12 Oct 2026)

A picture for the owner, from the planning chat (the Chat Board's "plan"). Nothing of the game
imports it. His words, 12 Oct 2026, 18:56: "How bout a mock up of what the other levels would look
like?  I’d like the quarry and forest to be mostly open with minimal narrow paths between open
areas.  The forest and the swamp don’t really have walls".

`src/dev/preview_act1.ts` paints four of the doc "Wordsmith Act 1: The Descent" levels, each edge
made his way of 18:33 (today's tiles, the edge painted round over them; see
docs/mockups/ledge_road/README.md), the knight standing in each for scale:

- 6, THE QUARRY: three open pits, each joined to the next by a cut about a tile wide, sheer
  quarried walls (benches and drill marks), the mountain's grass and rock on top; cut blocks, the
  obelisk lying where it was cut, rails and a cart, a crane.
- 8, ECHO CANYON: the dry riverbed (sand, river-worn stones down the middle) between red layered
  walls 75 game pixels high; a broken cult wagon with an obelisk on it.
- 9, THE PINEWOOD: three clearings joined by paths a tile wide through the trees, no walls; a
  stream with a log bridge; the trees standing in front of ground the hero could be on drawn
  see-through; a late-afternoon light.
- 10, THE SUNKEN FEN: no walls; dark water, islands of mud, boardwalks, a sunken paved ruin with
  the cult's obelisk, the Eye's magic running out across the water in pink, mist, dusk.

THE NEAR WALLS (quarry and canyon) are left out as the game leaves out walls toward the eye: the
ground ends in its line of light, then a band of dark rock where the wall is cut, then the
rock's top.

The rock, ground, water, trees and light are rough mock-up paint to show the shapes and the
feel, not art for the game. Layouts are drawn on the screen (`at`, `area`) so that each open area
reads as one.

    node tools/preview.mjs src/dev/preview_act1.ts previews/act1_levels.png 1280 800

Sent to him by 19:06 as previews/act1_levels.png. His answer is not in yet.

## See-through walls (his question of 19:17)

His words, 19:17: "Can we do for the walls that would block the view of the character or enemies
the same thing that the mystic’s tent does where is becomes translucent when you pass by it?"

With the hash `see` the page paints Echo Canyon as the game does it today (the near wall left
out), then the canyon and the quarry with the near walls drawn whole, see-through in a window
round the knight and a dagger cultist (as the tent's roof is seen through, Version 14.5):

    node tools/preview.mjs src/dev/preview_act1.ts previews/act1_see_through.png 1280 800 see

What it shows: walls this tall (75 game pixels in the canyon, 50 in the quarry), drawn whole,
cover most of the ground behind them, so the windows show the figures but not the ground round
them (traps, loot, the danger marks of monsters' attacks), against his art rulebook's "The hero
and every warning stay in sight". The planning chat's pick, put to him: keep the near walls cut
away, and use the tent's see-through for tall things that stand in front (trees, pillars, the
crane, dead trees). Sent to him by 19:19 as previews/act1_see_through.png; his answer not in yet.
