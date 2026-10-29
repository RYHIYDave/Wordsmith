# Floor 19's boss, the King (mock-ups; the art chat's branch `mockup/king`)

From `origin/mockup/swan-gardens` (floor 16 finished, the Princess its boss: the model for him). Nothing here is in the
game until the main chat puts it there, on his yes. Nothing of the game imports any of it; his switch, `KING_ON`
(`src/art/king.ts`), is off.

His floor, from the plan he said yes to: THE KEEP, the old castle at the hill's crown, where the king lies dying; its
palette cold stone, royal blue, old gold. Its story from Andersen's "The Nightingale" (1843), drawn only from the book:
Death sits on the dying emperor's chest wearing his crown and holding his sword and banner, and the faces of his good and
evil deeds peer from the folds of the bed curtains ("some ugly, others gentle and lovely"); the artificial bird lies
broken. In the plan: "the king is dying. The Hush sits on his chest wearing his crown, holding his sword, and the faces
of everything he ever did look out at him from the bed curtains (as Death does in "The Nightingale"). His clockwork
songbird lies broken on the floor."

## His brief

Offered to him as a pop-up; his pick for how he moves: “Slow and heavy, huge reach (Recommended)”, with the brief as
offered: THE KING (floor 19 boss, the Throne Hall): the old king in his armour, raised from his deathbed with the Hush
riding on his back, its fog in his crown, his great sword dragging on the stones; huge, twice the knight's height with the
Hush on his back; slow and heavy, but every blow reaches across the hall; his mark the Hush riding his back, its fog in his
crown; his moves a sweep of the great sword (basic), the Decree (rows of his knights marching across the hall in lines
with gaps to slip through), the Crown (a leap and slam that rings out a shockwave), the Curtains (faces of his deeds
streaming at you from the hangings); his last phase, the Hush climbs off him and fights at his side; his death, the
clockwork songbird winds itself up and sings, and the door to the Quiet Tower opens; never a skeleton or zombie, never
gory; his sound the sword's drag, armour, the bird's song.

And his rules built in from the first pass: his Movement 9 (24 Oct), “Like the wind up and wind down are big but the
actual punch is lightning quick”, for the enemies from 28 Oct, “Start from now on, but every enemy is going to need that
change eventually.  And bigger AOE to compensate for the extra time the player gets to evade”; and of 28 Oct, “It’s all
too slow and too narrow and too small.  I could dodge anything you’ve put in these moves with my eyes closed” and “There
are big bosses that can be slow.  But like the prince with a rapier, dancing is going to need to be fast and constantly
moving”. Read as: he is the big slow kind (his pick), so his steps are slow and heavy, but every blow of his is huge and
lightning-fast at the strike (two frames, smeared), its wind-up held big, its wind-down big, and its reach across the
hall (a boss arena about 17 by 20 tiles).

## His look (`src/art/king.ts`)

On the heroes' bones (`KING_BODY`): a hundred tall standing straight (the knight is 58), broad in his plate, his head a
third bigger than life so his face reads; bowed under what rides him, his knees bent with its weight. With the Hush on
his back, the top of its head is twice the knight's height.

- AN OLD, GAUNT, WHITE-BEARDED KING, alive, grey and dying (not undead): an old grey face, hollow-cheeked, deep-eyed, heavy
  white brows, a long nose; a long white moustache and a long white beard in locks down over his breastplate to a point;
  long white hair down his back. His own eyes pale and tired (the pink is the Hush's, not his).
- OLD ORNATE PLATE of royal blue (enamel, hue about 230, well clear of the friend's cyan) edged in old gold: a breastplate
  with a gold ridge and gold scrolls at the breast, gold trim at its neck and waist, a gold gorget and belt, a fauld of
  royal lames over his thighs edged in gold; broad pauldrons of three lames each, gold-edged; royal rerebraces and
  vambraces, gold couters; gold gauntlets; royal cuisses and greaves with a gold ridge, gold knee cops, pointed gold
  sabatons. The gold is old and dull: it never glows.
- A ROYAL BLUE MANTLE of velvet down his back to the stones, trailing; its collar ermine with its black tails. It falls the
  way his thighs go: to the floor behind him standing, hanging below him in his leap, along his legs as he lies.
- HIS CROWN: a gold band set high on his head, eight fleurons standing up off it (tall and short by turns, each with two
  leaves and a sapphire at its foot); the Hush's grey fog curling up through it from inside, rising and thinning.
- HIS GREAT SWORD (`SWORD`), 77 long, taller than the knight: a gold pommel set with a sapphire, a long grip bound in royal
  blue and gold, a broad gold cross with down-curved quillons, a broad blade of old steel with a ricasso, a fuller and bright
  edges. Its point rests on the stones behind him (`TIP_Z`) as he stands and walks: he drags it, sparks off it.
- ON HIS BACK, THE HUSH (`hushRiding`): a fog-shape of ragged lobes (their edges eaten into where they turn from the eye,
  their faces streaked: `lobe`), hunched along his back over the mantle, its fog trailing down his back in tattered tongues
  to his knees; its long arms over his shoulders, the right hand gripping his sword arm above the elbow, the left clutching
  at his breast; its head behind his crown and over it, a dark cowl round a pale mask: long hollow eyes with the dull pink
  in them, a long dark gape of a mouth, sharp cheekbones. Frightening, not gory: it is fog and a face. Fog wisps rise off it.

## His moves (`src/art/king_moves.ts`)

Every blow strikes as his Movement 9 asks: a big held wind-up (the warning), the strike in two frames landing on the
second, smeared with its after-images (a fan of them for the blade, its newest bright), a big wind-down. `KG_STRIKES` says
where. Seconds; tiles are the game's (a boss arena about 17 by 20).

- STANDING (`KG_STAND_LONG` 3.6 s, 36 frames at 10 a second): bowed under the Hush, heaving for breath (two laboured breaths
  round), his weight shifting; the Hush stirring, its head turning slowly, its fog curling up through his crown; his sword's
  point on the stones behind him.
- HIS WALK (`KG_WALK`, 18 frames at 10 a second; `KG_PACE` 1.0 tile a second, the knight's 2.5): slow and heavy, each foot set
  down with his whole weight (down 10 frames of 18), lurching side to side; the sword dragged behind, its point grinding the
  stones, sparks off it. The game starts and stops his walk at a frame where his feet pass (`KG_WALK_STOPS`, 0.5 s and 1.3 s).
- THE SWEEP, his basic blow (`KG_SWEEP`, 2.6 s; the blow at 1.3 s): both hands on the grip, he hauls the great sword round
  behind him to his right, low, its point grinding, crouched and twisted far round; held 0.62 to 1.2 s, the blade's edges
  glinting pink (THE WARNING); his hips go first; in two frames the blade sweeps round in front of him from 165 degrees
  behind his right to 62 degrees to his left (the blade itself 2.5 tiles out), smeared; it bites the stones at his left;
  he drags it back round in front of him, grinding, and lets it down behind him. ITS WAVE (`sweepPainted`, `SWEEP_FX`): the
  wind and grit off its edge roll out across the floor over the whole wedge it swept (235 degrees, from behind his right to
  his left) out to 10 tiles (`KG_REACH.sweep`) in half a second, a bright edge in front, dust and chips churned up behind;
  gone by 0.7 s.
- THE DECREE (`KG_DECREE`, 2.8 s; the blow at 1.33 s): he takes the sword in both hands and raises it high over his head,
  point to the sky, his face lifted to it; held 0.72 to 1.24 s (the warning); then in two frames drives it point-down into
  the stones before him, smeared; the stones crack; he leans on it, wrenches it out and lets it down. HIS KNIGHTS
  (`decreePainted`, `DECREE_FX`, `DECREE_GAPS`): three lines of them, grey-blue fog in old armour (great helms with the dull
  pink in the slit, kite shields with his crown faded on them, spears levelled), their legs thinning to fog below the knee,
  rise out of the floor at the far side of the hall and march across it at 2.4 tiles a second, one line every 3.2 tiles; a
  knight every 1.25 tiles across the hall's whole width, each line with two gaps two knights wide (2.5 tiles) in different
  places, to slip through; each line fades at the near wall.
- THE CROWN (`KG_CROWN`, 2.8 s; the landing at 1.5 s): he crouches deep, the sword drawn back low in both hands (held 0.45 to
  0.95 s, the warning); springs up off his toes; in the air (1.02 to 1.45 s, THE GAME CARRIES HIM 5 tiles at you) the sword
  swung up high to his right, his knees drawn up, 56 above the floor at the top; he comes down and in two frames lands and
  slams the blade down before him, smeared; the landing sinks; he rises slowly. ITS SHOCKWAVE (`crownPainted`, `CROWN_FX`):
  the stones crack out from under him (2.6 tiles), and a ring rolls out across the whole hall to 10 tiles in 0.8 s
  (`KG_REACH.crown`), the flags heaving up along it in blocks and settling, dust rising behind it, its edge ringing pale.
- THE CURTAINS (`KG_CURTAINS`, 2.5 s; the blow at 1.1 s): he turns to the hangings and stretches out his left hand to them,
  his face turned away; held 0.5 to 0.98 s (the warning), while the faces of his deeds look out of the hangings
  (`curtainsPainted` before its moment); then he flings his hand at you in two frames, smeared: THE FACES (`curtainFaces`,
  `CURTAINS_FX`) stream out of three hangings at you, one from each every 0.11 s for 1.5 s, flying at 11 tiles a second at
  chest height, weaving, trailing fog, out 13 tiles; gentle and lovely ones (serene, eyes closed, a faint smile) and ugly
  ones (brows knotted, hollow eyes with the dull pink, the mouth dragged open); grey masks, original, not gory. Then he
  clutches at his breast.
- THE HUSH CLIMBS OFF, his last phase (`KG_CLIMB`, 2.6 s): it lets go of him, rises off his back and high over his left
  shoulder (0.4 to 1.3 s), and comes straight down at his left (to 2.1 s), where it stands as its own figure (`HUSH`,
  `HUSH_BESIDE`: 50 to his left, 8 behind); he straightens as its weight goes, gasping, and bows again. From then on he is
  `KING_ALONE`: the same moves, nothing on his back.
- THE HUSH ON ITS OWN (`HUSH`, its own bones `HUSH_BODY`, about his height): hovering (a flier: its fog never touches the
  floor), hunched, its long arms hanging past its knees; standing, it sways, its head turning and tilting, its fingers
  drifting (3.6 s round). Its own moves are to come (his to decide): until then its stand stands in for them, and the review
  does not look at them. ITS END (`HS_DIES`, 3.0 s): it rears up, its arms thrown up, and unwinds into nothing.
- STRUCK (`KG_REEL` 0.4 s): he barely gives: rocked a little, his head knocked up.
- HIS DEATH (`KG_DIES`, 3.6 s): struck, his sword falls from his hand (0.42 s) and lies on the stones at his right; his knees
  give and he sinks onto them (by 1.1 s), swaying, his head bowing; he folds forward (1.85 to 2.5 s) and goes down, and lies
  still on the stones (3.0 s), as if asleep. The Hush, on his back or at his side, unwinds into nothing (0.3 to 2.7 s).
- THE CLOCKWORK SONGBIRD (`birdPainted`, `BIRD`): a small jewelled bird of gold and silver (a body of gold set with rubies
  and sapphires, a silver head with diamond eyes, wings of silver feathers edged in gold, a fanned tail, a winding key in
  its back). BROKEN: lying on its side, a wing bent out, its spring sprung out of its breast. WINDING (1.8 s): its key turns
  by itself in jerks, it shudders, the spring coils back into it, and it rights itself with a hop. SINGING (round every 1.2
  s): upright, its head up, its beak opening and shutting, its throat swelling, its wings fluttering, little notes of silver
  going up from it (grains: no glow). FOR THE MAIN CHAT: where it lies in the hall, and the door to the Quiet Tower opening,
  are the game's.

His picture (`KING_CANVAS`) is 340 by 400 (room for the sword at full reach and him at the top of his leap); the Hush's
own 200 by 220; the hall-sized picture the blows leave is `FX_CANVAS`, 1000 by 580, his floor point at its middle.

FOR THE MAIN CHAT: the areas each blow hits are the game's, as his “And bigger AOE to compensate for the extra time the
player gets to evade” asks; the art is drawn to these: the sweep's wave a 235-degree wedge 10 tiles out; the Decree's
lines the hall's whole width with their gaps; the Crown's ring 10 tiles; the faces' streams aimed where you stood as his
hand was flung (`curtainsPainted`'s `at`, and its hangings, `from`); the Crown's leap carrying him 5 tiles at you.

## How to bring him in

As the Princess: `makeKingArt3()` gives `{ front, back }` (his moves are `more.decree`, `more.crown`, `more.curtains`,
`more.climbOff`); `makeKingArt3(KING_ALONE)` after the climb-off; `makeHushArt3()` the Hush at his side. The effects are
pictures the game lays at his floor point (each from its blow's `hit`): `sweepPainted`, `decreePainted` (lines behind him,
`'behind'`, and before him, `'before'`, for laying him between them), `crownPainted`, `curtainsPainted`; the songbird
`birdPainted`. All behind `KING_ON`.

## The pictures (docs/mockups/king/pictures/)

(listed at the end of the work)

## The dev pages

- `src/dev/preview_king.ts` (a browser): `sheet`, `game`, `hush`, `bird`, `big:<move>:<t>[:alone|hush]`,
  `grid:<move>:<t>,<t>,...[:alone|hush]`, `fx:<sweep|crown|decree|curtains>:<t>`.
- `tools/king_pictures.ts` (no browser; PNGs): `sheet <dir>`, `look <move> <t,...> <out> <k> [king|alone|hush]`,
  `fx <name> <t,...> <out>`, `bird <out>`. The scenes are `src/dev/king_scene.ts` (the hall's floor there is a stand-in:
  floor 19's own ground and pieces are another piece of work).
- `tools/king_film.ts` (no browser): the film, `npx tsx tools/king_film.ts <out.mp4>`.

## The checks (`tests/king.test.ts`)

1. The switch is off, and nothing of the game imports him.
2. EVERY MOVE THROUGH EVERY BOSS CHECK (`src/art/boss_checks.ts`, `KG_SHAPE`): every frame, from in front and from behind,
   and every handover (his stand into every move and back, the walk in and out where his feet pass, the climb-off into his
   last phase); with the Hush on his back (`KING`), without it (`KING_ALONE`, `KG_ALONE_SHAPE`), and the Hush on its own
   (`HUSH`, `HS_SHAPE`: its stand and its end). SLIDE, FLOOR, ARM, THROUGH (his sword, and the Hush's arms on him), JERK,
   JUMP, BLOW, HIPS, ALIVE, STRIKE.
3. His lightning strikes: each of the four blows two frames, landing on the second; the strike's frames and the one after
   smeared; no other frame.
4. Every frame both ways round: nothing cyan, the pink edge while he lives and none as he dies, every pixel whole or empty
   but the edge, nothing red.
5. Nothing cut off.
6. Nothing of him in the floor; his sword's point on the stones, not in them.
7. His brief: the Hush on his back with the dull pink eyes, his own not pink; his crown; twice the knight with the Hush; the
   sword taller than the knight and dragging behind him; his death (down on the stones, the sword fallen, the Hush gone).
8. The climb-off ends where the Hush's own figure stands; nothing rides him after; the Hush hovers.
9. What his blows leave: nothing cyan in any of it; the wave and the ring drawn big; the Decree's lines the hall's width,
   each with its gaps; the faces out 10 tiles and more; the songbird's three, never glowing, its song.
10. His sizes and reach, and his pace.

`tests/bosses.test.ts`: its two import checks (1 and 12) now pass over `art/king*` as they pass over the Princess's and
the other mock-ups' files (his files import the bosses' footwork and the checks, as theirs do).
