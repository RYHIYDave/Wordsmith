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
never ghosts, never witches, never gory; their sound, silk rustling, a mirror's crack. (Their death and their rhythm were
made new on 30 Oct, on his picks: see "Their death: the swoon" and "Their rhythm: the glides, and the flash from range".)

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
  the strike again at half speed; three of them gliding, darting and flashing as the game would play them. (Made before the
  changes of 30 Oct: its dart, its death and its shorter flash are no more. Not made again.)
- `ladies_change.mp4` (30 Oct; 1200 by 676, 37.5 s, captioned): THE TWO CHANGES. A line of four at the game's size (a phone's
  whole view across) gliding at the knight, circling, still facing him, backing away as he walks at them, and one flashing
  him from range; the flash from range from in front and from behind; the glides three times as big, in front and from
  behind, the floor going by; the swoon at the game's size both ways round, three times as big in front and from behind, and
  at half speed.
- `ladies_change_sheet.png` (30 Oct; 1200 by 1350): the four glides both ways round, arrows on the floor for the way each
  goes; the flash's held warning, and the flash from range at the game's size with its reach counted in tiles and the knight
  six tiles off in its light; the swoon in eight moments from in front.

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

`GALLERY_LADY`; `makeLadyArt3()` gives `{ front, back }`; her other moves are her glides, `more.glideBack`,
`more.glideLeft`, `more.glideRight` (30 Oct; the dart is no longer one of them). Frames: the game's thirty a second for every
move but her stand (ten a second) and her death (twenty).

- STANDING (`LD_IDLE`, 24 frames at 10 a second, 2.4 s round): the mirror held up beside her face, gazing into it, turning
  her head to it; she breathes, her weight shifts, her lips move; once round her free hand goes up to the lace at her breast.
- THE GLIDES (her walk and three more, made new on 30 Oct): see "Their rhythm: the glides, and the flash from range".
- THE FLASH, her one attack, now thrown from range (30 Oct): see the same section.
- STRUCK (`LD_REEL`, 0.4 s): knocked back a step, flung back from the waist, the mirror jerked up and out, the Hush
  coughed out.
- HER DEATH (`LD_DIES`, 3.6 s), made new on 30 Oct: a swoon. See "Their death: the swoon".

Her picture (`LADY_CANVAS`) is 340 by 280, its floor point at 66, 140 (it was 256 by 252: grown for her beam thrown from
range, six and a half tiles, and for her lying on the floor); the game cuts each frame to what is in it.

## Their rhythm: the glides, and the flash from range (made new, 30 Oct)

To make Act 2's enemies differ, offered to him as a pop-up: "THE LADIES never dart, they glide in their neat line and keep
their distance, circling to flash at you from range, backing away if you close in". His pick: “Yes, these (Recommended)”.

THE DART IS GONE FROM HER MOVES. Its code is kept in `src/art/gallery_ladies_moves.ts` (`dartPlan`, `dartFeet`, `LD_DART`,
`dartAlong`), out of her move set: `GALLERY_LADY.more` holds only her glides, and nothing plays it.

THE GLIDES (`LD_GLIDES`; each a round of 8 frames at 30 a second, `LD_GLIDE`, painted for its own pace): four, ALL FACING YOU
(the way her picture faces):

| glide | the way she goes | pace (tiles a second) | `ground` |
|---|---|---|---|
| `walk` | forward, at you | 3.2 (the knight walks 2.5) | +3.2 tiles a second |
| `glideLeft` | to her left, circling round you | 2.8 | 0 (carried to her side) |
| `glideRight` | to her right, circling round you | 2.8 | 0 (carried to her side) |
| `glideBack` | back, away from you, still facing you | 2.4 | -2.4 tiles a second |

- NO STEP SHOWS: her steps are tiny and quick, four to a round (fifteen a second), each foot down for two frames and lifted
  for two, all under the hem; the hem skims the floor; the body carried level, leaning a little into the way she goes (back,
  backing away; to the side, circling), the mirror held up before her face. Circling, her feet go wider apart under the hem,
  so that the closing foot never meets the other.
- THE GOWN TRAILS AFTER THE WAY SHE GOES: its hem kept over her feet, its train streaming out on the side that trails: behind
  her going forward, before her (toward you) backing away, to the far side circling.
- Backing away at 2.4, a knight walking at her (2.5) closes on her slowly; one who runs or dashes catches her.

THE FLASH FROM RANGE (`LD_FLASH`, 1.6 s; the blow at 0.9 s, frame 27): turned side-on, the mirror swept up high over her
right shoulder and turned to catch the light, her left hand pointing at you (0 to 0.3 s); HELD HALF A SECOND, the glint on
the glass building to its full (0.3 to 0.8 s, the warning; the spot of reflected light skittering on the floor where the
beam will fall, from 0.3 s, `FLASH_FX.warn` 0.6 s before the blow); her hips come round first (frame 25); THE STRIKE in two
frames (25 to 27), smeared; THE BEAM on the frame it lands: a burst at the glass and a cone of cold light from it to the
floor, a wedge SIX AND A HALF TILES long (`FLASH_FX.reach`), from half a tile before her (`near`, 0.45 tiles), THREE TILES
wide at its end (`FLASH_FX.wide`; its half-width at any distance, `wedgeHalf`), held 0.14 s (4 frames), broken up and gone by
0.44 s after the blow; carried on to 1.0 s; drawn back up to her face by 1.6 s. The light on the floor, `flashPainted`, on
its own picture (`FLASH_CANVAS`, now 286 by 272, its anchor at 18, 136). Silver-white and lavender; never cyan.

For the main chat (the game's, as everything it does with them; these are only what the pictures were made for):

- Play each glide as a walk is played, its frames at 30 a second (`mobSet` already gives `more` loops with a `ground` at the
  walk's frames a second), the picture facing her target, and carry her the way that glide goes, at its pace: forward
  (`walk`) toward you; `glideBack` away from you; `glideLeft` or `glideRight` to whichever side she circles. (Turned over to
  face left, the same pictures go the mirror way: the game picks the glide by the way she goes as her picture has it.)
- Her keeping her distance, if the game wants numbers to start from: keep between about 4.5 and 6 tiles from you, inside the
  flash's 6.5; back away when you come within about 3.5; circle while between; stop and flash when in reach. (Not his
  words, and not decided: the game's.)
- The flash: its wedge from `FLASH_FX.near` to `FLASH_FX.reach`, `wedgeHalf(d)` wide, landing at `LD_FLASH.hit` (0.9 s);
  the warning, the held raise and the glint, half a second and more.

## Their death: the swoon (made new, 30 Oct)

To make Act 2's enemies die differently, offered to him as a pop-up: "THE LADIES a swoon, a hand to the brow, a faint
backwards to the floor, the hand mirror falling and cracking ... the Hush leaving them in a grey breath, alive." His pick:
“Yes, these (Recommended)”. Unlike the footmen's plank and the dancers' spin: soft and slow-sinking, the drama of a faint.

What it is (`diesPlan`, `diesFeet` and `mirrorLooseAt` in `src/art/gallery_ladies_moves.ts`; seconds, and frames at the
game's 20 a second for a death; `LD_DIES`):

- STRUCK (0 to 0.08 s, frames 0 to 2): jolted back, as before.
- SHE SWAYS (to 0.42 s, frame 8): back and to her right, the BACK OF HER LEFT HAND LIFTED TO HER BROW, her elbow out to her
  side, her head tipped back; her right arm out at her side, the mirror hanging loose in her hand; her left foot a step back
  beside her right (0.06 to 0.26 s). HER EYES CLOSE (0.26 to 0.62 s): lashes where the dull pink was.
- THE MIRROR SLIPS FROM HER HAND (0.64 s, frame 13), falls, tumbling over onto its back as it goes, and LANDS AND CRACKS
  (0.95 s, the frame at 1.0 s): flat on its back at her right side, a little before her (7 forward, 31 to her right of her
  floor point: clear of her gown, from in front and from behind), a starred crack across its glass, a glint flaring off it
  (gone by 1.35 s), six tiny shards flung off it in little hops, lying round it; a clatter of a hop.
- SHE SWAYS THE OTHER WAY (0.7 s) and HER KNEES GIVE: a slow theatrical swoon, sinking straight down and back (0.74 to
  1.7 s, frames 15 to 34, never back up), the hand still at her brow, her skirt settling round her and pooling on the floor
  (from 0.95 s), until she sits on the floor in a heap of silver-grey gown (1.7 s, frame 34).
- SHE FAINTS BACK ACROSS THE FLOOR (1.74 to 2.42 s, frames 35 to 48), slow to start, quicker, soft at the end: her left hand
  slipping from her brow and falling back over her head onto the floor, her right arm out at her side on it, her face up and
  turned over to her right, her knees fallen out to either side under the gown, which lies pooled round her (its hem out
  some 17 of her own lengths round her, its folds lying in it, a heap of it over her legs); her lace collar crushed flat on
  the floor round her head.
- THE HUSH LEAVES HER (1.95 to 3.05 s, frames 39 to 61) in a grey breath rising from her as she lies (only a thread of it
  as she is struck, none as she swoons and sinks).
- STILL from 3.1 s (frame 62) to 3.6 s: lying on her back, alive, a woman again; nothing of her stirs. Not a corpse,
  nothing gory.

For the main chat: `dying` as before (`dieTime` 3.6 s); the mirror as it falls and lies is in her own frames (`fall` gives
nothing now). Sound, as the brief: a soft gasp as she sways, silk as she sinks, the mirror's crack as it lands (0.95 s), a
grey breath as the Hush leaves her.

## For the main chat: how to bring it in

- Her art: `makeLadyArt3()`, as the other mobs of the bones (art/new_mobs3.ts `mobSet`).
- Her paces: `LD_GLIDES` (forward 3.2 tiles a second, `GALLERY_LADY.pace`; circling 2.8; backing away 2.4); how to play the
  glides, see "Their rhythm". No dart.
- THE FLASH'S AREA (his “bigger AOE”): a wedge before her from `FLASH_FX.near` to `FLASH_FX.reach` (6.5 tiles), its
  half-width at a distance `wedgeHalf(d)` (3 tiles wide at its end), landing at `LD_FLASH.hit` (0.9 s). The warning is the
  held pose and the glint, half a second and more, and the spot of light on the floor.
- The light on the floor: `flashPainted(t, view)` (t seconds from the blow; less than nothing through her wind-up), laid on
  the floor under every figure at her feet, turned the way she faces (`FLASH_CANVAS` anchor), as the Princess's snare is.
  The light in the air is in her own picture. Their game lights (`Painted.lights`) are silver-lavender, never cyan.
- Her sound, as the brief: silk rustling as they glide, a bright ring of the glass at the flash, a mirror's crack as it
  lands and a gasp as she swoons; no voices (they are Hushed). The game's to make, by sound rule 7.
- Shared tests told of her (the smallest change): the import checks of tests/bosses.test.ts (two lists) and
  tests/hushed.test.ts now pass over `art/gallery_ladies*.ts`, which take the bosses' footwork, the checks' types and the
  Hushed's breath, as floor 16's mobs do.

## The dev page and the film

`src/dev/preview_gallery_ladies.ts` (the floor under them a stand-in: polished dark stone, its tiles drawn so they can be
counted; not the Glass Gallery's own ground):

    node tools/preview.mjs src/dev/preview_gallery_ladies.ts shots/ladies/sheet.png 1200 600 "sheet"
    node tools/preview.mjs src/dev/preview_gallery_ladies.ts shots/ladies/crowd.png 960 540 "crowd"
    ... "big:<move>:<t>", "close:<move>:<t>", "grid:<move>:<t>,<t>,...", "look:<move>:<t>[,<k>]" (both ways round, k times)
    node tools/film_frames.mjs src/dev/preview_gallery_ladies.ts "film" shots/ladies/film
    ffmpeg -framerate 30 -i shots/ladies/film/f%04d.png -c:v libx264 -pix_fmt yuv420p -movflags +faststart ladies_film.mp4
    (the old film, `film`, now without the dart, and with the new death and flash; not made again)

The pictures of 30 Oct:

    PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_gallery_ladies.ts docs/mockups/gallery_ladies/pictures/ladies_change_sheet.png 1200 1350 "changesheet"
    node tools/film_frames.mjs src/dev/preview_gallery_ladies.ts "change" shots/ladies2/film
    ffmpeg -framerate 30 -i shots/ladies2/film/f%04d.png -c:v libx264 -pix_fmt yuv420p -crf 23 -movflags +faststart docs/mockups/gallery_ladies/pictures/ladies_change.mp4

`tools/film_frames.mjs` (new) saves every frame of a page that shows itself frame by frame (as `tools/page_gif.mjs` asks),
without making a GIF of them.

## The checks: tests/gallery_ladies.test.ts (13)

1. The switch is off, and nothing of the game imports them.
2. EVERY MOVE THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts `checkBoss`): stand, her four glides, flash, struck and death,
   every frame, from in front and from behind; every handover (her stand from any frame into each move, her flash and struck
   back into it; each glide from any frame into her stand, into her flash and into each other glide). Feet grip (circling,
   the floor going by to her side is counted: `LD_SHAPE.grips`); nothing in the floor; nothing through her (the mirror too,
   falling and lying); no jerks or jumps; the blow drawn back, held, carried through, hips first; she breathes; HIS
   LIGHTNING STRIKE (two frames, far faster than the wind-up and wind-down, smeared).
3. The strike two frames, landing on the second; it and the frame after it smeared, no other frame of any move; the
   warning held nearly half a second and more.
4. Every frame, both ways round: nothing cyan, the pink edge while she lives and none as she dies, every pixel whole.
5. Nothing cut off, her beam and her lying too (six pixels of room at least); the light on the floor inside its own picture.
6. Nothing of her in the floor: all she wears and carries, the mirror falling and lying.
7. The Hush leaking while she lives; a great breath of it as it leaves her; none once she is still.
8. The dull pink in her eyes while she lives; shut (lashes, no pink) from 0.62 s; SHE ENDS DOWN: the highest of all she
   wears under a fifth of it standing, her hips, chest and head on the floor, her head behind her, her hands on the floor;
   and STILL: every frame from 3.1 s to the end the same, both ways round.
9. The mirror held up beside her face as she stands; in her hand and whole until it slips; whole as it falls, falling;
   flat on its back as it lands, cracked across (a starred crack), its glint and then only its shards; lying clear of her
   from in front and from behind.
10. The flash: the mirror over her head in the warning, the glint building to full; thrust out at the blow, its glass at
    you; its light never cyan (no bright strong hue from 160 to 205) nor pink; on the floor out at once and gone after; the
    beam in her own picture on the blow's frame, and none before it or after her move.
11. His sizes and speeds: NO DART among her moves (`more` is her three glides); her glides 3.2, 2.8, 2.8 and 2.4 tiles a
    second, each painted for its pace; the beam 6.5 tiles long and 3 wide, its light on the floor reaching that far.
12. HER GLIDES, every frame of each: facing you; NO STEP SHOWS (her slippers add not one pixel to her picture, from in front
    or from behind); a foot that is down stays put on the floor as the game carries her her way; her gown's hem trailing
    after the way she goes.
13. HER SWOON: the back of her left hand at her brow (0.42, 0.7 and 1.2 s), still on her feet, her head thrown back; sinking
    from her full height to sitting on the floor over nearly a second, never back up; fainting back, her head from sitting height
    to the floor; her gown pooled round her, its hem out wide and flat on the floor; the Hush leaving her once she is down.

Also kept: every frame of her stand and of struck is painted as before, pixel for pixel (76 frames, both ways round, hashed
before and after, measured from her floor point, the picture having grown).

## His word on the pictures

The sheet, the crowd and the film (`ladies_sheet.png`, `ladies_crowd.png`, `ladies_film.mp4`), asked “Floor 18's
ladies-in-waiting (ladies_sheet.png, ladies_crowd.png and the film): are these right? With them, floor 18 is complete.”:
“Yes, that's them (Recommended)”.

OF THE NEW DEATH AND RHYTHM (b42b49a; his picks for them, 30 Oct, “Yes, these (Recommended)”): shown the sheet and the film (`ladies_change_sheet.png`, `ladies_change.mp4`), asked “The ladies-in-waiting, changed. They never dart now: they glide forward, circle and back away from you, always facing you. Their flash reaches 6.5 tiles and is 3 tiles wide at the end, after half a second with the mirror raised. Their death is a swoon: a hand to the brow, sinking into a heap of gown, fainting back, the mirror cracking on the floor. Is that them?”: “Yes, that's them (Recommended)”.
