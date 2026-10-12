# The Ledge Road: three ways to make its edges (mock-up, 12 Oct 2026)

A picture for the owner, from the planning chat (the Chat Board's "plan"). Nothing of the game
imports it. His words, 12 Oct 2026, 18:16: "Can I get a look at what the cliff side might look
like with our current tile size?  Then we can decide if we need to go smaller"; 18:17: "Or can
we fake rounded corners with the painting?"

`src/dev/preview_cliff.ts` paints the same winding ledge (level 7 of the doc "Wordsmith Act 1:
The Descent", the cliff path with open sky) three ways, the knight standing on it for scale:

1. today's tiles, 32 by 16 game pixels, each whole, empty or one of the four halves the game can
   already cut (whichever fits the ledge best);
2. quartered tiles, 16 by 8, the same way;
3. today's tiles of 1, the edge painted over them rounded (a blur of radius 18 picture pixels)
   and bitten in places: the game would still walk by the tiles of 1, and the painted edge strays
   from them by about 3 game pixels at a corner.

The rock (layered, lit on faces toward the lower left), the path, the sky and the haze are rough
mock-up paint to show the shapes, not art for the game.

    node tools/preview.mjs src/dev/preview_cliff.ts previews/cliff_three_ways.png 1280 800

Sent to him by 18:27 as previews/cliff_three_ways.png, with the planning chat's pick, 3. HIS
ANSWER, 18:33: "Yeah I really like the rounded edges". So Act 1's outdoor edges stay on today's
tiles, with the edge painted rounded and ragged over them; quartering the tiles stays in reserve.
Nothing is built: how the edge is painted in the game is the art chat's, and the renderer's part
the main chat's, pictures to him first.
