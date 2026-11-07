# The Drowned Eye redone: the Swamp Colossus (stage 1: his look and the new arena; stage 2: his moves, part 1)

A MOCK-UP: NOT IN THE GAME. The art chat's, branch `art/eye-redo`. His new look is `src/art/eye_colossus.ts`, behind
`EYE2 = { on: false }`; nothing of the game imports it (`tests/eye_colossus.test.ts` holds it). Nothing of the old Eye
(`src/art/drowned_eye.ts`, `art/act1_figs/eye.ts`, `game/act1_rules/eye.ts`) is used in it. Stage 1 (below the moves) was his look,
in stills; stage 2 is his first moves: his stand, his lurk under the water and his entrance, in `src/art/eye_moves.ts`.

## Stage 2: his moves, part 1 (his stand, his lurk under the water, his entrance), in pictures and a film

His words and picks, 7 Nov 2026 (after the stills of stage 1):

- Shown him from his sketch (fe166263) and asked whether to make him taller like the sketch: “Yes, build on this”. So his look stays
  as at fe166263.
- His entrance (the start of phase 2), offered three, his pick: “Rises shut, then splits”. It was offered as: “The jaws rise slowly,
  pressed together like a melting mound, then tear apart down the middle with the roar and the tongue-eye unfurls.”
- Then: “Nice job that’s awesome”.
- Earlier: “And the eye waves around like its own tentacle”; “have him like constantly melting and dripping”; “Spittle and goo all
  over the place”; his entrance today “is not epic”.
- 14:01, the entrance beat by beat: “And we want the screen to rumble and water pour off as it rises in the phase transition.  It
  opens with a big roar, more screen shake, the eye stalk comes out, let the moment breathe for a second, tentacles come up, phase 2.”

The pictures: `pictures/eye_moves1.png` (key frames of each move at the game's size and at twice) and `pictures/eye_moves1.mp4`
(51.0 s, 30 a second: his lurk looped twice; his entrance at full speed, then at half speed; his stand looped three times; all as the player
sees them in the arena, the stone, the Warrior at his spot breathing, the leaned camera, the rumble and the shakes moving the whole
screen as the game's would; then his entrance once more close up, twice the size). Captioned beat by beat.

### His stand (`EYE_STAND`)

A loop of 3 s (90 frames at 30 a second) that begins and ends on the same picture (the test paints the start and the end of the loop
and finds them the same). He is never still:

- HIS FLESH ALWAYS MELTING: three sheets of his flesh, one after another, each welling up over the tops of his jaws, sliding down him
  (from 158 of his lengths over the water to 26, a loop's time: 44 of his lengths a second, about 22 game pixels a second), its drips
  running longer the further it has slid, laid over the sheets under it, and melting into the heaps of him at the water as the next
  comes down: he never runs out. The drips off his overhangs run longer and their bulbs swell until they let go (each on its own round
  of 1, 1.5 or 3 s): the gob falls (gravity 420 of his lengths a second a second) and splashes in the water or splats on the heaps,
  the drip springing back short. Little drips on every lower edge of him run longer and drop their beads; strings of drool hang off his
  lips, teeth, throat and tongue, a bead sliding down each.
- HIS SPITTLE STRETCHING AND SNAPPING across his maw: 9 strands (8 strung between his jaws, 1 held by his tongue to his teeth), each
  on a round of 1.5 s: strung sagging, stretched thinner as his jaws breathe open, necking at the middle and SNAPPING, the halves whipping back
  and hanging off each jaw, dripping, running shorter until they are gone; then knitting across again. Strung only where his tongue
  never weaves through them (checked through his whole loop). Two ropes of drool off the low front of each jaw sway into the water.
- HIS JAWS BREATHING: one slow breath a loop, the V opening and shutting 5 per cent (each jaw swinging about 2 degrees on the line
  under the water where its face meets the other's).
- HIS THROAT'S GLOW PULSING with his breath (0.69 to 1.31 of as drawn), a quicker flicker in it; its light breathing with it.
- HIS TONGUE-EYE ALWAYS WEAVING LIKE A TENTACLE: a wave running up his tongue from its root to the eye, little at the root, most at the
  eye (48 of his lengths at the eye: the eye sways 75 of his lengths across and 29 up and down through his loop); the eye turning to
  keep looking toward the camera and the Warrior (never less than 88 per cent of the way at him).
- His three tentacles sway at their roots (their tips 14 of his lengths), roots unchanged: their own figures; their own moves are for
  later. Their burst up at his entrance (below) is theirs.

### His lurk (`EYE_LURK`, phase 1)

A loop of 3 s (90 frames). The dark shape of him deep under the black water (as the phase 1 still: 215 down, 330 further out), heaving
slowly (6 of his lengths); his eye's fire on his tongue reared before him, drifting (the tongue weaving at 0.8 of his stand's) and
pulsing up through the black water (its fire and its light 0.48 to 1.08 of their brightness, twice a loop); bubbles rising and breaking
over him (clear domes catching the light, popping in rings of droplets); a slow swell rolling over the water (thin broken lines of light
along its crests); slicks of his goo rising and spreading, dull and oily, the light along their far edges and in streaks across them.
The two phase 1 tentacles are their own figures, with their own moves later; they are not in the lurk's film (at the end of phase 1 they
are dead).

### His entrance (`EYE_ENTRANCE`), his pick, as he set it beat by beat

270 frames: 9.0 s (the main chat planned about 4 s; it is longer, as his 14:01 word asks for more beats). Frames from the first frame after
his lurk's last; it ends on the frame before his stand's first (the test holds both). Times from its start.

| Beat | Frames | Seconds | What |
|---|---|---|---|
| 1. The rise | 0 to 29 | 0.00 to 0.97 | His eye's fire sinks back into him (his tongue drawn down into his throat, its lids shutting, its glow dying), his jaws shut under the water (painted in ten steps, deep and dim); the water stirs (the swell heaving, bubbles), then boils (foam churning over him). He gathers himself, sinking 14 of his lengths. |
| 1. He rises shut | 30 to 107 | 1.00 to 3.57 | HE RISES SHUT, his jaws upright and pressed together down his seam (their faces 7 of his lengths apart each side of it, never through each other; his teeth meshed in it), a huge melting mound, slowly: 229 of his lengths up and 318 in toward the stone, never faster than 7.9 of his lengths a frame, slow at the start and the end. His top breaks the water at frame 38 (1.27 s). WATER POURS OFF HIM: runs of it sliding down him faster than he rises, a dark wet film, streams falling off his overhangs into the water, foam where they land, each part of him streaming for about two seconds after it comes out; swells rolling off him; the boil dying away. |
| 2. The strain (wind-up) | 108 to 128 | 3.60 to 4.27 | HELD: his seam splitting slowly (13 per cent open by its end), strings of his flesh and spittle across it stretching, his throat's glow showing through it (rising to 1.7 of as drawn). |
| 2. THE ROAR (strike) | 129 to 132 | 4.30 to 4.40 | HE OPENS WITH A BIG ROAR: his jaws TEAR APART down the middle in four frames (36, 68, 95, 111 per cent open), the 8 strings across his seam (4 of his raw flesh, 4 of spittle) snapping one after another (the spittle first, the flesh last), his teeth unmeshing; his throat FLARES (2.7 of as drawn, a burst of gold light); spray and goo BLASTED out of his maw (280 drops and gobs, arcing down into the water, splashing); the water SLAMMED FLAT in a ring (a wave racing out from him at 330 of his lengths a second, the water flat and black behind it, streaked with foam). MORE SCREEN SHAKE. |
| 2. Settling (wind-down) | 133 to 155 | 4.43 to 5.17 | His jaws flung on past open (115 per cent) and settling, wobbling, onto his breath; the snapped strings hanging and dripping away; ropes of drool running down out of him to the water; his throat's glow dying back to his stand's; the spray falling, the ring spreading. |
| 3. The eye stalk | 156 to 191 | 5.20 to 6.37 | His tongue unfurls out of his throat (its eye squeezed small and up on its edge as it comes up between his jaws where they are narrowest, swelling to its size and lying down on its side as it clears them), curls over to one side, rears up taller than it stands (its eye 258 of his lengths up) and comes down into his stand's weave; all the while its shut lids turned to face you, a slit of its fire glimmering between them; its EYE SNAPS OPEN at frames 186 to 188 (shut, 30, 72, 100 per cent), turning to stare at the Warrior. |
| 4. The moment breathes | 192 to 221 | 6.40 to 7.37 | A second with nothing new: he looms, melting and dripping, breathing, his tongue-eye weaving, staring at the Warrior; his spittle knitting across his maw again; the water settling. |
| 5. The tentacles come up | 222 to 269 | 7.40 to 8.97 | His three tentacles, their own move (`armBurst`, for the start of each phase): each coiled deep under the water rising, THE WATER BULGING over it (10 frames, held: a dome of water heaving up, rings running off it, foam breaking on it, its dark shape under it); BURSTING up in two frames (smeared, its last frame behind it), tall and straight, its tip hooked, a crown of water thrown up round it and falling back; curling over into its place with a bounce (20 frames); then swaying as he stands. Left at frame 232, right at 237, middle at 242 (the bursts' first frames). |
| 6. Phase 2 | 270 | 9.00 | His stand, from its first frame. |

#### For the main chat and the sound chat: the screen (`EYE_SCREEN`)

- THE RUMBLE: from frame 18 (0.60 s) to frame 128 (4.27 s): the screen thrown by up to 2 game pixels (whole pixels, as the game's camera
  moves), weak at first, strongest through the strain; its sound from frame 18.
- THE ROAR'S SHAKE: from frame 129 (4.30 s), the first frame of the tear, up to 5 game pixels, dying away by frame 162 (5.40 s).
- A JOLT as each tentacle bursts: 2 game pixels for 6 frames, from frames 232, 237 and 242.
- THE DARK: from frame 4 the fen's dusk drops toward night (darkest, 32 per cent darker, from frame 36 (1.20 s)); his eye's fire and his throat's
  glow never darken; it lifts as he roars, from frame 129 to frame 143 (4.77 s).
- THE ROAR'S SOUND starts at frame 129 (4.30 s), the first frame of the tear.
- Nothing hurts the hero in the entrance; the main chat's 2.5 s pause between phases is now 9.0 s.
- THE CAMERA in the film: leaned toward him as the stills have it, but 6 game pixels less (his middle at the water 131 game pixels down
  the 234 of the screen, not 125), so that his eye at the top of its weave stays on the screen (at the stills' lean it would rise 5 game
  pixels off its top); the Warrior's feet then 232 down. The main chat's to set in the game.

### What he costs (`pictures/eye_moves1` as painted here)

- FRAMES: his stand 90 (a loop), his lurk 90 (a loop), his entrance 270: 450 frames at 30 a second. Painted in layers, each its own
  picture: 970 in all (his jaws and throat 149: his stand's 90, his entrance's own 59, the rest of his entrance his stand's own frames;
  his spittle 223; his tongue and eye 238; each tentacle 120). His lurk is one painting of his body moved as he heaves, and his tongue's.
- MEMORY, baked as painted here (two picture pixels to a game pixel, 4 bytes a pixel, each layer in the box round it): a frame of his
  stand, all of him, 1.9 MB (his jaws 1.0, his spittle 0.2, his tongue 0.2, his tentacles 0.5): 56 MB for each second of him at 30 a
  second, 169 MB for his stand's loop. All three moves, every layer once: 272 MB (85 MB packed, as kept here). At one picture pixel to
  a game pixel, a quarter of that: 14 MB a second, 68 MB in all. The water's effects are drawn by the game over him, not baked.
- Painting, here without a browser: 30 to 45 s a frame of his jaws, 5 s of his tongue, 3 s a tentacle, 1 s his spittle; all of it in
  about an hour on two workers. Not to be painted while the game runs: baked (his word of 6 Nov: the game may carry files).

### How the moves are made, and how to make the pictures again

- `src/art/eye_moves.ts` says every frame (`eyeFrame(move, k)`): each layer of him (his jaws and throat, his spittle, his tongue and eye,
  each tentacle) as a pose for `src/art/eye_colossus.ts`, where he is, what the screen and the water do. Behind `EYE2` (off); nothing of
  the game imports it (`tests/eye_moves.test.ts`).
- `src/art/eye_colossus.ts` paints a frame of a move (`ColossusPose.anim`): his jaws swinging on the line under the water (open,
  breathing, shut and turned square to each other), the heaps of him at the water staying where they lie, what slides and drips off him
  running straight down; his sheets sliding, his drips and gobs, his spittle, his tongue and its eye (its lids, how it is turned, how
  big). Without `anim` he is the still exactly as at fe166263 (checked pixel for pixel).
- `tools/eye_moves_pics.ts` paints each layer once (kept on the machine's memory disk, `/dev/shm`, packed: the disk was full), then lays each frame together in the arena with
  the water, the effects, the shakes and the lights; `tools/eye_moves_sheet.py` makes the sheet and the film:

```
npx tsx tools/eye_moves_pics.ts paint 0 2 & npx tsx tools/eye_moves_pics.ts paint 1 2     (the layers, on two workers; about an hour)
npx tsx tools/eye_moves_pics.ts frames /dev/shm/eye_moves/frames lurk
npx tsx tools/eye_moves_pics.ts frames /dev/shm/eye_moves/frames entrance
npx tsx tools/eye_moves_pics.ts frames /dev/shm/eye_moves/frames stand
python3 tools/eye_moves_sheet.py sheet /dev/shm/eye_moves/frames docs/mockups/eye_redo/pictures/eye_moves1.png
python3 tools/eye_moves_sheet.py film /dev/shm/eye_moves/frames docs/mockups/eye_redo/pictures/eye_moves1.mp4
```

### The checks (`tests/eye_moves.test.ts`)

art/boss_checks.ts `checkBoss` is for a boss with bones; he has none (he is painted as one solid), so its checks are asked of what he is:
(1) the switch off, nothing of the game importing his moves; (2) his stand closing on itself, painted the same at the end of its loop as
at its start, his lurk too; (3) his entrance beginning where his lurk is and ending on the frame before his stand's first, its beats in
his order, the strain held before the tear and the tear far faster than it, the tentacles' wind-up held and their burst two frames
(BLOW, STRIKE); (4) nothing cyan, the pink edge round him over the water; (5) NOTHING THROUGH ANYTHING (THROUGH, FLOOR): his tongue and
eye clear of his jaws and teeth and his spittle clear of his tongue in every third frame of his stand and every frame of his tongue's
unfurling (but where his tongue holds a strand, and down his gullet), his jaws clear of each other shut and tearing, his tentacles clear
of him and of the stone standing and bursting; (6) never still (ALIVE): his flesh sliding, gobs letting go and splashing, his spittle
snapping and knitting, his jaws breathing, his throat pulsing, his eye waving like a tentacle and always looking at the hero; (7) no leaps
(JERK, JUMP), frame to frame in his loops and where one move hands over to the next; (8) the screen: the rumble through his rise, the
roar's shake bigger, the dark lifting as he roars, all gone by his stand. `tests/eye_colossus.test.ts`'s first check now lets his own
moves file import him (the smallest change).

### For the owner to decide (the art chat's to put to him)

1. HIS SHUT MOUND. Pressed together, his two jaws stand upright side by side, so that shut he reads as two great rounded lobes of
   melting flesh with his seam down the middle, his fangs meshed in it (see the rise and the strain in the film). It is his look as
   drawn, only shut. If it reads wrong to him (too round, too like two lobes), the fix is his shut shape: taller and more pointed, the
   tips of his jaws meeting in one peak like a closed claw. Not changed without his word.
2. His entrance is 9.0 s with every beat of his 14:01 word (the main chat planned about 4 s). Shorter is easy: the rise (2.6 s) and the
   moment that breathes (1 s) are where it would come from.
3. THE DARK while he rises (the fen's dusk dropping toward night, lifting as he roars) is from the art chat's brief, not in his 14:01
   words: shown in the film; his to keep or drop.
4. Shut, his teeth are meshed into his other jaw's gum along his seam (they bite in, hidden in it); as he tears open they pull out of
   it. Said here because it is the one place anything of him is inside anything else; nothing else of him is.
5. His tentacles sway at their roots as he stands, and burst up at his entrance (their own move, `armBurst`); their attacks and their
   phase 1 moves are for later. In his lurk the phase 1 tentacles are left out (they are dead by his entrance).
6. The spray and goo of his roar, the splashes, the water pouring off him, the swell, the bubbles and the slicks are drawn here as the
   game would draw them over him (the pictures' tool), not baked into him: the main chat would bring them in as effects.

## His words, 7 Nov 2026

- 00:07: “if you get time, i think the whole sunken eye fight needs to be redone.  hes just not scary or intimidating.  the arena doesnt really work, and his entrance is not epic.”
- 00:08: “maybe instead of a circle its a big rectangle and hes in the water in front of you.”
- 00:08: “well, like up on the screen above you”
- 00:10: “start with just tentacles coming up, kill both of them, then he emerges with three.  kill the three with extra attacks from the main body, final phase he uses the magic, maybe keep three tentacles.  kill the tentacles and his body.  flasks reset in between each phase for now”
- 00:11: “but lets get new art for the whole thing”
- 00:13: “just scrap his look and start fresh.  big ancient gross eldritch horror swamp monster with tentacles and a big eye.”
- Asked which take to draw first, his pick: “Swamp colossus (Recommended)”, offered as: “A rotting hill of moss-grown flesh filling the top of the screen; one huge bloodshot eye under a heavy brow; a split maw of teeth below; slime, weed and old bones on it; thick slimy tentacles.”
- His answer on b0b6fef2, asked whether to build the fight on this look and arena: “His mouth is bad and he needs to slide back a little so the tentacles don’t clip through him or the stage”.
- His answer on 7910b3e9, asked the same: “He’s a little too rectangular.  Less floating island and more eldritch horror.  And there’s a line on the tentacle that kinda cuts it in the middle.”
- Shown 3e7b6844: “Eh.  Still not quite it.  Let’s keep the tentacles, they’re still split up into sections.  But let’s scrap the body.  I want the eye as the end of the tongue and the whole head to split open down the center for the maw.  Spittle and goo all over the place.  And have him like constantly melting and dripping”
- 11:17: “And the eye waves around like its own tentacle”
- Shown the splitting head (bfb16ba3): “That’s pretty good, I like the direction, but I have a drawing of what I was kinda thinking”. Then he sent his drawing: `docs/ref/eye_drawing_from_owner_2026-11-07.jpg`.
- 12:45: “Not EXACTLY like that but that’s kinda what I meant about the maw splitting and the tongue eye”

## His drawing, as it was read (as he was told)

1. His body rises out of the water already split wide open in a deep V, its point down at the waterline: a vast maw opened from
   the water up. The two halves tall and pointed, like great jaws pried apart, each leaning out to a peak (the left a little lower
   and further out, the right taller and sharper). Jagged teeth down both inner edges of the V, crooked and hooked. Inside, a dark
   wet throat glowing faintly pink-gold low down, spittle strung across. The outer flanks rotting, melting flesh, drips running down
   into the water.
2. His tongue rises out of the bottom of the V and twists up in a long S, thick at the root and tapering, smooth wet flesh,
   towering over the jaws.
3. His eye on the tongue's tip, the highest of all: an almond or lens-shaped eye lying on its side (wider than tall), a tall black
   slit pupil, raw lids, the iris the enemy's pink burning to gold. It waves around like its own tentacle.
4. His tentacles curl outward from the water on both sides of him, clear of his body and of the stone.
5. The two small dots high in his drawing: nothing to draw.
6. He is drawn open, as his drawing shows him, the way he stands when risen. Whether the V closes is a question for later (below).

And, after his 12:45 word, his drawing is THE IDEA, not a shape to trace: the split from the water up in a V maw with teeth down both
inner edges; the tongue twisting up out of it, towering; the eye on its tip, the highest of all, waving like a tentacle; tentacles
curling out on both sides. The exact outline, the number of tentacles and the proportions were the art chat's to make look best.
His drawing stands beside the new still at the top of `eye_look.png`, captioned as the idea he sketched.

Kept as they were: the arena (17 by 11, the water), his place in the water (his middle 7.9 tiles out), the tentacles' roots and
their poses, the pillar spots, the melting and goo, the smooth unsectioned tentacles, the enemy's pink and gold, nothing cyan.

## The pictures (`pictures/`)

- `eye_look.png`: at the top, his drawing beside the new still, the same height; him at the game's size with the Warrior on the
  stone before him twice (from behind and from in front) for scale; twice the size (his maw, his tongue and eye); the eye on the
  tongue at three times; his jaws' teeth close (three times); under the water (phase 1); from behind (half size).
- `eye_arena.png`: the arena as the player sees it, a phone held sideways (the game's own 507 x 234 game pixels, two picture pixels
  to each), the camera leaned toward him. Phase 1: the black water across the top, his eye's fire under it, two tentacles up out of
  it. Phase 2: him risen, split open, his eye high on the screen, inside it; three tentacles. Each again at twice the size, in two
  halves. Then, small: today's fight from the game itself, and the new one beside it. Then the camera as the game sets it when the
  hero stands in the middle of the stone (no lean). Last, a plan of the arena from above.

Everything round him is the game's own: the fen's paving and black water from the fen's terrain painter (`art/fen.ts`,
`art/terrain.ts`), the fen's pieces (`art/floor10.ts`), and the Warrior as the game paints him (`art/heroes3.ts`).

## What he is now

THE V. He rises out of the black water already split wide open: two great jaws pried apart, the line their inner faces meet along
just under the water, so that the V's point is at the waterline (43 of his lengths across there at its front, a little over a
tile) and it gapes wide at the top (his peaks 281 of his lengths apart, 7.2 tiles). Each face leans out from upright, his left 44
degrees, his right 39, and is turned a little toward you.

HIS JAWS. Each rises out of the narrow trunk he stands in the water on, leaning out and tapering to a point on the edge of the V:
his left the lower (its peak 128 of his lengths over the water) and further out, heavier and sagging; his right the taller (146)
and sharper. Thinner front to back than across, slabs of a jaw rather than domes. Rotting grey-green flesh, wrinkled and lumpy,
veined, boils and sores, barnacles at the water; heaps of flesh that have run off him slumped round him at the water; a jowl of
melting flesh sagging off each outer flank over the water; tumours bulging out of them.

THE TEETH. Down both inner edges of the V from the water up to each peak, rows of crooked hooked fangs (46 in all): a front row,
the bigger, some long, some broken, and a row behind it, set in raw wet gum, each hooked back toward his throat, smaller toward the
peaks. None goes through his tongue (the nearest 10.6 of his lengths clear of it, risen or under the water).

THE INSIDE OF HIS MAW. Behind each face the jaw is hollow, wet and ribbed, inside a lumpy rim of raw gum; across the back of the V a
wall of wet ribbed throat, its top sagging between the jaws below their peaks, its foot sloping forward to the water as the floor
of his mouth; his gullet a hole in it, low down, glowing pink burning to gold, the throat round it faintly pink low down. Spittle
strung across the V at every height and slant, sagging each its own way, some snapped and hanging; drool in ropes off his jaws'
low front edges into the water. From behind, the back of his throat between his jaws is rounded hide.

HIS TONGUE. Out of his gullet at the bottom of the V and up in a long S, thick at the root (27 of his lengths) and tapering (17)
to where it swells round his eye; one smooth tube, slick, a groove down its back, rough with papillae; towering over his jaws.

HIS EYE, on the tongue's tip, the highest of all of him: lying on its side, 116 of his lengths across and 48 tall (67 game pixels
across: more than twice the knight's height), in a bulb of the tongue's flesh drawn to a point at each corner like a lens, its raw
lids parted round it in an almond with pointed corners; yellowed and bloodshot, redder toward its corners; the iris a round of the
enemy's pink burning to gold round a tall black slit; looking at you; its fire's glow on what is near it.

MELTING AND DRIPPING. Two sheets of his flesh slid down each jaw like melting wax, the upper the thicker, each sheet's edge running
down in drips of every length (122 round him, the longest 91 of his lengths), necked where they leave the sheet, swelling to fat
ends; they run straight down, as wax does, however his jaws lean. Thin runs of goo between; drips hanging off his overhangs (25), a
gob let go and falling, a splash on the water where each lands and where each rope of drool meets it (13); little drips with fat
beads off every lower edge in the picture; goo sheeting down him, bubbles in it.

HIS TENTACLES. As they were: where they rise, their lie, one continuous smooth taper each, the suckers in two rows along the
underside all the way. Left one hooking over outward like a question mark, right one curling out and over, the middle one low
and coiled aside.

An enemy: the pink edge round him; pink and gold his only glow; nothing cyan.

## How he will move (for the next stage)

- His melting never stops: the sheets sliding down, the drips running each down its own path, swelling until they let go; gobs
  falling and splashing, the rings spreading; new flesh welling up as the old runs off; drool always dripping off his teeth and
  tongue.
- His tongue never still: always weaving, swaying and curling like a tentacle, the eye on its tip turning to keep watching the
  hero; it rears back before it strikes.
- His jaws: breathing, the V working a little wider and narrower, spittle stretching and snapping across it.

## A question for later: does the V close?

His drawing shows him open, and he is drawn open. It could close and open: the jaws swinging back to upright on the line under the
water until their faces meet, the teeth meshing down the seam, the tongue drawn down into his throat and the eye hidden; then
gaping again, spittle stretching between the jaws and snapping, the tongue rearing out with the eye on it (a shut state while he
rises, say, or a guard he takes). Not drawn; his to say.

## For the main chat

- The stone: 17 tiles across the screen by 11 deep, its far long edge open on the water. As before.
- His distance out: his middle at the water 7.9 tiles out from the stone's edge (310 of his lengths). As before.
- The tentacles' roots: as before (in the water 1.4 tiles out from the stone's edge; phase 1 at a third and two thirds along it;
  phases 2 and 3 left, middle and right), and their poses as before. Risen, each is clear of all of him (his jaws, his throat, his
  tongue, his eye, his drool, his drips and gobs) by at least 37.8 of his lengths, and 10.6 clear of the stone; under the water
  228.5 clear of him.
- The three pillars of phase 3: where they were (on the plan).
- His size: him alone (his jaws, his tongue and eye) 351 game pixels across and 164 top to bottom at the game's size; his eye's top
  117 over his middle at the water.
- The camera in phase 2 (the pictures' lean, to set as the main chat likes): his middle at the water 125 game pixels down the
  234-pixel screen, so that his eye's top is 8 down from the top of the screen and its middle 26 down; his peaks 40 and 50 down;
  the hero's feet 226 down, a tile onto the stone. The camera leans 97 game pixels toward him (before: 70). With the hero further
  back on the stone, his eye leaves the top of the screen unless the lean follows.
- His tongue and eye are an enemy's weapon of their own when the moves are drawn (the eye can be struck, or can strike): risen,
  the eye is 1.2 tiles before his middle and 5.7 tiles over the water.
- The slam's area (a tentacle's slam toward the hero): as before, yours to say.

## His numbers

- The phone's screen: 507 x 234 game pixels (`engine/screen.ts`; the game's own playtest logs it on a phone held sideways). That is
  15.8 tiles across and 14.6 tiles top to bottom (a tile 32 x 16 game pixels).
- Him alone at the game's size: 351 game pixels across, 164 top to bottom, his eye's top 117 over his middle at the water: the knight
  stands 29.
- The V: his left face leans out 44 degrees, his right 39; 43 of his lengths across at the water at its front; his peaks 281 apart,
  at (-145, -22, 128) and (136, -22, 146) (across, toward you, up).
- His eye: 116 x 48 of his lengths, 67 game pixels across; its middle at (-6, 46, 224).
- Under the water (phase 1): he lies 215 of his lengths down and 330 further back than risen; his peaks 69 under the surface; his
  tongue reared forward in the water before him, the eye on it 95 down, its fire seen in the water before the stone between his two
  arms.

## Why the fight today is not scary (the audit)

1. His size: about 127 x 61 game pixels on a 507 x 234 screen, his eye about 32 across: about the hero's own height.
2. Where he sits: flat in a pool in the middle of a round ring, seen from above, with the hero right beside him; nothing of him looms over the hero.
3. How he moves: he never moves or turns (`game/act1_rules/eye.ts`); risen he only sits higher in his pool; his arms come up from cracks round the ring.
4. His frame rate: his frames are up to 860 x 790 picture pixels, so he is held at 15 frames a second and his surfacing and death at 10 (`EYE_MOVES`; `EYE_COST`, 676 frames, 320 MB): his biggest moments are his choppiest.
5. His entrance: a 4.2-second surfacing at 10 frames a second; the screen shakes twice (7 at the break, 5 at the roar) with a slam, a wave and his roar; the camera does not move and the screen does not darken.

## An epic entrance, within the game as it is (choices to put to him)

- What rises first: the water goes still and black; rings spread; his eye's fire swells under the water; his tongue breaks the
  surface first, the eye on its tip, and rears, looking at you; then the two peaks of his jaws break the surface, melting, muck
  pouring off them, and he rises, the V gaping wider as he comes up; last, his roar out of the open maw.
- The screen darkens: the fen's dusk drops to near night for the rise, so that his eye's fire and the hero's own light are
  all that is lit; it comes back as he roars.
- The screen shakes: a low rumble growing all through the rise, a big shake as he breaks the water, another at the roar.
- The camera: glides up toward the water as he rises and settles leaned toward him, so the hero drops to the foot of the screen
  and his eye is high on it.
- The water: a wave rolls off him over the stone's edge as he comes up; muck and goo rain down.
- The sound's cue (for the sound chat): the music cuts to silence; a deep rumble; a wet tearing groan as he rises; his roar out of
  the maw; then his music.

## What he costs

- A frame of him risen, his arms with him: about 800 x 480 picture pixels, at 4 bytes a pixel 1,536,000 bytes (1.46 MB).
- Baked at 30 frames a second: 43.9 MB for each second of him. Too much to hold whole. Ways to afford him (for the main chat):
  his jaws painted once a few times a second and only what moves (his tongue and eye, his drips, his arms, each a small picture of
  its own) at 30; or baked to files and read as they are needed (his word of 6 Nov: the game may carry files).
- Painting a frame, here without a browser: about 66 seconds risen, about 46 seconds under the water (this container). Not to be
  painted while the game runs: baked.

## How to make the pictures again

```
node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/eye_today.mjs --out shots/eye_today/x
npx tsx tools/eye_redo_pics.ts look shots/eye_redo/look
npx tsx tools/eye_redo_pics.ts arena shots/eye_redo/arena
python3 tools/eye_redo_sheet.py look shots/eye_redo/look docs/mockups/eye_redo/pictures/eye_look.png
python3 tools/eye_redo_sheet.py arena shots/eye_redo/arena shots/eye_today/x_risen.png docs/mockups/eye_redo/pictures/eye_arena.png
```

(`eye_redo_pics.ts` keeps each painting of him in `shots/eye_redo/cache`, so the arena does not paint again what the look
painted; a change to `eye_colossus.ts` makes them all again. Run the look and the arena one after the other, not at once. The look
sheet reads his drawing from `docs/ref/`.)

## Before (the art chat's notes)

The first pass broke his rule of 6 Nov, 15:18 (“Everything drawn should not just look like shapes.  That’s the rule”); the
second redrew it; the third (3e7b6844) made the body a towering, hunched, lopsided mass and took the line off the tentacles. On
3e7b6844 he scrapped the body; bfb16ba3 made him a huge melting head that split down its seam, its halves swinging apart on a hinge
at the back of his skull, his tongue out of a slit low on the seam when shut. On his drawing of 7 Nov the head became the V: the
shut head, its seam, its slit, the hinge and the round lobes are gone from the file; the eye, once a ball, now lies on its side.
The tentacles, the arena, the water, the melting and the colours stayed.

## Checks

`tests/eye_colossus.test.ts`: (1) the switch off and nothing of the game importing him, nothing of the old Eye in him; (2) his
pictures (risen from in front and from behind, under the water, a tentacle alone) with nothing cyan, the pink edge round him, his
iris pink burning to gold; (3) his lengths the game's, his eye huge and lying on its side, a frame's cost; (4) his arms clear of all
of him (jaws, throat, tongue, eye, drool, drips, gobs) and of the stone, their roots under the water before it, where the main
chat's layout puts them, risen and under the water; (5) his drawing: the V's point at the water and wide at the top, each face
leaning out; his jaws tall, his left the lower and further out; rows of teeth down the V, none through his tongue; his throat
inside it and spittle across it; his tongue from his throat into the eye; the eye's bottom well over his taller peak and the
highest of him in his picture, and on the screen in the phase 2 view; under the water, nothing of him above it; (6) every
tentacle and his tongue one smooth taper: sampled close, no step in its thickness, no twist, the suckers in order; (7) he melts:
drips, gobs, splashes, the sheets running off him in drips, goo on him. `tsc --noEmit` clean. Stage 1 only: no moves, so the boss
checks (`art/boss_checks.ts`) come with his moves.
