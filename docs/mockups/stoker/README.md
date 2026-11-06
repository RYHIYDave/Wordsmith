# Floor 3's side boss, THE STOKER, and his furnace room (a mock-up; branch `art/stoker`)

Made for the art chat, from `origin/work-f4` (dcb229d5, the main chat's release branch, with floor 3's black iron prison). NOTHING
HERE IS IN THE GAME: nothing of the game imports it (its test proves it), and it is all behind one switch, `STOKER_ON`
(src/art/stoker.ts), off.

## His words

- To the main chat, 4 Nov 2026, 00:27: “I want a quest given to go to the chained one’s area and turn off the furnace.  Maybe by
  the armorer when you turn in the first runestone quest.  You go down to level 3, and there will be a side area you go into, it
  can be pretty short, then a flamey boss guy who drops a missing gear to the forge crank to turn it off, allowing you access to
  the chained one’s boss area which was blocked by fire, and then you get a reward from the armorer.”
- Read back to him: “Yes, that's it (Recommended)”. Who draws it: “The art chat, pictures to you first (Recommended)”.
- To the art chat, 4 Nov, which look for the flamey boss: “The Stoker (Recommended)”, offered as: the prison's huge fire-stoker,
  fused with the furnace: an iron firebox for a chest, coals glowing through its grate, a great shovel. Hurls burning coal, rakes
  fire across the floor.
- His rules: Movement 9 (24 Oct: “Like the wind up and wind down are big but the actual punch is lightning quick”; for the
  enemies, 28 Oct: “Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for
  the extra time the player gets to evade”), Monsters 9 (“Action, like a movie”), Animations 1 (“as big and wild and kinetic and
  weighty as possible.  I’d rather it be a notch too high than a notch too low.”), and “I’d rather have to pull back from a 10 then
  build up from a 1.”

- 6 Nov 2026, shown the Stoker and told that his arms and legs read like pipes with ball joints, too close to the circles-and-squares
  look his rules forbid; his pick: “Reshape his body first (Recommended)”, offered as: sculpted arms and legs: forged iron plates
  over real muscle and joints, his shoulders and knees shaped, not balls. His moves and the room stay as they are. His rulebook:
  real shapes, never circles and squares slapped together; one body, muscle melted into muscle; nothing passing through the body
  (plates and cloth over what they cover: no limb poking through a plate).

- 6 Nov 2026, asked how his death should end: “No man, too many death animations are fall to knees, then fall forward, elbows
  out.  Make him explode in fire or completely burn to ash or something”. Offered three; his pick: “Furnace explodes
  (Recommended)”, offered as: his firebox swells white-hot, plates bulging and rivets popping, then he bursts in a blast of fire
  and flying iron. The gear spins out of the fireball and clangs down.

- 6 Nov 2026, 15:18, his rule for everything drawn: “Everything drawn should not just look like shapes.  That’s the rule”. Every
  effect of his death is held to it, with the same care as his body: the fireball, its smoke, the sparks, the rivets popping, the
  steam, the shockwave's ring, the scorch, and every piece of him flying and lying must read as the real thing (see THE BURST,
  REMADE below).

## His body reshaped (6 Nov 2026, “Reshape his body first (Recommended)”)

Only his body changed (src/art/stoker.ts): his firebox chest, flue, shovel, colours, every move's timing and pose
(src/art/stoker_moves.ts), his effects (stoker_fx.ts) and the room (stoker_room.ts) are as they were.

- WAS: each arm a leather tube with a ball for a shoulder (a round pauldron), a ball for an elbow, a straight iron bracer and a
  ball for a fist; each leg a straight rod, a ball at the knee, a round boot; the head a sphere on a short rod of a collar.
- NOW, NO TUBES AND NO BALLS: each limb is MUSCLE (eggs of scorched leather laid along the bone, swelling and tapering as a body
  does, `armBody`, `legBody`), all of one part so that they melt into each other with no seam, the leather WRAPPED round them in
  strips (`wrapSkin`: their edges dark, a lit edge beside, burns); and over it IRON PLATES SHAPED TO IT: each plate is worked out
  from the muscle under it (`outFrom`, `ringOver`, `enclosing`), so that it follows its curve, and each is a true solid (see
  check 11).
- THE SHOULDER: a heavy rounded deltoid (it rides between his chest and his arm, up with the arm as it is raised) under a forged
  PAULDRON (`PAULDRON`): a COP over the top of the shoulder, a shell laid round the deltoid 1.2 times its size, riveted, a ridge
  over it; and three LAMES shingled down the arm, each a band laid round the muscle under it, flaring at its foot and over the
  top of the next, a row of rivets along each under the plate above (`lameOf`).
- THE UPPER ARM: biceps before, the great triceps behind, the brachialis out, swelling and tapering into the elbow; an iron BAND
  round it over the swell of the muscle (`ARM_BAND`), shaped to it.
- THE ELBOW: a hinged iron COUTER, a cup over the point of the elbow with a ridge and rivets, a fluted fan out over its side.
- THE FOREARM: thick at the top (the extensors over its back, the flexors before), narrowing to the wrist into an iron VAMBRACE
  laid round it (`VAMBRACE`, 0.42 to 0.86 of the forearm), its top rim rolled.
- THE HANDS: heavy gauntlets: a flared cuff, the fist closed round the haft (round nothing when it lets go, turning smoothly from
  one to the other), the back of the hand a riveted plate, four fingers curled with their seams across, a ridge of knuckles, the
  thumb over them.
- THE LEGS: thick thighs (the quadriceps, the hamstrings, the two heads swelling above the knee) under the leather skirt, which is
  now laid over his thighs as they are posed (never closer in than their muscle and a little slack), so no thigh comes through it
  (and what it covers of them is not painted);
  the knee under an iron POLEYN (a cup fitting the front of the knee, a fan over its side, a lame above it on the thigh and one
  below on the shin); the calves' two heads swelling behind and tapering into IRON BOOTS: a cuff up the calf laid round its
  muscle (`BOOT_TOP`), flared at its top; the foot shaped from behind its heel to its toe (`FOOT` in the painter), lames across the
  instep, a sole.
- THE HEAD: not a sphere: the furnace mask's HELM (`HELM`, `helmOf`), one shape of iron from its crown to its jaw: a domed crown
  with a crest, straight sides, a heavy brow over the slits for his eyes (the enemy's pink burning deep in them, gold as he winds
  up), the jaw flaring out wider than the crown and jutting before the face with the GRILLE set in it (bars, his fire behind
  them), rivets round it; set lower, on a thick iron GORGET of three lames flaring down into his shoulders, so that his head is
  sunk between them. Top-heavy: the shoulders high and broad.

## THE BURST, REMADE (6 Nov 2026; his rule, 15:18: “Everything drawn should not just look like shapes.  That’s the rule”)

Only his death's burst and after changed (src/art/stoker.ts `explosion`, `steamJet`, `blastBits`, `shardSkin`, `hollowSkin`,
`aimsOf`, `layOf`); his body, his moves, their timings, the shockwave's ring and the scorch on the floor (stoker_fx.ts) and the room
are as they were. What was there, and what is there now:

- THE FIREBALL was circles and flat bands of colour, and its smoke a flat grey disc with holes: now a white-hot
  flash with jagged spikes, then billows of fire heaped on one another, lit from within, creased under each, tongues licking off
  it, soot rolling over its top in billows lit red beneath; then billowing smoke rolling over and out at its top, lit and
  shadowed, soft at its edge, thinning into wisps (THE FIREBALL, below).
- THE PIECES were his plates each flying alone, stuck on the fireball's face, lying as grey lumps (his boots like ribbed grubs):
  now each thing whole (a pauldron with its lames, a boot with its foot), flung clear of the fireball all round, trailing sparks
  and smoke, and lying as the thing it was; the shards jagged torn plate, not ovals (FLUNG APART, below).
- THE STEAM was a few grey specks: now jets driven out of his gaps, swelling into billows (THE OVERLOAD, HELD, below). THE RIVETS
  were single specks: now heads torn off white-hot, sparks streaming, a white-hot hole left.

## The pictures (docs/mockups/stoker/pictures/)

- `stoker_body.png` (1200 by 6185, new, 6 Nov; made again on the plates as true solids): HIS BODY BEFORE AND NOW, side by side: standing from in front, from behind and
  from the side (his right, truly turned, not flipped), three times the game's size; at the game's own size from in front and
  from behind; and six moments of his moves from in front, twice the game's size (walking, the coals into his firebox, the coals
  held high, the rake held up, the burst held, struck).
- THE SHEET, IN TWO, each short enough for his phone (made again for THE BURST, REMADE):
  - `stoker_sheet.png` (1200 by 5346): him beside the knight from in front and from behind, three times as big; in his furnace
    room at the game's size (one phone screen); the key moments of each attack from in front and behind; the coals' marks and
    fires, the rake's sheet of fire and the furnace's ring over the whole room.
  - `stoker_sheet2.png` (1200 by 3864): struck and HIS DEATH, THE FURNACE EXPLODING (struck; white-hot and held, the steam
    jetting; the burst; the fireball and the shockwave; flung apart, the full width; scattered with the gear, the full width),
    each moment in a cell measured to hold all of it (nothing cut off: the tool stops if anything of a moment would come within 8
    of the game's pixels of its cell's edge, or under its label); the furnace lit and out; the fire in the Chained One's way burning and going
    out; the crank without its gear, with it, turned; the gear as an item.
- `stoker.mp4` (made again for THE BURST, REMADE; 1200 by 872, 30 fps, H.264 yuv420p, captioned, 59.7 s): his stand, his walk, each
  attack from in front and behind in a stand-in furnace room on floor 3's own floor and walls with the knight; the coals and the
  rake over the whole room; each strike at half speed; struck; HIS DEATH, THE FURNACE EXPLODING, from in front and from behind,
  with the shockwave and the scorch on the floor, and the burst again at half speed (he dies a little further into the stand-in
  room than he stands, 0.7 tiles from in front and 1.8 from behind, so that every piece of him comes down on its floor); the crank (gear missing, set
  in, turned), the furnace going out, the fire in the Chained One's way going out.

## What he is (src/art/stoker.ts)

On the heroes' bones (`ST_BODY`), so every boss check holds for him. **His crown 114.6 to the knight's 58: twice the knight.** A
hulking figure fused with the furnace:

- HIS FIREBOX, his trunk: a great pot belly of soot-black cast iron (`ST_IRON`), two riveted bands round it, a seam down it, soot
  streaked up it, rust bled from the bands; its domed top between his shoulders; an iron collar round his neck; great riveted
  pauldrons.
- HIS FIRE-DOOR on its front (`DOOR`): a grate of iron bars, his coals glowing through it an honest orange (`ST_COALS`, the props'
  own embers), brighter to white as he winds up (`heat`); the iron about it glowing a dull red (`ST_HOT`). Hinged on his left: it
  swings open (112 degrees) on its own as he scoops, bursts and dies, the fire within seen through it.
- HIS FLUE: a stove-pipe out of his back behind his left shoulder, banded, capped, up past his head, venting smoke and sparks
  (more as he breathes out, pouring out of him when he is spent). FIXED IN HIS BACK (6 Nov, after it was seen floating clear of him as
  he slumped in his old death): every point of it is fixed in the firebox's own frame (`FLUE`, `flueOf`), its foot set in the iron
  of the firebox's domed top, so that it tilts and moves with him whatever he does; standing, it is where it always was. As he
  bursts it is flung off with the rest of him.
- HIS ARMS AND LEGS, SCULPTED: muscle in wrapped leather under iron plates shaped to it: the pauldrons (a cop and three lames),
  a band round each upper arm, couters, vambraces, gauntlets; the skirt over his thighs, poleyns at his knees, iron boots with a
  toe and a heel (see "His body reshaped" above).
- HIS FURNACE MASK: the helm, its crown and crest, its heavy brow, the slits for his eyes, the jaw jutting with the GRILLE, the
  fire behind its bars, on a thick gorget sunk between his shoulders. From behind, iron only.
- THE GREAT SHOVEL (`SHOVEL`): an iron haft 60 from its D-grip to its socket, a broad scoop 27 long and 23 across with walls on
  three sides, bent up 22 degrees off the haft; its lip glowing from the fire. Always in his right fist (his fist runs down the
  haft to choke up on it, `hold`); his left fist takes the haft or lets it go smoothly, never leaping (worked out every frame).
- The enemy's pink rim round him while he lives; nothing cyan on him (tested).

His picture `ST_CANVAS` 560 by 440, his floor point at 272, 316. `trueBack`: from behind as the game truly sees him.

## His moves (src/art/stoker_moves.ts), and their numbers

Frames are the game's thirty a second; tiles are the game's (`TILE3`, 39.2 of his lengths). Every attack: a big held wind-up (his
eyes flaring gold, the warning), a strike of **two frames** smeared with its after-images (a swept band of the scoop's lip, the
lines of the arms), a big wind-down; and its area marked on the floor in the enemy's pink before it comes.

- HIS STAND (2.4 s, 24 frames at 10): heavy on bent knees, breathing: his chest rising 3, his weight shifting; his firebox's glow
  swelling and sinking; smoke puffed out of his flue as he breathes out; the shovel's scoop resting on the floor at his right.
- HIS WALK (`ST_PACE` **1.4 tiles a second**, 12 frames at 10, two steps): long heavy strides, his bulk dropping onto each foot as
  it comes down (soot puffed up under it; `ST_SHAKE`: the game's camera shaken **1 game pixel for 0.1 s** at each footfall), feet
  gripping the floor; the shovel dragged at his right, its lip scraping sparks off the floor; his left fist swinging.
- THE SHOVEL OF COALS (`attack`, `ST_COALS`, **3.1 s**, 93 frames):

| | |
|---|---|
| the door | flung open of itself, 0.1 to 0.28 s, sparks bursting out |
| INTO HIS FIREBOX | his fist run down the haft, the scoop driven into his own firebox by **0.38 s**, HELD and rocked, scooping, to **0.86 s**: the coals white-hot |
| out | torn out heaped; the door slammed 0.92 to 1.02 s |
| HELD HIGH | swung out round his right shoulder and up and back, the coals blazing over his head (his grip 124 up), his left arm flung out at you: **1.32 to 1.70 s** |
| THE MARKS | from **1.0 s**: where each coal will come down marked on the floor |
| hips first | 1.70 to 1.77 s |
| THE STRIKE | **frames 53 to 55** (1.77 to 1.83 s): whipped over the top in two frames, smeared; the coals flung at **1.833 s** (`hit`) |
| down | carried on down to the floor before him by 2.15 s; at his stand again by 3.1 s |
| THE COALS (`COALS`, art/stoker_fx.ts) | **seven**, arcing out (2.4 tiles high at the top), each coming down on its own spot round where the hero stood (`COAL_SPOTS`, out to 1.9 tiles from it) **0.62 s** after the hit, each 0.035 s after the last; thrown at a hero up to 8 tiles off |
| THE FIRES (`COAL_FIRE`) | each **1.2 tiles across** (0.6 round), a splash of sparks as it lands, burning **3.0 s**, dying over its last 0.8, then a smoking scorch |

- THE FIRE RAKE (`rake`, `ST_RAKE`, **3.0 s**, 90 frames):

| | |
|---|---|
| heaved up | turned away to his right, the shovel heaved up along his right side to high over his shoulder by 0.42 s |
| HELD | **0.42 to 0.90 s**, trembling; the arc marked on the floor before him from **0.3 s** |
| hips first | 0.90 to 0.97 s |
| THE STRIKE | **frames 29 to 31** (0.97 to 1.03 s): slammed down onto the floor at his right in two frames, smeared; the blade lands at **1.033 s** (`hit`) |
| THE DRAG | 1.03 to **1.50 s**: dragged round before him across **135 degrees** (`RAKE_ARC`, 75 to his right to 60 to his left), his whole bulk turning with it, fastest at first, sparks off the blade |
| THE SHEET OF FIRE (`RAKE_FIRE`) | fire springing up off the floor behind the blade as it passes each way (`rakePasses`): a band from **1.5 to 4.2 tiles** before him, burning **3.6 s**, dying over its last 1.0, then scorched. That floor is taken away; in close under him, or behind him, is safe |

- THE FURNACE BURSTS (`burst`, `ST_BURST`, **3.4 s**, 102 frames: HIS FINISHER, when he is low on life):

| | |
|---|---|
| wide | his arms flung wide (the shovel out to his right), his chest thrown out, his head back; his fire-door bursts open of itself 0.3 to 0.46 s |
| HELD, ROARING | **0.55 to 1.33 s**, his fire white-hot, shaking; marked from **0.4 s**: a ring round him, and its three gaps marked out along the floor |
| hips first | 1.33 to 1.40 s |
| THE STRIKE | **frames 42 to 44** (1.40 to 1.47 s): he hurls himself forward and down, smeared; the fire belches out of his door (out to 2.8 tiles) at **1.467 s** (`hit`) |
| THE RING (`RING`) | rolling out from **1.2 to 6.0 tiles** round him at **8 tiles a second** (0.6 s), 0.8 tiles deep; **three gaps**, 34 degrees each, at 60, 180 and 300 degrees off his forward (the way through); the floor it passed scorched and smoking 1.4 s |
| spent | to 2.2 s, heaving, his fire burnt low, smoke pouring out of him (the moment to hit him); the door clanged shut 2.55 to 2.75 s; at his stand by 3.4 s |

- STRUCK (`ST_REEL`, 0.4 s): jolted back, his door banged open a crack, sparks burst out of it.
- HIS DEATH: THE FURNACE EXPLODES (`ST_DIES`, the same as art/stoker.ts `ST_DEATH`; **4.2 s**, shown at the game's 20 frames a
  second; his pick of 6 Nov, “Furnace explodes (Recommended)”). No kneeling, no falling forward:

| | |
|---|---|
| struck | jolted back (0.1 s); staggering, his fire flaring; **the shovel let fall from his fist at 0.4 s**: it drops at his right and lies along the floor |
| HE STIFFENS UPRIGHT | by **0.6 s**: knees locked straight, chest thrown out, head flung back, arms rigid out from his sides, fists clenched; his feet never leave the floor |
| THE OVERLOAD, HELD | **0.3 to 1.45 s** (a second and more, the warning): his grate and every seam and band of his firebox glowing orange to white-hot (`heat` to 1.6), his firebox and its dome bulging (to 9 in 100 larger, throbbing), 22 rivets popping off its bands (each head torn off white-hot where it sheared, sparks streaming off it, a white-hot hole left where it was), JETS OF STEAM driven harder and harder out of his flue, his shoulders, over his door and his hips (`steamJet`: tight and white at the gap, swelling as they go into billows that slow and rise, each lit on its top and grey under, their edges soft and dithered, thinning to nothing), all of him above his knees shaking (`ST_SHAKE_DEATH`: 1.1 of his lengths, 15 a second); his eyes white-hot (no pink, no gold: an honest fire) |
| THE BURST | **two frames: 1.45 to 1.55 s** (Movement 9): the first his firebox cracking open white, a flash; the second, at **1.55 s** (`hit`), the blast |
| THE FIREBALL | from 1.55 s, painted pixel by pixel over all of him (`explosion`), so that every piece of him in it is hidden in it and seen only as it is flung out of it: A WHITE-HOT FLASH, jagged spikes of flame shooting out of it, white at their roots, orange to their tips (to **1.71 s**); then A BILLOWING FIREBALL, swelling and rising: 16 billows of fire of many sizes heaped on one another, each swelling out of the one behind it, their edges billowed again, smaller, rolling (no circle, no flat band), lit from within (white-yellow at its heart and at the middle and top of each billow, orange, red-orange at their edges, a dark crease under each billow where it rolls over the next), tongues of flame licking up off it, waving along their length and fraying at their tips; SOOT rolling over its top in billows, its underside lit red by the fire under it, eating in from its edges as it burns down; dark red and gone by **2.55 s**. THE SMOKE: a cloud of billows of many sizes climbing off the fire and rolling over and out at its top as a blast's smoke does (a roll each side: up its middle, out over its top, down its sides), each billow lit on its top and grey under, a dark crease where one rolls over another, the fire's red on their undersides while it burns, its edge soft and dithered, embers in it; a stem of billows climbing out of the fire into it; thinning from its edges in as it climbs and breaking up into wisps, **gone by 4.15 s**. Sparks streaking out of the blast, white-hot heads going red |
| THE SHOCKWAVE (art/stoker_fx.ts `BLAST`, `blastFloor`, `blastAt`) | a ring of fire and dust rolling out over the floor from 0.5 to **3 tiles** at 10 tiles a second (0.25 s), 0.5 tiles deep; the main chat may make it hurt or not (a hero within `deep` of its front as it passes). Where he stood the floor is left scorched, **1.2 tiles round**, to the end and after |
| FLUNG APART | **every piece a real piece of him, and each WHOLE, the thing it was on him** (`blastBits`, `wholeOf`): each pauldron with its three lames, each gauntlet with its vambrace, each couter with the band from his upper arm, each poleyn with its lames, each boot with its foot; his helm (its grille and eye-slits gone dark), his gorget, his flue, his fire-door (its grate going dark); his shovel, blown from where it lay; and **12 SHARDS of his firebox's iron**, torn out of it (`shardSkin`: a jagged plate, straight edges between sharp corners and torn notches, never round, a band and its rivets across it, the side that tore glowing as it flies and going dark). Each flung clear out of the fireball, all round it (`aimsOf`: spread round the blast in the order they were on him, each its own way and distance, so that none comes down on another; a clear way kept either side of the shovel, none on the gear), 28 to 59 of his lengths above where it starts, tumbling end over end once to thrice, TRAILING SPARKS AND SMOKE (pale close behind it, darker, wider and thinning behind), landing, hopping and sliding, **2.4 to 4.5 tiles from where he stood** (the shards 1.7 to 3.3, the shovel 3.4); then lying as the thing it was, seen from above (`layOf`): a pauldron, couter or poleyn rolled onto its side, the curve of its iron, its ridge and its rim up, its hollow beside; a boot fallen on its side, shaft and foot; his helm on the back of its crown, its brow, eye-slits and grille up; his door and the shards flat; the flue, the gorget and the shovel along their length, out from the blast. Through an open end the hollow of a plate is seen (`hollowSkin`: the inside of its wall lit on one side, going down into the dark, never a flat black lid; through a narrow band or lame, the floor, as through a ring). Smoking for 2.4 s. **Every piece down and still by 2.9 s** (`down`). His muscle, his leather and his skirt burn in the blast: **nothing of his body is left standing**, only the scorch and the scattered iron |
| THE GEAR | spinning out of the fireball as he bursts (1.55 s), flung high, clanging down onto its edge (0.7 s later), bouncing twice, rolled over flat and **lying glinting at `GEAR_REST` by 2.85 s** (88 of his lengths forward, 14 to his left: **2.25 tiles before him**, as before) |

## What his fire does on the floor (src/art/stoker_fx.ts)

`coalsFloor`, `rakeFloor`, `ringFloor` paint each on a picture with his floor point where it is, seen from in front or from behind
(`fxAt`: a spot in tiles along his forward and to his left, as the picture has it); `fxPainted(which, t, view, aim)` paints one
alone on `FX_CANVAS` (900 by 560, his floor point at 450, 260). `coalAt(i, since, from, aim)` is where coal `i` is in the air
(tiles, and up), and `coalInAir` paints one, a trail of sparks behind it. Marks in the enemy's pink (`FX_PINK`); fire the props'
own embers; crisp, nothing soft.

## The furnace room's pieces (src/art/stoker_room.ts), and their anchors

All through `STOKER_ROOM` (made the first time each is asked for and kept; `forgetMade()` lets them go, the main chat's rule), in
floor 3's own colours (look B: the prison's stone, black iron and rust, said again here and tested to be the same):

- THE FURNACE, `STOKER_ROOM.furnace(alongX, 'lit' | 'out' | 'going', frame)`: four tiles of a wall (`FURNACE`: 128 along it, 176
  up), as **a gate's strips** (art/gates.ts `Strip`: `t` tiles along the wall from its start, each strip anchored as the gate's
  arch strips are); its stone surround strapped in riveted iron, an arched iron mouth (72 across) with two doors of grates, a hood
  and a flue, the damper's rod out of its side toward the crank. Lit: roaring (6 frames at 10 a second, `FURNACE_ROAR`), its
  light `FURNACE_LIGHT`; going out: 16 frames over 1.6 s (`FURNACE_OUT`); out: cold, a thread of smoke.
- THE FORGE CRANK, `STOKER_ROOM.crank('missing' | 'set' | 'turning' | 'turned', frame)`: **a standing piece**, its floor point
  the anchor (`CRANK_CANVAS` 180 by 220, anchor 88, 170). A stone foot, an iron gearbox, a great wheel on its side, a train of
  three gears on its front: the middle one MISSING (its bare axle and the bright ring worn where it turned); SET IN (the wheel's
  handle glowing the cyan of what is the player's to use, as floor 3's levers do: its light in the sprite's `lights`); TURNING
  (18 frames over 1.2 s, the wheel 1.25 times round, the gears and the damper's rod turning: `CRANK_TURN`); TURNED.
- THE GEAR on the floor, `STOKER_ROOM.gearDropped(frame)`: lying flat, a glint running round it (8 frames at 8 a second,
  `GEAR_GLINT`), its middle the anchor (`GEAR_CANVAS` 48 by 32, anchor 24, 18). Lay it at `GEAR_REST` when his death ends.
- THE GEAR AS AN ITEM, `STOKER_ROOM.gearIcon()`: **32 by 32** at the heroes' grain, the middle the anchor, in the new items'
  style A (five tones, dark seams, the shadow down and to the right, the ink outline): a cog of blackened steel, a brass hub. **A
  quest item: a plain white rim** (Normal's, the game's own `RARITY_COLOR[0]`), no rarity of its own.
- THE FIRE IN THE CHAINED ONE'S WAY, `STOKER_ROOM.fireWall(alongX, 'burning' | 'going' | 'gone', frame)`: a wall of fire filling
  his gateway's way (his gate's own: art/prison_gate.ts, `prisonInWay`), **as his portcullis's strips** (the same plane and
  anchors: laid at the back of the arch, the portcullis drawn up), up to its crown (114); burning 8 frames at 12 a second, its
  light `FIRE_WALL_LIGHT`; going out 18 frames over 1.5 s, down to embers and smoke; gone: a bed of ash.

## How the main chat brings it in

(No stand-ins for the furnace quest were on origin/work-f4 when this was made: nothing named furnace, crank, gear or Stoker; the
names here are the art's own, for the main chat to match or rename.)

- HIM: `makeStokerArt()` gives `{ front, back }` as the game holds a monster: `idle`, `walk` (at `ST_PACE`), the attack clip (the
  shovel of coals, its `hit`), `clips.moves.rake` and `clips.moves.burst` (each with its `hit`), `reel`, `die`. Shake the camera
  `ST_SHAKE` as each foot comes down (the walk's left at 0, right at 0.6 s of each 1.2 s round).
- THE COALS: at `ST_COALS.mark` take where the hero stands as `aim` (tiles along his forward, and to his left) and keep it; at the
  hit seven coals fly (`coalAt`), each landing at `ST_COALS.hit + coalLands(i)` on `aim + COAL_SPOTS[i]`; a fire `COAL_FIRE.r`
  round burns there `COAL_FIRE.burns` s (the rules' damage: a hero within it as it lands, and while he stands in it).
- THE RAKE: from its hit each patch of `RAKE_PATCHES` (a way and a distance) catches as the blade passes it (`rakePasses`) and
  burns `RAKE_FIRE.burns` s; a hero standing on a burning patch is burnt.
- THE BURST, only when he is low on life (a suggestion: below a third): from its hit the ring's front is `ringAt(since)` tiles
  out; a hero within `RING.deep` of it as it passes, and not in a gap (`inGap`, degrees off his forward), is struck once.
- Draw each with the painters above at his floor point (the ring's far and near halves can be split, `ringFloor(..., half)`, to
  sort with the hero).
- HIS DEATH: play `die` (4.2 s); under it, at his floor point, lay his death's blast on the floor (`blastFloor`, from his
  death's start: it begins at `ST_DIES.hit`); if the shockwave is to hurt, a hero within `BLAST.deep` of `blastAt(since)` as it
  passes. At its end lay the gear (`gearDropped`) at `GEAR_REST` as the thing to pick up (his death's last frame shows it lying
  there); the scattered pieces lie in his death's last frame for the game to fade; carried, the gear is the item `gearIcon()`.
- THE ROOM: the furnace lit in the side area's wall; the crank beside it, `missing` until the hero brings the gear, then `set`
  (ready, glowing); used: `turning` (1.2 s), then `turned`; then the furnace `going` (1.6 s) and `out`; and in the Chained One's
  gateway the fire `going` (1.5 s) and `gone` (the way open).

## The checks (tests/stoker.test.ts, 13; all pass, the 11th at nothing)

1. the switch off; nothing of the game imports any of the four files;
2. EVERY MOVE THROUGH EVERY BOSS CHECK (art/boss_checks.ts `checkBoss`: SLIDE, FLOOR, ARM, THROUGH, JERK, JUMP, BLOW, HIPS, ALIVE,
   STRIKE), every frame of all seven moves, from in front and truly from behind, and every handover: **nothing found**;
3. HIS LIGHTNING STRIKES: each of the three in two frames, landing on the second; smeared then and in no other frame;
4. every frame both ways round: nothing cyan, the pink rim while he lives and none as he dies, crisp;
5. nothing cut off; 6. nothing of him in the floor (his boots on their toes, every piece of him as it flies and lies, the gear as it rolls flat);
7. the shovel in his fist in every frame he holds it, his left fist on its haft when it holds it; his eyes the enemy's pink; his
   fire an honest orange; the coals blazing on the shovel held high;
8. his size (twice the knight), his walk, each attack held a third of a second and more, each marked before it comes; the coals',
   the rake's and the ring's numbers; the gear out of his grate only as he dies, lying flat where it rests;
9. what his fire does on the floor, painted both ways round: crisp, no cyan, nothing cut off, marked in pink before it comes (no
   fire yet), fire after, burnt out at the last;
10. the furnace room: every picture painted and crisp, no cyan but the crank's handle when it is ready; the furnace lit and out and
    going out (dying down), the fire in the way and its going out and gone; the icon 32 by 32 with its white rim; floor 3's colours
    the same as art/prison.ts's; the made copies let go by `forgetMade`;
11. NOTHING OF HIM THROUGH WHAT HE WEARS (new, 6 Nov; the Veteran's check, done for a figure of solids; at the coordinator's
    word a STRICT ZERO, after his word on the Brawler, 3 Nov 18:07, “Well first off the brawlers knees are clipping through his
    pants which is against the rules which I reminded you to follow multiple times”): every frame of every move, from in front,
    from behind and FROM EITHER SIDE (his solids truly turned), painted part by part; every pixel of his muscle that is seen (the
    nearest there of all his parts) put back where it is on him, put on the muscle it is on, and asked (art/stoker.ts `coverOf`)
    whether it is outside the iron of a plate laid over that muscle (it would come through it), or a point of his thigh above his
    skirt's hem: **not one pixel, in any frame, from any of the four sides.** And the check is shown to see it: muscle swollen out
    past the top of his pauldron's cop is found, and not under it; a point of his thigh above the hem is under the skirt.

**How it is held at nothing** (6 Nov, second pass): every plate is A TRUE SOLID (`Plate`, `armPlates`, `legPlates`): cut from an
egg painted as a ball, so that every pixel of it is as near the eye as it truly is (the tube-shaped plates were lengths of cloth,
whose nearness the painter only guesses at: it was there that slivers of muscle showed), and made big enough that the muscle under
it is inside it wherever it is iron (`enclosing`: rays from its middle over all its iron, each 0.8 to 0.9 of his lengths past the
muscle). So: the pauldron's cop and three lames, the band round the upper arm, the couter's cup, the vambrace (now down to 0.86 of
the forearm, into the gauntlet), the poleyn's cup and its lames above and below the knee, the boot's cuff in two (its top flared).
His skirt is laid over his thighs as they are posed (never closer in than their muscle and 3.2 of his lengths of slack), and his
thighs are painted only below its hem (and a little up under it): what the skirt covers is not painted, so nothing of them can
show through it from any side.

12. NOTHING OF HIM FLOATING (new, 6 Nov; his rules: nothing floating, nothing detached, loose things follow): in every frame of
    every move till he bursts, his flue's foot set in his firebox's domed top, and, painted part by part from in front and from
    behind, every pixel of his flue joined to his firebox through his own parts; the check is shown to see a flue lifted clear of
    him;
13. HIS DEATH, THE FURNACE EXPLODES (new, 6 Nov): the overload held a second and more, the burst in two of his death's frames,
    landing on one; whole till the burst, nothing of his body after it; his right fist on the shovel's grip till he lets it go
    (0.4 s), then the shovel lying still on the floor till the burst; every piece of him (28: the 14 whole things he flies apart into, the 12 shards, his shovel and the gear) down by
    2.9 s, lying on the floor (its lowest point within a length of it) and still to the end; no pink or gold in his death's
    pictures or their lights from the overload on, both ways round; the fireball as he bursts; the blast on the floor (its ring
    of fire as it rolls, its scorch at the end, no fire left in it) crisp, no cyan. His death also goes through every boss check
    (2: struck, staggering and stiffening, his feet gripping, nothing jerky), and through 4, 5 and 6 (crisp, no rim as he dies,
    nothing cut off, nothing in the floor) in every frame.

**The boss checks' head** (`stokerSolids`, art/stoker_moves.ts): the head is now the helm as it is painted (`helmOf`: its middle
1.5 below the helm's own and 0.7 forward, 10 deep, 11.2 wide, 11 high), and the neck the gorget (8 thick, was 6.5). Every boss check
still finds nothing.

Also passing: tests/bosses.test.ts, tests/new_mobs3.test.ts, tests/palace_hands.test.ts, tests/princess.test.ts,
tests/prison.test.ts, tests/rime_shade.test.ts; `tsc --noEmit` clean. Changed outside its own files: only the import checks,
`tests/bosses.test.ts` (tests 1 and 12: its lists of mock-ups built on the bosses' own footwork and checks) and
`tests/new_mobs3.test.ts` (its list of mock-ups built on the new monsters), each told of the Stoker's files as of every mock-up
before them. No shared engine file touched; art/prison.ts and art/prison_gate.ts are not imported by the room (their colours and
the gateway's way are said again in it, and tested to be the same), so floor 3's own import check stands as it was.

## Tools

- `npx tsx tools/stoker_pics.ts body <dir>`: the pieces of `stoker_body.png` on the body as it is (painted once on the body as it
  was, from `c440351e`, into another dir); then `python3 tools/stoker_body_sheet.py <before dir> <now dir> stoker_body.png`.
- `npx tsx tools/stoker_pics.ts look|big <dir> [...]`: frames to look at; `sheet <dir>` then `python3 tools/rime_shade_sheet.py
  <dir> stoker_sheet.png` and `python3 tools/rime_shade_sheet.py <dir>/two stoker_sheet2.png` (the sheet in two, each short enough
  for his phone; the death's cells are measured to hold all of each moment, and it stops if anything would be cut off);
  `film <dir> [parts]` then `python3 tools/hush_shapes_film.py <dir> stoker.mp4`.

## For him to decide (the art chat's to ask)

- THE FINISHER: the furnace's burst, its ring with three gaps to step into (the thing to learn to read). When it comes (below a
  third of his life suggested), and whether the gaps stay where they are marked or turn each time.
- HOW HARD: seven coals with 3 s fires; the rake's band 1.5 to 4.2 tiles burning 3.6 s; his walk 1.4 tiles a second (heavy, but he
  covers ground). Each is one number.
- A HINT, NOT DRAWN: the gear could be glimpsed glinting among the coals behind his grate while he lives, so you know what he has.
- THE CRANK'S HANDLE glows the player's cyan once the gear is set in (as floor 3's levers do when they are yours to pull).
- The knight stands still in the film (a stand-in for size); the room is a stand-in laid from floor 3's own floor and walls.
