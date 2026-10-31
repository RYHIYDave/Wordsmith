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
  way his thighs go: to the floor behind him standing, hanging below him in his leap, along his legs as he lies. (Nothing
  of him goes into the stones: as he lies, what would (his mantle, his beard, his plate's edge) lies pressed flat on them.)
- HIS CREST, THE ROYAL SWAN, in old gold, nothing else: his pick, asked whether the King should have a mark of his own or
  keep the royal swan crest (white swan, wings raised, as floor 16's palace guard wears), “Keep the royal swan”. It is the
  palace guard's own swan (`royalSwan`, copied from `swanCrest`), a big one on the back of his mantle between the
  shoulders, seen from behind (`swanOn`); his knights in the Decree bear it faded on their kite shields. (A second on his
  breastplate was tried and dropped: under his beard and at three-quarters it read only as gold specks.)
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
- THE CHARGE, his basic blow in place of the sweep (`KG_CHARGE`, 2.7 s): he sets himself, the sword dragged back behind him
  on the stones, and charges at you, cutting a line of sparks in the floor; after he stops its sparks shoot off it and pop
  in shrapnel. Its own section below.
- THE DECREE (`KG_DECREE`, 2.8 s; the blow at 1.33 s): he takes the sword in both hands and raises it high over his head,
  point to the sky, his face lifted to it; held 0.72 to 1.24 s (the warning); then in two frames drives it point-down into
  the stones before him, smeared; the stones crack; he leans on it, wrenches it out and lets it down. HIS KNIGHTS
  (`decreePainted`, `DECREE_FX`, `DECREE_GAPS`): three lines of them, grey-blue fog in old armour (great helms with the dull
  pink in the slit, kite shields with the royal swan faded on them, spears levelled), their legs thinning to fog below the knee,
  rise out of the floor at the far side of the hall and march across it at 2.4 tiles a second, one line every 3.2 tiles; a
  knight every 1.25 tiles across the hall's whole width, each line with two gaps two knights wide (2.5 tiles) in different
  places, to slip through; each line fades at the near wall.
- THE CROWN'S WEIGHT, in place of the Crown (`KG_WEIGHT`, 5.6 s): he sends his crown up off his head; grown huge, it
  follows you, hangs, slams down, and flies home onto his head. Its own section below.
- HIS OLD SWEEP AND HIS CROWN'S LEAP ARE KEPT IN THE CODE BUT OUT OF HIS MOVES (`KG_RETIRED`, `sweepPlan`, `crownPlan`,
  `KG_SWEEP`, `KG_CROWN`; their pictures across the hall `sweepPainted`, `crownPainted`): his word of 31 Oct, below.
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
  drifting (3.6 s round). ITS THREE MOVES (grab and drag, its shield, grey fog): their own section below. Its walk and its
  reel are its stand (it glides where the game puts it; struck while it shields him, it is the King who is struck). ITS END
  (`HS_DIES`, 3.0 s): it rears up, its arms thrown up, and unwinds into nothing.
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

## His new moves (31 Oct)

His word on the films of floor 19, by 07:26: “His sweep and leap are pretty lame.  There are a dozen other enemies that have
that’s same moves with those same animations.” Offered “The dragged blade (Recommended)” for the sweep: “Dragged blade works
but I’d like him to charge at the player”; for the leap and slam: “The crown's weight”. Of the Hush at his side: “It needs
at least a couple moves.  It can’t take words we have so many bosses that do that already”; of four offered: “Grab and drag
(Recommended),Shields the King,Grey fog”. Each as his Movement 9 asks: a big held wind-up, the strike in two frames
smeared, a big wind-down. Times in seconds and frames (30 a second), lengths in tiles. None of the Hush's moves takes or
darkens words.

### THE CHARGE (`KG_CHARGE`; his `attack`; 2.7 s, 81 frames; both looks, `KING` and `KING_ALONE`, and `KING_SHIELDED`)

- 0 to 0.3 s (frames 0 to 9): he drops low and steps his right foot back, hauling the sword back behind him along the stones.
- THE WARNING, 0.3 to 0.7 s (frames 9 to 21), held: crouched low at you, his weight back on his right foot, his left fist
  before him, the sword dragged far back behind him, its point grinding the stones (sparks), the blade glinting pink; his
  hips start at 0.73 s (frame 22).
- THE STRIKE, 0.767 to 0.833 s (frames 23 to 25; `hit` 0.833): he bursts off his mark, his left foot driving off, smeared:
  streaks of him (head, shoulders, hands, knees, feet, the blade) left behind where he was.
- THE RUN, 0.8 to 1.55 s (frames 24 to 46.5): THE GAME CARRIES HIM along his forward at 12 tiles a second, 9 tiles in all
  (`chargeCarried(t)`, own lengths). Three strides of a quarter second, each foot down 0.08 s and gripping the floor as he
  is carried (his feet land at 0.97, 1.22, 1.47 s), off the floor between; leaning hard into it (31 degrees), his left
  arm pumping, his mantle, hair and beard streaming back; the sword dragged behind in his right hand, its point on the
  stones, a spray of sparks off it; grit kicked up behind his feet.
- THE STOP, 1.55 s: he plants his left foot far ahead (down at 1.62 s), surges over it (1.68 s) and stands, turning to look
  back along the line (1.9 s).
- THE RIP, 2.0 to 2.15 s (frames 60 to 64.5): he wrenches the blade up off the stones behind him, flinging its point up
  high; at 2.15 s (`burst`, 0.6 s after he stops) THE LINE'S SPARKS GO; he lets the sword down and steps back into his stand
  (right foot 2.16 to 2.34 s, left 2.38 to 2.58 s); 2.7 s, his stand.
- THE LINE OF SPARKS (`sparksPainted(t, view, lane)`, `t` from when he sets off, laid where he set off, on FX_CANVAS): a
  groove cut in the stones where his sword's point went, 1.75 tiles (`tail`) behind his floor point the whole way, so from
  1.75 tiles behind where he set off to 1.75 tiles behind where he stops; white-hot where the point is, cooling to the
  enemy's pink along it, sparks fizzing off it. Its times below are from ITS MOMENT, 0.6 s after he stops (`burstAfter`;
  his 2.15 s); lengths in tiles; `CHARGE_FX`:
  - THE HELD BEAT, the 0.35 s before it (`hold`): the line brightening to white-hot, flickering, its sparks gathered on it
    as beads of light, swelling and trembling.
  - THE RELEASE, at 0: every spark SHOOTS OFF the line at once (one for every 0.33 tiles of it, `every`: 27 on a 9-tile
    line; `chargeSparks(lane)`), up and out to either side in turn, streaked back to the line in its first two frames
    (40% or more of the way up in them), slowing and arcing over (`chargeSparkAt`); a flash along the line, stone chips
    kicked up out of it.
  - THE POPS, 0.28 to 0.4 s (`fly`, staggered along the line): each pops at the top of its flight, up to 1.5 tiles up
    (`high`; the lowest 0.8) and up to 1.6 tiles off the line (`out`; the nearest 0.56), and 0.3 tiles either way along it:
    a star of light (0.06 s).
  - THE SHRAPNEL, 0.25 s from each pop (`shards`; `chargeShards(t, lane)`): twelve hot fragments flung out every way, out
    to 1 tile round the pop (`r`), slowing and falling a little, streaked, cooling white-hot, gold, the enemy's pink; gone.
  - THE HIT, for the game: everything within 2.6 tiles of the line (`reach`, `out` + `r`; round its ends too), from the
    first pop to the last shrapnel gone: 0.28 to 0.65 s after its moment (his 2.43 to 2.8 s; laid by the game, the line
    lies on after his move ends).
  - Smoke off each pop and the scar after; all gone 1.0 s after its moment (`long`).

### THE CROWN'S WEIGHT (`KG_WEIGHT`; his `weight`, in place of `crown`; 5.6 s, 168 frames; both looks, and shielded)

- 0 to 0.45 s: his left hand sweeps low behind him, he bows; 0.45 to 0.9 s (frames 13.5 to 27) held, the crown trembling up
  off his hair (a few up); 0.9 to 1.1 s he flings his hand up high.
- 1.1 s (`send`, frame 33): THE CROWN GOES UP OFF HIS HEAD. From here until 5.2 s (`back`) it is not on his picture
  (`KingSay.crown` 'away'): it is the game's to lay (`weightPainted`), and he stands steering it, his left hand up over his
  head and out before him, clawed, his face up to it (his feet stay where they are).
- THE CROWN (`weightPainted(t, view, 'crown' | 'floor')`, `t` from `send`, on WEIGHT_CANVAS 340 by 360, laid at the floor
  point under it; `weightAt(t, view)` says where it is: `lerp`, how far the game has moved that floor point, its middle from
  there, its size, its ways):
  - FLYING OUT, 0 to 0.45 s (`fly`): from his head (where it sat on it, as each view paints him: `weightHead`) up and out,
    growing to 5.2 times its size (`k`), the floor point under it moved by the game from him to over you (`lerp` 0 to 1).
  - FOLLOWING, to 2.4 s (`follow`, from going up): high over you, its band's middle 100 up (`z`: the knight is 58 tall),
    turning slowly, bobbing, the Hush's fog wisping off it; THE GAME MOVES IT AFTER YOU at 3.2 tiles a second. Under it on
    the floor: its shadow, and THE WARNING, the enemy's pink ring round where it will fall, 1.7 tiles (`r`), its dashes going
    round.
  - HELD, 2.4 to 2.933 s (`hold`; his 3.5 to 4.033 s, frames 105 to 121): it stops, rises 14 more and hangs trembling; the
    ring solid and bright pink, a second ring closing in on it, the shadow darkening; his hand closes into a fist, raised.
  - THE SLAM, 2.933 to 3.0 s (his strike, frames 121 to 123; `hit` 4.1): it drops in two frames, streaked, as he yanks his
    fist down to his thigh (smeared); it lands at 3.0 s (his 4.1 s): a flash over all it strikes (1.7 tiles), the stones
    cracked out from under it, a ring rolling out to 2.6 tiles, dust.
  - LYING, 3.0 to 3.4 s (his 4.1 to 4.5 s): on the stones, rocking, rings of sound going off it.
  - HOME, 3.4 to 4.1 s (`home`; his 4.5 to 5.2 s): it rises and flies back in an arc, shrinking, the game moving the floor
    point under it from where it slammed back to him (`lerp` 0 to 1), and settles on his head as his picture has it at 5.2 s
    (his hand raised open to it); three quarters of a turn in all, so it sits as it did.
- 5.2 to 5.6 s: his hand lowered, his stand.

### THE HUSH'S MOVES (`HUSH`; its own picture, `HUSH_CANVAS`)

- GRAB AND DRAG (`HS_GRAB`; its `attack`; 2.3 s, 69 frames). 0 to 0.3 s it rears back, its arms drawn back behind it; THE
  WARNING, 0.3 to 0.6 s, held, trembling; THE STRIKE, 0.6 to 0.667 s (frames 18 to 20; `hit` 0.667), its arms flung out,
  smeared. From 0.667 to 1.9 s ITS FOREARMS AND HANDS ARE THE EFFECT'S (`grabBare`; `grabPainted(t, view, { reach, aim,
  grip })`, laid at its floor point on FX_CANVAS): out of its elbows, long fog arms, rippling, rags hanging off them, long
  hands spread (or closed on you, `grip` 1). THEY SHOOT OUT at 16 tiles a second from 0.6 s, 8 tiles past where its hands
  would be by 1.1 s (`out`; `grabReach(t)`, its own if they catch nothing; `reach` the game's: they stop where they catch
  you); `aim`, degrees from its forward to its left (drawn to 45 either way). THE HAUL, 1.1 to 1.9 s (`haul`): it leans back,
  hauling, and they come home, dragging you with them to stand before the King (7.2 tiles in the 0.8 s at 9 a second); at
  1.9 s its hands are its own again; 2.3 s, its stand.
- THE SHIELD (`HS_WRAP`, `KING_SHIELDED`, `HS_STRUCK`). WRAPPING (its `wrap`, 0.5 s): it turns to him, its arms flung wide,
  and THE GAME CARRIES IT from its place to his through the 0.5 s; at its end its own picture is not laid and he is
  `KING_SHIELDED` (every move of his, the Hush wrapped round him: on his back as it rode him, close, its head down over his
  crown, its fog wound round him in ribbons from his knees to his shoulders), its fog closing in round him over 0.45 s
  (`shieldPainted(t, view, 'on', 'behind' | 'before')`, laid at his floor point, him between). STRUCK OFF (its `struckOff`,
  1.5 s): he is `KING_ALONE` again, its fog bursting off him (`shieldPainted(t, view, 'off', ...)`, 0.6 s); it is flung back
  off him, tumbling (THE GAME CARRIES IT from him back to its place through 0 to 0.35 s, `knock`), and hangs there sagging,
  dazed, its head lolling (to 1.5 s), and gathers itself into its stand.
- GREY FOG (`HS_FOG`; its `fog`; 1.9 s, 57 frames). 0 to 0.35 s it rears up, swelling, its arms flung wide, its head thrown
  back, drawing breath; THE WARNING, 0.35 to 0.77 s, held (the three places marked on the floor); THE STRIKE, 0.8 to
  0.867 s (frames 24 to 26; `hit` 0.867): its head thrust down at you, its mouth gaping, smeared; THE BREATH
  (`breathPainted(t, view, at)`, `t` from the hit, laid at its floor point): a gout of grey fog out of its mouth and three
  clots flying out to where they lie (0.28 s, `fly`; `at`, own tiles from it: the game's, where you are and 2.5 tiles,
  `apart`, either side of you). THE PATCH (`fogPatchPainted(t, view)`, `t` from the hit, laid where it lies, FOG_CANVAS):
  from -0.6 s the place marked (a faint ring of the enemy's pink, fog drifting at it); as the clot lands it billows out
  (0.35 s) to 1.7 tiles round (`r`), and lies, low and rolling, curls of it lifting off; in its last 1.3 s it breaks up and
  thins; gone at 7 s (`lies`).

### FOR THE MAIN CHAT: the art's numbers beside `gking.ts` (origin/high-city)

- CHARGE: warn 0.8 and the run 0.75 s at 12 tiles a second, 9 at most: as yours (the game carries him from 0.8 s). His whole
  move is 2.7 s, not 2.3 (the stop, the rip, the burst at 2.15 s, 0.6 after he stops, as yours, and his step back). HIS
  FEET GRIP ONLY AT 12 TILES A SECOND FOR THE WHOLE 0.75 s: the art needs him always to run his full 9 tiles (stopped only
  by a wall), not 1.5 past where you stood; if the floor runs out, stop him and go on from his stop (1.55 s), a small jump.
  The line lies where his point went: 1.75 tiles behind his floor point (`tail`), so from 1.75 behind where he set off to
  1.75 behind where he stops (yours runs from his floor point). ITS BURST IS NOW SPARKS SHOOTING OFF AND POPPING: its
  sparks leave the line at 2.15 s (0.6 after he stops, as yours) but nothing hurts until they pop, 0.28 to 0.4 s later;
  the hit is everything within 2.6 tiles of the line (`CHARGE_FX.reach`; yours 0.75 either side) from 0.28 to 0.65 s
  after they leave (his 2.43 to 2.8 s); its picture lies 1.0 s from 2.15 s.
- CROWN'S WEIGHT: send 1.1, fly 0.45, follow 2.4 at 3.2 tiles a second, slam radius 1.7, home 0.7: as yours. Its hold is
  0.533 s (16 frames, not 0.55) and its drop two frames (0.067 s, not 0.08), so it lands 3.0 s after it is sent; then it
  lies 0.4 s before it flies home (yours has none: home 3.4 to 4.1 s after sending). HIS MOVE IS 5.6 s, NOT 1.6: he stands
  and steers it until it is back on his head (5.2 s). If he is to fight on while it flies, every move of his needs a
  crownless set: the owner's to say.
- GRAB: warn 0.6, out at 16 tiles a second to 8: as yours. The haul (whether it caught you or not) is 1.1 to 1.9 s, 0.8 s
  (yours: 0.4 s back if it misses, and up to 2 s dragging); its move 2.3 s. Its arms are drawn aimed up to 45 degrees off
  the way it faces: turn it to face you as it rears back.
- SHIELD: wrap 0.5 s, as yours (carry it from its place to him through it); struck off: carry it back over 0.35 s (yours
  puts it back at once), dazed 1.5 s as yours. Lay `KING_SHIELDED` while it holds.
- GREY FOG: its breath out is at 0.8 s (0.867 the end of its two frames; yours 0.8); the patches 1.7 tiles round, 2.5
  apart, 7 s: as yours. Its move is 1.9 s.

His picture (`KING_CANVAS`) is 340 by 400 (room for the sword at full reach and him at the top of his leap); the Hush's
own 200 by 220; the hall-sized picture the blows leave is `FX_CANVAS`, 1000 by 580, his floor point at its middle.

FOR THE MAIN CHAT: the areas each blow hits are the game's, as his “And bigger AOE to compensate for the extra time the
player gets to evade” asks; the art is drawn to these: the Decree's lines the hall's whole width with their gaps; the
faces' streams aimed where you stood as his hand was flung (`curtainsPainted`'s `at`, and its hangings, `from`); the
charge, the crown's weight and the Hush's moves as in their sections above. (Of the moves out of his set: the sweep's wave
a 235-degree wedge 10 tiles out; the Crown's ring 10 tiles, its leap 5 tiles.)

## How to bring him in

As the Princess: `makeKingArt3()` gives `{ front, back }` (his moves are `attack`, the charge, `more.decree`,
`more.weight`, `more.curtains`, `more.climbOff`); `makeKingArt3(KING_ALONE)` after the climb-off;
`makeKingArt3(KING_SHIELDED)` while the Hush shields him; `makeHushArt3()` the Hush at his side (its `attack`, the grab,
`more.fog`, `more.wrap`, `more.struckOff`). The effects are pictures the game lays (each from its move's moment, as its
section says): `sparksPainted` (where he set off), `decreePainted` (lines behind him, `'behind'`, and before him,
`'before'`, for laying him between them), `weightPainted` (`'floor'` under the figures, `'crown'` over them, at the floor
point under it), `curtainsPainted`; the Hush's `grabPainted` and `breathPainted` (at its floor point), `fogPatchPainted`
(where each lies), `shieldPainted` (at his, `'behind'` and `'before'`); the songbird `birdPainted`. All behind `KING_ON`.

## The pictures (docs/mockups/king/pictures/)

- `king_sheet.png` (1200 wide): him standing, from in front and from behind, beside the knight, three times as big; the
  Hush on his back.
- `king_game_size.png`: in his hall at the game's size (the floor a stand-in), the knight before him; behind, his last
  phase from behind, the Hush at his side.
- `king_hush.png`: his last phase, the Hush climbed off him and standing at his left, from in front and from behind, three
  times as big.
- `king_songbird.png`: the clockwork songbird broken, winding itself up, and singing, from in front and from behind, four
  times as big.
- `king_blows.png`: his four blows across the hall at the game's size: the sweep's wave, the Decree's knights marching,
  the Crown's ring, the faces streaming from the hangings at the knight.
- `king_film.mp4` (about 76 s, 1920 by 1080): every move from in front, then from behind, in his hall with the knight,
  captioned; each of the four strikes again at half speed, close; his death with the songbird winding up and singing (close,
  in the corner). (Made 29 Oct, with the sweep and the Crown's leap, now out of his set.)
- `king_new_moves.mp4` (51 s, 1200 by 676): his new moves, from in front and from behind in his hall with the knight,
  captioned: the charge and its line of sparks bursting; the crown's weight following the knight round, slamming down as
  he runs clear, flying home; the Hush's grab and drag, its shield (wrapping, struck off, dazed), its grey fog (marked,
  breathed out, lying, its last seconds); then each strike at half speed (the charge's burst off his mark, the line
  bursting, the crown's slam, the grab, the breath).
- `king_new_moves_sheet.png` (1200 wide): key frames of each of them, captioned. (Both made before his word on the sparks:
  their line of sparks bursts where it lies.)
- `king_sparks.mp4` (11 s, 1200 by 676): the charge's line of sparks as it is now: the charge from in front and from
  behind in his hall, the knight standing just clear of the shrapnel; its sparks held, shooting off and popping; then at
  half speed, and close at half speed, captioned.
- `king_sparks_sheet.png` (1200 wide): its key frames: the shrapnel round the whole line at the hall's scale; then close,
  held, shot off (two frames on), flying up and out, each popping, the shrapnel, gone.

Made with `tools/king_pictures.ts sheet <dir>` and `python3 tools/king_captions.py <dir> docs/mockups/king/pictures`;
the film with `tools/king_film.ts docs/mockups/king/pictures/king_film.mp4` (its sweep and Crown parts are of moves now out
of his set: it made the film of 29 Oct). The new moves: `npx tsx tools/king_new_moves.ts film
docs/mockups/king/pictures/king_new_moves.mp4`; the sheet, `npx tsx tools/king_new_moves.ts sheet <dir>` and `python3
tools/king_new_moves_sheet.py <dir> docs/mockups/king/pictures/king_new_moves_sheet.png`. The sparks: `npx tsx
tools/king_new_moves.ts sparks docs/mockups/king/pictures/king_sparks.mp4`; its sheet, `npx tsx tools/king_new_moves.ts
sparks-sheet <dir>` and `python3 tools/king_sparks_sheet.py <dir> docs/mockups/king/pictures/king_sparks_sheet.png`.

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
   last phase); with the Hush on his back (`KING`), without it (`KING_ALONE`, `KG_ALONE_SHAPE`), with it wrapped round him
   (`KING_SHIELDED`, `KG_SHIELD_SHAPE`), and the Hush on its own (`HUSH`, `HS_SHAPE`: its stand, its grab, its fog, its
   wrap, struck off, its end). SLIDE (his charge: a foot down goes back with the floor as the game carries him,
   `BossShape.carried`), FLOOR, ARM, THROUGH (his sword, and the Hush's arms on him), JERK, JUMP, BLOW, HIPS, ALIVE,
   STRIKE; and every frame a figure (no number lost).
3. His lightning strikes (the charge, the Decree, the crown's weight, the Curtains) and the Hush's (its grab, its breath):
   each two frames, landing on the second; the strike's frames and the one after smeared; no other frame.
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
11. The charge: its warning held, its strike two frames, carried 9 tiles at 12 a second, off the floor between his strides,
    leaning into it, the sword dragged on the stones behind him; the line of sparks cut the length of his run; brighter
    as it is held; its sparks leaving from the line, 40% of the way up in two frames, rising until they pop, popping in
    their time, no higher than 1.5 tiles and no farther out than 1.6 and reaching both (within a tenth), to both sides;
    its shrapnel within 1 tile of each pop and 2.6 of the line, and reaching both, never under the stones, gone in time;
    painted where they are (the sparks in the air, the shrapnel round the pops); all gone at 1.0 s; in every frame, for a
    full line and a short one: nothing cyan, nothing cut off, every pixel crisp.
12. The crown's weight: away from his head from 1.1 to 5.2 s and on it before and after; sent from where it sits on his
    head and home to where it sits (each view); huge and 100 up while it follows and hangs; the pink ring as it follows,
    bright as it hangs; its drop two frames and streaked; the slam drawn big; nothing cyan, nothing cut off.
13. The Hush's moves: its arms out 8 tiles at 16 a second and drawn there (aimed 45 degrees either way too), home by the
    haul's end; wrapped round him with its fog in every move of `KING_SHIELDED`; its fog on and off; the patch marked,
    1.7 tiles round, thinning, gone at 7 s; its breath; nothing cyan, nothing cut off.

`src/art/boss_checks.ts` (shared): `BossShape.carried` (optional), how far the game has carried a boss along his forward
by a moment of a move that is not a walk (his charge): SLIDE counts it as it counts a walk's floor going by. Nothing else
changed; the other bosses' tests pass as before (tests/palace_hands.test.ts, tests/princess.test.ts, tests/bosses.test.ts).
`src/dev/king_scene.ts`: `keys.at(-1)` (not in the compiler's library: `tsc` stopped on it) put plainly.

`tests/bosses.test.ts`: its two import checks (1 and 12) now pass over `art/king*` as they pass over the Princess's and
the other mock-ups' files (his files import the bosses' footwork and the checks, as theirs do).

## His word on the pictures

The sheet, his blows across the hall and the film (`king_sheet.png`, `king_blows.png`, `king_film.mp4`), asked “The King
(king_sheet.png, king_blows.png and the film): is this him? He walks slowly but his blows reach across the hall.”: “Yes,
that's the King (Recommended)”.

OF THE NEW MOVES (eb9fe0d; `king_new_moves.mp4`, `king_new_moves_sheet.png`), shown 31 Oct: asked whether these were it (the charge and its line of sparks bursting after he stops; the Crown's Weight; the Hush's grab and drag, shield and grey fog): “The sparks should shoot off, then pop in shrapnel”. Read as: the line of sparks his sword cuts does not just burst where it lies; its sparks shoot up and off the line, then each pops in a burst of shrapnel. Asked whether he stands and steers the crown while it flies, or fights on bareheaded: “He stands and steers it (Recommended)”.
