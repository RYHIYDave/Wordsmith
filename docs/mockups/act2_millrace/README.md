# Floor 13, the Millrace: its art (mock-ups, handed back to the main chat)

The art chat's branch `mockup/act2-millrace`, from floor 12's hand-back `mockup/act2-undercity` at 645904f (itself from
floor 11's `mockup/act2-gateward` at 9a14016, from `main` at 99a128c). Nothing here is in the game until the main chat
puts it there. Every switch is off; nothing of the game imports any of it.

The measure is the planning chat's Act 2 doc ("Wordsmith Act 2: The Hush (Levels 11–15)", with his yes as ideas): level
13, THE MILLRACE, "Out a side gate and along the river, following the night carts."; its layout "fields left overgrown
through the siege, the river with little bridges, a water wheel, and a paper mill"; its hazards "the mill race's fast
water, and the turning wheel"; its palette "Gold fields, river blue, white sheets"; its enemies "the Silent Order's
carters, and the Hushed working the fields"; its boss the Palimpsest, "A giant of wet, layered pages, written and scraped
and written over", on the Pulping Floor.

**ALL OF FLOOR 13 WENT AHEAD ON HIS WORD, NOT ON A YES OF ITS OWN.** His words to the art chat, 18 Oct, 21:24 Pacific:
"Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15".
So its ground, its 25 pieces, the Palimpsest, its two mobs and its moment were each settled in the art chat (the pick it
would have marked recommended) and sent him as pictures and films as they were made. He has not answered any of them
yet. Whether that word stands as his yes for the game is for the main chat to settle with him (the board, 00:27
Eastern, 19 Oct). And his words of 18 Oct on the act's enemies: "I’d like no not reuse any enemies from the previous
act"; "So some of the new enemies can be used throughout the next 10 levels."; "But let’s keep the acts separate".

## Its ground (src/art/millrace.ts; painted by src/art/terrain.ts)

`millraceLook(land)`, from what only the level knows (`MillLand`, each optional): `river(x, y)` and `race(x, y)`, how far a
place is from the river's or the mill race's middle, in tiles; `raceFlow(x, y)`, which way the race runs (toward the
wheel); `track(x, y)`, how far from the middle of the nearest cart track; `yard(x, y)`, whether a place is in the mill
yard. The river's water reaches `MR_RIVER_HALF` 0.62 tiles either side of its middle, then mud and stone banks and
reeds; the race's water `MR_RACE_HALF` 0.34, then its kerb of dressed stone, white chevrons of foam racing along it.

THE FLOOR is the fields gone over: gold corn standing and leaning, green weeds through it, poppies (a dull brick red,
never the cult's pink), cornflowers and yarrow; gold stubble where it was trodden; the cart tracks two ruts of churned
mud with grass down the middle; the mill yard worn setts. NO WALLS, as the Pinewood: past the fields the rough pasture
goes on at the fields' height, tall, dark, brambles in it (the hedges, trees, the mill and its wheel are pieces). The
water is painted at the fields' height too, on tiles that are not floor (the river, the race), and on a walkable tile
under a footbridge, its piece laid over it; so nothing need be laid behind the ground. Its colours all through
art/act2_quiet.ts (Colour 4), as floors 11's and 12's are. Nothing in it glows.

`tests/millrace.test.ts` (5): nothing of the game imports it; walkable tiles floor (the fields, a track, the yard, a
footbridge's crossing), every other tile not; pieces side by side are one picture; every pixel opaque; nothing cyan or
pink, every colour under the dullest word's, and its own palette (gold the most of what is walked on, the river's blue
there to see).

## Its 25 pieces (src/art/floor13.ts `millracePieces()`, the Palimpsest's)

His rule of 10 Oct, 14:54: "Going forward, let’s do 25 that are the theme of the 5 levels, then 25 for each boss." The
Hush's 25 for floors 11 to 15 came with floor 11 (src/art/act2_set.ts); these are the Palimpsest's. Built in the Act 2
kit (src/art/act2_kit.ts), as floors 11's and 12's are:

the paper mill (its drying loft louvred, a lamp in its window), the water wheel (trap: its paddles strike what is in the
race beside it; four frames a quarter of a paddle apart, looking along +y or +x), the race's headgate (gate: shut or
lifted), drying lines (two frames: whole, and half there while someone is behind them, his doc's "go see-through, like
the mystic's tent"), a vat of pulp, the stamping mill (trap: at rest, the warning, falling, struck), the screw press,
reams bound for the city, bales of rags, barrels of the Order's ink, emptied jars (each breakable: whole and broken),
spilled pulp (on the floor), a footbridge over the race and the cart bridge (floor tiles, along x or y), the mill bell on
its gable (the Muffled Bell: gagged by the Order with black cloth and chains, or rung), a farm bell on its post (the
Bells: quiet, awake, rung one way and back), a scarecrow gagged, stooks of corn (breakable), a hay wain abandoned, a
pollard willow, a hedge (along x or y), a field gate (gate: shut or open, across x or y), sheets blown into the corn (on
the floor), the mould and deckle, a page half made (the quest: the first page the Order made of the city's voices, the
words swimming in its wet pulp), a cracked millstone.

WHAT GLOWS (Colour 3): the enemy's pink burning to gold only in the vat of pulp (the voices not yet drowned); the mill's
window lamp an honest orange; the hero's cyan only on the farm bell, awake or rung; the quest's own pale light. Nothing
else gives light.

`tests/floor13.test.ts` (7): nothing of the game imports them; 25, each its own name; only what may give light gives it,
in its own colour; crisp, no loose pixels; nothing cyan but the Bells', no hot pink but the enemy's own, every other
colour duller than every word; what stands stands on its foot, a floor tile inside its diamond; nothing cut off at a
picture's edge.

## Its boss, the Palimpsest (src/art/palimpsest.ts, palimpsest_moves.ts; what it throws, src/art/palimpsest_shots.ts; behind `PALIMPSEST_ON`, off)

A HUNCHED GIANT OF WET PAPER, built 110 tall standing straight (the knight 58), hunched like a great ape, its arms so long
its fists hang by its knees: sheet on sheet of wet paper plastered over each other, every one written over in the Order's
black ink; where one has peeled, OLDER WRITING beneath it, brown on yellowed vellum; deep in the oldest of it the stolen
words, burning the enemy's pink. Two great fists of grey pulp, bigger than its head, dripping slurry. A small head sunk
between its shoulders, a page plastered over its face like a mask, two holes torn in it with the pink burning through,
the Order's black bar of ink struck across where a mouth would be. A crest of loose leaves stands up off its back. 163
pages on it. On the heroes' bones (art/skeleton.ts), as the Crier is. `PALIMPSEST`, `makePalimpsestArt()`; `PA_CANVAS`
520 by 470 at (250, 350).

WEAR, his doc's "Every hit peels pages off and shows older writing underneath": `WEAR.now`, from 0 (whole) to 1 (half its
pages gone, the old writing and the burning words showing all over), the game's to set by its life.

| Move | Clip | Timings (seconds from its start) |
| --- | --- | --- |
| Stand | idle, 32 frames at 10 (3.2 s) | hunched, heaving, its weight rolling from foot to foot, its fists dripping |
| Lumber | walk, 12 frames at 8, `PA_PACE` 0.8 tiles a second | slow heavy strides, the body rolling over each foot, the fists swinging |
| THE PULP-FIST SLAM | attack, 2.1 s, `PA_SLAM` | a dip, then both fists hauled up over its head, joined, rearing back, by 0.42; held there trembling, the stolen words burning up through it: THE WARNING 0.42 to 0.78; hips first from 0.82; THE BLOW at 27/30 (0.9); the fists in the floor at 29/30 (0.97), their middle about 1.55 tiles before it; held there to 1.3; heaved back up, upright by 2.1 |
| PAPER CUTS | moves.cuts, 2.8 s, `PA_CUTS` | it crouches and spreads its arms; 78 of its pages lift and stand out, their edges glinting pink: THE WARNING 0.22 to 0.7; they TEAR OFF at 0.75 and are flung out by 1.05 into a whirl round it, edge on, between 1.12 and 2.55 tiles from its middle (`PA_WHIRL`), about 1.25 turns a second, as it sways and stirs them round; they fly home from 2.2 and lie on it again by 2.55 |
| LOOSE LEAVES | moves.leaves, 2.2 s, `PA_LEAVES` | it rears back, chest out, arms flung back, by 0.38; its crest stands up and shakes, the leaves' edges glinting: THE WARNING 0.38 to 0.8; it heaves forward and the seven leaves TEAR OFF at 0.86, folding into paper birds that flap up off it; out of its picture at 1.2 (the game's from there); the crest grows back 1.45 to 2.05 |
| REWRITE | moves.rewrite, 3.0 s, `PA_REWRITE` | it crouches low by 0.5, fists planted, head bowed, the words in it burning; in its own picture fourteen pages lying about it set off one every 0.1 s from 0.5, each crawling 0.75 s and climbing onto it 0.3 s (the last on it at 2.85); it rises from 2.1, up by 3.0 |
| Struck | reel, 0.45 s, `PA_REEL` | rocked back at 0.06; seven pages torn off its front at 0.04, thrown down about it by 0.4, the older writing under them showing |
| Death | die, 3.4 s, `PA_DIES` | rocked back at 0.08; its pages slough off it from its crown down, 0.12 to about 1.6, and fall about it; its crest's leaves fall 0.15 to 0.75; the stolen words rise out of it 0.3 to 2.4, pink going pale as they go free; its knees give from 0.7 and hit the floor at 1.2; it sways on them to 1.8; it falls forward onto its fists and its face, down at 2.3; the pink out of it by 2.4; it slumps into a low heap of old wet paper and pulp 2.15 to 3.05; still to 3.4 |

WHAT IT THROWS AND LEAVES (src/art/palimpsest_shots.ts, in the game's own pixels, as art/crier_shots.ts and
rat_king_shots.ts): `drawSlamSplash` where the fists come down (cracks, grey pulp and scraps thrown out
`SLAM_SPLASH_REACH` 1.3 tiles, a ring of slurry; `SLAM_SPLASH_FOR` 0.7 s); `drawFallenPage`, a page torn off it lying on
the floor (the game keeps them there for its Rewrite); `drawBurningPage`, such a page touched by the hero's fire: it
curls, blackens from its edges in, flames an honest fire's orange, and is ash in `PAGE_BURN_FOR` 0.8 s (his doc, "Fire
words shine here"); `drawPageHome`, an unburned page crawling home to it, `PAGE_HOME_SPEED` 2.2 tiles a second;
`drawLeafBird`, a paper bird flapping, `BIRD_SPEED` 5 tiles a second, the game's to fly at the hero; `drawBirdMark`,
through a bird's warning a ring of the enemy's pink closing in where it will strike (`BIRD_MARK_FOR` 0.5 s).

`tests/palimpsest.test.ts` (9): the switch off and nothing of the game importing it; every move and handover through
every boss check (art/boss_checks.ts), from in front and behind: 0 findings; every frame painted both ways round, nothing
cyan, its pink edge while it lives; nothing cut off, its whirl too; nothing of it in the floor; its pages (worn, struck,
whirled and home again, the crest, the strays); the pink in its eyes while it lives, gone once down, and down a low heap;
the stolen words rising as it dies; what it leaves on the floor.

## Its mobs

| | THE HUSHED IN THE FIELDS (small) | THE SILENT ORDER'S CARTERS (medium) |
| --- | --- | --- |
| Files | art/fieldhands.ts, fieldhands_moves.ts | art/carters.ts, carters_moves.ts |
| Switch | `FIELDHANDS_ON` | `CARTERS_ON` |
| Art | `makeFieldArt3(mob)`: `FIELD_REAPER`, `FIELD_GLEANER` (`FIELD_ALL`), each a `Mob` on the heroes' bones | `makeCarterArt3()` (`CARTER`, a `Mob` on the heroes' bones) |
| What | floor 11's Hushed (their body, skin and breath), here the farm folk outside the walls, still reaping at nothing, mouths working on words that make no sound, the Hush leaking out of them. A REAPER (an oatmeal smock-frock, a battered straw hat, leggings bound with cord) and a GLEANER (a deep sunbonnet, a russet bodice, a long skirt, a sacking apron with a lap of ears). Grown men and women. Each a sickle. | the Order's men who drive the night carts of stolen voices out to the mill: the Order's blank white mask (the scribes' and dredgers'), dull pink in its eye slits, under a black hood and a broad-brimmed black hat; a short black cape over a long leather coat; gauntlets, breeches, tall boots; a hooded night-lantern at the left hip, its flame the enemy's pink (the voices burn in it); a long carter's whip |
| Size | the knight's height | a little over the knight's height (63 to his 58), broad |
| Canvas | 240 x 220 at (120, 160) | 420 x 300 at (200, 210) |
| Stand | 30 frames at 10 (3.0 s): stooped, reaping at corn that is not there, one stroke a round | 32 at 10 (3.2 s): planted, the masked head turning slowly, the whip's stock tapped against the boot once a round, the lash trailing on the ground |
| Walk | a shuffle, 10 at 8, `FH_PACE` 0.9, the sickle hanging in the hand | a trudge, 12 at 8, `CT_PACE` 0.85, the lash dragged behind |
| Blow | THE SICKLE SLASH, 1.3 s (`FH_SLASH`): the sickle raised high over the right shoulder by 0.24, the blade glinting pink, held shaking (THE WARNING, 0.24 to 0.44); hips first, a step in, THE BLADE CROSSES BEFORE THEM at 17/30 (0.57), down and across from their right to their left, about 1.1 tiles before them; carried through low to the left; back to the stoop by 1.3 | THE WHIP CRACK, 1.9 s (`CT_WHIP`): swung out to the side and back over the right shoulder by 0.34, the lash streaming out behind, its cracker glinting pink, held (THE WARNING, 0.36 to 0.58); hips first, a step in, the arm brought over and down, the lash rolling out before them (0.6 to 0.9); IT CRACKS at 25/30 (0.83), pink sparks, its end then about 1.8 tiles before them, head-high; rolled out its whole length at 0.9, its end about 2.65 tiles out; on the ground by 1.12 (about 2.15 tiles out); drawn back 1.15 to 1.75 |
| Struck | 0.4 s: jolted back, the head snapped back, the Hush coughed out | 0.4 s: jolted back, the masked head snapped back, the lash flicking |
| Death | THE HUSH LEAVES THEM, 2.2 s (`FH_DIES`): rocked back; a gasp at 0.3, the head thrown back; the Hush pours out in one great grey breath 0.12 to 1.7; the sickle drops at 0.34 and falls clear; the knees hit the floor at 0.85; swaying to 1.3; they slump forward, down at 1.85 | OVER ONTO THEIR BACK, 2.6 s (`CT_DIES`): rocked back; the hat knocked off at 0.14; a stagger back; the whip dropped at 0.36; the lantern's flame out by about 0.56; the knees going, they sit down hard at 1.05 and go over onto their back, flat at 1.6, the arms flung out, the legs sprawling 1.62 to 2.04; the hat and the whip lie clear |
| Checks | tests/fieldhands.test.ts (8): every move and handover of both through every boss check, from in front and behind: 0 findings; painting, nothing cut off, nothing in the floor; the Hush leaking and leaving; the eyes and how low they lie; the sickle clear of them | tests/carters.test.ts (8): the same checks, 0 findings; the crack's sparks only at the crack, the cracker far out before them; the eyes and how low they lie; the hat and the whip clear of them |

WHAT IS YOURS for both: how hard each blow hits and how far, how many come and where. For the carters, what the lash
does to the hero (it reaches about 2.65 tiles at most). All of Act 2's enemies may come again on floors 11 to 20 (his
words above); the Hushed in the fields are fit for any open ground of the act, the carters for anywhere the Order's carts
go.

## Its moment around the hero (src/art/floor13_moments.ts `millraceMoments()`)

THE WHIRL OF PAGES. Not birds (floor 11's pigeons), not water (floor 12's surge): the fields' own. A few of the mill's
written sheets lie in the corn, stirring (`before`, four frames). A gust comes over the field from the left, streaks of
chaff driven before it (frames 0 to 80); it catches, and a whirlwind spins up out of the corn from frame 10, at its
height by frame 26: chaff and dust spiralling up in a funnel, the six sheets snatched up into it one by one (frames 16 to
35) and whirled round and up; it wanders across the field; from frame 74 it falls apart, the chaff flung out and raining
down, the sheets let go (frames 74 to 84) fluttering down like leaves, swaying, each coming to lie in the corn somewhere
else with a puff of chaff, the last by frame 160 (`after`). 169 frames at 30 a second (5.6 s). No jolts.

LAY IT on open corn: its anchor any point of the field; the whirl stands up 68 world units (1.7 tiles, KT 40 to a tile)
toward -x and 36 (0.9 of a tile) toward -y of it, and wanders off toward +x (1.1 a frame) and +y (0.44 a frame). The
picture reaches 300 picture pixels either side of the anchor. Built as floor 11's pigeons and floor 12's surge are
(art/floor2.ts `onPic`, picture pixels). `tests/floor13_moments.test.ts` (6).

## Films and pictures

Sent him as they were made, made by the dev pages (not kept in git): the ground and pieces (src/dev/preview_millrace.ts,
preview_floor13.ts); the Palimpsest's stand, walk, slam, cuts, leaves, rewrite, reel, death and shots
(preview_palimpsest.ts); the reaper's and gleaner's (preview_fieldhands.ts); the carters' (preview_carters.ts); the whirl
(preview_floor13_moments.ts).

## Changed outside its own files

No file of the game's. Tests only: tests/floor11.test.ts (floor 13's pieces and ground may use the Act 2 kit);
tests/bosses.test.ts and tests/new_mobs3.test.ts (the Palimpsest, the field hands and the carters counted as mock-ups);
tests/crier.test.ts and tests/hushed.test.ts (the field hands may take the Hush's colours and the Hushed's body).

## Checks

tsc clean; each file's own test above (millrace 5, floor13 7, palimpsest 9, fieldhands 8, carters 8, floor13_moments 6);
the whole unit suite on the hand-back head (its count on the board). NOT RUN: the regression, a real phone.
