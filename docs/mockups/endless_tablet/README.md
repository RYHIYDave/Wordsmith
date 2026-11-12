# Endless mode's key: the tablet, the portal and the final boss (concept, 12 Nov 2026)

The Pips chat, a chat of his working from the queue (item `draw-endless-tablet-portal-final-boss`; his words, 12 Nov, 13:28
Eastern: “Work on the next queue item”). Branch `art/endless-tablet`, cut from `main` 40c62c8d (25.3.11). NOTHING OF THE GAME IS
CHANGED: these are rough concept sketches for his picks, painted by small Python tools (`tools/endless_tablet/`), not the game's
painter. The ones he picked are next drawn to the game's standard in the game's own code (the Gate Ward and the Brawler the measure),
behind a switch that is off, pictures first.

His 7 Nov idea (docs/handoff.md, 6d): the bosses of floors 5, 10, 15 and 20 in endless each drop a quarter of a round stone tablet;
the four set in the wordsmith's bench open a portal to a final boss, “Like something that will kick your ass if you don’t have an
optimized build.”

## What he picked, in his words (by pop-up, 12 Nov 2026)

1. THE TABLET. Shown three takes (`pictures/endless_1_tablet.png`: A the stair seal, B the key word, C the four faces): “I like B
   but I want runes over letters”. Shown B with the wordsmith's own runes (`pictures/endless_5_tablet_runes.png`: art/town.ts
   RUNES drawn twice as big, one a quarter, each boss guarding one, cut dark as they drop, burning in the friend's cyan set whole),
   by 13:50: “Sorry I like the runes”. SO: TAKE B WITH RUNES. Which rune each boss guards, as sketched: the Fleshmancer RUNES[0],
   the Swamp Colossus RUNES[4], the Censor RUNES[3], the Moth RUNES[1] (`tools/endless_tablet/tablet.py` RUNE_OF); each quarter also
   carries its boss's small mark on the rim.
2. THE PORTAL. Shown three takes painted over the Shaft's Rim (`pictures/endless_2_portal.png`): “B: The landing opens
   (Recommended)”. SO: the landing at the tongue's end splits in four as the tablet does, its quarters draw back onto the rim, and a
   stair goes on down into the friend's light, the boss's pink glow far below.
3. THE FINAL BOSS.
   - Shown four (`pictures/endless_3_boss_a.png`, `endless_4_boss_b.png`: the Head Librarian, the Bottom of the Stair, the Erasure,
     the Four Made One): “I want a big four legged thing.  I was thinking a dragon or a wyvern or something but that seems a little
     cliche”.
   - Shown four beasts (`endless_6_beasts_a.png`, `endless_7_beasts_b.png`: the Sphinx of the Stacks, the Bound Behemoth, the
     Stair-Back, the Ink Hound): “[No preference]”, and “Ooo let’s have you fight a warped runesmith”.
   - Asked who and what shape: “A new runesmith of his own”; “Riding a four-legged beast”.
   - Shown him as a smith with a hammer and tongs on three mounts (`endless_8_runesmith.png`): “Let’s talk about wordsmiths for a
     second.  I don’t even really know what they are or where they come from”; “Does he ever have tongs in the game?”. Told: no one
     in the game carries tongs; the town's wordsmith (the Old Skald) writes runes on the air with a staff of runes; the game has two
     wordsmiths (him, and the fallen one in the Crypt with the master rune-stone) and never says what they are.
   - THE LORE, offered and his yes, 14:01: “Yeah thats not bad”: WORDSMITHS ARE AN OLD ORDER WHO KEEP THE WORDS; the one in the
     Crypt fell; the final boss is one of them who went down the shaft for the deepest words and was warped by them; his runes are
     what the four bosses guard on the tablet.
   - Shown him so, a wordsmith (`endless_9_warped_wordsmith.png`): of his mount, “What he rides is kinda dictated by where they’re
     from.  Are they a desert dwelling people, cold mountain monastery kinda guys, swamp temple, forest elven types, etc”; of him,
     “[No preference]”.
   - Asked where the order is from: “Cold mountain is good, but save all these for further quests and acts where you have to visit
     temples in all these regions”. SO: the order's home is a cold mountain monastery in the north; the other lands' temples are
     queued (`plan-wordsmith-temples-in-other-lands`).
   - Shown three mounts of the cold (`endless_10_mounts.png`: the great ram, the white bear, the glacier tusker): “Gimme a mix of a
     and c”. Shown two mixes (`endless_11_mount_mix.png`): “Maybe a big wooly boar would kinda satisfy the mix of the two”.
   - Shown the great woolly boar, with and without the ram's horns (`endless_12_woolly_boar.png`): “Without (Recommended)”; and
     whether to lock in the warped wordsmith on the woolly boar: “Yes, lock them in (Recommended)”.

## So, what is locked in

- THE TABLET: a round stone disc of the rim's stone, a raised rim, a small boss in the middle; in four quarters, each with one of
  the wordsmith's runes cut in it (twice the slab's size) and its boss's small mark on the rim. As they drop: cut dark. Set whole
  in the bench's socket: the four runes burn in the friend's cyan.
- THE PORTAL: the landing opens (above).
- THE FINAL BOSS: THE WARPED WORDSMITH ON THE GREAT WOOLLY BOAR. He: one of the old order, gaunt, a beard to his belt and long white
  hair, an iron band on his brow with its stone cracked, his order's cloak gone to violet rags, his skin ashen and cut with runes
  that burn pink, his eyes pink; a staff of his order taller than he is, runes cut down it burning, his great rune burning in the ring
  at its head; he writes runes on the air, pink; cracked rune stones go round him. It: a boar grown huge from the cold mountains,
  high at the shoulders, the ram's long pale wool matted with frost, a dark crest down its spine, tusks curving up out of its jaw cut
  with his runes, small eyes burning, short thick legs and cloven hooves; his runes branded on its flank, the wool burnt off round
  them; a saddle of iron and old leather on its hump. Both the enemy's: pink burning to gold, the pink edge.

## HOW HARD HE IS: HIS WORDS, 12 Nov 2026, 14:32

“Can you put in there that this is the biggest, baddest boss in the game and will need a well geared, well rounded character to
deafeat.  The fight needs to be fun and engaging and tough as nails.  I want it to be something you have to prep for or he’ll wipe
the floor with you.  Not unfair or gimmicky, just hard”. (Put in the queue's draw-endless-tablet-portal-final-boss and
build-endless-tablet-and-final-boss too.)

## HIS BRIEF FOR THE FINAL BOSS (docs/art/RULEBOOK.md, A new character), 12 Nov 2026, by pop-up

1. What is it, and where does it live: the warped wordsmith on the great woolly boar (above), past the portal at the bottom of the
   endless shaft.
2. Friend or enemy: enemy (pink burning to gold, the pink edge).
3. How big, and how it should feel: “I don’t want the wordsmith to be huge, at least at the start.  So scale the boar to whatever we
   decided the wordsmith size would be.  I think he’s a little taller than the hero”. Asked whether he grows later: “Yes, after he's
   thrown (Recommended)” (offered as: thrown from the boar, he swells huge with his runes for the last part of the fight). SO: AT THE
   START HE IS A LITTLE TALLER THAN THE HERO, AND THE BOAR IS SIZED TO CARRY A MAN OF THAT SIZE (the sketches' sizes are not his:
   they drew both far too big); ONCE THROWN, HE GROWS HUGE.
4. How they move: “Heavy charges, skid and turn (Recommended)” (offered as: the boar charges in straight lines and skids round; he
   sways in the saddle, casting).
5. The one thing to know him by at a glance: “His burning rune-staff held high (Recommended)”.
6. What they carry, and how they attack: “Together, then he's thrown (Recommended)” (offered as: the boar charges and gores while he
   writes runes on the air that burst; partway he is thrown, and both fight on, alone). The fight's rules are the main chat's.
7. How they die: offered “the boar falls, he gutters out” (he sinks to his knees as his runes go out), his words: “Remember we’re
   trying to stay away from “falling to their knees”.  I think he is overwhelmed by the word power he is using and implodes in pink
   energy that dissipates into tiny runes that blink out until nothing is left”. SO: NO FALLING TO HIS KNEES; he is overwhelmed by
   the power of the words he is using and implodes in pink energy, which comes apart into tiny runes that blink out until nothing is
   left. (The boar's own death was not asked: ask with its first pictures, away from falling to its knees.)
8. Anything it must never look like: “Never kindly, never the Old Skald (Recommended)” (offered as: no one should mistake him for a
   friendly wizard or for the town's wordsmith).

## Still to do

1. (Done: his brief, above.)
2. The boss and his boar drawn to the game's standard (sculpted on bones, as the bosses are), through every boss check, then their
   moves; pictures, then films, his yes at each step.
3. The tablet to the game's standard: a quarter as loot on the floor and in the bag, the four in the bench's socket
   (art/shaft_props.ts BENCH_SOCKET), and lit.
4. The portal to the game's standard on the landing (art/shaft_rim.ts LANDING), and its opening as a moment.
5. The rules, the drops and the fight are the main chat's (the queue's `build-endless-tablet-and-final-boss`).

## TO THE GAME'S STANDARD (the Queue chat of 12 Nov, 14:38, session ...KKtBp; his words “Work on the queued items”)

### 1. THE TABLET: DONE, WITH HIS YES

`src/art/endless_tablet.ts`, behind `ENDLESS_TABLET` (off): nothing of the game imports it.
- `paintQuarter(k)`: a quarter as an item (the bag, the gear page, lying on the floor: the game shows loot as its bag picture),
  32 x 32 picture pixels, painted the item pictures' own way (art/items_a.ts: the light from the upper left, five tones, the ink
  outline and the rarity's rim). k 0 to 3: floors 5, 10, 15, 20 (the Fleshmancer, the Swamp Colossus, the Censor, the Moth), each
  its own quarter of the round as it sits in the whole. The rim's stone a step up; a raised rim along the round; the quarter of the
  round boss at its corner; its rune (art/town.ts RUNES[RUNE_OF[k]], RUNE_OF = 0, 4, 3, 1, as he was shown) cut dark, twice the
  slab's size; its boss's mark inlaid in a plaque on the rim (from his trophy: the skull, the eye, the mask, the moth). Its rim is
  the uniques' orange (`QUARTER_RARITY`, read as: the rarest thing a boss drops; told him; the main chat's to change).
- `paintSocketTablet(held, lit)`: the quarters he has set, lying in the bench's socket (art/shaft_props.ts BENCH_SOCKET), laid over
  `paintSocketSlab` at the slab's anchor. Its picture is 68 x 140, the anchor (34, 122): the slab's breadth with room above for
  what rises. `lit` -1 dark; else the four burning, `SOCKET_LIT_FRAMES` (102) at 30 a second: they kindle one by one, floor 5
  first, each throwing sparks (28 frames); the moment (26): the boss in the middle flares white, two rings of cyan run out over the
  slab, a shaft of the friend's light shoots up, a fountain of sparks, the four runes torn up out of the stone and up the shaft in a
  climbing turn; then they burn on (48, these go round): the four runes held turning about a thinner shaft over the bench. Its
  lights go with it (all cyan). Nothing pink or gold.
- Pictures: `pictures/standard/tablet_quarters.png`, `tablet_bench.png` (the bench at the game's camera, three times as big: empty,
  three of four, all four, burning), `tablet_wakes.mp4` (the moment at the bench, the game's view beside the bench three times as
  big). Made by `tools/endless_tablet_peek.ts` and the rim's dev page (`src/dev/preview_shaft_rim.ts`, modes
  `tablet:<four 0/1>:<frame>` and `tabletfilm`; `tools/endless_tablet_film.mjs`).
- HIS WORD, 12 Nov 2026, by pop-up, shown the three: “Yes, the tablet's done (Recommended)” (offered as: it goes on with the portal
  and the boss, then to main together).
- FOR THE MAIN CHAT: the quarters as items (a kind of their own, never rolled; they show `paintQuarter(k)` as their picture); the
  socket's picture laid over the slab's at the same anchor whenever he holds a quarter set; when the four are set, its frames from
  0 at 30 a second, the moment's sound, then the burning frames round; the portal opening after it (below). Which quarters show in
  the socket before all four are in, the main chat's rules say: the picture takes any of them.

### 2. THE PORTAL: DONE, WITH HIS YES

`src/art/endless_portal.ts`, behind the same switch (`ENDLESS_TABLET`, off): nothing of the game imports it.
- The landing at the tongue's end (art/shaft_rim.ts LANDING) keeps its ring of kerb and its eight posts; ITS FLOOR INSIDE THE RING
  (radius 0.84 of a tile) SPLITS IN FOUR along the grid's two axes, the same lines as the tablet in the bench's socket; the seams
  kindle the friend's cyan from the middle out; light bursts up through them (two walls of rays standing on the cross); the four
  quarters grind back under the ring (slow to start, a lurch, then running, slowing into their slots), dust puffed and chips flung
  where each goes under, a column of the friend's light standing up out of the widening hole; it settles. Standing open: A WELL, drawn
  as the shaft itself is (a pictorial cheat: each ring deeper a little smaller), its wall in dressed blocks, A STAIR winding down
  rightward round its far side from where the tongue comes in (under the near lip it is not seen), the stone taking more of the cyan
  the deeper it is, and at the bottom the friend's light with THE BOSS'S PINK BURNING TO GOLD in its middle, breathing; motes of cyan
  rising out of it.
- `paintPortalFloor(f)` (what lies flat, 96 x 64, the anchor (48, 26) on the landing's middle) and `paintPortalRise(f)` (what stands
  up out of it, 120 x 240, the anchor (60, 214), laid in depth at the landing's middle). `f`: -1 shut (nothing laid: the ground's
  own); 0 to `PORTAL_OPEN_FRAMES` - 1 (104 at 30 a second: kindle 24, burst 10, grind 46, settle 24) the opening; past that, standing
  open (`PORTAL_IDLE`, 48 frames that go round). `portalAt(f)` says where it is. Their lights go with them (cyan; the boss's pink
  small and only far down). Nothing glows pink or gold but the boss's own light at the bottom.
- Pictures: `pictures/standard/portal_stills.png`, `portal_opens.mp4` (the game's view beside the landing twice as big). Made by the
  rim's dev page (modes `portal:<frame>`, `portalfilm`) and `tools/endless_portal_peek.ts`.
- HIS WORD, 12 Nov 2026, by pop-up, shown the two: “Yes, the portal's done (Recommended)” (offered as: on to the warped wordsmith
  and his boar).
- FOR THE MAIN CHAT: the opening runs once, after the tablet's moment at the bench (the main chat's rules say when); then it stands
  open until he goes down (the way down is the well's stair: the landing's floor no longer walkable where the hole is); the sound of
  stone grinding and the light's roar. Shut again (the tablet used up, his pick) is -1.

### 3. THE FINAL BOSS'S LOOK (in hand)

`src/art/endless_boss.ts`, behind the same switch: THE WARPED WORDSMITH on the heroes' bones (`WS_BODY`, 64 tall: a little taller
than the hero) riding THE GREAT WOOLLY BOAR, its own solids (`boarBits`, as the Princess's steed and the Hollow Stag are), in the
monsters' painter (art/new_mobs3.ts). `wsMob()` has his stand only so far; `WS_SHAPE` is what the bosses' review takes (his body,
the staff, the boar's hooves as what grips the floor); his stand passes `checkBoss` (tests/endless_boss.test.ts).
- First pictures: `pictures/standard/boss_look.png`, `boss_stand.mp4`. HIS WORDS, 12 Nov 2026, by pop-up: “I was thinking the boar a
  little bigger.  And you’re going to refine that picture right?  It’s looking pretty wonky”. THE BOAR'S DEATH, his pick: “Crashes
  onto its side (Recommended)” (offered as: killed mid-charge, it ploughs on, flips onto its side and skids to a stop in frost, its
  runes going out).
- HIS WORDS on the refined pictures, 12 Nov 2026, 15:4x: “Wait so this is his final look?  Dude not even close.  His hands are all
  fucked, I can see his legs, the wool is really bad.  Run the checks, read the rules.  This is bad.”; 15:47, “Can’t see his legs”;
  15:48, “His elbows are sticking out for no reason.”; “The wool looks like scales”; 15:49, “Are the spikes on the bottom supposed to
  be icicles?  It’s so off.  I don’t want the fastest result, I want a correct result”.
- REMADE FOR THAT (the same chat): HIS LEGS were inside the boar (made bigger, its flanks had swallowed his feet): now astride,
  dark breeches and riding boots down its sides into stirrups out past its widest, and A NEW CHECK that holds them there (his knees
  and shins outside its body, every frame: tests/endless_boss.test.ts; `boarLumps`). HIS HANDS: real hands as the bosses on the bones
  have them (a palm, four fingers in two joints, a thumb): his right closed round the staff, which runs through his fist; his left
  open, a claw, writing. HIS ELBOWS in (the pose no longer swings them out). HIS HEAD made as the King's is (art/king.ts head: one
  head with his face painted on it: eye hollows, heavy brows, hollow cheeks, a long nose), his beard in locks drawn to a point at
  his belt, his hair in locks of their own lengths over his cloak. THE WOOL made as the game's fur is (art/companions_art.ts fur,
  art/moth.ts furSkin: the coat's own tone broken by short strokes of the tone below, a few above; here hanging down and running on
  across its body), not patterned partings (the scales); THE SPIKES GONE: its shag a soft skirt of locks in its body's own part (no
  seam cutting it into teeth), in shade, their ends round; no frost points. The checks: checkBoss on his stand, nothing cyan, his
  legs outside the boar: all pass.
- HIS WORDS on the remade look, 12 Nov 2026: “Look at the brawlers hands, then look at the wordsmiths hands.  I’ve probably talked
  about hands on this project 10 times and every time a new hand shows up it’s wrong”; then “And the boar just doesn’t move at all?
  Doesn’t breathe?  Doesnt snort?  Doesn’t shake its head like a dog?  Doesn’t stamp its feet?”
- MADE FOR THAT: HIS HANDS to the Brawler's size (the hand 1.75 times what it was, knuckles, a thumb on its own side; his right a fist
  round the staff, his left an open claw), set beside the Brawler's fists to check. THE BOAR ALIVE (`BOAR_STAND_AT`, a 4.8 s round):
  three deep breaths (its barrel and back rising); two SNORTS (its head thrown up, a puff of white breath out of each nostril, swelling
  and thinning); a HEAD SHAKE like a dog's (its head swung and rolled hard, its ears and jowls flung, eased in and out); and a STAMP
  of each forefoot in turn (its head thrown up as the foot comes up out in front of its chest, then struck down where it stood, its
  body jolted, grit thrown out round the hoof). Its hooves stand planted (each leg solved to its own spot on the floor), so its
  breathing and rocking never slide them. The checks (checkBoss on the 144 frames, nothing cyan, his legs outside the boar): all pass.

## The tools

`tools/endless_tablet/` (Python with Pillow and numpy; run from that folder): `kit.py` (a small pixel-art kit: two picture pixels to
a game pixel, lit from the upper left, an ink seam round every part, banded glows), `emblems.py` (the four bosses' marks),
`tablet.py`, `portal.py` (painted over `docs/mockups/endless_town/pictures/rim3_whole.png`), `bosses.py`, `beasts.py`, `rider.py`,
`mountains.py`; `sheets.py` and `round2.py` to `round6.py` make the sheets in `pictures/`. `brawler.png` is the Brawler's standing
frame from the live heroes' bake (1fdc8d09059a), for size.
