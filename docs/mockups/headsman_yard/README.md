# Mock-up: THE HEADSMAN'S YARD, OUTDOORS (NOT IN THE GAME until the main chat puts it there)

Branch `mockup/headsman-yard`, from `v23` at 441ee0b. Pictures only: `src/dev/yard_paint.ts` (the painting) and
`src/dev/preview_yard.ts` (the page); nothing of the game imports them.

## His words

- To the main chat, 28 Oct 2026, passed to the art chat on the board (docs/NEXT_VERSION.md, 28 Oct): “And I think I want
  the headman’s yard to be outdoors.  Like you go out to a big open area like a prison yard but there’s the gallows and
  the chopping block where the headsman’s boss area is at.”; read there (told him so) as the Headsman's boss area an open
  prison yard under the sky, walled round, the gallows and the chopping block where he fights; who draws it, “The art chat
  (Recommended)”.
- To the art chat, asked whether to start on it now: “Headsman's yard (Recommended)”.
- Shown the three looks (the whole yard, and one phone screen of each), asked which light: “B, night (Recommended)”
  (offered as: moon and stars, torches and braziers; reads as outdoors and keeps the crypt's dark).

## What is drawn

A yard of cobbles under the open sky, 13 tiles each way, walled round by the prison's high wall (150 picture pixels, a
wall-walk and battlements against the sky), a tower in its far corner; the arch the hero comes out of from the Crypt, its
portcullis drawn up; beyond the wall the prison's cell block (rows of barred windows, chimneys) and its keep (tall
windows, a bell turret); in the yard the scaffold draped in black with the block on it (the floor's own block, its own
basket) and the Headsman on it, and the long gallows against the wall, three nooses over three trapdoors; the floor's own
bell, stocks, gibbet, grindstone, barrel, crate and pail; sawdust at the scaffold's steps, old puddles holding the sky,
weeds and a gutter at the wall's foot; the walls toward the eye cut low, as the game leaves them.

THREE LOOKS, each its own light:
- A, GREY DAWN (the hour of executions): a rose dawn under a slate sky; the stone cool and blue-violet; long shadows
  thrown by the wall, the tower, the scaffold and the gallows.
- B, NIGHT, BY TORCHLIGHT: the moon and stars; torches on the walls and two braziers, their light in two bands.
- C, A STORM: black cloud, lightning far off, rain; the stone dark with wet, the puddles wide; no hard shadows.

The floor's own pieces (art/floor2.ts) are brought into each look's light (their colours, not their shapes); fire stays
an honest orange. Nothing glows cyan but the hero's own, nothing pink but the Headsman's own.

Pictures: `node tools/preview.mjs src/dev/preview_yard.ts shots/yard/<look>.png 1200 840 "overview:<look>"`, and one
phone screen, `... 1014 468 "phone:<look>"`.
