# Floor 14, the House of Quiet: its art (mock-ups, handed back to the main chat)

The art chat's branch `mockup/act2-housequiet`, from floor 13's hand-back `mockup/act2-millrace` at fc2ab91 (itself from
floor 12's at 645904f, floor 11's at 9a14016, and `main` at 99a128c). Nothing here is in the game until the main chat
puts it there. Every switch is off; nothing of the game imports any of it.

The measure is the planning chat's Act 2 doc ("Wordsmith Act 2: The Hush (Levels 11–15)", with his yes as ideas): level
14, THE HOUSE OF QUIET, "The city infirmary, where the Hushed are taken to be cured."; its layout "indoors: wards of iron
beds, apothecary rooms, and a surgical theatre with a gallery. Rooms and halls, like the Prison."; its hazards "spilled
tonics that leave clouds of the Hush on the floor"; its enemies "Hushed patients who sit up in their beds as you pass,
and the Physician's orderlies"; its story "the doctors aren't curing anyone. They draw out people's last words. The
Physician's ledger shows where every page goes: up the hill to the High City."; its palette "Whitewash, pale green
lamplight"; its boss the Physician, "A beaked plague doctor with a quill-tipped syringe", in the Physician's Theatre; its
Muffled Bell "The chapel bell", its Bells "Patients' call bells in the wards".

**ALL OF FLOOR 14 WENT AHEAD ON HIS WORD, NOT ON A YES OF ITS OWN.** His words to the art chat, 18 Oct, 21:24 Pacific:
"Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15".
So its ground, its 25 pieces, the Physician, its two mobs and its moment were each settled in the art chat (the pick it
would have marked recommended) and sent him as pictures and films as they were made. He has not answered any of them
yet. Whether that word stands as his yes for the game is for the main chat to settle with him (the board, 00:27
Eastern, 19 Oct). And his words of 18 Oct on the act's enemies: "I’d like no not reuse any enemies from the previous
act"; "So some of the new enemies can be used throughout the next 10 levels."; "But let’s keep the acts separate".

## Its ground (src/art/housequiet.ts; painted by src/art/terrain.ts)

`houseOfQuietLook(land)`, from what only the level knows (`HouseLand`): `floor`, its tiles; `zone(tx, ty)`, what each
walkable tile is (`HQ_ZONE`: `Ward`, `Hall`, `Apothecary`, `Theatre`, `Chapel`; a hall where not said). Rooms and halls,
as the Prison: walls the game's own dungeon walls' height and more (`HQ_RISE` 92 picture pixels; the dungeon's are 80),
the dado's rail at `HQ_RAIL` 24, the wall fading into the dark from `HQ_FADE` 64. Edges straight, as walls are.

THE FLOOR, room by room: the wards' scrubbed deal boards, pale, worn into paths between where the beds stand; the halls'
cool grey flags, worn hollow down their middles; the apothecary's small glazed tiles, cream and a dull green in a
checker, cracked, ringed where bottles stood; the theatre's dark oak boards strewn with sawdust, thickest toward its
middle; the chapel's great flags, ledger stones among them. What lies about: bandages come loose, shards of the tonic
vials' pale green glass, pills, the Order's black ink dripped and smeared, a dropped page.

THE WALLS: limewash over plaster, cool, a little green in the lamplight, never white; below it a dado, room by room (the
wards and halls tongue-and-groove boarding painted the infirmary's green, a near-black skirting; the apothecary glazed
tiles to the rail; the theatre oak panelling; the chapel a stone plinth and a stencilled band). Tall windows barred by
the Order, the night dark in their panes (not in the theatre); the house's rules painted on the wall in black letters,
the Order's ink struck across them (not in the chapel or the theatre); plaster fallen to the laths; damp stains;
cracks. Its colours all through art/act2_quiet.ts (Colour 4), as floors 11 to 13's are; the green kept a yellow-green,
never near the hero's cyan. Nothing in it glows.

`tests/housequiet.test.ts` (5): nothing of the game imports it; walkable tiles floor, every other tile not; pieces side by
side are one picture; every pixel opaque, floor, wall and top all there to see; nothing cyan or pink, every colour under
the dullest word's, and its own palette (pale limewash on a fifth of the walls at least, the infirmary's yellow-green there to see).

## Its 25 pieces (src/art/floor14.ts `houseOfQuietPieces()`, the Physician's)

His rule of 10 Oct, 14:54: "Going forward, let’s do 25 that are the theme of the 5 levels, then 25 for each boss." The
Hush's 25 for floors 11 to 15 came with floor 11 (src/art/act2_set.ts); these are the Physician's. Built in the Act 2
kit (src/art/act2_kit.ts), as floors 11 to 13's are:

an iron ward bed (four frames: made, and risen from, its head against a far wall along x or along y; the patients rise
from the second of each, below), a ward screen (whole, and half there while someone is behind it; a man's height, 58 by
72), a bedside locker, a hamper of soiled linen, a washstand (each breakable: whole and broken), a patient's call bell (on
the wall: the Bells, quiet, awake, rung one way and back), a coal stove, a bath chair, a stretcher left lying, the ward's
doors (a door), the Order's iron grille (a gate: shut or open, across x or y), a lamp of green glass (on the wall: lit,
or out), a stand of candles, the apothecary's shelves and its counter (each along x or y), a rack of tonic vials
(breakable), spilled tonic (the trap, his doc's hazard: lying, the warning, the cloud of the Hush rising off it), the
operating table under its lamp, the theatre's gallery, a tray of the Physician's instruments (breakable), a cabinet of
last words (the phials of last words he drew out, along x or y), a drain in the theatre's floor (a floor tile), the
chapel bell (the Muffled Bell: gagged by the Order, or rung and swinging either way), chapel pews (along x or y), the
Physician's ledger (the quest: his doc's "shows where every page goes: up the hill to the High City").

WHAT GLOWS (Colour 3): the enemy's pink burning to gold only in the cabinet of last words and on the tray of his
instruments; the coal stove and the candles an honest orange; the lamps of green glass and the operating table's lamp a
pale yellow-green (his doc's "pale green lamplight"); the hero's cyan only on the call bells, awake or rung; the quest's
own pale light. Nothing else gives light.

`tests/floor14.test.ts` (7): nothing of the game imports them; 25, each its own name; only what may give light gives it,
in its own colour; crisp, no loose pixels; nothing cyan but the Bells', no hot pink but the enemy's own, every other
colour duller than every word; what stands stands on its foot, a floor tile inside its diamond; nothing cut off.

## Its boss, the Physician (src/art/physician.ts, physician_moves.ts; what he throws, takes and leaves, src/art/physician_shots.ts; behind `PHYSICIAN_ON`, off)

TALL AND THIN, 72 tall (the knight 58), long in the leg, stooped like a heron; precise and unhurried, then the sudden
lunge of the Draw. A long black waxed coat to his shins, a short cape, a broad-brimmed black hat; the beaked mask of the
plague doctors in the Silent Order's blank bone-white, its long curved beak, two round lenses of glass burning the
enemy's pink; black gloves; a belt of pale green tonic phials. HIS CANE in his right hand: ebony, a silver knob and
ferrule. HIS SYRINGE in his left: a great glass syringe in brass, its needle a sharpened quill; what it draws out burns
pink in its barrel. Nothing gory: he draws out words, not blood. On the heroes' bones (art/skeleton.ts). `PHYSICIAN`,
`makePhysicianArt()`; `PH_CANVAS` 440 by 360 at (210, 270).

| Move | Clip | Timings (seconds from its start) |
| --- | --- | --- |
| Stand | idle, 32 frames at 10 (3.2 s) | still over his cane, his beaked head cocking this way and that, as a bird's does |
| Walk | walk, 12 frames at 8, `PH_PACE` 1.0 tile a second | a long, stalking stride, the cane set down with every other step |
| THE RAP | attack, 1.5 s, `PH_RAP` | the cane lifted high over his right shoulder, his head up, held trembling: THE WARNING 0.26 to 0.48; hips first, a step in, THE BLOW at 18/30 (0.6); bent into it, the ferrule comes down on the boards at about 0.72, about 1.2 tiles before him; held; drawn back up |
| THE DRAW | moves.draw, 2.9 s, `PH_DRAW` | he turns side-on, sinks low and levels the syringe at you, the quill glinting pink: THE WARNING 0.3 to 0.76; a fencer's lunge, the quill at full reach at 27/30 (0.9), its point about 1.9 tiles before him at about a man's head height; held there while he draws back the plunger, the barrel filling pink (the word drawn out of you), 1.0 to 1.4; he springs back by 1.62 and lifts the syringe high over his head by 1.9; the plunger pushed home 2.02 to 2.3, the word put up out of the quill to hang over his head |
| TONIC | moves.tonic, 2.0 s, `PH_TONIC` | the syringe thrust through his belt 0.06 to 0.2; three phials plucked from it at 0.32; reared back with them over his shoulder, shaking: THE WARNING 0.44 to 0.72; FLUNG at 25/30 (0.83); the syringe taken up again 1.5 to 1.72 |
| ROUNDS | moves.rounds, 2.4 s, `PH_ROUNDS` | he draws himself up, cane and head lifted: THE WARNING 0.18 to 0.46; THREE RAPS of the cane on the floor at 0.62, 0.92 and 1.22; the cane swept round the room, pointing, 1.36 to 2.0 |
| Struck | reel, 0.4 s | jolted back, the beak knocked up |
| Death | die, 2.8 s, `PH_DIES` | rocked back; his hat knocked off at 0.16; the cane falls from his hand at 0.3, the syringe at 0.42 (each lying clear); the words he drew out of the city rise out of his breast and his belt of phials 0.3 to 2.3, pink going pale as they go free; his knees give, on the floor at 1.05; he folds forward onto the floor, long and black, down at 2.1 |

WHAT HE THROWS, TAKES AND LEAVES (src/art/physician_shots.ts, in the game's own pixels, as the Crier's and the
Palimpsest's are): `drawCaneRap`, where the cane strikes the floor (a star of cracks run out `RAP_CRACKS` 0.5 tiles,
chips and dust, `RAP_FOR` 0.45 s); `drawDrawAim`, through the Draw's warning a line of the enemy's pink along the floor
the way his lunge will go; `drawHeldWord`, the word he drew out of you hanging over his head (`HELD_WORD_UP` 58 game
pixels up), the rune of your own word (art/icons.ts `GLYPH`) burning the enemy's pink, his doc's "which glows over his
head until you beat it back out of him"; `drawWordFreed`, beaten out of him it flies home to you, taking its own colour
(`WORD_COLOR`) again as it comes (`WORD_FREED_FOR` 0.6 s); `drawPhialFlight`, a phial tumbling through the air
(`PHIAL_FLIGHT` 0.55 s, its arc `PHIAL_ARC` 30 game pixels high); `drawHushCloud`, where it lands: it smashes (`SMASH_FOR`
0.35 s), the tonic splashes, and a cloud of the Hush wells up and lies on the floor, roiling, an ellipse `HUSH_CLOUD_R` × 32 by × 16 game pixels
each way from its middle (1.25: about 1.8 tiles out on the floor, as the game's 32 by 16 diamonds go), dithered so the floor shows through, gone by `HUSH_CLOUD_FOR` 4.0 s; `drawRoundsRing`, a ring of the Hush
rolling out from each rap of his Rounds to `ROUNDS_RING_REACH` 3.5 tiles in `ROUNDS_RING_FOR` 0.9 s.

`tests/physician.test.ts` (9): the switch off and nothing of the game importing him; every move and handover through
every boss check (art/boss_checks.ts), from in front and behind: 0 findings; every frame painted both ways round, nothing
cyan, his pink edge while he lives; nothing cut off; nothing of him in the floor; the Draw and Tonic (the quill far out at
the lunge, the barrel filling pink as he holds, full as he lifts it; the phials in his hand until they are flung); the pink
in his lenses while he lives, gone once down, and down he lies low; what falls from him lies clear, the drawn words going
free; what he throws, takes and leaves.

## Its mobs

| | THE HUSHED PATIENTS (small) | THE PHYSICIAN'S ORDERLIES (medium) |
| --- | --- | --- |
| Files | art/patients.ts, patients_moves.ts; their scream's burst, art/patient_shots.ts | art/orderlies.ts, orderlies_moves.ts; their blow's mark, art/orderly_shots.ts |
| Switch | `PATIENTS_ON` | `ORDERLIES_ON` |
| Art | `makePatientArt3(mob)`: `PATIENT_MAN`, `PATIENT_WOMAN` (`PATIENTS_ALL`), each a `Mob` on the heroes' bones | `makeOrderlyArt3()` (`ORDERLY`, a `Mob` on the heroes' bones) |
| What | floor 11's Hushed (their body, skin and breath), here the city's people brought to the House of Quiet to be cured, their last words drawn out of them. A MAN in a long nightshirt of washed grey linen to his calves, his head bandaged; a WOMAN in a nightgown to her ankles, a frilled nightcap, a grey shawl, her hair down her back. Barefoot; the ward's number inked on the breast in the Order's black; drained faces, the cult's dull pink in the eyes, mouths working, the Hush leaking out of them. Grown men and women. | the House of Quiet's attendants in the Order's service, who carry the Hushed in and hold them down for him: a long attendant's coat of grey-white canvas buttoned high, its sleeves rolled to the elbow over thick bare forearms; a heavy black apron of the Order's oilcloth from chest to shins; a white linen cap and a gauze mask over nose and mouth tied with the Order's black cord, the cult's dull pink in the eyes above it; a ring of iron keys at the belt; heavy boots; THE QUIETING MALLET, a long ash handle and a head of dark lignum bound with two black iron hoops, carried on the right shoulder |
| Size | the knight's height | a head over the knight (66 to his 58), heavy in the shoulder, arm and belly |
| Canvas | 250 x 210 at (136, 158) | 400 x 320 at (170, 226) |
| Stand | 30 frames at 10 (3.0 s): stooped, unsteady, swaying, the left hand at the throat their words were drawn from, the mouth working | 32 at 10 (3.2 s): planted, wide-footed, breathing heavily through the gauze, the head turning to watch, the mallet shifted on the shoulder once a round |
| Walk | a barefoot shuffle, 10 at 8, `PT_PACE` 0.8 | a heavy trudge, 12 at 8, `OD_PACE` 0.8, the mallet on the shoulder |
| Blow | THE SILENT SCREAM, 1.5 s (`PT_SCREAM`): reared back, both hands clutching the throat, the throat burning pink, shaking (THE WARNING, 0.28 to 0.58); hips first, a step in, the head thrown forward and the arms flung back: THE SCREAM at 21/30 (0.7), the mouth gaping, a burst of the Hush blasting out of it before them in their own picture for 0.6 s (`PT_SCREAM.burst`); held; back to the stoop by 1.5. ITS BURST ACROSS THE FLOOR (`drawScreamBurst`, in the game's pixels): from the mouth down onto the floor in a fan `SCREAM_HALF` 34 degrees either side of the way they face, its ragged front rolling out to `SCREAM_REACH` 1.8 tiles, gone by `SCREAM_FOR` 0.6 s. A scream with no sound. | THE MALLET BLOW, 2.1 s (`OD_BLOW`): lifted off the shoulder in both hands and raised high over the head by 0.36, the body arched back, its hoops glinting pink, held shaking (THE WARNING, 0.38 to 0.66); hips first from 0.73, a step in, brought down over the top gathering speed: THE BLOW at 25/30 (0.83); IN THE FLOOR at 27/30 (0.9), its head about 1.4 tiles before them, dust and splinters thrown up there; held there, bent over it, to 1.25; heaved back up onto the shoulder by 2.1. ITS MARK ON THE FLOOR (`drawMalletSlam`, in the game's pixels): a ring of dust rolling out `SLAM_REACH` 1.1 tiles in `SLAM_FOR` 0.6 s, splinters thrown up, a star of cracks left in the boards fading by `SLAM_CRACKS_FOR` 1.6 s |
| More | IN BED (`moves.abed`, a 3.0 s round, 30 frames at 10): on their backs on a ward bed, knees drawn up, eyes shut, breathing slow, the head stirring, mouthing in their sleep. THEY RISE (`moves.rise`, 2.3 s, `PT_RISE`): the eyes snap open pink at 0.12; they SIT BOLT UPRIGHT by 0.46; turn their heads to you by 0.76; swing their legs over the side of the bed, their bare feet on the floor at 1.32; lean, push off and stand by 1.96; settled into the stand's first frame at 2.3 | none |
| Struck | 0.4 s: jolted back, the head snapped back, the mouth jolted open | 0.4 s: jolted back, the head snapped back, the mallet rocking on the shoulder |
| Death | THE HUSH LEAVES THEM, 2.6 s (`PT_DIES`): rocked back; a gasp at 0.3, the head thrown back, the Hush pouring up out of them in one great grey breath; the knees give, on the floor at 0.9; they sway, fold over by 1.5 and are down by 1.95, curled up on their right side, as if asleep at last | A FELLED TREE, 2.6 s (`OD_DIES`): rocked back; the mallet slips from their hands at 0.3 and falls behind them to their right, lying clear; a lurching step 0.36 to 0.6, the other foot brought up beside it; from 0.9 they go over forward, stiff, gathering speed, and hit the floor full length on their face at 1.52; a bounce; still |
| Checks | tests/patients.test.ts (9): every move and handover of both through every boss check, from in front and behind: 0 findings (handovers: in bed only into their rising, their rising into their stand); painting, nothing cut off, nothing in the floor; in bed on the bed (nothing into the mattress past what a stuffed one gives, nothing past the rails) and stood clear of it; the Hush leaking (faint asleep) and leaving; the eyes shut in bed, open as they rise, out once down; the scream's burst before them, and across the floor | tests/orderlies.test.ts (8): the same checks, 0 findings; the mallet in the floor more than a tile before them, raised high before, the dust only at the blow and only round where it struck; its mark only in its time; the eyes and how low and how long they lie; the mallet clear of them |

LAY THE PATIENTS' BEDS (`PT_BED`): a patient in bed or rising is drawn over a ward bed in its risen-from frame, the
bed's middle 20 of the figure's own lengths (about half a tile) behind the patient's floor point, its length along
the patient's left and right, its head to the patient's left (`PT_BED` x -20, half-length 27, half-width 12, mattress
18.6 up). They rise FACING YOU: seen from in front (facing down the screen to the right) the bed is its frame with its
head toward -y (the bed's fourth frame); turned over in the mirror (facing down to the left), the bed with its head
toward -x (its second). Draw the bed first and the patient over it. His doc's Physician's Rounds, "where the patients
rise from their beds", is where the game may play their rising.

WHAT IS YOURS for both: how hard each blow hits and how far, how many come and where; what the scream does to the hero
(his doc keeps the Hush status for the bosses and the Knell: so a blow, unless he says otherwise); which beds hold
patients, when they rise (as you pass, and at the Rounds), and whether a patient struck in bed rises first. All of Act
2's enemies may come again on floors 11 to 20 (his words above); the patients are the House of Quiet's own, the orderlies
fit for anywhere the Order keeps the Hushed.

## Its moment around the hero (src/art/floor14_moments.ts `houseOfQuietMoments()`)

THE SCREEN FALLS. Not birds (floor 11's pigeons), not water (floor 12's surge), not paper on the wind (floor 13's whirl):
the wards' own. One of the wards' linen screens stands near you, three panels on iron frames in a zigzag, its linen
stirring (`before`, four frames). A draught finds it: the linen bellies out and the screen rocks on its feet (frames 0 to
24), rocks harder, nearly goes and settles back (24 to 40); then it tips past its balance toward you and comes down,
gathering speed, and CRASHES FLAT on the boards at frame 56 (its one jolt): its panels splay out flat, it bounces and
settles by frame 70, and a cloud of dust rolls out from under it and drifts away. It lies there after (`after`). In the
House of Quiet it makes no sound at all. 95 frames at 30 a second (3.2 s).

LAY IT in a ward, on open floor: its anchor the middle of the screen's foot, its length along x (72 world units, 1.8
tiles, KT 40 to a tile, as the piece); it falls toward +y (toward the hero, down the screen to the left), its top coming down about 1.6 tiles out,
so leave that clear; where it stands, no screen piece. Its canvas is 460 picture pixels wide, the anchor 230 from its left; what it draws stays within 220 of the anchor.
Built as floors 11 to 13's moments are (art/floor2.ts `onPic`, picture pixels). `tests/floor14_moments.test.ts` (6).

## Films and pictures

Sent him as they were made (the films and pictures themselves are not kept in git), made by the dev pages: the ground and pieces (src/dev/preview_housequiet.ts,
preview_floor14.ts); the Physician's stand, walk, rap, Draw, Tonic, Rounds, reel, death and shots
(preview_physician.ts; the rap again once it reached the floor); the patients' stand, walk, scream, reel, death, in bed
and rising, and the scream's burst (preview_patients.ts); the orderlies' stand, walk, blow, reel, death and the blow's
mark (preview_orderlies.ts); the falling screen (preview_floor14_moments.ts).

## Changed outside its own files

No file of the game's. Tests only: tests/floor11.test.ts (floor 14's pieces and ground may use the Act 2 kit);
tests/crier.test.ts (floor 14's spilled tonic and the patients may take the Hush's colours); tests/hushed.test.ts (the
patients may take the Hushed's body); tests/bosses.test.ts and tests/new_mobs3.test.ts (the Physician, the patients and
the orderlies counted as mock-ups).

## Checks

tsc clean; each file's own test above (housequiet 5, floor14 7, physician 9, patients 9, orderlies 8, floor14_moments
6); the whole unit suite on the hand-back head (its count on the board). NOT RUN: the regression, a real phone.
