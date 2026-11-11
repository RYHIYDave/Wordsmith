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

## Not yet asked of him

- Which one is the endless town, and which four are the others.
- Whether the two proposals (record, trophies) go in.
