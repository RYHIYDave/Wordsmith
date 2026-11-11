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
