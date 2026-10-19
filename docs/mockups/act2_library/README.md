# Floor 15, the Great Library: its art (mock-ups, handed back to the main chat)

The art chat's branch `mockup/act2-library`, from floor 14's hand-back `mockup/act2-housequiet` at 73d9d8e (itself from
floor 13's at fc2ab91, floor 12's at 645904f, floor 11's at 9a14016, and `main` at 99a128c).
Nothing here is in the game until the main chat puts it there. Every switch is off; nothing of the game imports any of it.

The measure is the planning chat's Act 2 doc ("Wordsmith Act 2: The Hush (Levels 11–15)", with his yes as ideas): level
15, THE GREAT LIBRARY, "The lair floor that ends the first half: the stolen words are being bound into one book here.";
its layout "tall halls of shelves, galleries, rolling ladders, chained books and candle chandeliers."; its enemies "the
Silent Order in force, and creatures of spilled ink."; "the kid may recognize this room. It's the dream's version of the
library they fell asleep in."; "on the lectern at the heart of the library lies the book of stolen words, nearly
full."; its palette "Dark wood, candle gold, black ink"; its boss the Censor, "The leader of the Silent Order, robed in
black, with a great ink brush. Whatever he strikes through is gone.", in the Reading Room; its Muffled Bell "The
library's closing bell", its Bells "Hand bells on the reading desks and in the galleries"; and at half his life the
Censor "blacks out parts of the floor for good, so the room shrinks".

**ALL OF FLOOR 15 WENT AHEAD ON HIS WORD, NOT ON A YES OF ITS OWN.** His words to the art chat, 18 Oct, 21:24 Pacific:
"Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15".
So its ground, its 25 pieces, the Censor, its two mobs and its moment were each settled in the art chat (the pick it
would have marked recommended) and sent him as pictures and films as they were made. He has not answered any of them
yet. Whether that word stands as his yes for the game is for the main chat to settle with him (the board, 00:27
Eastern, 19 Oct). And his words of 18 Oct
on the act's enemies: "I’d like no not reuse any enemies from the previous act"; "So some of the new enemies can be used
throughout the next 10 levels."; "But let’s keep the acts separate".

## Its ground (src/art/library.ts; painted by src/art/terrain.ts)

`greatLibraryLook(land)`, from what only the level knows (`LibraryLand`): `floor`, its tiles; `zone(tx, ty)`, what each
walkable tile is (`LB_ZONE`: `Stacks`, `Hall`, `Reading`, `Scriptorium`; a hall where not said). Walls of bookcases going
up into the dark, well over the game's own dungeon walls (`LB_RISE` 124 picture pixels; the dungeon's are 80), fading
into the dark from `LB_FADE` 88; in the halls and the Reading Room a gallery along them, its floor at `LB_GALLERY` 54 and
its rail at `LB_RAIL` 70. Edges straight, as walls are.

THE FLOOR, room by room: the stacks' narrow aisles of dark oak boards, each board its own tone, nail heads, worn paler
where feet go, dust thick along the shelves' feet; the halls' great pale marble slabs, one to a tile, a small square of
black marble set where four meet, veined, cracked here and there; the Reading Room's parquet of walnut and oak in a
basket weave, and over its middle (2.8 tiles in from the room's edges, off its doorways) a great worn carpet of indigo,
a border of dull gold, lozenges of dull red, worn to its grey threads where most feet went; the scriptorium's grey flags,
spattered black with the Order's ink, spills run out of dropped pots, a quill dropped. What lies about: books pulled
down and dropped, shut or open face down; loose pages with lines of writing; the Order's ink dripped and pooled; candle
wax dripped in patches away from the walls; dust (on the carpet only ink and a dropped page or book).

THE WALLS: bookcases of dark walnut from the floor up into the dark: a base of cupboards (two panelled doors a bay, brass
pulls), then shelf over shelf of books, their spines oxblood, bottle green, navy, tan calf, black, vellum, slate and a
dull violet, gilt bands dull on them; bay by bay, the Order's black ink slashed across the spines and dripping, chained
books, a rolling ladder on its brass rod, shelves pulled empty (a book or two lying flat), and in the halls a tall
round-headed leaded window barred by the Order, the night in its panes; in the halls and the Reading Room the gallery's
beam with a gilt bead and a balustrade of turned posts, more books above it. The scriptorium's walls are a panelled dado
of dark wood and dressed stone over it, pigeonholes of rolled scrolls bay by bay, lines of writing on the stone struck
over with bars of the Order's ink. The tops: the bookcases' tops seen from above, a lit edge of dark wood, then the dark.
Its colours all through art/act2_quiet.ts (Colour 4), as floors 11 to 14's are. Nothing in it glows: the candles are the
pieces'; its gold is gilt and brass, dull.

`tests/library.test.ts` (5): nothing of the game imports it; walkable tiles floor, every other tile not; pieces side by
side are one picture; every pixel opaque, floor, wall and top all there to see; nothing cyan or pink, every colour under
the dullest word's, and its own palette (the dark wood on more than 15 in 100 of the walls' pixels, the dull gilt there
to see, the Order's black ink on the floors), not mud-brown all over.

## Its 25 pieces (src/art/floor15.ts `greatLibraryPieces()`, the Censor's)

His rule of 10 Oct, 14:54: "Going forward, let’s do 25 that are the theme of the 5 levels, then 25 for each boss." The
Hush's 25 for floors 11 to 15 came with floor 11 (src/art/act2_set.ts); these are the Censor's. Built in the Act 2 kit
(src/art/act2_kit.ts), as floors 11 to 14's are:

a reading desk (walnut, its top of green leather, a great book open on a book-rest; its length along x or along y), a
reading chair (breakable: standing, and knocked over on its back), a lectern, the book of stolen words (the quest, open on
its great black lectern: his doc's "on the lectern at the heart of the library lies the book of stolen words, nearly
full."), library steps, a candle chandelier (hung over the floor, nothing of it on the floor; eighteen candles: lit,
or out), a candelabrum, a stack of books, a book cart, a card catalogue, a globe (each breakable: whole, and kicked over,
tipped, spilled or smashed), chained books (his doc's: along x or along y), the library's closing bell (the Muffled
Bell: gagged by the Order, or free, hanging still and swinging either way), a hand bell on a little reading table (the
Bells: quiet, awake, rung one way and back), the library's doors (a door: shut, or swung open), a gate of the Order (a
gate: shut or open, looking along y or along x), a portrait, blacked out (on the wall), a wall sconce (on the wall: lit,
or out), spilled ink (the trap: lying, the warning, sprung), the floor blacked out (a floor tile, a bar of the Order's
ink: where his doc's Censor "blacks out parts of the floor for good, so the room shrinks"), a book press, a copying
desk (its front along y or along x), a vat of the Order's ink, a basket of struck-out pages (breakable: heaped, and
tipped), a spiral stair up to the gallery.

WHAT GLOWS (Colour 3): the enemy's pink burning to gold only in the book of stolen words (the words in its pages and
rising off it), with its own pale light as the quest's; the candles of the chandelier (lit), the candelabrum and the
sconce (lit) an honest orange (his doc's "candle gold" is their light; the gilt and brass about the library stay dull);
the hero's cyan only on the hand bells, awake or rung. Nothing else gives light: not the closing bell, gagged or rung,
nor the copying desk's cold candle stub.

`tests/floor15.test.ts` (7): nothing of the game imports them; 25, each its own name; only what may give light gives it,
in its own colour; crisp, no loose pixels; nothing cyan but the Bells', no hot pink but the enemy's own, every other
colour duller than every word; what stands stands on its foot, a floor tile inside its diamond; nothing cut off.

## Its boss, the Censor (src/art/censor.ts, censor_moves.ts; what he lays on the floor, src/art/censor_shots.ts; behind `CENSOR_ON`, off)

THE ORDER'S LEADER, 84 tall (the knight 58, the Physician 72), broad in the shoulder, long in the arm; still and upright
as a pillar, every stroke a calligrapher's: slow to rise, then all at once. A great black robe to the floor, wide
sleeves, its hem lying about his feet and dragging behind as he goes; behind his head a high stiff collar of black pages
fanned out like a ruff, their edges grey; a deep hood; the Order's blank white mask, larger than his scribes', two eye
slits burning the enemy's pink and, where a mouth would be, a bar of black ink painted across it; down his front a page
of grey writing, most of its lines struck through in black; an iron chain of office, a padlock hanging from it, its
keyhole burning pink while he lives; long grey fingers black with ink. THE GREAT INK BRUSH in his right hand, held
upright at his side like a standard, its bristles over his head: 76 of his lengths from butt to point (he is 84), a
shaft of pale bamboo banded in black lacquer, a brass ferrule, a great head of black bristles wet with the Order's ink,
glinting pink as he readies a stroke. Nothing gory: he strikes words out, not men. On the heroes' bones
(art/skeleton.ts). `CENSOR`, `makeCensorArt()`; `CE_CANVAS` 640 by 520 at (320, 370). His doc's moves: “a brush slash
(his basic attack); Redaction, black bars slamming across the floor in a telegraphed pattern; Strike-Through, a line
drawn straight through you, which you have to dodge; the Hush, silence across the whole room.”

| Move | Clip | Timings (seconds from its start) |
| --- | --- | --- |
| Stand | idle, 32 frames at 10 (3.2 s) | still as a pillar, the brush upright at his side (its butt about 30 picture pixels off the floor); his masked head turning slowly from one side of the room to the other; once a round the brush lifts a little in his hand and settles |
| Walk | walk, 12 frames at 8, `CE_PACE` 0.8 tile a second | slow and upright, the robe's hem dragging, the brush carried upright and swaying forward with his left foot, as a standard is carried |
| THE BRUSH SLASH | attack, 1.8 s, `CE_SLASH` | the brush heaved up over his right shoulder in both hands, its bristles high behind him, his body wound round to his right, held trembling: THE WARNING 0.34 to 0.64; hips first, a step in, the stroke brought down across before him from his right to his left: THE BLOW at 24/30 (0.8), the point about 2.6 tiles out and coming down; at 27/30 (0.9, `through`) the bristles down on the floor at his left, the point about 2 tiles out; carried on to 1.18; drawn back up by 1.42; ink flung off the bristles 21/30 to 28/30 |
| REDACTION | moves.redact, 2.6 s, `CE_REDACT` | the brush raised straight up over his head in both hands, laid back over it, his body arched back, his head up, held trembling: THE WARNING 0.32 to 0.92; hips first, a step in, brought over and down: THE SLAM at 30/30 (1.0); IN THE FLOOR at 32/30 (1.07), the point about 2.5 tiles before him; dragged across the floor from his right to his left 1.12 to 1.52; drawn back up by 2.0 |
| STRIKE-THROUGH | moves.strike, 2.2 s, `CE_STRIKE` | he turns side-on, sinks low and draws the brush back along his right side, its point levelled at you (about 50 picture pixels up), glinting pink: THE WARNING 0.26 to 0.78; a lunge, hips first, the brush driven out its whole reach: THE THRUST at 27/30 (0.9), the point about 2.5 tiles before him and low (about 24 picture pixels up); held there to 1.3; sprung back by 1.6 |
| THE HUSH | moves.hush, 2.6 s, `CE_HUSH` | the brush stood upright; his left hand raised before his mask, one finger to the inked bar where his mouth would be (the finger raised 0.18 to 1.11), and the bar burns pink (0.45 to 1.21): THE WARNING 0.3 to 1.0; at 1.06 he lets the silence go, sweeping the hand out wide to his left by 1.42, drawn up tall, his head up; back by 2.1 |
| Struck | reel, 0.45 s | jolted back, the mask knocked up, the brush rocking |
| Death | die, 3.4 s, `CE_DIES` | rocked back; the brush slips from his hands at 0.3 and falls behind him to his right, lying clear; he clutches his mask with both hands 0.4 to 0.86; it cracks down its middle 0.56 to 0.96 and its halves fall away to either side of him at 1.0 and 1.06, a drained grey face under it, the eyes shut; the words of the city burst out of him 0.6 to 2.6, pink going pale as they go free; his knees give, on them at 1.4; he folds forward and is down at 2.5, long and black, his head about 2 tiles before where he stood, his grey face turned to one side |

WHAT HE LAYS ON THE FLOOR (src/art/censor_shots.ts, in the game's own pixels, as the Physician's are): `drawSlashMark`,
where the slash's bristles swept: an arc of the Order's black ink laid across the floor before him from his right to his
left in its first tenth of a second, `SLASH_MARK_HALF` 55 degrees either side of the way he faces, `SLASH_MARK_REACH`
1.9 tiles out, thick in its middle, spattered off its outer edge, drying away, gone by `SLASH_MARK_FOR` 1.2 s;
`drawRedaction`, Redaction's bars (`Bar`: each one's middle, which way it runs, how long and how wide, in tiles): from
`REDACT_WARN` 0.6 s before the slam each bar marked out on the floor in the enemy's pink, its dashes marching round,
brightening, the floor inside darkening; at the slam each laid down along its length in `REDACT_LAY` 0.12 s, black, its
edges ragged, ink spattered off it; lying wet, drying away, gone by `REDACT_FOR` 2.0 s (a bar laid for good at half his
life is the floor tile "the floor blacked out", above); `drawStrikeAim`, through the Strike-Through's warning, a line of
the enemy's pink across the floor from him through where you stand, its dashes running out along it; `drawStrikeLine`,
from the thrust, a line of black ink running out along it from his brush's point at `STRIKE_SPEED` 16 tiles a second, its
head spattering, thick near him, drying away, gone by `STRIKE_FOR` 1.4 s; `drawRoomHush`, from him a ring of the Hush's
grey rolling out across the room in `ROOM_HUSH_RING` 1.0 s, its veil lying thin over the floor inside it, thinning away,
gone by `ROOM_HUSH_FOR` 3.0 s. How far the line and the ring reach (`reach`) the game says.

`tests/censor.test.ts` (9): the switch off and nothing of the game importing him; every move and handover through every
boss check (art/boss_checks.ts), from in front and behind: 0 findings; every frame painted both ways round, nothing
cyan, his pink edge while he lives and none as he dies; nothing cut off; nothing of him in the floor; his strokes (the
slash's point more than 1.8 tiles out at its blow; Redaction's bristles down on the floor more than 2 tiles out, and low
as they are dragged; the Strike-Through's point more than 2.2 tiles out, and low; the Hush's pink bar and his raised
finger only in its warning); the pink in his eyes while he lives, gone once down, and down he lies low; what falls from
him (the brush, the mask's two halves) lies clear, the words going free pink going pale; what he lays on the floor.

## Its mobs

| | THE INKLINGS (small) | THE BOOKWARDENS (medium) |
| --- | --- | --- |
| Files | art/inklings.ts, inklings_moves.ts; the pool they go about as, art/inkling_shots.ts | art/bookwardens.ts, bookwardens_moves.ts; their tome's mark, art/bookwarden_shots.ts |
| Switch | `INKLINGS_ON` | `BOOKWARDENS_ON` |
| Art | `makeInklingArt3()` (`INKLING`, a `Mob` on the heroes' bones) | `makeBookwardenArt3()` (`BOOKWARDEN`, a `Mob` on the heroes' bones) |
| What | his doc's "creatures of spilled ink": the Order's ink, spilled across the library's floors, got up and walking. Small and hunched, all glossy black ink with a cold sheen; long thin arms hanging to the floor, each ending in three long dripping claws; short legs running down at the feet into a puddle; a lump of a head with no face but two pink eyes, a drip hanging where a chin would be; ink forever running down them and dripping off. | his doc's "the Silent Order in force": the Order's men-at-arms, who keep the library for it now. A coat of black lacquered plates over a black tabard to the knees edged in the Order's grey; the breastplate a closed book's cover, brass at its corners, a strap and clasp down its middle; pauldrons like books' covers edged in brass; iron gauntlets, heavy boots; an iron cap over the Order's black hood and its blank white mask, the cult's pink in its eye slits; THE CHAINED TOME (his doc's chained books, made a flail): an iron haft, its grip bound in leather, a chain of ten links, a great book bound in black leather, brass at its corners, a brass boss and two clasps, glinting pink as they ready it |
| Size | 42 tall were they to stand straight (the knight 58); crouched, about 29 picture pixels to the top of them (about the knight's hips); reared up, about 39 | a head over the knight (66 to his 58), big and broad |
| Canvas | 230 x 190 at (115, 140) | 440 x 360 at (200, 262) |
| Stand | 28 frames at 10 (2.8 s): crouched low on their haunches, swaying, the long arms hanging to the floor before them, the head thrust forward and twitching round, ink dripping off them, a shudder through them once a round | 32 at 10 (3.2 s): planted wide, the haft held out before them in the right hand, the tome hanging from it by the knee and swaying a little; breathing heavily, the masked head turning slowly to watch |
| Walk | a scuttle, low and quick, 10 at 12, `IK_PACE` 1.3, the long arms swinging | a heavy trudge, 12 at 8, `WB_PACE` 0.85, wide-footed, the tome swinging on its chain |
| Blow | THE INK LASH, 1.3 s (`IK_LASH`): reared up tall, arms flung wide and high, claws spread, the eyes flaring, quivering (THE WARNING, 0.22 to 0.46); hips first, a step in, both claws raked down across before them, crossing: THE BLOW at 18/30 (0.6), the claws about 0.7 tiles before them and low, carried on to about 0.8; ink flung off the claws 17/30 to 0.85; back to the crouch by 1.3 | THE TOME SLAM, 2.2 s (`WB_SLAM`): the haft heaved up overhead by 0.3, the tome lifting out on its chain and whirled round above their head, its brass glinting pink, the body braced under it (THE WARNING, 0.32 to 0.8); hips first, a step in, the tome brought over the top and down, gathering speed: THE BLOW at 27/30 (0.9); FLAT ON THE FLOOR on its cover at 29/30 (0.97), its middle about 1.9 tiles before them; held there, bent over it, to 1.3; dragged back up, swinging and turning on its chain, hanging again by 2.2. ITS MARK ON THE FLOOR (`drawTomeSlam`, in the game's pixels): a ring of dust shoved out from under the book to `TOME_REACH` 1.2 tiles from its middle (stretched: out of its sides 1.15 of that, along the way they face 0.8 of it), gone by `TOME_DUST_FOR` 0.6 s; nine cracks run out from under its edges; seven loose pages knocked out of it, flung up and fluttering down round it; the cracks and pages gone by `TOME_MARK_FOR` 1.8 s |
| More | MELT (`moves.melt`, 0.9 s, `IK_MELT`): they sink down and run into a pool of ink on the floor 0.12 to 0.8, only the pool left after. RISE (`moves.rise`, 1.1 s, `IK_RISE`): out of the pool a lump bulges up and they pull themselves up out of it 0.08 to 0.82, crouched before you, whole again by 1.1. A melt hands over only into a rise. THEIR POOL ON THE FLOOR (`drawInkPool`, in the game's pixels): sunk, they go about as a ragged pool of black ink `IK_POOL_R` 0.42 tiles in radius, lengthened along the way it goes, its surface rippling, its edge creeping, a cold sheen across it, two pink eyes surfacing in it now and then; behind it a trail of wet ink `IK_TRAIL` 1.4 tiles long, broken and drying further back | none |
| Struck | 0.35 s: splashed back, the ink rippling, drops flung off | 0.4 s: jolted back, the masked head snapped back, the tome swinging |
| Death | THEY BURST, 1.8 s (`IK_DIES`): rocked back as ink bursts out of them 0.04 to 0.5; slumped into their pool by 0.5, the eyes out; run down into it 0.3 to 1.0, the pool spreading; it dries away to a dull stain 1.1 to 1.8 | THE TOME BURSTS, 2.6 s (`WB_DIES`): rocked back, the tome swung up and out before them; THE CHAIN SNAPS at 0.3 and the tome bursts open in the air in a pink flash, its pages flying up and away 0.3 to 2.1, pink going pale; the haft, the chain's broken end on it, drops from their hand at 0.5 and falls before them to their right, lying clear; on their knees at 1.05, swaying; forward onto their face, down at 1.95, full length |
| Checks | tests/inklings.test.ts (8): every move and handover through every boss check, from in front and behind: 0 findings (sunk into the pool, they rise from it); painting, nothing cut off, nothing in the floor, their pool too; the ink dripping off them as they stand, flung off the claws at the lash, bursting out as they die; sunk, only the pool, risen, whole again; the pink in the eyes while they are up, out once down, and down only a stain; the pool they go about as, black, its eyes pink, nothing cyan | tests/bookwardens.test.ts (9): the same checks, 0 findings, the haft, the chain and the tome too; the tome whirled right round over their head through the warning, then flat on the floor more than a tile and a half before them and held there; its mark only in its time, within a tile and a half of where it struck, nothing cyan; the eyes, and how low and how long they lie; the haft clear of them; the tome whole until the chain snaps, its pages pink going pale and gone before they are down |

WHAT IS YOURS: for both mobs, how hard each blow hits and how far, how many come and where; what the ink lash, the pool
and the tome slam do to the hero, and how wide the slam reaches; where the inklings melt, where their pools slide and how
fast, and where they rise again. For the Censor (art/censor_shots.ts): how many bars Redaction lays and in what pattern,
how long they lie and what they do to the hero, how far the Strike-Through runs and how fast, what the Hush does and for
how long, and which parts of the floor he blacks out for good at half his life (his doc's "blacks out parts of the floor
for good, so the room shrinks"; "the floor blacked out" is its picture). All of Act 2's enemies may come again on floors
11 to 20 (his words above), these two with them.

## Its moment around the hero (src/art/floor15_moments.ts `greatLibraryMoments()`)

THE CHANDELIER FALLS. Not birds (floor 11's pigeons), not water (floor 12's surge), not paper on the wind (floor 13's
whirl), not a ward screen (floor 14's): one of his doc's "candle chandeliers". It hangs over the floor near you on its
chain, its eighteen candles burning (`before`, four frames, the flames flickering). Its chain creaks and it starts to
swing, wax dripping off it; at frame 26 a link gives and it drops a hand's breadth (6 picture pixels) with a jerk,
bouncing on its chain; it swings harder, up to about 6 degrees (26 to 52); at frame 52 THE CHAIN SNAPS (its
first jolt), the upper end left swinging above, and it falls straight down, gathering speed; it CRASHES on the floor at
frame 63 (its second jolt): it lands on its finial and topples onto its hoop's edge, rocking, still by frame 92 (the
times in `CHANDELIER_AT`). As it lands eleven of its candles are thrown out of their cups and roll away across the
floor, all lying still by frame 101; wax splashes out; every flame but two goes out in a puff of smoke; dust rolls out
from under it, gone after frame 95; the broken chain comes down after it in a heap. It lies there after (`after`, four
frames), wrecked, two of the thrown candles still burning on the floor, guttering. Its only light its candles' honest
flame (`CANDLE[3]`, #f0a040): eighteen lights while it hangs and falls, two from the crash on. 128 frames at 30 a second
(4.3 s).

LAY IT on open floor (a hall's marble or the Reading Room's carpet), away from walls: its anchor the floor under the
chandelier's middle as it hangs; its lower hoop 84 picture pixels (42 game pixels) over the floor, its chain running up
out of the picture into the dark. It comes down a little to one side: it lies with its middle about 0.27 tiles from the
anchor toward -x (up the screen to the left), its hoop about 0.7 tiles round that (KT 40 to a tile). The thrown candles
come to rest about 1 to 2 tiles from the anchor and go out as far as 2.2 on the way; the wax splashes out to about 1.8
tiles; the dust rolls out to about 2.4; so leave about 2.2 tiles clear round the anchor. Where it hangs, no chandelier
piece. Its canvas is 420 picture pixels wide and 340 high, the anchor 210 from its left and 250 from its top; what it
draws stays within 100 of the anchor to the left, 91 to the right and 46 below it, and its chain runs out of the top.
Built as floors 11 to 14's moments are (art/floor2.ts `onPic`, picture pixels). `tests/floor15_moments.test.ts` (6).

## Films and pictures

Sent him as they were made (the films and pictures themselves are not kept in git), made by the dev pages: the ground and
pieces (src/dev/preview_library.ts, preview_floor15.ts; the ground's page also dresses three of its rooms with the
pieces); the Censor's stand, walk, slash, Redaction, Strike-Through, Hush, reel, death and what he lays on the floor
(preview_censor.ts); the inklings' stand, scuttle, lash, melt, rise, reel, death and their pool on the floor
(preview_inklings.ts); the Bookwardens' stand, trudge, slam, reel, death and the slam's mark (preview_bookwardens.ts);
the falling chandelier (preview_floor15_moments.ts).

From 19 Oct his films go as MP4 videos, not GIFs: one video a creature, every move of it one after another. His words to
the art chat, 19 Oct, 08:23 Pacific: "So .gifs don’t really work on my phone.  Is there another way to see the
animations without too much usage?" The Censor's and the inklings' films went as GIFs first and then again as videos;
the Bookwardens' and the chandelier's as videos.

## Changed outside its own files

No file of the game's. Tests only: tests/floor11.test.ts (floor 15's pieces, ground and moment may use the Act 2 kit);
tests/bosses.test.ts and tests/new_mobs3.test.ts (the Censor, the inklings and the Bookwardens counted as mock-ups).

## Checks

tsc clean; each file's own test above (library 5, floor15 7, censor 9, inklings 8, bookwardens 9, floor15_moments 6);
the whole unit suite on the hand-back head (its count on the board). NOT RUN: the regression, his room, a real phone.
