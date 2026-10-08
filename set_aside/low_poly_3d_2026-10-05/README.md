# Set aside: the low-poly 3D look, and the pixel-art light and shadow (5 Oct 2026)

Nothing in this folder is part of the game. It is not built, not tested and not type-checked.
The game is 2D pixel art, and stays so.

## What happened

5 Oct 2026, in the owner's words and in order:

- 12:43 "I'd like the layout as whole to be less uniform. The floors and walls just need more
  variation. And more doodads around like molted tapestries or gargoyle heads or missing broken
  floors tiles. That kind of thing. I know it's a tomb but I'd like it to look more alive if that
  makes sense"
- 12:44 "And everything looks too flat"
- 12:49 "I think steps are a must include"
- 12:53 "And the swipe moves need to be able to traverse the different levels as well. I need to
  be able to jump up and down ledges"
- 13:16 "I think when I said 2D I really meant low-poly 3D for the look"
- 13:17 "I like the sort of cartoonish look, but I think I want the 3D. Maybe you can just give me
  some still renders of what the might look like?"
- (he was sent five still renders, `previews/v15_3d_*.png`, and a page that moves:
  https://claude.ai/artifact/2uvbwYrfh5bHguAkNF6aAz, "Wordsmith 3D Test")
- 14:25 **"No let's keep the 2D. Thats not what I'm looking for. I'll keep thinking about it. You
  can go back to other things"**

So: the low-poly 3D look was not what he was looking for. The look of the game is a question he
is still thinking about. Do not bring 3D back, and do not start another change of look, until he
says what he wants. (He was asked, without pressing, for the name of a game or a screenshot.)

## What is here

Two experiments, both stopped, both unreleased. Version 14.4 never had either.

### 1. Low-poly 3D (`src/gl`, `src/dev`, `tools/build3d.mjs`, `built/`)

A small WebGL2 engine written by hand (no library: the package registry refused the one that was
asked for, and that was not got round), models of the three heroes and all the monsters, a tomb
hall for the stills, and the start of the real game drawn in 3D.

- `src/gl/vec.ts`, `mesh.ts`, `gl.ts`: vectors and matrices, flat-coloured meshes and their
  builders, the painter (flat shading by face, light in cartoon steps, a far light and one fire
  that throw shadows, sixteen small lights, glow, mist, fog of war, tints).
- `src/gl/kit3.ts`, `props3.ts`: stone, floors, walls, steps, and what stands in a tomb.
- `src/gl/figures.ts`, `pose.ts`: the knight (with shield or great sword), the ranger, the mage,
  the skeleton, the archer, the cultist, the bat, the brute, the guardian, the Warden, the fallen
  wordsmith; and how they stand, walk and attack.
- `src/gl/scenes.ts`, `src/dev/look3d.ts`: the still renders that were sent.
- `src/dev/walk3d.ts`, `tools/build3d.mjs`, `built/walk3d*.html`: the page that moves (published
  at the link above; it is still there, and was left alone because he did not ask for it to go).
- `src/gl/level3.ts`, `src/dev/level3d.ts`: a real level of the game (game/dungeon.ts) as 3D
  pieces. This worked: `pictures/level_b.png` is a real dungeon of the game (and `pictures/more.png` the figures made after the stills).
- `src/gl/world.ts`: the game's own world drawn in 3D under the game's canvas, with the pixel
  painter drawing effects and the interface over it. Written, type-checked, NEVER RUN.

### 2. Pixel-art light and shadow (inside `changed/render.ts` and `changed/px.ts`)

An answer to "everything looks too flat" that was begun before he asked for 3D: every fire and
the hero throw a pool of light on the floor, and what stands in a pool cuts a shadow out of it
(`Renderer.floorLight`, `drawPool` in px.ts). It compiled and ran; the shadows were still too
faint to be worth showing when the work stopped. Never tested, never released.

### `changed/`

The four files of the game that the two experiments had touched, as they stood when the work
stopped, each with a `.diff` against Version 14.4:

- `render.ts`: both experiments (the light pools; and `look3d`, which makes the pixel painter
  leave out what the 3D world draws).
- `px.ts`: `drawPool`, and `glowOf` exported.
- `screen.ts`: a canvas that can be seen through (`createScreen(clear)`), for the 3D canvas under it.
- `main.ts`: the 3D world hooked into the frame loop behind a switch.

In the game's own tree these four are back exactly as Version 14.4 has them.

## If it is ever wanted again

Copy `src/gl` to `src/gl`, the three files of `src/dev` to `src/dev` and `tools/build3d.mjs` to
`tools/`, and apply the `.diff` files (they are against Version 14.4: by then the game's files
will have moved on, so read them and make the changes by hand). The axes, the camera that matches
the pixel game's and the sizes are written at the top of `src/gl/scenes.ts`, `level3.ts` and
`world.ts`.

Things learned that are worth keeping whatever the look turns out to be:

- The workspace's headless browser draws WebGL2 (in software): stills are fine, real time runs at
  2 to 3 frames a second there, so speed on a phone cannot be measured here.
- A 3D camera 30 degrees down from the corner, without perspective, lands every floor point
  exactly where the pixel game's projection puts it (half the screen's height = its height in game
  pixels / 45.25 tiles). A tile of height is 19.6 game pixels.
- A wall can stand as high as 8(a + b) - 16 game pixels (straight behind) without hiding floor
  that lies `a` tiles back along x and `b` along y: which is where the pixel game's "low walls"
  rule comes from.
