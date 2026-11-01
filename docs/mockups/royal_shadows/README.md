# Floor 20's Shadows of the Four Royals (mock-ups; the art chat's branch `mockup/royal-shadows`)

Made from `origin/mockup/swan-gardens` (the Princess), with `origin/mockup/prince`, `origin/mockup/queen` and
`origin/mockup/king` merged in (the King's branch again on 31 Oct, at 7eb52c3, for his Crown's Weight and his charge). The three merges clashed only in the tests' lists of mock-up files that the game must not
import; each list now holds both sides' entries. Nothing here is in the game until the main chat puts it there, on his yes.
Nothing of the game imports any of it, and its switch, `SHADOWS_ON` (`src/art/royal_shadows.ts`), is off.

His floor: THE QUIET TOWER, the Moth's lair. Its palette is grey fog and bone white, with no colour.

## His brief

Offered to him as a pop-up. His pick: “Each with one boss move (Recommended)”, with the brief as offered:

> SHADOWS OF THE FOUR ROYALS (floor 20, medium). Who: grey fog echoes of the four royals you beat: the Princess, the
> Prince, the Queen, the King. Look: each royal's own shape, smaller (knight's size to a head taller), made of grey fog and
> bone white, no colour, the dull pink eyes. Move: each as its royal moved (the Prince quick and dancing, the King slow and
> heavy). Attacks (two): its royal's basic attack, and one of that royal's big moves, smaller. Death: it blows apart like
> smoke, leaving that royal's playing card for a moment. Never: not their full boss fights again; not gory. Sound: an
> echo of each royal's sound.

## The pictures (`pictures/`)

- `royal_shadows_sheet.png`: the four shadows standing, from in front (top row) and from behind (middle row), beside the
  knight and three times as big. Below them are their four cards, four times as big.
- `royal_shadows_film.mp4` (49 s): each shadow in turn standing, moving, its basic attack, its big move, struck, and its
  death. Each part shows the shadow from in front (left) and from behind (right), with the knight for size, captioned.
  (Made 29 Oct: its King's basic is the old sweep and its big move the old leap. His new ones are in the four below.)
- `king_shadow_crown_sheet.png` (31 Oct): the King's shadow's Crown's Weight in nine key frames, twice as big, the knight
  under it: gathered, sent up, following, held (the warning), the drop, slammed; from behind following, held, flying home.
- `king_shadow_crown.mp4` (12.3 s, 1200 wide): the same from in front (left) and from behind (right) at the arena's
  scale, the knight stepping aside and back as the crown follows him; then at half speed, the sending up, and the hold,
  the slam and the flight home. Captioned.
- `king_shadow_charge_sheet.png` (31 Oct): the King's shadow's charge in five key frames, twice as big, the knight beside
  it: the warning; from behind, the strike; the run, cutting the line; from behind, stopped, the held beat; its sparks
  popping in shrapnel.
- `king_shadow_charge.mp4` (7.7 s, 1200 wide): the same, in front (above) and from behind (below), at the arena's scale,
  the knight stepping out of its way and then out of reach of its sparks; then at half speed, the strike and the run, and
  the sparks. Captioned.

## How a shadow is made (`src/art/royal_shadows.ts`)

Every shadow is made from its boss's own moves. Each frame is painted by the boss's own painter (`paintMob`), on the
boss's bones, motions and timings. Then:

1. **Fog.** Every colour handed to the painter (its ramps, skins, cloth and specks) is moved onto an eleven-tone ramp,
   fog-black to bone white (`FOG`), by its lightness. Anything the painter makes by itself (a smear, a seam) gets the same
   treatment afterwards. Every shape keeps its shading, so each shadow still reads as its royal. Pale things come out
   bone white: the King's beard, the blades, the Queen's comb.
2. **The Hush's dull pink in the eyes** (`FLAME[1]`, lit `FLAME[2]`) is the only colour. The King's own eyes are pale, and
   the pink belongs to the Hush on his back. His shadow is the Hush's echo of him, so it has the pink. His shadow is drawn
   from the King alone (`KING_ALONE`), without the Hush on his back.
3. **Smaller.** Each finished frame is drawn at a fraction `k` of the boss's size. Each pixel takes the middle tone of the
   boss's pixels under it, so seams and edges stay crisp. A smaller set of bones would not work cleanly: the painters use
   fixed lengths (the King's sword, the Queen's comb, the Prince's rapier), and those would not shrink with the bones.
4. **Fog on the figure.** Lighter patches drift slowly upward through it, and thin wisps rise off its head and shoulders.
5. **The edges:** the style's dark seam round the figure, and the enemy's pink edge (`ENEMY_RIM`) outside it.

The boss's warning glints, such as the King's pink-edged blade in his warning, become bone white like everything else.
Only the eyes and the edge stay pink.

| | k | stands (top of head; the knight is 57) | moving pace (tiles a second) |
|---|---|---|---|
| Princess | 0.8 | 59 | 3.2 (hers 4.0) |
| Prince | 0.76 | 62 | 3.42 (his 4.5) |
| Queen | 0.72 | 64 | 1.44 (hers 2.0) |
| King | 0.64 | 68, a head taller than the knight | 0.64 (his 1.0) |

Each pace is the boss's pace times `k`, so the feet still grip the floor at the smaller size.

## Each shadow's moves

Every move uses its boss's timings in seconds. Strikes take two frames, landing on the second, and are smeared as the
boss's are.

**The Princess** (`ROYALS.princess`; her boss `PRINCESS`)
- Stand: she hovers (2.8 s loop). Walk: she glides (12 frames at 20 a second).
- Basic: the nettle vine lash (`attack`, 1.6 s, the blow at 0.8 s). The vine is the boss's, drawn at 0.8, so it reaches
  6 tiles where hers reaches 7.5.
- Big: the vine snare (`snare`, 1.6 s, the blow at 0.83 s), as a small cage. The vines burst up round you 2.75 tiles across
  (hers 5) and hold 1.4 s (hers 6) before sinking, gone by 2.0 s (`snareFx`, `SHADOW_SNARE`).

**The Prince** (`ROYALS.prince`; his boss `PRINCE`)
- Stand: he dances in place (24 frames at 10 a second). Walk: his dance-step (12 frames at 30 a second), quick.
- Basic: the rapier thrust (`attack`, 2.0 s, the blow at 0.87 s, with his lunge).
- Big: Masks (`masks`, 1.85 s, the blow at 0.87 s). Three smiling masks fly in a fan (his five; these are the middle
  three), 6 tiles (his 12) at his 15 tiles a second, so 0.4 s, and each bursts into fog (0.3 s) (`masksFx`,
  `SHADOW_MASKS`).

**The Queen** (`ROYALS.queen`; her boss `QUEEN`)
- Stand: 28 frames at 10 a second. Walk: she glides (16 frames at 12 a second).
- Basic: the comb (`attack`, 1.5 s, the blow at 0.8 s, her lunge).
- Big: Looking Glass, done as a short blink through her own hand mirror, with no wall mirrors (`blinkFrame`, `BLINK`).
  - Into the mirror (1.0 s): she lifts her left hand (her Reflections' lift, without its ring of glass), and a hand mirror
    gathers in it (0.15 to 0.3 s). Its glass flashes (0.35 to 0.6 s), which is the warning. In two frames (0.6 to 0.667 s)
    she folds into it, her smear behind her. The mirror then hangs, shrinks and puffs away (to 1.0 s).
  - Out of it (0.9 s), wherever the game puts her (behind you, as her boss's Looking Glass does): the mirror gathers in the
    air (to 0.25 s) with her pink eyes in its glass (from 0.12 s), which is the warning. In two frames (0.3 to 0.367 s)
    she unfolds out of it, and that is the strike. The mirror fades from her hand by 0.9 s.

**The King** (`ROYALS.king`; his boss `KING_ALONE`, his moves as they are now; checked as he is, `KG_ALONE_SHAPE`)
- Stand: bowed, heaving (3.6 s loop). Walk: slow and heavy, dragging his sword (18 frames at 10 a second).
- Basic: THE CHARGE, its blade dragged (`attack`, the King's own move, 2.7 s; `sparksFx`, `SHADOW_CHARGE`,
  `chargeCarriedTiles`), in place of the old sweep, which is kept in the code, out of its set (`KG_SWEEP_MOVE` in
  `king_moves.ts`).
  - Times, the King's own (seconds into the move): 0 to 0.3 it drops low, hauling the sword back along the stones; THE
    WARNING held 0.3 to 0.7 (crouched, the sword dragged far back, its point grinding the stones); THE STRIKE 0.767 to
    0.833, two frames (`hit` 0.833), bursting off its mark, smeared (streaks of it left behind); THE RUN 0.8 to 1.55; it
    stops at 1.55 and looks back along the line; the rip, the blade wrenched up, 2.0 to 2.15; its stand at 2.7.
  - The run: THE GAME CARRIES IT along its forward at 7.68 tiles a second (his 12 times 0.64, so that its feet, drawn at
    0.64, grip the floor as his do), 5.76 tiles in all (his 9).
  - THE LINE OF SPARKS (`sparksFx(t, view, lane)`, `t` from 0.8 s, laid where it set off, under the figures): a groove
    cut 1.12 tiles behind its floor point (his 1.75), bone white where the point is, cooling to the dull pink. Its moment
    is 0.6 s after it stops (the move's 2.15 s). For the 0.35 s before it, the line goes bone white and its sparks bead
    on it, trembling. At its moment every spark SHOOTS OFF the line, one for every 0.21 tiles of it (27 on the whole
    line, as his), streaked. Each pops 0.28 to 0.4 s after, up to 0.96 tiles up (his 1.5) and 1.02 tiles off the line
    (his 1.6), in a star of bone white and pink. Its shrapnel flies out 0.64 tiles round the pop (his 1.0) for 0.25 s,
    cooling from bone white to the dull pink. Then smoke and the scar, all gone 1.0 s after its moment.
  - THE HIT, for the game: everything within 1.66 tiles of the line (his 2.6; round its ends too), 0.28 to 0.65 s after
    its moment (the move's 2.43 to 2.8 s).
  - Scaled to 0.64 of his: every length (the run, the line's tail, its sparks' spacing, height and spread, the shrapnel,
    the reach) and the carry's speed. Kept: every time (the warning, the two-frame strike, the run, the held beat, the
    pops). Its colours are fog, bone white and the dull pink (`EYE`, lit `EYE_LIT`), with no gold and nothing cyan. The
    sparks off its point as it runs, and the grit it kicks up, are drawn with the figure, in fog.
- Big: THE CROWN'S WEIGHT (`weight`, the King's own move, 5.6 s), in place of the Crown's leap and slam, which is kept
  in the code, out of its set (`crownFx`, `SHADOW_CROWN`; the King's `KG_RETIRED.leap`). The shadow crown is the King's
  crown (`crownAt`), painted as fog at his size and drawn at the shadow's, as the shadow is: no gold, its dark seam and
  the enemy's pink edge, fog wisping off it (`weightFx(t, view, 'crown' | 'floor')`, `shadowCrownAt`, `SHADOW_WEIGHT`;
  `t` from its sending).
  - Times, the King's own (seconds into the move): 0 to 0.45 its hand swept low, bowing; 0.45 to 0.9 held, the crown
    trembling up off its head; 0.9 to 1.1 its hand flung up. At 1.1 (`send`, frame 33) THE CROWN GOES UP and is off its
    picture until 5.2; the shadow stands steering it, its hand up, its face up, its feet where they are.
  - Flying out, 1.1 to 1.55 s: up and out from its head, growing to 5.2 times its size (3.3 times the King's crown on
    his head), the game moving the floor point under it from the shadow to over you.
  - Following, to 3.5 s: its band's middle 84 up (24 clear of the knight's head; his 100, 38 clear), turning, bobbing;
    THE GAME MOVES IT AFTER YOU at 3.2 tiles a second (his pace). Under it its shadow and THE WARNING, a ring of the
    shadows' dull pink 1.09 tiles round (his 1.7), its dashes going round.
  - Held, 3.5 to 4.033 s (16 frames): it stops, rises 9 more (his 14), trembles; the ring solid and lit, a second ring
    closing in on it.
  - THE SLAM, 4.033 to 4.1 s: it drops in two frames, streaked, as the shadow yanks its fist down (smeared); it lands at
    4.1 s: a flash over the ring, the stones cracked, a ring rolling out to 1.66 tiles (his 2.6), dust.
  - Lying, 4.1 to 4.5 s, rocking, rings of sound off it. Home, 4.5 to 5.2 s: it rises and flies back in an arc,
    shrinking, onto the shadow's head. 5.2 to 5.6 s, its hand lowered, its stand.
  - Its sizes are the shadow's, 0.64 of the King's (as the shadow is drawn); its times and its pace are his.

**All four:**
- Struck: the boss's own flinch (`reel`: Princess 0.4 s, Prince 0.5 s, Queen 0.4 s, King 0.4 s).
- Death (`deathFrame`, `DEATH`, 2.4 s): struck (to 0.12 s), then the figure blows apart like smoke (0.12 to 1.25 s). Each
  speck rises, spreads and curls in its own time, paling and thinning, the outside first. The royal's playing card turns
  to face you at the shadow's chest (0.3 to 0.45 s), hangs there rising a little, and fades away pixel by pixel (1.7 to
  2.4 s). Nothing is left behind.

## The four cards (`cardPx`, `CARD` 27 by 41, `MARKS`, `SWAN`)

These are original playing-card faces in bone white and fog. Each has a fog border, the family's swan crest small in two
corners, a fine line across its middle, and the royal's own mark twice, head to foot as on a court card:

- **Princess:** her crown of nettles on its circlet.
- **Prince:** the smiling mask.
- **Queen:** her crown of glass spikes, the middle one tallest.
- **King:** his crown of fleurons.

The royal swan (`royalSwan`, the guard's and the King's crest) is too fine to hold at the card's size, so the corners carry
a small swan of its own with raised wings and a curved neck.

## Not made here

- **Sound** ("an echo of each royal's sound"): for the sound work, each royal's own sounds played quieter and lower, with a
  long echo.
- **The floor effects of the basic attacks** (the Queen's poison cloud; the King's charge's line of sparks is drawn) are not drawn for the
  shadows: only the blow is. If wanted, they can be done the way the big moves are: the boss's painter, as fog, smaller.

## Tests (`tests/royal_shadows.test.ts`)

1. The switch is off, and nothing of the game imports these files.
2. Every move the shadows play (stand, walk, the basic attack, the big move, struck; for the Queen, her Reflections' lift
   and her stand) passes every boss check, using each boss's own shape setup (`PR_SHAPE`, `PC_SHAPE`, `QN_SHAPE`,
   `KG_ALONE_SHAPE`). The checks cover every frame, from in front and from behind, and every handover.
3. The strikes take one or two frames.
4. There is no colour on them but the pinks (the eyes and the enemy's edge), and nothing is cut off. This covers every
   move, the death, the blink, the three big moves' effects, and the cards, from in front and from behind.
5. Their size runs from the knight's height to a head over it, with the King the tallest. Each has the pink eyes from in
   front, and each card is its own.
6. The King's shadow: its basic is the King's charge (his motion and strike), with the old sweep and the leap not in its set; the Crown's
   Weight has the King's times, its drop in two frames, his pace; the crown goes from the shadow's head and comes home to
   it; the crown and the pink ring are 0.64 of the King's; following, it hangs clear over the knight's head; landed, it
   lies on the floor; nothing of it before it is sent or after it is home. (Test 4 covers the crown and its floor through
   the whole flight and the slam's frames: no colour but the pinks, nothing cut off. Test 2 runs its `weight` and its charge
   through every boss check, carried as the game carries it.)
7. The King's shadow's charge: the King's times and its two-frame strike; carried at 0.64 of his pace, 0.64 of his run
   (5.76 tiles in the 0.75 s); its line of sparks 0.64 of his, end to end and in its sparks' spread; the dull pink in it;
   nothing before it sets off or after it is gone. (Test 4 covers every other frame of the charge and the line through
   its whole life, a short line too: no colour but the pinks, nothing cut off.)

The boss tests' lists of mock-up files that the game must not import now include these two files. The list in `tests/new_mobs3.test.ts` also gains the Queen's and King's files, which their own branches had left out (that test failed on them).

## How to bring it in (the main chat's)

- Bake each shadow's frames like the bosses': `shadowFrame(ROYALS[id], move, t, view)` for `stand`, `walk`, `attack`,
  its big move and `reel`. The Queen's big move is `blinkFrame('into' | 'out', t, view)`. The death is
  `deathFrame(r, t, view)`. Each frame gives its picture and the floor point under the figure.
- Draw the big moves' effects from their blows: `snareFx(t - PR_SNARE.hit)` at the player, `masksFx(t - PC_MASKS.hit)`
  at the Prince. For the Queen, play `into` where she stands, move her behind the player, then play `out`.
- The King's shadow's charge: from `KG_CHARGE.run[0]` (0.8 s) to `run[1]` (1.55 s) carry it along its forward at
  `SHADOW_CHARGE.pace` (7.68 tiles a second; `chargeCarriedTiles(t)`), 5.76 tiles. If a wall stops it, stop it and go on
  from 1.55 s, as for the King. From 0.8 s lay `sparksFx(t - 0.8, view, lane)` where it set off, under the figures
  (`lane`: how far it ran). The hit: everything within `SHADOW_CHARGE.reach` (1.66 tiles) of the line, 2.43 to 2.8 s into
  the move; the line lies on until 3.15 s.
- The King's shadow's Crown's Weight: from `KG_WEIGHT.send` (1.1 s) lay `weightFx(t - KG_WEIGHT.send, view, 'floor')`
  under the figures and `weightFx(..., 'crown')` over them, at the crown's floor point: moved from the shadow to over the
  player by `shadowCrownAt(...).lerp` as it flies out, after the player at `SHADOW_WEIGHT.pace` (3.2 tiles a second)
  until 3.5 s, still from then; lay the floor where it fell once it has landed (4.1 s); bring the floor point home by
  `lerp` from 4.5 to 5.2 s. The hit: everything within `SHADOW_WEIGHT.r` (1.09 tiles) of where it lands, at 4.1 s. The
  shadow stands where it is for the whole move (5.6 s).
- Walk at `r.pace`. Strike at `r.strikes`. Each move's length is `longOf(r, move)`.
- Then turn `SHADOWS_ON` on.
- The pictures are made by `npx tsx src/dev/preview_royal_shadows.ts sheet <png>` and `film <mp4>` (also `stills
  <dir>`).
- `npx tsx src/dev/preview_royal_shadows.ts crownsheet <png>` and `crownfilm <mp4>` make the King's shadow's Crown's
  Weight pictures.
  `chargesheet <png>` and `chargefilm <mp4>` make its charge's.
- One line of `src/dev/king_scene.ts` (from `mockup/king`) changed from `Array.at` to `slice(-1)[0]`, so that `tsc`
  passes on the game's ES2020 library; `mockup/king` has since made the same change, and its line is the one kept.
- `src/art/king_moves.ts` (the King's) gains `KG_SWEEP_MOVE`, his old sweep as a move his painter still knows by its
  old name ('The sweep': its strike, its 64-step smear, its pink glints, the stone it kicks up, as before). It is not one
  of his moves, and since the shadow took the charge it is out of the shadow's set too; it is kept in the code. These are small additions in `byName`, `bonesOf`, `smearedAt`, `smearOf` and
  `moreOf`, and his own moves are unchanged (his tests pass).
- With the King's 31 Oct branch merged in, the King's shadow is drawn from the King as he is now. Its crown on its head
  is his as redrawn there, a few pixels different in each frame of its stand, walk, struck and death. The other three shadows are unchanged pixel for pixel (every frame of every move,
  death, effect and card, 30 a second, before and after).

## His word on the pictures

The sheet and the film (`royal_shadows_sheet.png`, `royal_shadows_film.mp4`), asked “The royal shadows
(royal_shadows_sheet.png and the film): are these right? With them, every character of floors 17 to 20 is drawn.”: “Yes,
that's them (Recommended)”.

THE KING'S SHADOW, 31 Oct: told that on floor 20 the King's shadow still does his old crown leap, which he had just replaced (the King now charges with his blade dragged and sends up the Crown's Weight), and asked whether to give it one of his new moves: “The Crown's Weight” (offered as: a shadow crown follows you and slams). Drawn: `king_shadow_crown_sheet.png` and `king_shadow_crown.mp4`. Its basic is still the King's old sweep: whether it should be his charge is for him to say.

OF THE KING'S SHADOW'S CROWN'S WEIGHT (ea24adb; `king_shadow_crown.mp4`, `king_shadow_crown_sheet.png`), asked “The King's shadow now sends up a grey shadow crown, about two-thirds the size of his, that follows you with a pink ring and slams. Is that it?”: “Yes, that's it (Recommended)”. Told its basic attack is still the King's old sweep, and asked whether it should charge with its blade dragged as the King now does: “Yes, the charge (Recommended)” (offered as: a smaller shadow of his charge and its line of sparks). Drawn: `king_shadow_charge_sheet.png` and `king_shadow_charge.mp4`.

OF THE KING'S SHADOW'S CHARGE (f7bec47; `king_shadow_charge.mp4`, `king_shadow_charge_sheet.png`), asked “The King's shadow's charge: it crouches with its blade dragged, bursts off and runs about 6 tiles cutting a line. The line glows white, then its sparks shoot off and pop within about 1.7 tiles. Everything is in the shadows' grey and dull pink. Is that it?”: “Yes, that's it (Recommended)”.
