# Floor 18, the Glass Gallery: YOUR REFLECTIONS (mock-ups; the art chat's branch `mockup/reflections`)

The art chat's branch, from `mockup/swan-gardens` at 55945b3. Nothing here is in the game until the main chat puts it
there. Nothing of the game imports any of it; its switch, `REFLECTIONS_ON` (src/art/reflections.ts), is off.

## The brief, as he picked it

Floor 18, THE GLASS GALLERY: the queen's wing, long galleries of mirrors; its palette silver, cold blue glass, dark violet;
from the Grimms' "Snow White" (1812). The floor's plan, approved by him: “Enemies: ladies-in-waiting, the queen's guard,
and your own reflections, which step out of the mirrors and fight with your class's moves.” The Queen's move
“Reflections, copies of you stepping out of the mirrors” uses them too.

Asked “YOUR REFLECTIONS: copies of your own class stepping out of the mirrors and fighting with your moves. Is this the
look?”, his pick: “Glassy copy of you (Recommended)”, with the brief as offered:

- WHO: a copy of whichever hero you play, stepping out of a mirror.
- LOOK: your own hero, turned to silvered glass: grey-violet, a sheen across it, fine cracks, the enemy's pink in the eyes
  and the pink rim.
- MOVE: your class's own moves and speed. ATTACKS: your class's own attacks.
- DEATH: it shatters into shards that fall and fade.
- NEVER: never cyan (the friend's colour), so you always know which one is you.
- SOUND: the ring of glass.

## His word on the pictures

The sheet and the film (`reflections_sheet.png`, `reflections_film.mp4`), asked “Floor 18's reflections
(reflections_sheet.png and the film): are these your glass copies?”: “Yes, that's them (Recommended)”. Asked whether
everything that glows cyan on the hero should turn the enemy's pink on a reflection (its blade, the mage's crystal, the
bowstring), or be silver glass: “Pink, like enemies (Recommended)”.

## How it works (src/art/reflections.ts)

A REFLECTION IS MADE FROM THE HERO'S OWN FINISHED FRAMES. Each frame is the hero's, painted by the very function the
game paints its heroes with (`paintMove3`, art/heroes3.ts) at the same moment of the same move, without its cyan edge,
and then turned to glass:

1. SILVERED. Every pixel's lightness is laid on a ramp of nine tones of glass, so every shape keeps its shading and the
   figure still reads as that hero. Two ramps, both in the floor's palette and far from cyan (hues 228 to 263): what was
   cool on the hero (steel, mail, the ranger's greens and teal) goes to SILVER, what was warm (the knight's red tabard,
   the mage's violet robe, leather, skin, hair) to a GREY-VIOLET. The seams between parts stay the style's deep indigo.
2. GLASS IS BRIGHT AT ITS EDGES. Where a part ends (at the figure's edge or a seam) it is a tone or two lighter, the more
   on the upper left, where the light comes from: what makes it read as glass, not grey stone.
3. FINE CRACKS, FIXED TO THE BODY. Five short jagged lines with a branch or two (across the chest, down the belly, across
   the back, low on the back, over the brow), each laid on the skin of the trunk's solids or the head and carried by the
   bones, so they go wherever the body goes; two or three are seen from any side. Each is a line of the glass's white
   with a pixel of dark glass under it; hidden where an arm, a leg or what the hands hold passes in front.
4. A SHEEN. A broad band of light (three tones up) and a thin one behind it (four up) sweep over it on the slant, from
   the upper left down to the lower right, in the first half of each turn of the wind's clock (art/heroes3.ts `windAt`):
   in a move that goes round, a whole number of times in one turn of it, so it never jumps; once in an attack.
5. NOTHING CYAN LEFT. Every friend's glow becomes the enemy's pink, tone for tone (`FRIEND_TO_ENEMY`): the knight's
   blade and its streak, the mage's crystal, its sparks and the light trim of her robe, the belt's gems, the bowstring,
   the arrow's glint, the quiver's thread. The lights a frame gives off the same (`asEnemy`). Its pool of light is the
   enemy's pink one (as art/mkit.ts MENACE). The crackle the game draws from the mage's crystal (`Sprite.charge`) is
   not handed on.
6. THE HUSH'S DULL PINK IN ITS EYES (art/mkit.ts FLAME[1], the Hushed's and the palace guard's): the knight's point of
   light in each slot of his helm, and the ranger's and the mage's dark eyes, found from the same bones as the hero's
   own, where they are seen (a cap or a hat brim may be over them).
7. THE ENEMY'S PINK EDGE (art/mkit.ts ENEMY_RIM), one picture pixel, as strong as the hero's cyan one was.

The silhouette is the hero's own, pixel for pixel: it is his shape. WHAT FLIES FROM IT (the knight's scarf ends, the
ranger's feather, the mage's braids: engine/tails.ts) is glass too: `GLASS_TAILS`, the hero's tails under their own names
with `glass:` before them, any glow on one the enemy's pink.

## Stepping out of a mirror (src/art/reflections_fx.ts `stepOutPainted`, `STEP_OUT`)

1.6 seconds. The glass stirs and rings run out across it; a dark shape forms in it, a pixel at a time, and grows bright as
silvered glass, the Hush's pink kindling in its eyes (0.55 s); at 0.72 s it is thrown out through the glass, front
first (the hero's own stumble forward, played slower), the part still inside tinted the glass's blue and shimmering, a
bright skin of glass where it breaks the surface, carried from a quarter of a tile behind the glass to 0.85 of a tile in
front of it; at 1.08 s the surface bursts in a spray of glass drops and flakes, its pink edge flares, new rings run out
behind it, and it stands on the floor. The mirror's glass is the floor's cold blue. From in front only: a mirror on the
other wall is the game's to show the other way round, as it shows any figure facing left.

The effect paints over the mirror's glass, not its frame: the frame is the floor's piece. The mirror in the pictures
(`mirrorPainted`) is a stand-in (a tall arched silver frame, a crest, scrolled feet); the gallery's own mirror pieces
would be made to the same glass (`GALLERY_MIRROR`: 58 across, 84 to the arch, the arch 22 higher).

## Struck (`chipsPainted`)

The game flashes and knocks it back as it does every enemy; chips of glass fly off it, white, silver and one of pink (his
rulebook, Hits 4: what flies off a hit is the monster's). Its rocked-back pose is the hero's own.

## It shatters (src/art/reflections_fx.ts `shatterPainted`, `SHATTER`)

1.4 seconds, from its own picture as the blow fell (its reel). White cracks race over it from the blow (0.11 s); it bursts
into angular shards (its picture cut along straight lines round scattered points, finer near the blow; each shard what
was painted there, its broken edges lit on the upper left and dark on the lower right) and a spray of glitter, white and
pink. The shards fly out, the nearest the blow fastest, turning by quarter turns (so every pixel stays a pixel) and
flashing as they turn; they fall, bounce once, skid on the polished floor; the pink in them goes out (hot, then dull,
then glass). From 0.48 of the way they fade, each in its own time, a pixel at a time by an ordered dither; at the end
NOTHING IS LEFT. No pool of light, and no edge, once it breaks: a dying enemy's goes out.

## How the game would use it (the main chat's)

- A reflection takes the player's class and its moves: `makeReflectionArt(reflectionEffects).of(cls)` gives the same
  pictures, in the same shape, as `makeHeroArt3().of(cls, ...)` gives the hero in a dungeon (every list as long, every
  clip at the same pace, its blow and its loop at the same moments), each frame its glass copy; and besides,
  `clips.die` (its shattering, the last frame empty: it leaves no body) and, from in front, `clips.moves.stepOut`
  (stepping out of a mirror, its feet where it ends). What it does not have: the hero's fall, and a class card's making
  ready.
- The game's AI drives it as it drives any enemy, with the hero's moves and speed (its run grips the floor at the
  hero's own stride where the hero's does).
- What the game draws for an attack besides the figure (an arrow and its trail, the Wave, the Orb, the Beam, the
  crackle, the warrior's big and wild dust and wind) must take the enemy's colours when a reflection makes it:
  `asEnemy(colour)` turns any of the hero's colours to the reflection's (a friend's glow its pink; anything cyan a pink
  as bright; anything else as it was). render/wild.ts draws some of those in its own cyan (`CRACKLE`): those need the
  same. In the film, its arrows, its Wave and its Beam are stand-ins drawn by the dev page, and its Orb the game's own
  (art/spells.ts) turned pink, to show them so; the Slam's and the rest of the big and wild effects are not drawn.
- Its tails: the game's tails take `GLASS_TAILS` beside the heroes' (engine/tails.ts `new Tails({ ...HERO_TAILS,
  ...GLASS_TAILS })`).
- The step-out is drawn over a mirror whose foot is `STEP_OUT.out` tiles behind where the reflection ends, on the wall
  square to the way it faces; the Queen's “Reflections” can use the same.
- The ring of glass (its sound) is the sound chat's.

## The pictures (docs/mockups/reflections/pictures/)

- `reflections_sheet.png`: each class, the hero beside his reflection, from in front and from behind, three times as big;
  and at the game's size (a picture pixel to a page pixel), each hero among two of his reflections.
- `reflections_film.mp4`: for each class, the hero and his reflection side by side; then the reflection stepping out of a
  mirror (you standing by), standing (the sheen), running, its attacks, struck, shattering, from in front; then running,
  its attacks, struck and shattering from behind. Captioned. 1080 x 1080, 30 a second.
- `reflections_stepout.png`, `reflections_shatter.png`: the stepping out and the shattering, moment by moment.

## The dev page (src/dev/preview_reflections.ts)

`sheet`; `big:<warrior|ranger|mage>:<move>:<t>` (the hero and his reflection at a moment, both ways round, four times as
big); `strip:<cls>:<move>:<front|back>:<n>` (n moments of a move, the hero above, his reflection below);
`step:<cls>:<t>` (stepping out, with the stand-in mirror); `shatter:<cls>:<front|back>:<k>`; `film` (frame by frame,
`window.__frame(k)`, as tools/page_gif.mjs takes them; `film:<k>` draws frame k). The film's frames were taken so and
joined with `ffmpeg -framerate 30 -i f%04d.png -c:v libx264 -pix_fmt yuv420p -movflags +faststart`.

## The checks (tests/reflections.test.ts)

1. The switch is off, and nothing of the game imports them.
2. A reflection has the hero's pictures: every class, both ways round, every list of frames as long as the hero's, every
   clip at the same pace with its blow and its loop at the same moments; and its shattering, and its stepping out from
   in front.
3. Every frame of every class, both ways round (idle, run, every attack and ability, struck, and the rest): NO CYAN AT ALL
   (no pixel, no light it gives off, no pool of light, at a hue from 160 to 205 and a saturation over 0.2), and no
   crackle handed on.
4. ... the pink edge all round it, and every pixel whole or empty but that edge (crisp).
5. ... the hero's shape, pixel for pixel, in the same place.
6. The Hush's dull pink in its eyes from in front (none from behind); the glass's white (its cracks, its sheen) on most
   frames; its glass only the floor's silver and violet.
7. What flies from it is glass: nothing cyan.
8. It shatters: whole as it begins, the shards flying out, nothing cyan, every pixel whole or empty, fading over its last
   half, and NOTHING LEFT at the end (the last frame of `clips.die` empty, no pool of light).
9. It steps out of a mirror: all of it in the glass and no edge before it is thrown out; its pink edge once it is out;
   standing on the floor at the end; nothing cyan in any frame; the stand-in mirror's cold blue and silver, nothing cyan.

Results on this branch, 29 Oct: `tests/reflections.test.ts` 9 of 9 (every frame of the three classes looked at, both ways
round, beside the hero's); the heroes' own checks unchanged and passing (`heroes3` 13 of 13, `heroes` 17 of 17,
`mage_stances` 6 of 6, `ranger_stances` 12 of 12); `tsc --noEmit` clean. No hero file is changed.
