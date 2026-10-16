# Act 1, The Descent (floors 6 to 10) as one version: the build's working notes

Written by the main chat as it builds (from 16 Oct 2026, 11:21, his words: "Read all relevant chats and put
levels 6-10 into the game"). Nothing here is live until he has seen it from the game and said yes.

## His words while it was being built

- 16 Oct 2026, 11:21: "Read all relevant chats and put levels 6-10 into the game".
- Asked whether word melding goes on with it: "Yes I want word melding on".
- Asked to attach the GitHub repository: "Yes connect".
- Mid-build: "New Queen should be done soon" (the art chat's new Carrion Queen; she was handed back at 11:32 and
  is the one used: the old one, art/carrion_queen.ts, is not in the game).
- 16 Oct, 14:00, after the usage limit reset: "Go".

## Where the work is

- Branch `act1` (from main a60d618, fast-forwarded to the art chat's `mockup/queen-redo` d398e55, which holds
  floors 6 to 10 and the new Queen as handed back; `meld/words` merged in: acbae5c).
- The descent's own monsters and bosses were built by helpers of this chat, each on a branch of its own
  (`act1-mobs-a`, `act1-mobs-b`, `act1-mobs-c`, `act1-boss-a`, `act1-boss-b`, `act1-boss-eye`), merged here.

## How it is built

1. THE FLOORS (game/act1.ts, act1_layout.ts, act1_level.ts): each floor of the descent is made out of doors, by
   its own map-maker: a chain of open areas joined by lanes (the Quarry's pits, the Ledge Road's trail along the
   drop, Echo Canyon's switchbacks, the Pinewood's meadows over the river, the Fen's islands and boardwalks),
   a side area or two, a lair, the cult's stronghold (one or two), the boss's ground at the far end. Its look is
   the art chat's terrain painter (art/terrain.ts and each floor's look), painted in pieces as the camera goes
   (render/outdoor.ts); the Ledge Road and the Fen have the sky behind.
2. THE DRESSING (game/act1_dress.ts; render/act1_pieces.ts): every floor laid with its own 25 pieces, the cult's
   camp and its strongholds, by the art chat's mock-ups (the open water of the Fen on its mock-up's own grid);
   the tops of the cliffs, the forest and the water dressed for the eye. Its light: out on the open ground, the
   day, thin or none, as the mock-ups have it (game/act1.ts `light`).
3. THE WAYS: the waypoint where each floor begins (to town and back); THE WAY ON, the waypoint's own picture
   waking at the far end of the boss's ground as he dies: walked into, the next floor; from the tenth, home to
   town ("The siege is broken."). The Prison cleared up floor 5's shaft, the town's waypoint takes him on to
   floor 6 ("Waypoint: to The Quarry, Level 6").
4. THE BOSSES OUT IN THE OPEN: no gate falls behind the hero; the boss waits until he comes into his ground
   (or within 6 tiles of him), then says his line and his name comes up, as a boss whose gate has fallen.
   Their lines (new, for his yes with the pictures): the Unfinished "The chisel never finished me." / "Stone
   does not tire." / "Lie still. Be carved."; the Carrion Queen screeches; the Cantor "Hear the hymn." / "Your
   echo is mine now." / "Sing with me. Scream with me."; the Hollow Stag bellows; the Drowned Eye "You are
   seen." / "Drown." / "The siege is my dream. Sleep in it."
5. THE STRONGHOLDS (game/act1_holds.ts; Game's strongholds; ui/town.ts altarSide): two rare guards of the cult
   before the door (a mini fleshmancer and a dagger cultist, as the mock-up stood them; one always carries a
   word); the altar, opened with the use button beside the inventory as the town's gate was, takes up to three
   spare words (taken back free until the door is opened; given back if he leaves the floor first); OPEN THE
   DOOR burns them and breaks the seal; through the door into the hall (in the redoubt's stone); there, the
   first time, a yellow pack of four of the floor's own medium kind round the half-cut obelisk, every one with
   the words burned at the door, a quarter harder for each past the first; all four dead: runedust (2, 4 or 6
   for 1, 2 or 3 words), gear (1, 2 or 3 pieces) and gold; out by the threshold at the middle of the hall's
   near side.
6. THE DESCENT'S OWN KINDS (game/act1_rules/, art/act1_figs/, render/act1_fx/): each kind in a file of its own,
   run as the bosses of floors 2 to 5 are (game/bosses.ts BossRules: a gait and acts, each act one of its
   pictures' moves, its blow landing at its picture's moment). A kind not built is stood in for by the cult's
   dagger cultists; a boss not built, by the Warden.
7. WORD MELDING ON (game/melds.ts MELD), and quest items given by using the one they are for (defs.ts HAND_IN).

## Calls made (to tell him)

- The strongholds of floors 7 to 10 use the Quarry's gatehouse, court and altar and the redoubt's hall (the
  waystation's gate on floor 8), as the set's; their own ideas (a watchtower, a palisade camp...) are not drawn.
- One of the two guards always carries a word, so the word the door asks for can be won at its foot.
- Runedust 2, 4, 6 for 1, 2, 3 words; the hall's pack a quarter harder for each word past the first.
- The way on is the waypoint's own picture; the act's end is a line, "The siege is broken." (the dome
  shattering, the bells and the rout of the camps are not built).
- The day's light on the outdoor floors is lighter than first built, to match the mock-ups.

8. THE REVEAL: the town far below under the cult's dome (the eyrie mock-up's painter, moved unchanged from
   src/dev/preview_eyrie.ts to art/ledge_town.ts) is painted once into the land of the Ledge Road's sky, out over
   the drop past the edge of the Queen's eyrie nearest its middle; it slides with the sky (half the ground's
   slide), and the low clouds pass in front of it.

## Runedust and the Meldstone drawn (16 Oct, from 17:40)

His words, 16 Oct 2026, 17:40: "Runedust and the meldstone need to be done". Read as (told him so): both still had
the planning chat's stand-ins; drawn properly now, lying, dropping, taken, the Meldstone carried and given, big
and wild, behind a switch that is off (MELD_DROPS, art/meld_drops.ts), pictures and films to him first.

- RUNEDUST: rune stone ground to glittering grit in the friend's cyan, chips of its stone in it; three heaps by how
  much (1 or 2, 3 or 4, 5 and more). It bursts up out of the floor in a fountain as it drops; taken, it whirls up
  round the hero and pours into him. The small picture beside the gold and on the melding page is the new heap.
- THE MELDSTONE: two halves of two rune stones (ash and slate), each with half a rune, fused along a crackling
  seam of the friend's light; it hangs over the floor, turning, its halves straining apart and snapping back.
  It bursts up out of the Fleshmancer's pit as it shuts (the rules hold it, and his runedust, under the floor
  while he is dragged down: game/melds.ts STONE_RISE, on only with the switch); taken, it leaps over the hero,
  wrenches apart, slams together (the screen kicks, a beat held) and dives into him; carried, it shows by
  INVENTORY; given, it splits over the wordsmith's slab, its halves whirl and slam together, and from then on
  it circles the column of light over his slab (my call: the sign that he can meld).
- Where and when: render/meld_drops.ts (riseOf, takenOf, givenOf, orbitAt); events 'dustGot', 'stoneGot',
  'stoneGiven' (state.ts). Tests: tests/meld_drops.test.ts. Films: tools/scenarios/meld_drops_film.mjs,
  tools/meld_drops_films.py.
