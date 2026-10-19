# Floor 11, the Gate Ward: its art (mock-ups, handed back to the main chat)

The art chat's branch `mockup/act2-gateward`, from `main` at 99a128c. Nothing here is in the game until the main chat
puts it there. Begun on his word in the art chat for floors 11 to 15, 18 Oct 2026: "I’d like you to
read the art chat and the art rulebook and begin design on levels 11-16"; his picks: "11–15 now, 16 once planned
(Recommended)" and, where to start, "Floor 11 whole first".

The measure is the planning chat's Act 2 doc ("Wordsmith Act 2: The Hush (Levels 11–15)", with his yes as ideas) and
its posts on the chat board (the Crier's brass speaking-trumpet, the Bells, the Knell).

**WHAT HAD HIS OWN YES, AND WHAT WENT AHEAD ON HIS WORD.** The ground, the fifty pieces, the Crier, the pigeons and the
Hushed townsfolk each had his own yes to pictures and films. Then, at 21:24 Pacific: "Hey go without my say so.  If
something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15". The Hushed watch (to its brief
his picks; its look and films after them), the Silent Order's scribes and the mute watch hounds (their briefs this chat's,
the picks it would have marked recommended) were made on that word and sent him as they were made; so was the
quietening of the colours below (Colour 4). Whether that word stands as his yes for the game is for the main chat to
settle with him (the board, 00:27 Eastern, 19 Oct).

## Its ground (src/art/gateward.ts; painted by src/art/terrain.ts)

`gateWardLook(land, mode)` and `gateWardPaintFloor(land, mode)`: the house fronts are the walls (a grey stone storey, a
jetty, oak and plaster, each house its own colours, casements, a few candle-lit), the tops their roofs (clay pantiles
and slate, plot by plot); setts in the lanes, a kerb of slabs at every house's foot; the squares in flags round a
ring of setts (`land.squares`); the siege's leavings. Rise 150 (`GW_RISE`), edges straight. To the first picture his
words: "It looks great, but I don’t like the big wood floors open.  Can we make it so the fronts of any building you
can go into is there, but once you enter, the wholefacade fades to transparent so you can see inside?"; made so, his
pick "Yes, on to the pieces (Recommended)". Of the square: "The open squares should be like at least 2x that size",
then "Bigger still" (30 by 27 in the dev page).

HIS RULE, ART RULEBOOK PLACES 9 (on this branch): a house you can go into stands whole from the street; once the hero
steps inside, its whole front and roof fade to clear in about a third of a second, and come back as he leaves. His
words: "Let’s make this a rule for rooms and buildings to go into.  The walls are transparent once you go into them.  Or look into them?", and asked
when, "Let’s try when you step inside, but remind me in a couple days to revisit this
topic" (a reminder is on his phone for 20 Oct).

FOR THE MAIN CHAT: a level gives its houses walked into (`GWHouse`: the room, its front's row or column, its doorway).
Paint the ground from `gateWardPaintFloor(land, 'open')` with `gateWardLook(land, 'open')`; each house's SHELL is
`houseShell(open, closed, house, paintTerrain)` (`closed`: `gateWardPaintFloor(land, 'closed')` with
`gateWardLook(land, 'closed')`): lay it over the ground and over whatever stands inside the house, under whatever
stands outside it, and fade it while the hero is in the room or the doorway. Painting cost: about 84 ms a piece of
256 by 256 picture pixels. `gateWardRidge(x, y)` says where a roof's ridge runs (for the pigeons).

`tests/gateward.test.ts` (6): nothing of the game imports it; every walkable tile's middle is floor, every other tile a
house but a front walked into; a house's shell lies over its own tiles and roof only; two pieces side by side are one
picture; every pixel opaque; nothing cyan or pink that could be taken for a glow, and every colour duller than every
word (a lit window's candlelight aside).

## Its fifty pieces (src/art/floor11.ts `gateWardPieces()`, the Crier's 25; src/art/act2_set.ts `hushSetPieces()`, the Hush's set of 25 for floors 11 to 15)

Built in the Act 2 kit (src/art/act2_kit.ts) as Act 1's pieces are (floor 4's Scene, the `Piece` of art/floorkit.ts).
The Crier's: the market (stalls whole and smashed, the cart barricade, produce, grain, a handcart), his rostrum, the
notice board, the town well, the herald gagged, a firepot's crater burning (a trap), the market bell gagged (the
Bells' Muffled Bell), bunting, guild signs blotted, the city gate broken, the crier's gate, the watch's alarm horn
(a trap), the crier's last proclamation (the quest), the three small Bells (a wayside shrine's, a shop's doorbell, the
watch's alarm bell: quiet, awake, rung), paper lanterns, the maypole, a horse trough, hay. The Hush's set: street and
wall lamps, barrels, crates, a crate of stolen voices, the Order's banner, chimneys, shards of the dome, rubble, the
Order's hooded lantern, its rack of jars, the carters' cart, blank paper, the Order's ink bars, an ink spill, blank
proclamations pasted, washing, a drain grate, a cellar's hatch, a house's door, a tavern table, the hearth, a bed, a
dresser, a jar of the Hush (a trap). With his yes, each set shown him as it was made.

WHAT GLOWS (Colour 3): the enemy's pink burning to gold on the cult's and the Order's own (the firepots, the dome's
shards, the city gate's scorch, the horn, the stolen voices, the Order's lanterns, jars and cart, the drain, the jar of
the Hush); an honest fire orange (lamps, lanterns, the hearth); the hero's cyan only on the Bells, awake or rung (his
to ring, as the waypoints are); the quest's own pale light. Nothing else gives light.

CHANGED SINCE HE SAW THEM (this hand-back, on his 21:24 word): COLOUR 4. Every colour of the ground and the pieces is
quietened to at most 0.46 of full colour (HSV saturation), where the dullest of the nine words is at 0.5
(art/act2_quiet.ts: hue and brightness kept; what glows left as it is). The clay roofs, the oxblood awnings and the
brass are a shade greyer; side by side with the pictures he saw, the square looks the same. The bottle green is a
little greener (it read as cyan in shade). Six pieces were cut off at their canvas's edge and were made bigger:
the city gate, the watch's alarm horn, the wayside shrine's bell, the shop's doorbell, the maypole, the jar of the
Hush. The Order's ink bars are laid on the floor, bigger (kind `on the floor`, not `floor tile`), their spatter in
clumps.

`tests/floor11.test.ts` (7): nothing of the game imports them; 25 and 25, each its own name; only what may give light
gives it, in its own colour; crisp, no loose pixels; nothing cyan but the Bells', no hot pink but the enemy's own, and
every other colour duller than every word; what stands stands on its foot (a trap's throw allowed further); nothing cut
off at a picture's edge.

## Its moment around the hero (src/art/floor11_moments.ts `gateWardMoments()`)

His pick: "Pigeons burst off a roof (Recommended)"; to the film, "Yes, as shown (Recommended)". Nine pigeons on a
roof's ridge burst up as the hero passes, swoop out low over the street and wheel away over the rooftops; feathers
settle on the roof. Built as floor 2's ravens are; lay it on a roof whose ridge runs along x (`gateWardRidge`).
`tests/floor11_moments.test.ts` (6). Film: `previews/gw_pigeons.gif`.

## Its boss, the Crier (src/art/crier.ts, crier_moves.ts, crier_shots.ts; behind `CRIER`, off)

His look and every move have his yes; his board post to main of 18 Oct, 17:44 Eastern, says all of it (the swing, the
Silent Shout's cone 7.4 tiles out and 80 degrees wide, the Proclamation's lane 2.5 tiles wide, the Crowd's call, his
death). `CRIER_MOB`, `makeCrierArt()`; `CR_CANVAS` 470 by 450 at (224, 330). `tests/crier.test.ts` (8).

## Its mobs (his picks, 18 Oct: "The Hushed townsfolk (Recommended),The Hushed watch (Recommended),Silent Order scribes,Mute watch hounds")

His word on the act's enemies, that afternoon: "I’d like no not reuse any enemies from the previous act"; "So
some of the new enemies can be used throughout the next 10 levels."; "But let’s keep the acts separate". So these are
the city's own, fit to turn up anywhere on floors 11 to 20, and nothing of Act 1's.

Each is a monster as the game holds one: the first three on the heroes' bones (art/new_mobs3.ts `Mob`, its
`ActorArt` by `mobSet`), every move and handover through every boss check (art/boss_checks.ts), from in front and
behind; the hounds on their own four-legged solids, as Act 1's deer and wolves are. Behind their switches, off.

| | THE HUSHED TOWNSFOLK | THE HUSHED WATCH | THE SILENT ORDER'S SCRIBES | THE MUTE WATCH HOUNDS |
| --- | --- | --- | --- | --- |
| Files | art/hushed.ts, hushed_moves.ts | art/hushed_watch.ts, hushed_watch_moves.ts | art/scribes.ts, scribes_moves.ts, scribe_shots.ts | art/hounds.ts |
| Switch | `HUSHED_ON` | `WATCH_ON` | `SCRIBES_ON` | `HOUNDS_ON` |
| Art | `makeHushedArt3(mob)` | `makeWatchArt3(mob)` | `makeScribeArt3()` | `makeHoundArt()` |
| Kinds | porter, goodwife, baker | watchman, sergeant | one | one |
| Size | the knight's height | a head taller | the knight's height | its back at his hip |
| Canvas | 200 x 200 at (100, 150) | 360 x 300 at (180, 214) | 220 x 210 at (110, 160) | 200 x 150 at (96, 112) |
| Stand | 28 frames at 10 a second | 32 at 10 | 30 at 10 | 36 at 15 |
| Walk | a shuffle, 10 at 8, 0.9 tiles a second | a trudge, 12 at 8, 0.8 | a glide, 10 at 10, 1.0 | a lope, 8 at 16, 2.4 |
| Blow | the lunge and grab: 1.4 s, the warning 0.22 to 0.42, the hands clutch shut at 0.6 | the halberd sweep: 1.8 s, the warning 0.32 to 0.62, the blade crosses before them at 0.8, low and wide from their right to their left | the ink flick (from afar): 1.36 s, the warning 0.32 to 0.5, the ink leaves the quill at 0.63 | the pounce: 1.2 s, the warning 0.2 to 0.42, the forepaws slam down at 0.6 (held a tenth) |
| Struck | 0.4 s | 0.4 s | 0.35 s | 0.45 s (held 0.05) |
| Death | the Hush leaves them, 2.2 s | the gag falls, they kneel, 2.6 s (the halberd drops at 0.5, the helmet at 1.96) | the mask splits, the pages fly, 2.4 s (the mask's halves at 0.32, the quill at 0.36) | the gag off, a silent howl, it lies on its side, 2.0 s |
| Their mark | grey breath from the open mouth | the Order's black gag, the breath seeping round it | a blank white mask, the cult's pink in its slits | the Order's black gag round the muzzle |
| His word | his brief picks, his yes to the look and the films | his brief picks; made on his 21:24 word | made on his 21:24 word | made on his 21:24 word |
| Test | tests/hushed.test.ts (7) | tests/hushed_watch.test.ts (8) | tests/scribes.test.ts (9) | tests/hounds.test.ts (15) |

THE SCRIBES' INK (art/scribe_shots.ts, in the game's own pixels, as art/crier_shots.ts): `drawInkMark` (as the quill is
drawn back, a pink ring closes in on where it will land), `drawInkFlight` (the gob in its arc, `INK_FLIGHT` 0.36 s),
`drawInkSplat` (the splash, and a pool of ink that dries away over `INK_POOL_FOR` 2.4 s, `INK_POOL` 0.62 tiles across).
How far they throw and what the ink does to the hero are yours.

WHAT IS YOURS for all four: how hard each blow hits and how far (the watch's sweep reaches about two tiles before them;
the hounds' forepaws about half a tile), how many come and where, and the hounds' place at the watch's heels.

## Films and pictures

`previews/hushed/`, `previews/watch/`, `previews/scribes/`, `previews/hounds/` (walk, attack, reel, die, stand);
`previews/crier/`; `previews/gw_pigeons.gif`. Dev pages: src/dev/preview_gateward.ts, preview_crier.ts,
preview_hushed.ts, preview_watch.ts, preview_scribes.ts, preview_hounds.ts.

## Changed outside its own files

src/art/bosses3.ts (the footwork helpers exported, as on mockup/headsman-redo); tests/bosses.test.ts,
tests/new_mobs3.test.ts, tests/crier.test.ts, tests/hushed.test.ts (the import checks told of these mock-ups);
docs/art/RULEBOOK.md (Places 9, his).

## Checks

tsc clean; each file's own test above; the whole unit suite on the hand-back head (its count on the board). NOT RUN:
the regression, a real phone.
