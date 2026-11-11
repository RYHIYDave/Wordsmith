# THE ENDLESS TOWN, STEP 1: TEN TOWN IDEAS AS MOCK-UP SKETCHES (PICTURES ONLY; NOT IN THE GAME)

Branch `art/endless-town`, cut from `main` (25.3.2). The art chat, 11 Nov 2026. Nothing of the game imports any of it
(`tests/endless_town_options.test.ts` holds that), so no switch is needed.

## His words

His queue item, added by him on 11 Nov 2026 at 10:31, titled “Draw a new “Endless” town for endgame purposes”: “A town that is different from the two we currently have, with all the bells and whistles needed for the endless run.  I’d like maybe 5 different towns, they can be themed after the current levels, or new designs, but I want one for the new town, then the rest will be unlockable or purchasable.  I need mockups until they’re locked in, then drawn to the standard of the game”.

Asked in this chat whether to start it, by 10:55: “Yes, start the Endless town (Recommended)” (offered as: I begin with mock-ups: a few different town ideas as phone pictures for you to pick from).

Read as: (1) a NEW TOWN the hero comes home to in endless mode, unlike the game's two towns (the prison town, `game/level.ts` TOWN, and Act 2's camp inside Vellum's gate, `game/camp.ts`); (2) it holds everything an endless run needs; (3) about FIVE town designs in all: one is the endless town, the other four are looks to unlock or buy later; (4) MOCK-UPS FIRST, until he locks them in; only then drawn at the game's standard. This is the first mock-ups.

## The list: what a town for endless needs

So that every sketch has a place for each thing. The rules are the main chat's; this is only where each thing stands.

What the towns have now (`game/level.ts` TOWN, `game/state.ts` Station, `ui/town.ts`):

| station | who stands there | what the player does there |
| --- | --- | --- |
| smith (the smithy: forge, anvil, rack) | the armourer | buys and sells weapons and armour |
| bazaar (the tent and its table of wares) | the mystic | buys and sells jewellery, potions, magic gear |
| wordsmith (his ring of runes and stone slab: the bench) | the wordsmith | wordsmithing: burns words into gear |
| lexicon (the book on its lectern) | nobody | reads the words he has found |
| stash | nobody | stores gear, shared by all his heroes |
| stranger (leaning in the shadows) | the stranger | gambles for unknown gear |
| gate | nobody | sets up to three words on the next dungeon, and goes in |
| waypoint | nobody | in endless, it takes him to the endless level he reached |

What endless adds (his words of 7 Nov 2026 and his picks then, in docs/handoff.md):

- **The socket in the wordsmith's bench** for the round stone tablet (the four quarters dropped by the bosses of floors 5, 10, 15 and 20 in endless). Drawn in every sketch as an empty round hollow cut in four on the slab, labelled `socket`. The tablet itself is not drawn.
- **The portal's place**: where the portal to the final boss opens once the tablet is set. Drawn in every sketch as a round of floor kept clear, ringed with low posts, labelled `portal`. The portal and the boss are another item: not designed here.
- **The way down into the next floor** (the waypoint, labelled `way down`), each town giving it its own shape: a stair down a shaft, a ramp into a pit, a well in the water, a hole in the ice and so on.
- **The shared stash** (already the town's stash): a fallen hero's quarters are kept there, so it stands where it is easy to reach.

PROPOSED (not asked for; for him to say yes or no):

- **record**: a tall stone notched at every endless level he has reached: how deep he has gone, at a glance.
- **trophies**: a wall of four mounts, one for each of the four bosses whose quarter he holds (shown with two filled).

## The ten (`src/dev/endless_town_options.ts`)

Painted in the game's slant at night by torch and lamp, rougher than the game; every station of the list in each, marked by its word. Five themed after the game's own floors, five new designs.

1. **THE SHAFT'S RIM** (new): the town round the head of the stair with no bottom (his splash): every floor lies under it, and the portal waits out over the drop.
2. **QUARRY TERRACES** (floor 6, the Quarry): three steps of hewn stone climbing to a crane under the stars; the way down a ramp into the pit.
3. **THE STILT TOWN** (floor 10, the Sunken Fen): each station on its own platform over black water, lanterns doubled in it.
4. **THE READING HALL** (floor 15, the Great Library): indoors, walls of books to the dark, the Lexicon on a great desk in the middle, a stair down through the floor.
5. **THE TOWER TOP** (floor 20, the Quiet Tower): a round roof in the clouds under a huge moon, the stair down in its very middle.
6. **THE STONE BRIDGE** (new): a street of houses along a bridge over a chasm, the gate at its far end, a cage let down off its side.
7. **THE ISLE OF STONES** (new): a small isle in a still sea under the northern lights (green and violet, never cyan), all of it inside a ring of standing stones.
8. **THE SWAN GARDEN** (floor 16, the Swan Gardens): hedge rooms round a long pool with the moon in it, a white pavilion at its head kept clear for the portal.
9. **THE BELL FOUNDRY** (new): a cavern lit from the casting pit, a bell bigger than a house hung over it; the way down is into the pit.
10. **THE FROZEN MERE** (new): stalls and tents on a frozen lake in falling snow round one fire; the way down a hole cut in the ice.

The art chat's pick for the endless town: **1, The Shaft's Rim** (it is the splash he chose, made a place: the way on is always there in the middle). For the four to unlock or buy: **4 The Reading Hall, 7 The Isle of Stones, 9 The Bell Foundry, 3 The Stilt Town** (indoors, open sky, firelight, water: each unlike the others).

## The pictures (for his phone)

`pictures/options_1.png` to `options_5.png`, 1200 x 1420 each, two sketches in each one above the other, numbered 1 to 10, each with its name, where it is from and its line. Made by `node tools/endless_town_options.mjs` (page: `src/dev/endless_town_options_page.ts`).

## His picks on the ten sketches (11 Nov 2026, by 11:12)

Shown the five pictures and the ten named, and told that the record stone and the trophies wall were the art chat's own
suggestions, he was asked three things:
- “Which of the ten sketches should be the Endless town itself (options_1.png to options_5.png)? Tap one, or type another
  number.”: “1 The Shaft's Rim (Recommended)”.
- “Which other town sketches should I keep as the towns to unlock or buy later? Tick any, or type the numbers you want (2, 5, 6,
  8 and 10 are the rest).”: he ticked “4 The Reading Hall (Recommended)”, “7 The Isle of Stones (Recommended)”, “9 The Bell
  Foundry (Recommended)” and “3 The Stilt Town (Recommended)”, and wrote: “I want 2, 5, 8, and 10 as well.”
- “The sketches have two additions of mine: a record stone (how deep you've gone in endless) and a trophies wall (the bosses
  whose tablet quarters you hold). Keep them in the town?”: “Keep both (Recommended)”.

SO: THE ENDLESS TOWN IS 1, THE SHAFT'S RIM. KEPT AS TOWNS TO UNLOCK OR BUY LATER, EIGHT: 2 Quarry Terraces, 3 The Stilt Town,
4 The Reading Hall, 5 The Tower Top, 7 The Isle of Stones, 8 The Swan Garden, 9 The Bell Foundry, 10 The Frozen Mere. NOT
KEPT: 6 The Stone Bridge (he did not name it). The record stone and the trophies wall go in (what they show and when is the
main chat's to write). His note asked for “mockups until they’re locked in, then drawn to the standard of the game”: next is
a closer mock-up of the Shaft's Rim; the eight others stay as sketches until he asks for each.

## Step 2: the Shaft's Rim, closer, as the player would see it (11 Nov 2026)

Pictures first: a mock-up for him to lock the Shaft's Rim in from. Dev page `src/dev/preview_shaft_rim.ts` (commands in its
header); nothing of the game imports it (`tests/endless_town_options.test.ts` holds that too).

**The pictures** (`pictures/`): `rim_whole.png` (1200 x 714: the whole town, every station marked by a small word);
`rim_view_1.png` to `rim_view_3.png` (1014 x 528 each: one phone screen held sideways, 507 x 234 game pixels at the game's
own zoom, the camera on the knight as the game holds it, a caption under): 1 at the wordsmith's bench and its socket, 2 at
the brink looking over the way down and the portal's place, 3 at the gate with the record stone and the trophies wall.

**At the game's own scale**: a tile is 32 x 16 game pixels, every game pixel two picture pixels, as in the game. The paved
rim is a round 16 tiles across (radius 8 about tile 12, 12), about the size of the prison town's floor (16 x 14 tiles);
the shaft's mouth is 7.6 tiles across in its middle; past the rim, rough rock, and at the back a round cliff (the great
hollow the shaft is sunk in). On a phone held sideways the town nearly fills one screen, as the towns do now.

### The layout (tiles on the game's grid; the shaft's middle at 12, 12)

- **the way down**: the waypoint (the game's own, awake) at tile 12, 7, on the brink at the back right, where the stair
  leaves the rim and winds down the shaft's wall. The player goes down by stepping onto it, as with every waypoint now; the
  stair is how it looks.
- **portal's place**: a stone tongue out from the brink on the left (about 8, 12) to a round landing over the drop (its
  middle about 10.3, 12.2), ringed with low posts, kept clear. The portal is not drawn.
- **gate**: tile 7, 6, at the back, facing the shaft across the whole town: three empty word sockets on its lintel.
- **record**: tile 5, 9, beside the gate on the left; **trophies**: tile 10, 5, beside it on the right (four mounts, two
  filled in the mock-up). With the gate they make the back of the town, the first thing past the pit.
- **smith**: the forge at 18, 8 (the rack, trough, anvil and armourer laid round it as the game's TOWN lays them), right.
- **bazaar**: the tent's back at 18, 12, the mystic at 18, 13, the table at 18, 14, opening toward the front right.
- **wordsmith**: at 10, 17, the bench at 10, 18 with THE TABLET'S SOCKET cut in its top (an empty round hollow in four),
  the six stones round them as the game has them: front left, near the brink, the town's brightest cyan.
- **lexicon**: 7, 15, and **stash**: 5, 14, beside the ring on the left (the cyan things together).
- **stranger**: 4, 11, alone at the far left by the cliff, in the dark between torches.
- Six of the game's braziers round the edge, four torches on posts; a kerb of posts round the brink, open where the stair
  leaves and where the tongue goes out. The front of the rim is left open: room to walk round the pit.

**Why so**: the eye goes to the pit first (the middle, the darkest and the deepest, the stair's pale treads and the far fire
in it); everything a run needs is on the rim within a few steps of the brink; the way down and the portal both open off the
brink itself.

### How it differs from the game's two towns

The prison town is a hall: four walls, the gate in the back wall, the stations along the walls and the middle open floor.
Act 2's town is the camp inside Vellum's gate: an open yard among streets and houses. The Shaft's Rim is round, with no
walls of its own, and its middle is a hole: everything stands round the edge of a pit, under a cliff, at night by fire,
with the friend's cyan only at the ring, the Lexicon, the stash and the waypoint, and the enemy's pink burning to gold
only far down in the shaft.

### What is the game's own, and what is new (to be drawn at the game's standard)

The game's own pictures, as they are (in the rim's stone through `makeTownProps(theme)`): the forge, rack, trough and
anvil; the tent, its table and rug; the wordsmith's ring, slab and six stones; the Lexicon; the stash; the waypoint
(awake); the braziers; the armourer, the mystic, the wordsmith and the stranger; the knight.

New, painted here as a mock-up, still to be drawn at the game's standard:
1. the rim's paving (rings of slabs round the mouth) and the rough rock past it;
2. the cliff round the back;
3. THE SHAFT: its far wall storey under storey of every floor's stone (the splash's), a doorway and a torch in each, the
   stair winding down from the brink, the dark, the far fire;
4. the kerb and its posts at the brink;
5. the portal's tongue and round landing with its posts;
6. the gate standing free, its three word sockets;
7. the record stone (notches);
8. the trophies wall (four mounts, the bosses' heads);
9. THE TABLET'S SOCKET cut into the wordsmith's slab (the slab itself the game's);
10. the torches on posts.

### For the main chat

- A town to come home to in endless: where the hero wakes and where the waypoint leads back to, while a run is on (when it
  takes over from the camp, and whether it is the town from then on).
- The record stone's rules (what it counts, a notch a level or a mark every five) and the trophies wall's (which mount for
  which boss, filled while the quarter is held).
- The socket: setting the four quarters into the bench; the portal opening on the tongue's landing; the boss.
- The eight other towns as looks to unlock or buy (his “unlockable or purchasable”): how they are won is not settled.

### For him to decide

- Whether this is the Shaft's Rim to draw for real (the layout and the mood).

## His yes on the Shaft's Rim's layout (11 Nov 2026, by 11:50): LOCKED IN

Shown `pictures/rim_whole.png` and `rim_view_1.png` to `rim_view_3.png` (at df0da3ff), told where each station stands and that
the paving, the wall, the gate, the record, the trophies and above all the pit were still rough, and asked “Is the Shaft's Rim
laid out right for the Endless town (rim_whole.png and the three views)?”, he answered: “Yes, lock it in and draw it
(Recommended)” (offered as: this layout and mood get drawn to the game's standard, the pit first).
SO THE LAYOUT AND THE MOOD ARE LOCKED. Next: drawn to the game's standard, the pit and the ground first, then the new things
that stand on it.

## Step 3: the Shaft's Rim's ground, drawn to the game's standard, the pit first (11 Nov 2026)

GAME ART NOW, BEHIND A SWITCH THAT IS OFF: `src/art/shaft_rim.ts`, `ENDLESS_TOWN = { on: false }`. Nothing of the game imports
it yet (`tests/shaft_rim.test.ts` holds that). The layout he locked in is unchanged, every station on its tile. One change
from the mock-up: THE PIT'S MOUTH IS 3.5 TILES ACROSS ITS RADIUS, NOT 3.8. At 3.8 one of the wordsmith's six standing stones
(tile 11, 15: the game's ring round his tile 10, 17) stood over the drop. At 3.5 it stands on the kerb.

**The pictures** (`pictures/`):
- `pit_phone.png`, 1014 x 1036: the pit at the game's zoom, then the same twice the size.
- `rim2_whole.png`, 1200 x 714: the whole town on the new ground, no labels.
- `rim2_view_1.png` and `rim2_view_2.png`, 1014 x 528 each: two phone screens at the game's zoom with the knight, at the brink by the way down and on the portal's landing.
- `rim2_measure.png`, 948 x 1124: the measure check (below).

The dev page is `src/dev/preview_shaft_rim.ts`, with modes `pit`, `whole2` and `view2:1` / `view2:2`.

### What was drawn

Painted the way the splash is painted: every picture pixel is a line of sight, and what it meets first is worked out from its
numbers. Two picture pixels to a game pixel; flat tones, a one-pixel seam, light in bands, and a dither only where two bands meet.

- **THE PIT.** We look at its far wall from the rim, in the game's slant. The wall goes down storey under storey, 28 game
  pixels a storey, in each floor's own stone in the splash's order: the town's, the prison's, the canyon's, the fen's, the
  High City's, the quarry's.
  - Each storey has a ledge at its head and courses of blocks.
  - Below the top storey each storey has a doorway (the prison's barred) with a torch beside it in an iron cup. The doorways
    are set about the middle of the far wall, where the eye can see that deep.
  - THE STAIR winds down round the inside from where it leaves the brink, beside the way down. It takes two storeys a turn
    in 28 steps. Each tread is shaded where the step above throws its shadow, its nosing is lit, and its inner edge shows.
    The wall under it is in its shadow.
  - The light falls off with every storey until the depth is lost in the dark. The torches down the shaft light their own
    patch of wall.
  - Far below, where only the middle of the far wall can be seen, the enemy's pink burning to gold, dim. It is inside the
    shaft only and lights nothing on the rim.
  - The near wall is under the eye and not seen; the brink's edge is.
- **THE BRINK.** The kerb: dressed stones with a seam between each and a lit inner lip. Its posts go all the way round,
  except where the stair leaves and where the tongue goes out.
- **THE PORTAL'S TONGUE AND LANDING.** Dressed slabs out over the drop, a slab's thickness seen under their edge. The round
  landing has a ring of kerb and a ring of low posts. It is kept clear: the portal is another job.
- **THE RIM.** Worn flags laid in rings round the mouth, each flag its own length and its joints wandering. Some flags are
  cracked or sunk, there is grit and soot as on the Gate Ward's streets, and the paving darkens toward its edge, which is
  broken, not ruled.
- **PAST THE RIM** is rough rock. At the back a round cliff in courses of rough stone fades up into the dark.
- **THE LIGHT.** Night. The warm pools on the paving are the game's own lights: its braziers, and the torches on posts (the
  game adds a light over the ground as it does now). The only other glow is the friend's cyan where the game's own things
  have it.

### How it is given to the game (as the camp gives its place, art/hub2_camp.ts)

- `rimPlace()`: the tiles, 24 x 24. `walk` per tile: 0 rock or cliff; 1 floor (the paving, the tongue and landing, and the
  rough rock just past the paving); 2 THE PIT, not walkable. `town` is where each of the game's own things stands, by the
  game's kinds (forge, rack, trough, anvil, armourer, tentBack, mystic, tentTable, rug, wordsmith, runeSlab, runeRing, the
  six runeStones, lexicon, stash, stranger, waypoint, six braziers). `more` is where the new things stand (gate, record,
  trophies, four torches). `hero` is where he stands as he comes in.
- `paintRimGround()`: THE GROUND, ONE PICTURE painted once. It is 680 x 388 game pixels, 1360 x 776 picture pixels (about
  4.2 MB as a canvas). Its top left is at `gx, gy` in game pixels, with tile 0, 0 at 0, 0 as the game counts them.
- THE KERB'S AND THE LANDING'S POSTS (`rimPosts()`, 27 of them: 21 round the brink, 6 round the landing, none across the tongue): one small picture (`paintPost()`, 8 x 18 picture pixels),
  laid in depth like any piece.
- WHAT MOVES: THE TORCHES' FLAMES down the shaft (`shaftTorches()`, the two the eye can see), 12 small frames
  (`paintFlame(f)`, 8 x 16 picture pixels each) at 30 a second, each torch at its own phase. THE FAR FIRE (`paintPitGlow()`)
  is one picture of its light, 318 x 80 picture pixels, added over the ground at `pitGlowAt(t)` of its strength: a slow
  breath, a 2.6 s round, changing every frame at 30 a second with no new picture.
- **What it costs, measured** in this session's headless Chromium (not on his phone): painting the ground took 572 to 830 ms
  (seven paintings); the posts, the 12 flames and the far fire's picture took a few ms more. Painted once, under the loading
  screen as the town loads, the ground then costs one picture laid down a frame. Or bake it to a file: it is plain numbers,
  `groundAt(px, py)`.

### Held to the measure (his word of 9 Nov: the Gate Ward and the Brawler)

`rim2_measure.png` puts a piece of the Gate Ward (floor 11, from the game, a phone held sideways, 844 x 390) beside a piece of
the rim and the pit at the same size (the view brought to the same 844 x 390), each the same 316 x 166 enlarged three times
alike. They have the same grain: flags the same size on the screen, a seam of one pixel, flat tones, light in bands. Neither
is finer. The rim is a step lighter than the Gate Ward's streets: a town is lighter (his rulebook), and the braziers' pools
are the game's own lights. The pit's wall courses are a little bigger than the Gate Ward's house stone; they are the splash's
storeys, seen from across a shaft.

### Still to draw (the next step works from this)

1. THE GATE, standing free, its three word sockets (the mock-up's rough one stands in the pictures).
2. THE RECORD STONE, its notches.
3. THE TROPHIES WALL, four mounts and the bosses' heads.
4. THE TABLET'S SOCKET cut in the wordsmith's slab (the mock-up's rough one is drawn over the game's slab).
5. THE TORCHES ON POSTS (four).
6. Perhaps: the way down's waypoint in the rim's stone, and the pit's lower storeys for a taller screen.

### For the main chat

- Lay it as a third town from `rimPlace()` and `paintRimGround()`, behind `ENDLESS_TOWN`: when it is the town (in endless,
  while a run is on), where he wakes, and what the waypoint leads back to.
- The pit is not walkable (`walk` 2): what happens at its brink is yours. The kerb has no posts where the stair leaves, but
  the stair is a look; the way down is the waypoint.
- The cost: one ground picture of about 4.2 MB, painted in under a second here. Paint it under the town's loading screen, or
  bake it to a file.
- Still yours, as before: the record's and the trophies' rules, the socket, the portal and the boss, the eight other towns
  as looks to unlock or buy.

### For him to decide

- Whether the ground and the pit are right (the pictures above).

## Step 3b: the pit mended (11 Nov 2026; he had not been shown step 3)

Looked at close, step 3's pit did not read. Its stair was a few big blocks along the top of the far wall, and its far wall was
one brick colour. The paving, the cliff, the kerb, the posts and the portal's landing stay exactly as they were. Only the
shaft is new. The five pictures are made again under the same names; this section replaces step 3's account of the pit.

- **THE STOREYS, A PICTORIAL CHEAT AS THE SPLASH'S OWN.** Seen from the rim, the storeys are rings, each lower one smaller (by
  0.72 a storey) and lower down the screen, closing toward a point by the front lip. Each storey is shallower and dimmer than
  the one above. THREE ARE SEEN BEFORE THE DARK, each in its own floor's stone in the splash's order: THE TOWN'S (warm grey),
  THE PRISON'S (blue-grey), THE CANYON'S (red-brown). The fen's below them is only just seen before the dark takes it. Each
  storey has a ledge at its head, lit, with a seam of shadow under it, and five courses of its own blocks.
- **THE STAIR, EACH STEP ITS OWN.** It leaves the brink by the way down and goes leftward round the far wall, down a storey a
  flight. Each flight is FOUR STEPS, then a landing, and so on down and round until the dark has it: three flights (twelve steps)
  and three landings are seen, the lowest flight dim and partly behind the portal's landing. Every step is a block of its own: a lit tread with its nosing lightest, a dark riser down to the step
  below, a seam at its end, and its shadow on the wall under it. The flight reads as one stair going down, not as posts.
- **A DOORWAY ON EACH LANDING**, in the wall of its storey: a dark arch ringed with its stones, its sill lit; the prison's
  barred. **ITS TORCH** stands on its iron bracket on the wall beside the doorway, a little up the stair, its flame one of the
  12 frames. Three torches in all, one to a landing. None floats: the torch that seemed to float at the bottom (a fourth
  storey's, on the near side) is gone.
- **THE FAR FIRE**: as it was, dim, inside the shaft only, below the fourth storey, where the dark has all.
- **COST**: the pit is still part of the one ground picture, and it is cheaper to paint now (no line of sight to follow): the
  ground took 167 to 267 ms in this session's headless Chromium (eight paintings). The flames are the same 12 frames.
- **THE PICTURES AGAIN**: pit_phone.png (its twice-size half framed on the pit, the stair, the three storeys and their doors
  all in it), rim2_whole.png, rim2_view_1.png, rim2_view_2.png, and rim2_measure.png. The measure check is as in step 3: the
  rim and the Gate Ward have the same grain.
- **THE TEST** (tests/shaft_rim.test.ts) now also holds that the pit shows at least three storeys lit before the dark.

## Step 3c: the stair thrown away and built again (11 Nov 2026)

HIS WORDS ON STEP 3b, by 12:26. Asked “Is the pit and the ground of the Shaft's Rim right (pit_phone.png)?”: “The pit needs
more”. Asked “What more should the Shaft's Rim's pit have? Tick any that fit, or tell me in your own words.”: “The stairs are
really bad”. He faulted nothing else, so the storeys, their stone, the doors, the torches, the kerb, the landing, the paving
and the wall stay. Step 3b's stair was a side view of a stair pasted on a curved wall: thin, steep, a jagged zigzag. It is
gone.

**THE STAIR NOW: A WINDING STAIR OF BROAD WEDGE TREADS SEEN FROM ABOVE** (`TREADS`, `stairPixel`, src/art/shaft_rim.ts):
- **The treads:** a helix of stone treads round the shaft's inner wall. Each is a wedge reaching 0.9 of a tile out from the
  wall toward the middle and a sixteenth of the way round wide, laid on the rings at its own depth, so lower treads are smaller
  and dimmer like the storeys.
- **What is seen of each tread:** its top, lit. A dark riser along its back, where it drops from the tread before it, so the
  rhythm reads lit top, dark riser, lit top. A worn, lighter nose along its leading edge. The dark face of its free end under
  it. Its free end is a little uneven. The nearest tread wins where they overlap. There is no rail.
- **Where it starts and how gently it drops:** at the brink by the way down, where the kerb is open, the first tread at the
  rim's own level in the town's light. It goes leftward round the far wall and on, about 0.06 of a storey a tread (one or two
  game pixels at the top).
- **ONE STOREY A TURN, NOT HALF A TURN.** The doors stay where they were, and a stair that comes to every doorway's sill must
  take one turn and a little (6.6 radians) for each storey.
- **Landings:** at each doorway's sill there is a LANDING, a slab three treads wide, with the door above it and its torch
  beside it. There are three, at the foot of the town's, the prison's and the canyon's storeys.
- **It comes round again:** on every storey, crossing the far wall once a turn, lower, smaller and dimmer. Above the dark
  three turns are seen (the town's, the prison's, the canyon's), with a fourth in the fen's just before the dark. Of 71 treads
  in all, 22 treads and the 3 landings fall on the far side above the dark.
- **Hidden parts:** the near side of each turn is under the eye and not drawn. Under the portal's tongue and landing the stair
  is hidden.
- **Other changes:** to leave the doors room between the turns, the rings close a little faster (0.62 a storey, was 0.72)
  and the doorways are a little lower (0.58 of a storey). A torch a tread would hide is not lit.
- **Cost:** the ground took 423 to 519 ms to paint in this session's headless Chromium (four paintings; the treads are
  looked through for every pixel of the pit). That is more than step 3b's 167 to 267 ms and still under step 3's.
- **The test** now also holds: at least 40 treads and 3 landings; every tread lower than the last; every tread on the far
  side above the dark lit; under the portal's tongue and landing the stair is hidden.
- **What still reads weakest:** at the game's size the top turn reads plainly as broad steps going down and round from the
  way down. The turns below read more as stepped rings than as the same stair going on, because where each turn passes from
  one to the next it is on the near side, under the brink.

## Step 3d: the treads made narrow and many (11 Nov 2026; he had not been shown 3c)

Step 3c's stair was built the right way, a helix of wedge treads seen from above, but each tread was a sixteenth of a turn,
a slab more than a tile long. It read as stepped rings, an amphitheatre. The fault was in step 3c's brief. Only the treads
are changed; everything else stays.

- **Narrow and many:** 46 TREADS TO A TURN (7.8 degrees each). At the top turn a tread is about 11 game pixels along the wall,
  a step the knight could take. The reach from the wall stays at 0.9 of a tile. 216 treads in all; 19 are seen on the top
  turn's far side, and 85 on the far side above the dark.
- **Each drawn simply:** the top lit, neighbouring tops a hair apart; ONE dark line (one picture pixel) for its riser where it
  drops from the tread before; ONE light line for its nose. The steps touch. The free ends make a clean stepped inner edge,
  with the dark face under them.
- **The drop:** one storey a turn, as before (the doors fix it). That is about half a game pixel a tread at the top turn,
  steady with no jumps; the far pass of a turn comes down about half a storey.
- **The landings:** three treads wide (about a tile), at the doors.
- **The lower turns:** the same fine rhythm, smaller and dimmer with their storeys.
- **Cost:** the ground took 261 to 337 ms in this session's headless Chromium (five paintings). Each pixel now looks only at
  the treads near it.
- **The test:** at least 150 treads, 44 to 48 to a turn; the rest as in step 3c.
- **What still reads weakest:** at the game's size the top turn reads as a fan of narrow steps round the far wall from the
  way down. Because it drops only half a pixel a tread, its going down is seen in the lower turns rather than step by step.
  Where one turn passes to the next on the near side it is under the brink.

## Step 3e: the stair slopes (11 Nov 2026)

HIS WORD ON STEP 3d (pit_phone.png and rim2_view_1.png). Told the stair was now a fan of narrow treads kin to his splash's,
and that each turn dropped so gently it was seen going down turn by turn more than step by step, he was asked “Is the Shaft's
Rim's stair right now (pit_phone.png)?” (offered: yes, draw the rest; make it slope more; still not right). He answered, by
12:54: “Make it slope more” (offered as: the stair drops visibly across the far wall on each turn, so you see it going down).
The treads as they were stay: 46 to a turn, a lit top, one riser line, one nose line, touching.

- **Each pass comes down a whole storey on the far wall,** like the thread of a screw. It starts at the right at the head of
  its storey (the top pass at the rim's own level, by the way down, where the kerb is open) and reaches the left at its foot,
  FIFTEEN STEPS. At the top pass a step drops 1.5 to 2.2 game pixels (about 2 on average), and the pass comes down a whole
  storey, about 30 game pixels at the far wall's middle. One pass is on the town's stone, the next below it on the prison's,
  the next on the canyon's, each smaller and dimmer. The left end of the top pass goes under the portal's tongue and landing,
  hidden.
- **Round the near side** it runs level back to the right, so every storey's pass starts again there. That part is under the
  eye and not drawn.
- **One landing on each pass,** three treads wide and level, with its doorway in the wall behind it and its torch beside it.
  On the town's and canyon's passes the landing comes after six steps (about the far wall's middle). On the prison's pass it
  comes after three steps, a little to the right, so that each doorway stands clear of the pass above it. The top storey's
  doorway is lower (0.31 of a storey, the others 0.5): its landing is only a little under the brink.
- **The test** now also holds: each of the top three passes has at least 15 steps and comes down more than 0.9 of a storey,
  and on the top pass every step is at least 1.5 game pixels below the last at the far wall's middle.
- **Cost:** the ground took 266 to 281 ms in this session's headless Chromium.
- **What still reads weakest:** the canyon's doorway is small and dim, partly under the pass above. Where each pass hands on to
  the next it is on the near side, under the brink, so a finger has to pick up the next pass on the right below.
