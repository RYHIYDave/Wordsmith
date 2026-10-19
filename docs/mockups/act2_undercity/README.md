# Floor 12, the Undercity: its art (mock-ups, handed back to the main chat)

The art chat's branch `mockup/act2-undercity`, from floor 11's hand-back `mockup/act2-gateward` at 9a14016 (itself from
`main` at 99a128c). Nothing here is in the game until the main chat puts it there. Every switch is off; nothing of the
game imports any of it.

The measure is the planning chat's Act 2 doc ("Wordsmith Act 2: The Hush (Levels 11–15)", with his yes as ideas): level
12, THE UNDERCITY, "Down the drains to find where the Hush comes from"; its palette "Wet brown brick, green water"; its
boss the Rat King, "A knot of rats tied at the tails, swollen on jars it broke into, squeaking in a hundred stolen
voices", in the King's Cistern.

**ALL OF FLOOR 12 WENT AHEAD ON HIS WORD, NOT ON A YES OF ITS OWN.** His words to the art chat, 18 Oct, 21:24 Pacific:
"Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15".
So its ground, its 25 pieces, the Rat King, its two mobs and its moment were each settled in the art chat (the pick it
would have marked recommended) and sent him as pictures and films as they were made. He has not answered any of them
yet. Whether that word stands as his yes for the game is for the main chat to settle with him (the board, 00:27
Eastern, 19 Oct). And his words of 18 Oct on the act's enemies: "I’d like no not reuse any enemies from the previous
act"; "So some of the new enemies can be used throughout the next 10 levels."; "But let’s keep the acts separate".

## Its ground (src/art/undercity.ts; painted by src/art/terrain.ts)

`undercityLook(land)`, from what only the level knows (`UndercityLand`): its `floor`; what each walkable tile is
(`zone`, `UC_ZONE`: `Walk` 0 the walkways' flags, `Cistern` 1 brick paving, `Grate` 2 an iron grate over the water,
`Planks` 3 the Order's planks over the water, `Dug` 4 the Order's own tunnels, packed earth); and which tiles that are
not floor are water (`water(tx, ty)`: the channels, the cisterns' pools). Water is a drop, as the Ledge Road's is, but
painted: the look's `hang` paints the channel's far wall and the water itself (sunk `UC_SINK` 22 picture pixels below the
walkways), so nothing need be laid behind the ground. The walls are wet brick in courses, the vault springing at
`UC_SPRING` 76, `UC_RISE` 112 tall; culverts, pipes, rungs, patches, lime and slime on them; roots in the tops. Its
colours all through art/act2_quiet.ts (Colour 4), as floor 11's are. Nothing in it glows.

`tests/undercity.test.ts` (5): nothing of the game imports it (but floor 12's moment, which takes the water's depth
from it); walkable tiles floor, water water, walls walls; pieces side by side are one picture; every pixel opaque;
nothing cyan or pink that could be taken for a glow, every colour under the dullest word's, and its own palette (not
mud-brown all over).

## Its 25 pieces (src/art/floor12.ts `undercityPieces()`, the Rat King's)

His rule of 10 Oct, 14:54: "Going forward, let’s do 25 that are the theme of the 5 levels, then 25 for each boss." The
Hush's 25 for floors 11 to 15 came with floor 11 (src/art/act2_set.ts); these are the Rat King's. Built in the Act 2
kit (src/art/act2_kit.ts), as floor 11's are:

a sluice gate (gate), the sluice's winch, the flood, a sluice bursting (trap), a slick of slime (trap), the diver's bell
(the Muffled Bell: the Order dragged it into the cistern and gagged it), an alarm bell at a sluice and a sewerman's
handbell (the two small Bells, quiet, awake and rung, as floor 11's), the King's nest, smashed voice jars, a crate of
jars gnawed open, a niche of bottled voices, rat holes, gnawed bones and rags, the jar of the Crier's voice (the quest:
the first voice taken, sealed in the Order's black wax), a sewerman's punt hauled up, eel traps, a sewerman's lantern,
light from the street above, a chain hoist, pale toadstools, roots through the vault, a door into the Order's store
(door), an iron sewer door (door), a sinkhole in the flags (floor tile), a sewerman's barrow.

WHAT GLOWS (Colour 3): the enemy's pink burning to gold only on what is the enemy's (the King's nest, the smashed voice
jars, the niche of bottled voices, the rat holes' eyes); the sewerman's lantern an honest orange, and the light from the street above a warm lamp-yellow; the hero's cyan only on the Bells, awake or rung; the quest's own pale light. Nothing else gives light.

`tests/floor12.test.ts` (7): nothing of the game imports them; 25, each its own name; only what may give light gives it,
in its own colour; crisp, no loose pixels; nothing cyan but the Bells', no hot pink but the enemy's own, every other
colour duller than every word; what stands stands on its foot, a floor tile inside its diamond; nothing cut off at a
picture's edge.

## Its boss, the Rat King (src/art/rat_king.ts; what it throws, src/art/rat_king_shots.ts; behind `RAT_KING_ON`, off)

TEN SWOLLEN SEWER RATS AND THEIR KING, their tails knotted into one hard lump bound round with the Silent Order's black
cord; the King on top, a jar's broken neck of green glass jammed on its head for a crown; eyes the cult's pink; fat,
sleek, wet, not gory. A heap near three tiles across, the King as high as the knight's head. On its own solids, as the
hounds are (not on the heroes' bones). `makeRatKingArt()`; `RK_CANVAS` 600 by 430 at (300, 296).

| Move | Clip | Timings (seconds from its start) |
| --- | --- | --- |
| Stand | idle, 45 frames at 15 (3.0 s) | every rat squirming its own way, two gnawing at the knot, the King looking round |
| Scuttle | walk, 6 frames at 24, `RK_PACE` 1.2 tiles a second | the heap goes as one, the front ones hauling |
| THE BITE | attack, 1.36 s at 30, `RK_BITE` | the front rats rear up, mouths wide, trembling: THE WARNING 0.16 to 0.38; the heap surges forward (under half a tile) and they SNAP DOWN at 0.66, the picture held 0.1 |
| Struck | reel, 0.4 s | the heap flinches back, every head up, a squeal |
| THE ROLL | moves.curl 0.7 s; moves.roll, 24 frames at 30, a loop (one turn in 0.8 s); moves.uncurl 0.6 s | curled tails-in into a ball of rats; rolling at `ROLL_PACE` (about 6.45 tiles a second: the game carries it at that pace so the ball does not slide); uncurled |
| UNKNOT and KNOT | moves.unknot 0.9 s; moves.knot 0.95 s | the knot comes loose, the rats burst outward and are gone into the cracks, the King with the cord in its teeth; then they pour back in and knot again (between, the swarm runs across the floor: `drawSwarm`) |
| STOLEN WORDS | moves.words, 1.6 s, `RK_WORDS` | the King rears, every mouth opens, a word gathers before it: THE WARNING 0.22 to 0.84; it flies at 0.86 |
| Death | die, 2.8 s, `RK_DIE` | the glass crown knocked off at 0.24 (lying on its side on the floor); the cord snaps at 0.46; the voices pour up out of them 0.5 to 2.1, pink going pale; the rats scatter 1.25 to 2.45, gone into the cracks 2.0 to 2.5; still from 2.5; left on the floor, the cord, the crown, the corks |

WHAT IT THROWS (src/art/rat_king_shots.ts, in the game's own pixels, as art/crier_shots.ts): `drawWordAim` (through the
warning, a thin line of the enemy's pink along the floor the way the word will fly); `drawStolenWord(kind)`, `kind` one of
fire, frost, lightning, poison: the shape of one of the hero's own words, burning the enemy's pink to gold, never a
friend's colour, flying `WORD_SPEED` 7 tiles a second; `drawWordBurst` where it lands (`WORD_BURST_FOR` 0.5 s);
`drawSwarm`, the swarm between unknotting and knotting (`SWARM_RATS` 18 drawn, there by `SWARM_FOR` 0.9 s).

`tests/rat_king.test.ts` (14): the switch off and nothing of the game importing it (but the King's rats, which are
painted with its rat painter); crisp, its pink edge while it lives; nothing cyan, every light the enemy's, its eyes
burning, nothing cut off; its size; FLOOR, SLIDE (feet grip; the ball rolls without sliding), JERK, JUMP, ALIVE, in every
frame of every move from in front and behind; the bite, the roll, unknot and knot, stolen words and the shots, its
death; its pictures as the game holds them.

## Its mobs

| | THE KING'S RATS (small) | THE ORDER'S DREDGERS (medium) |
| --- | --- | --- |
| Files | art/rats.ts | art/dredgers.ts, dredgers_moves.ts |
| Switch | `RATS_ON` | `DREDGERS_ON` |
| Art | `makeRatArt()` | `makeDredgerArt3()` (`DREDGER`, a `Mob` on the heroes' bones) |
| What | the sewer's rats, swollen on the voices the King's brood drank, the cult's dull pink in their eyes; the King's own, painted with its rat painter, free of the knot; small and fun to smash, in packs | the Silent Order's labourers in the sewers: the Order's blank white mask (the scribes'), smeared with muck, under a black hood; a long oilskin coat; waders; gauntlets; a wicker creel of voice jars on the back, glowing faint pink, a voice leaking out now and then; a boathook |
| Size | about four fifths of a tile long, nose to rump, without its tail; standing, under a third of the knight's height | the knight's height, heavier, stooped |
| Canvas | 170 x 130 at (80, 96) | 380 x 300 at (170, 210) |
| Stand | 36 frames at 15 (2.4 s): sniffing, the head turning | 30 at 10 (3.0 s): leaning on the boathook, listening, the creel shrugged higher once |
| Other move | LOOKING ROUND, `moves.look`, 1.3 s: up on its hind legs, forepaws drawn up, and down (the game's to play now and then from its stand) | |
| Walk | a scurry, 6 at 24, `RAT_PACE` 2.8 tiles a second | a wade, 12 at 8, `DR_PACE` 0.85, the waders lifted high |
| Blow | THE LEAP AND BITE, 1.0 s: crouched, its rump wiggling as a cat's does before it pounces (THE WARNING, 0.12 to 0.34); it springs at 0.36, all four feet off the floor, stretched out, and SNAPS at 0.5, 24 on (about 0.6 of a tile), held 0.1; scrambles back to where it was | THE HOOK AND HAUL, 2.0 s: the boathook levelled low in both hands and drawn back, its hook glinting pink, held shaking (THE WARNING, 0.3 to 0.6); hips first, a lunge, the pole THRUST OUT at 0.73 (its hook then about 2.3 tiles before them); a twist as the hook BITES at 0.99; a hard HAUL back at 1.25, leaning into it, a step back (the hook drawn in to about 1.5 tiles); the pole stood again |
| Struck | 0.35 s | 0.4 s |
| Death | 1.5 s: a squeal; flipped onto its back 0.08 to 0.42, legs curling up; the voice it drank puffs out of it 0.25 to 1.05, pink going pale; still from 1.1 | THE JARS BURST, 2.6 s: the jars crack 0.12 to 0.3, the lid flung off at 0.2; the voices pour up out of the creel 0.18 to 1.9, pink going pale; the boathook drops at 0.42 and falls clear; they kneel at 1.0, sway, and fall on their faces, down by 2.1 |
| Checks | tests/rats.test.ts (13): its own solids through the four-legged checks (floor, slide, jerk, jump, alive), from in front and behind | tests/dredgers.test.ts (8): every move and handover through every boss check (art/boss_checks.ts), from in front and behind: 0 findings |

WHAT IS YOURS for both: how hard each blow hits and how far, how many come and where; for the dredgers, what the hook
does to the hero (it is drawn as a pull toward them); for the rats, how often they look round. All of Act 2's enemies
may come again on floors 11 to 20 (his words above); the King's rats and the dredgers are the sewer's and the Order's,
fit for any of them below ground.

## Its moment around the hero (src/art/floor12_moments.ts `undercityMoments()`)

THE SURGE. Not rats: floor 1's rats bolt already. In the channel's far wall, a culvert shut by a hanging iron flap,
dripping (`before`, four frames). It rattles; at frame 8 (a jolt) the flap is flung up and a torrent bursts out across
the channel, spray thrown high; a breaking wave runs off down the channel at 8.5 world units a frame (KT 40 to a tile),
slopping over the coping and dying away; the Order's corks, a sodden notice and a plank come out on the torrent and are
swept off down the channel; the torrent slackens, the water drains back down, and the flap clanks shut (frame 91, the
second jolt); what came out is left floating where it came to rest, some five tiles down the channel (`after`).
114 frames at 30 a second.

LAY IT on a channel two tiles across that runs along x, its water `UC_SINK` below the walkways: its anchor is the point
on the middle of the channel at the walkways' height, the culvert in its far wall (toward -y) a tile upstream (-x) of
it; the wave runs off toward +x and dies away about six tiles past the anchor. Built as floor 11's pigeons are (art/floor2.ts
`onPic`, picture pixels). `tests/floor12_moments.test.ts` (6).

## Films and pictures

`previews/rat_king/`, `previews/rats/`, `previews/dredgers/` (stand, walk, attack, reel, die, and the King's roll,
unknot and words, the rats' look); `previews/floor12/surge.gif`. Dev pages: src/dev/preview_undercity.ts,
preview_floor12.ts, preview_rat_king.ts, preview_rats.ts, preview_dredgers.ts, preview_floor12_moments.ts.

## Changed outside its own files

src/art/floor11.ts (its bell helpers exported, for the Bells here); src/art/act2_quiet.ts (`quietTerrain`); tests/floor11.test.ts,
tests/new_mobs3.test.ts, tests/bosses.test.ts (the import checks told of these mock-ups); tests/undercity.test.ts
(its own check told of the moment).

## Checks

tsc clean; each file's own test above; the whole unit suite on the hand-back head (its count on the board). NOT RUN:
the regression, a real phone.
