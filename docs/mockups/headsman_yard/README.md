# THE HEADSMAN'S YARD, OUTDOORS, AT NIGHT (NOT IN THE GAME until the main chat puts it there)

Branch `mockup/headsman-yard`, from `v23` at 441ee0b. The three looks he chose from: `src/dev/yard_paint.ts` and
`src/dev/preview_yard.ts`. HIS PICK MADE GAME-READY: `src/art/yard.ts`, behind `YARD` (off), checked by
`tests/yard.test.ts`, shown built the game's way by `src/dev/preview_yard_game.ts`. Nothing of the game imports any of it.

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

## Made game-ready (his “Make it game-ready (Recommended)”)

Shown it built from these pieces beside the picture he picked (and one phone screen), asked whether to hand it to the main
chat to put in the game, behind a switch that stays off until he has seen it in play: “Yes, hand it over (Recommended)”.

`src/art/yard.ts`, `makeYardArt()`, every picture in the game's measures (picture pixels, two to a game pixel):

- `floor(tx, ty)`: the cobbles, laid on the world so the stones run on across tiles (sixteen pictures, repeating every
  four tiles). Anchored as the game's floor tiles are, at the tile's top corner.
- `tiles`: floor tiles to lay over the cobbles: three puddles, sawdust, beaten earth, the gutter at a wall's foot (along x,
  along y).
- `faceLeft` / `faceRight`: THE PRISON WALL a tile at a time (four of each), as the game's walls are laid: along x its face
  turned to screen-left and lit, along y turned to screen-right in shade; 150 picture pixels high (the Crypt's are 80),
  standing whole (no fade at the top), the wall-walk on top and a merlon of the battlements on the far edge of each tile.
  Anchored at the floor point of the tile's top corner, the face hanging to the floor.
- `arch`: the arch out of the Crypt, two tiles of the wall along x in place of two of its tiles (the first the farther),
  the passage dark, the portcullis drawn up.
- `tower`: the tower in the yard's far corner, three tiles each way, 250 high, battlemented; anchored at the floor point of
  its footprint's near corner.
- `beyond`: what is seen over the wall: the night sky (the moon, stars, clouds in bands), the keep and the cell block, the
  hills; one backdrop, 1600 x 700, anchored at the floor point of the yard's far corner, drawn first.
- `pieces`: two wide puddles (lying on the floor), THE SCAFFOLD draped in black with the floor's own block and basket on it
  (footprint 3.4 x 3.2 tiles and its steps), THE LONG GALLOWS (3.8 x 1.6 and its steps), THE YARD'S TORCH (on the wall, set
  92 up it; four frames each way; its light). `YARD_FOOTPRINTS` gives the two big ones' footprints. The floor's own
  pieces serve too: its braziers ('brazier of irons'), bell, stocks, gibbet, grindstone, barrel, crate, pail.

NOT PAINTED IN: the dark and the light. As everywhere in the game, the renderer's darkness with a hole where each light
burns (render.ts, light): the torches' and the braziers'. Under the open sky the yard's dark is the moon's: in
`preview_yard_game.ts` it is laid at 0.42 (rgba(6, 4, 14, 0.42)) with the hero's pool, the braziers' and the torches',
and that is near the picture he picked; the main chat's to set.

FOR THE MAIN CHAT, what the game would need to put it in (not done here): floor 2's boss room laid as the yard (walled
round, the arch from the Crypt's way in, the tower in its far corner); these walls and the backdrop drawn there in place of
the Crypt's; its moonlit dark; the scaffold and the gallows as big obstacles.

Checked (tests/yard.test.ts, 9 of 9): off, and nothing of the game imports it; every picture painted; crisp, a floor tile
covering its whole diamond, no pixel alone; nothing cyan, nothing pink; the floor and the wall darker than the darkest
word; light from the upper left (the wall turned to screen-left lighter than the one turned right; the scaffold and the
gallows lit on their left); the torch's fire as bright in shade as in the light, its light given, set high on the wall;
every picture anchored where the game lays it.
