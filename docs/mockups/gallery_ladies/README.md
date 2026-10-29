# Floor 18, the Glass Gallery: the ladies-in-waiting, a small mob (mock-up; branch `mockup/gallery-ladies`)

From `origin/mockup/swan-gardens` at 55945b3 (floor 16, finished and approved: its gardeners, guard, swans and Princess are
the models this follows). Nothing here is in the game until the main chat puts it there, on his yes. Nothing of the game
imports any of it; its switch, `LADIES_ON` (src/art/gallery_ladies.ts), is off.

## The brief

The floor, as he approved its plan: THE GLASS GALLERY, the queen's wing, long galleries of mirrors and a great glasshouse on
the roof; its palette silver, cold blue glass, dark violet; her mirror from the Grimms' "Snow White" (1812), only from the
book; “Enemies: ladies-in-waiting, the queen's guard, and your own reflections”; its story, “the queen gave the Hush every
voice in her court in return for her mirror's.”

His pick for how they move, offered to him as a pop-up: “Gliding in a line, quick (Recommended)”.

The rest is the brief as offered (not his words): the queen's ladies in silver-grey gowns with high lace collars, hair
pinned up, each holding a hand mirror; Hushed, grey breath; the knight's size, in crowds, fun to smash; they glide in a neat
line, then dart at you; known by the hand mirrors held up to their faces; one attack, a flash from the hand mirror, a short
bright beam of cold light (silver, never cyan); dying, the mirror cracks, the Hush leaves them, they sink to the floor;
never ghosts, never witches, never gory; their sound, silk rustling, a mirror's crack.

His standing rules built in from the first pass: Movement 9 (24 Oct, “Like the wind up and wind down are big but the actual
punch is lightning quick”), for the enemies from 28 Oct (“Start from now on, but every enemy is going to need that change
eventually.  And bigger AOE to compensate for the extra time the player gets to evade”); and speed (28 Oct, “Everything is
always so plodding when you first animate them.”), so every speed and size below is set in tiles from the start.

## The pictures (docs/mockups/gallery_ladies/pictures/)

- `ladies_sheet.png`: a lady from in front and from behind, beside the knight, three times the game's size.
- `ladies_crowd.png`: at the game's size, a phone's whole view of the game (480 by 270 game pixels): a neat line of five
  gliding at the knight, three at their mirrors, one throwing her light at him.
- `ladies_flash_front.png`, `ladies_flash_back.png`: her flash at four moments, twice the game's size, the knight in its
  way: the warning held (the glint, the spot of light on the floor), the strike smeared, the beam thrown, the beam breaking up.
- `ladies_film.mp4`: every move, from in front and from behind, at the scale of a boss arena with the knight in it, captioned;
  the strike again at half speed; three of them gliding, darting and flashing as the game would play them.

## Her look (src/art/gallery_ladies.ts)

Grown women of the court on the heroes' bones (`LADY_BODY`, 55 tall; with the hair up, the knight's height, 58), the
Hushed's own: powdered and drained grey, the cult's dull pink in the eyes, lips moving on no sound, grey breath leaking out
(art/hushed.ts `hushBreath`, as the gardeners). Unlike floor 16's Princess (no violet gown, no loose hair, no nettles, she
walks) and unlike the masque's dancers (no masks, no ribbons).

- THE GOWN, the queen's livery: silver-grey satin with a cold blue cast (`GOWN`, the floor's “cold blue glass”); a fitted
  bodice with a long pointed stomacher of dark violet laced with silver and edged with pearls; sleeves puffed and paned at
  the shoulder (the violet showing through), close to the wrist, falling lace at the cuffs; a full bell skirt over a
  farthingale, two silver guards above the hem and a lace hem, open down the front on a forepart of dark violet piped with
  silver, a row of pearls down it.
- THE HIGH LACE COLLAR: a pleated fan of white lace standing up behind her head from the shoulders, eleven pleats on their
  wires, each to a point at its top, a row of open-work under its edge; from behind, a fan with her coiled hair over it.
- HER HAIR drawn up off the face into a coil at the crown, pinned with silver and pearl, a ringlet left at each temple.
- THE HAND MIRROR (`MIRROR`, `mirrorOf`): an oval of cold grey-blue glass (`GLASS`, hue about 225: never cyan) in a beaded
  silver frame on a short handle; its back blued silver engraved with a scroll round a bright boss. Held up beside her face
  in her right hand, its glass turned to her, her head turned to gaze into it.
- NOTHING GLOWS but her mirror's own light (the glint, the flash: silver-white and lavender); the enemy's pink rim while she
  lives; the dull pink eyes.

## Her moves (src/art/gallery_ladies_moves.ts; the light, src/art/gallery_ladies_fx.ts)

`GALLERY_LADY`; `makeLadyArt3()` gives `{ front, back }`; her other move is `more.dart`. Frames: the game's thirty a second
for every move but her stand (ten a second) and her death (twenty).

- STANDING (`LD_IDLE`, 24 frames at 10 a second, 2.4 s round): the mirror held up beside her face, gazing into it, turning
  her head to it; she breathes, her weight shifts, her lips move; once round her free hand goes up to the lace at her breast.
- THE GLIDE (her walk; `LD_PACE` 3.2 tiles a second, the knight walks 2.5; `LD_GLIDE` 8 frames at 30 a second, two steps
  a round): quick small steps under the hem, the body carried level and leaning into the going, the skirt swept back and
  swinging, the mirror held up. A neat line is the game's to lay; the film shows four.
- THE DART (`LD_DART`, 0.8 s): a dip (0 to 0.1 s), then a burst at you, two and a half tiles (`reach`, 98 of her own
  lengths), nine tenths of it from 0.1 to 0.44 s (about 9 tiles a second at its fastest), in four running steps, low and
  leaning, her free hand gathering her skirt and the skirt streaming back; she checks, rocked back, the skirt swinging on
  past her, and settles by 0.66 s. It is painted going on through her own picture: the game holds her place through it and
  sets her down `LD_DART.reach` on at its end (`dartAlong(t)` says how far on she is at any moment, if the game would rather
  carry her). It hands straight over into her flash.
- THE FLASH, her one attack (`LD_FLASH`, 1.4 s; the blow at 0.7 s, frame 21): turned side-on, the mirror swept up high
  over her right shoulder and turned to the light above, her left hand pointing at you (0 to 0.3 s); HELD, the glint on the
  glass building to its full (0.3 to 0.6 s, the warning; on the floor before her a spot of reflected light skitters where
  the beam will fall); her hips come round first (frame 19); THE STRIKE in two frames (19 to 21), smeared with the glass's
  after-images: the mirror whipped round and down at you at arm's length, its glass full on you; THE BEAM on the frame it
  lands: a burst at the glass and a cone of cold light from it to the floor, lighting a wedge FOUR AND A HALF TILES long
  (`FLASH_FX.reach`), from half a tile before her, TWO AND A HALF TILES wide at its end (`FLASH_FX.wide`), held 0.14 s,
  broken up into glitter and gone by 0.44 s after the blow; carried on to 0.8 s; then drawn back up to her face by 1.4 s.
- STRUCK (`LD_REEL`, 0.4 s): knocked back a step, flung back from the waist, the mirror jerked up and out, the Hush
  coughed out.
- THE MIRROR CRACKS, THE HUSH LEAVES HER (`LD_DIES`, 2.6 s): struck, she brings the mirror before her eyes and it cracks
  across (0.18 to 0.42 s, a spray of glitter off it); a gasp, her head thrown back, the Hush pouring up out of her in one
  great grey breath (from 0.32 s); the mirror falls from her hand (0.56 s) and lies face up on the floor at her right,
  cracked; her knees give (to 1.05 s) and she sinks into the pool of her skirts, sits back on her heels (1.55 s) and bows
  over, her left hand on the floor (2.3 s): still, the pink gone from her eyes, alive, a woman again.

Her picture (`LADY_CANVAS`) is 256 by 252, for her dart and her beam; the game cuts each frame to what is in it.

## For the main chat: how to bring it in

- Her art: `makeLadyArt3()`, as the other mobs of the bones (art/new_mobs3.ts `mobSet`).
- Her pace: `GALLERY_LADY.pace` (3.2 tiles a second). The dart: play `more.dart`, then set her down `LD_DART.reach` on (or
  carry her by `dartAlong`); then her flash, if she is in reach.
- THE FLASH'S AREA (his “bigger AOE”): a wedge before her from `FLASH_FX.near` to `FLASH_FX.reach` (4.5 tiles), its
  half-width at a distance `wedgeHalf(d)` (2.5 tiles wide at its end), landing at `LD_FLASH.hit`. The warning is the held
  pose and the glint, 0.3 s and more, and the spot of light on the floor.
- The light on the floor: `flashPainted(t, view)` (t seconds from the blow; less than nothing through her wind-up), laid on
  the floor under every figure at her feet, turned the way she faces (`FLASH_CANVAS` anchor), as the Princess's snare is.
  The light in the air is in her own picture. Their game lights (`Painted.lights`) are silver-lavender, never cyan.
- Her sound, as the brief: silk rustling as they glide, a bright ring of the glass at the flash, a mirror's crack and a
  gasp as she dies; no voices (they are Hushed). The game's to make, by sound rule 7.
- Shared tests told of her (the smallest change): the import checks of tests/bosses.test.ts (two lists) and
  tests/hushed.test.ts now pass over `art/gallery_ladies*.ts`, which take the bosses' footwork, the checks' types and the
  Hushed's breath, as floor 16's mobs do.

## The dev page and the film

`src/dev/preview_gallery_ladies.ts` (the floor under them a stand-in: polished dark stone, its tiles drawn so they can be
counted; not the Glass Gallery's own ground):

    node tools/preview.mjs src/dev/preview_gallery_ladies.ts shots/ladies/sheet.png 1200 600 "sheet"
    node tools/preview.mjs src/dev/preview_gallery_ladies.ts shots/ladies/crowd.png 960 540 "crowd"
    ... "big:<move>:<t>", "close:<move>:<t>", "grid:<move>:<t>,<t>,..."
    node tools/film_frames.mjs src/dev/preview_gallery_ladies.ts "film" shots/ladies/film
    ffmpeg -framerate 30 -i shots/ladies/film/f%04d.png -c:v libx264 -pix_fmt yuv420p -movflags +faststart ladies_film.mp4

`tools/film_frames.mjs` (new) saves every frame of a page that shows itself frame by frame (as `tools/page_gif.mjs` asks),
without making a GIF of them.

## The checks: tests/gallery_ladies.test.ts (11)

1. The switch is off, and nothing of the game imports them.
2. EVERY MOVE THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts `checkBoss`): stand, glide, flash, struck, death and the
   dart, every frame, from in front and from behind; every handover (her stand from any frame into each move and back, the
   glide from each frame into her stand and into the dart, the dart into her stand and into her flash where it set her
   down). Feet grip; nothing in the floor; nothing through her; no jerks or jumps; the blow drawn back, held, carried
   through, hips first; she breathes; HIS LIGHTNING STRIKE (two frames, far faster than the wind-up and wind-down, smeared).
3. The strike two frames, landing on the second; it and the frame after it smeared, no other frame of any move.
4. Every frame, both ways round: nothing cyan, the pink edge while she lives and none as she dies, every pixel whole.
5. Nothing cut off, her dart and her beam too; the light on the floor inside its own picture.
6. Nothing of her in the floor: all she wears and carries.
7. The Hush leaking while she lives; a great breath of it as it leaves her; none once she is still.
8. The dull pink in her eyes while she lives, gone once down; sunk low (under four fifths of her standing height, from in
   front and behind), on her knees, her head up, a hand on the floor: alive, not lying dead.
9. The mirror held up beside her face, its glass turned to her; cracked across before it falls; once fallen, clear of her.
10. The flash: the mirror over her head in the warning, the glint building to full; thrust out at the blow, its glass at
    you; its light never cyan (no bright strong hue from 160 to 205) nor pink; on the floor out at once and gone after; the
    beam in her own picture on the blow's frame, and none before it or after her move.
11. His sizes and speeds: the glide 3.2 tiles a second; the dart 2.5 tiles, nine tenths of it in under half a second; the
    beam 4.5 tiles long and 2.5 wide, its light on the floor reaching that far.

## His word on the pictures

The sheet, the crowd and the film (`ladies_sheet.png`, `ladies_crowd.png`, `ladies_film.mp4`), asked “Floor 18's
ladies-in-waiting (ladies_sheet.png, ladies_crowd.png and the film): are these right? With them, floor 18 is complete.”:
“Yes, that's them (Recommended)”.
