# Floor 20's Shadows of the Four Royals (mock-ups; the art chat's branch `mockup/royal-shadows`)

Made from `origin/mockup/swan-gardens` (the Princess), with `origin/mockup/prince`, `origin/mockup/queen` and
`origin/mockup/king` merged in. The three merges clashed only in the tests' lists of mock-up files that the game must not
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

The boss's warning glints, such as the King's pink-edged blade before the sweep, become bone white like everything else.
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

**The King** (`ROYALS.king`; his boss `KING_ALONE`)
- Stand: bowed, heaving (3.6 s loop). Walk: slow and heavy, dragging his sword (18 frames at 10 a second).
- Basic: the great sword's sweep (`attack`, 2.6 s, the blow at 1.3 s).
- Big: the Crown, leap and slam (`crown`, 2.8 s, the landing at 1.5 s). The game carries him 2.5 tiles during the leap
  (1.02 to 1.45 s; his boss 5). Its ring rolls out 4 tiles (his 10) in 0.8 s (`crownFx`, `SHADOW_CROWN`).

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
- **The floor effects of the basic attacks** (the King's sweep wave, the Queen's poison cloud) are not drawn for the
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

The boss tests' lists of mock-up files that the game must not import now include these two files. The list in `tests/new_mobs3.test.ts` also gains the Queen's and King's files, which their own branches had left out (that test failed on them).

## How to bring it in (the main chat's)

- Bake each shadow's frames like the bosses': `shadowFrame(ROYALS[id], move, t, view)` for `stand`, `walk`, `attack`,
  its big move and `reel`. The Queen's big move is `blinkFrame('into' | 'out', t, view)`. The death is
  `deathFrame(r, t, view)`. Each frame gives its picture and the floor point under the figure.
- Draw the big moves' effects from their blows: `snareFx(t - PR_SNARE.hit)` at the player, `masksFx(t - PC_MASKS.hit)`
  at the Prince, and `crownFx(t - KG_CROWN.hit)` where the King lands. Carry the King 2.5 tiles during `KG_CROWN.air`. For
  the Queen, play `into` where she stands, move her behind the player, then play `out`.
- Walk at `r.pace`. Strike at `r.strikes`. Each move's length is `longOf(r, move)`.
- Then turn `SHADOWS_ON` on.
- The pictures are made by `npx tsx src/dev/preview_royal_shadows.ts sheet <png>` and `film <mp4>` (also `stills
  <dir>`).
- One line of `src/dev/king_scene.ts` (from `mockup/king`) changed from `Array.at` to `slice(-1)[0]`, so that `tsc`
  passes on the game's ES2020 library.
