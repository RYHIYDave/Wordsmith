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
- HIS WORDS on that, 12 Nov 2026, by pop-up: “We haven’t talked about his moves.  The boar really isn’t menacing enough.  Maybe
  some armor, pink energy pulsing out of its eyes and runes”; and 16:24, “Spiked hoof plates”. HIS MOVES are not to be made until
  they have been talked through with him.
- MADE FOR THAT (`boarArmour`): plates of blackened iron lying on it (each a shell over the part it covers, the wool showing round
  it): a plate of three lapped lames over each shoulder, his rune burning in the middle one; a plate over its hindquarters with his
  rune; a face plate down its brow and snout, a keel down it, his runes cut either side; an iron horn out of its brow; its shanks
  in iron, spiked at the knee, out of each side and out of the toe of its shoe. ITS EYES pour his power: a pink light on each, the
  burn of it streaming back over its head. All of it THROBS (`pulse`: a throb every 1.2 s, struck fast and dying slow, and at its
  height through each snort and stamp), dark pink to pink to gold. Its stand now plays at the beasts' 15 frames a second (as the
  stag, the hounds and the wolves). The checks: all pass.
- HIS YES, 12 Nov 2026, by pop-up (asked whether it is menacing enough now): “Yes, it's menacing (Recommended)”. Next: his moves,
  talked through with him first.

### HIS FIGHT (talked through with him, 12 Nov 2026)

- Asked which moves he should have (offered: the boar's charge, its tusk gore, runes from the saddle, growing huge at half health),
  HIS ANSWER: “Boar charge (Recommended),Tusk gore (Recommended),I want two phases, one saddled, then another after the boar dies.  I
  want the wordsmith to have an attack themed after each of the damage words.  And I want a rear up and stomp with a big aoe from the
  boar as well”. 16:40: “Remember, this is the final final boss.”
- Offered (by pop-up, after a message laying it out): PHASE 1 IN THE SADDLE: the boar's CHARGE (stamping and snorting first; up to
  three runs, wheeling round, faster each time), its GORE (tusks hooked up, the hero thrown), its REAR UP AND STOMP (reared on its
  hind legs with him in the saddle, slammed down, the floor cracking and shock rings rolling out one after another, a warning ring
  first); his five DAMAGE-WORD ATTACKS (Power, Flame, Frost, Lightning, Poison) from the saddle between them. THE BOAR DIES: it
  crashes onto its side; he is thrown clear and lands on his feet, skidding, his staff planted, never kneeling. PHASE 2 ON FOOT:
  his words faster, and MELDED two at a time (wordsmithing turned on the hero); at the last, his LAST STAND, word after word with no
  break. Every attack warned first. HIS ANSWER: “So while on the boar he’s using single words?  Then off he’s melding?  I like that.
  Sounds good.  I’m serious man, take your time, read the rules, go crazy, we can always tune it down.  I want you to ask me about
  each of the damage word attacks.”; and, 16:40, “I want this fight to be crazy”.
- The rules it is made to: the gameplay rulebook's BOSSES (a fight made long by what it throws, each phase harder than the last,
  something always coming, by the last phase something everywhere; attacks three times in a row); the art rulebook's ANIMATIONS (as
  far as it will go, the Wave the measure, the hero and every warning in sight), MOVEMENT 9 (big wind-up, lightning strike) and
  COLOUR (every word its own colour; enemy glows pink to gold, a friend's cyan).
- HIS PICKS for the word attacks, 12 Nov 2026, by pop-up. THEIR COLOURS: “Own colour, pink through it (Recommended)” (offered as: each
  word in its own colour so the hero reads what is coming, Power red, Flame orange, Frost blue, Lightning yellow, Poison green, with
  his pink at its heart and edges, the enemy's). POWER: “Hammer from the sky (Recommended)” (a giant Power rune high over the hero,
  its shadow chasing him across the floor, slamming down three times in a row: craters, shockwaves, stone flying). FROST: “Ice spikes
  (Recommended)” (jagged ice bursting up out of the floor in lines racing at him, the floor frozen and slippery behind them).
  LIGHTNING: “Ball lightning” (slow crackling orbs drifting after him, zapping anything near, then bursting). POISON: “Spore mines”
  (runes sunk in the floor round him, bursting into poison clouds when he comes near). FLAME: not answered at first; asked again (he
  asked “what were the fire options?”): “Firestorm (Recommended)” (the rune hurled skyward, bursting, fireballs raining across the
  room onto warning marks, leaving burning ground, less and less room to stand).
- PHASE 2, HIS SHADE (asked when he grows huge, as his brief had it: once thrown): “how about a large pink energy shade that looms
  above him and mimics his movements.  he forges a word, as he would in phase one, the shade also phases a word, and they meld into
  the new attack.” READ AS (told him so): in phase 2 he stays his own size; a huge shade of him in his pink energy looms above and
  behind him and does all he does; to attack, he forges one word and the shade another, and the two meld, seen, into the new
  attack. The shade is his (pink, never cyan). It stands for “once thrown, he grows huge” in his brief.

### HIS MOVES, MADE (each a film for his yes)

- THE CHARGE (`charge`, `chargePoseAt`; `pictures/standard/boss_charge.mp4`, from in front, from behind, then the burst and the skid
  at half speed): by Movement 9 and Monsters 4. ITS WIND-UP: head down, haunches sunk, its near forefoot pawing twice, grit flung
  back; it snorts, its eyes flaring; he leans down over its neck; the lane marked on the floor (the rules are the main chat's: the
  film only shows it). HELD, trembling. THE STRIKE: two frames, smeared, all four hooves off the floor (the screen kicks). THE RUN:
  11 tiles a second, the game carrying it (`chargeCarry`), each hoof down on its own spot of the floor while the floor goes by,
  grit kicked up at every footfall; he low over its neck, his cloak and hair streaming. THE SKID: forelegs braced out, haunches
  down, hooves ploughing (the one time a hoof slides: his pick, “Heavy charges, skid and turn (Recommended)”), grit and frost sprayed
  ahead; he thrown back, his cloak flung forward; its hooves stepped back under it. The lane about 14 tiles. The checks: checkBoss
  on it (all but the skid's plough, which is the move) and his legs outside the boar every frame: all pass. Its hooves are put on
  spots (`BoarPose.feet`, the leg solved to reach), its rider leans (`BoarPose.ride`). Tool: `tools/endless_boss_film.ts`.
  HIS YES, 12 Nov 2026, by pop-up (asked whether this is the charge; offered next: the wheel round between runs): “Yes, build the
  wheel-round (Recommended)”.
- THE WHEEL ROUND (`wheel`, `wheelPoseAt`; `pictures/standard/boss_charge_runs.mp4`: three runs, wheeling round between, each faster
  (the film plays the second at 1.15 and the third at 1.3 of itself: how fast is the rules', the main chat's), then the wheel at
  half speed): stopped out of its skid, it spins round on its forehand to face back down its lane, its hindquarters flung round in
  two hops (still as they come down between), its forefeet stepping round under it, its head swung round first, grit flung out from
  its hind feet; he turns with it (his hands, knees, feet and staff now turned with him as the boar turns). Done, the game shows it
  from its other side (from behind, turned over left for right) and the next run goes back down the lane. Through the checks
  (charge into wheel handed over), his legs outside the boar every frame: all pass.
  HIS YES, 12 Nov 2026, by pop-up: “Yes, on to the gore (Recommended)”.
- THE GORE (`gore`, `gorePoseAt`; `pictures/standard/boss_gore.mp4`, from in front, from behind, then the hook at half speed): by
  Movement 9 and Monsters 4. ITS WIND-UP: rocked back on its haunches, its head swung low and round to its right, cocked so its left
  tusk is down by the floor, its near forefoot pawing once; he leans back. HELD, trembling, snorting, its eyes blazing (its sweep,
  150 degrees out to 2.6 tiles before it, marked on the floor in the film: the rules are the main chat's). THE STRIKE: ONE FRAME,
  smeared: its head hooked up and across, its right to its left, its forequarters heaved up and forward; the hook's track left as a
  crescent of pink to gold off its tusk; grit and frost torn up off the floor; the screen kicks. AFTER: its head flung high, held,
  shaken, let down. The checks (the blow drawn back, held, followed through; the strike a flash from in front and behind), his legs
  outside the boar: all pass.
- HIS WORDS on it, 12 Nov 2026, by pop-up: “A gore would be a swing up of the head, trying to hook with the horns”. READ AS (told him
  so): an upward toss, its head dropped to the floor, held, then swung straight up hooking with its tusks, its forequarters heaving
  up behind it. REMADE SO: wound up, its head down at the floor, tusks levelled; the strike one frame, its head swung up (and
  barely to the side); its forefeet heaved up off the floor with the toss and brought down on their spots; the sweep marked
  before it narrower (90 degrees, 2.4 tiles). AND FOUND (and mended for every move): its head's `low` had been turning it up where
  it said down, so the snorts had dropped its head and the charge's wind-up had lifted it; now down is down (its stand drawn as it
  was). The checks: all pass. `boss_gore.mp4` and `boss_charge_runs.mp4` made again.
  HIS ANSWER to the remade gore, by pop-up (asked whether this is the gore; offered next: the rear up and stomp): “K”.
- THE REAR UP AND STOMP (`stomp`, `stompPoseAt`; `pictures/standard/boss_stomp.mp4`, from in front, from behind, then the slam at
  half speed): by Movement 9 and Monsters 4. ITS WIND-UP: it gathers, rears up onto its hind legs (50 degrees, its haunches let
  down under it, its hind feet planted), its forefeet off the floor beating the air, its head flung up bellowing, a blast of breath
  out of its snout; he leans into its neck, his cloak hanging. HELD at its height, trembling (the reach of its blast marked on the
  floor, 4.5 tiles round its forefeet, in the film: the rules are the main chat's). THE STRIKE: two frames, smeared: it crashes down
  onto its forefeet. THE BLAST: the floor cracked out from its forefeet, a hot line down each crack; three shock rings rolling out
  one after another, each a bright edge with the floor heaved and darkened behind it; stone, grit and frost thrown up in a ring,
  dust rolling out low; the screen kicks hard; its head whipped down and shaken, its body squashed down and coming back up, each
  forefoot stepped once as it settles. The checks (the blow drawn back, held, followed through; a flash from in front and behind;
  the hips first), his legs outside the boar: all pass. (His rider's seat now tips back with the boar as far as he does not lean
  into it.)
  HIS YES, 12 Nov 2026, by pop-up: “Yes, on to his words (Recommended)” (offered as: next, his five word attacks from the saddle,
  starting with Power's hammer from the sky).
- HIS WORDS, 12 Nov 2026, 19:55: “I see his staff swapping hands.  It’s gonna have to get unmirrored at some point”. READ AS (told him
  so): where the game turns his picture over for the other way he faces (the run back up the lane, from behind), the staff goes into
  his left hand; before he goes in the game, his pictures for that way must be PAINTED TURNED ROUND, NOT FLIPPED, so that he always
  holds it in his right (he and the boar are solids: the painter can draw them from that side true). On the list, before he goes in.
- POWER, THE HAMMER FROM THE SKY (`power`, `powerPoseAt`, `powerRuneAt`, `POWER_GLYPH`; `pictures/standard/boss_power.mp4`, then the
  first blow at half speed): HE WRITES IT, his left hand clawing its strokes on the air (the word's own glyph, two chevrons, in its
  red with his pink through the middle and a hot edge); he thrusts his staff up and it flies off into the sky. IT HANGS high over
  the hero, big, its shadow on the floor chasing the hero a beat behind (fixed the moment he raises his staff: where it falls is the
  rules'). THREE BLOWS, by Movement 9: he raises his staff high, HELD; in two frames he hammers it down forward, his hips first, and
  the rune drops onto its shadow in the same two frames, smeared down its fall: a crater, a ring of force, stone flying, the screen
  kicked; it heaves up for the next. After the third it bursts into shards. The checks (each blow drawn back, held, followed
  through, a flash, the hips first), his legs outside the boar: all pass. The hero in the film is the Brawler's standing frame,
  stepping aside (the film's stand-in).
- HIS WORDS on it, 12 Nov 2026, by pop-up: “I want him to form the rune, then a big hammer materializes from the rune and slams
  down”; and 20:06: “I want the runes to create something, not use the rune itself”. READ AS (told him so): FOR ALL FIVE WORDS, the
  rune is the spell he writes, and what strikes is what it makes: for Power, a great hammer of its red with his pink through it,
  out of the rune, swung down three times; the Firestorm's rune calls down the fireballs, Frost's raises the ice, Lightning's lets
  out the ball lightning, Poison's sows the spore mines.
- HIS WORDS on that remake (a flat hammer swung from the rune, which still hung there): “Dude cmon.  Seriously you think that’s what I
  meant?  A poorly drawn flat 2D hammer swinging on a hinge from the rune I specifically said I didn’t want in the spell”; then 20:14,
  “Don’t have it swing, have it crush straight down, top of the hammer first”. Owned (the rune had been kept in the spell after his
  word; the hammer was drawn flat, not to the game's standard). REMADE (`powerHammerBits`, `paintPowerHammer`, `HAMMER_CANVAS`): the
  rune he writes is flung, flies over the hero and BURSTS, and is gone; out of the burst a great war hammer forms, SCULPTED AS SOLIDS
  as he is and painted by the monsters' painter: a block of a head (six faces, each lit as it faces the light, its edges bevelled
  and caught bright), Power's red, banded near each end in darker riveted iron, cracked down its faces with his pink burning in the
  cracks, its striking faces dark iron with a hot pink heart; a long haft, its grain burning; a pommel; sparks crackling off it, a
  light on it. It hangs HEAD DOWN, its haft straight up, over the hero, trembling; at each of his three blows it is CRUSHED STRAIGHT
  DOWN head first in two frames (smeared) onto its shadow: the crater, the ring of force, stone flying; it heaves back up; after the
  third it shatters into sparks.
- HIS WORDS on it, 12 Nov 2026, by pop-up: “i dont like that he sends a rune into the air and also one out over you.  just have it go
  out over you”. SO: one rune only: written at his hand, flung out over the hero, bursting there (the hammer forming out of the
  burst, about its head); the rune that flew up off his staff is gone.
  HIS YES, 12 Nov 2026, by pop-up: “Yes, on to Flame (Recommended)”.
- FLAME, THE FIRESTORM (`flame`, `flamePoseAt`, `FIRE_DROPS`, `firestormBits`, `paintFirestorm`; `pictures/standard/boss_flame.mp4`,
  then the cast and the first wave at half speed): by his rules for the words. HE WRITES the Flame rune (the word's own glyph, its
  orange with his pink at its heart) at his hand and flings it out high over the room; IT BURSTS in a ring of fire, which hangs
  there while it pours them down; THE FIREBALLS, as solids (each a ball of fire lit round, white-hot at its heart, his pink at its
  edge, a tail of fire and smoke), are flung down out of the burst in arcs, three waves, each faster (5, 6, 7), each onto its own mark
  on the floor (a ring of the word's orange with his pink through it, filling as it comes: where they fall is the rules'); each lands
  in a splash of fire and leaves the floor scorched and BURNING to the end of it, flames standing up off it as solids, flickering, so
  there is less and less room to stand. He holds his staff high through it, calling them down. The checks on his cast, his legs
  outside the boar: all pass.
- HIS WORDS on it, 12 Nov 2026, by pop-up: “nah more like a meteor shower”. READ AS (told him so): the rune bursts high over the room
  and the sky opens; burning rocks streak down out of it at a steep slant, fast, long tails of fire and smoke behind them, one after
  another, each smashing into its mark: a blast of fire, a crater, rock and embers flying, the ground left burning. REMADE SO: each
  METEOR a rock as a solid (dark, its molten cracks glowing) at the head of a mantle and tail of fire (solids), sparks and smoke
  streaming behind, down from high over his side of the room (`METEOR_FROM`), a third of a second from the sky to the floor; three
  waves of 6, 8 and 10, each quicker; each lands in a blast (a flash of fire, fire and rock flung out and up), leaves a crater (blasted
  dark, its rim glowing and cooling) and the floor burning in it.
- HIS WORDS on that, by pop-up: “like he fires the rune into the sky and meteors fall randomly over the whole arena”. SO: he fires the
  rune STRAIGHT UP into the sky, out of sight (no burst in sight); the meteors fall AT RANDOM OVER THE WHOLE ARENA (14 tiles by 10 about
  its middle, none within 2 tiles of him), not about the hero, each still marked first. The film shows the whole arena.
  HIS YES, 12 Nov 2026, by pop-up: “Yes, on to Frost (Recommended)”.
- FROST, ICE SPIKES (`frost`, `frostPoseAt`, `FROST_SPIKES`, `frostBits`, `paintFrost`; `pictures/standard/boss_frost.mp4`, then the
  strike and the ice at half speed): by his rules for the words. HE WRITES the Frost rune (the word's own snowflake, its blue with his
  pink at its heart) at his hand, raises his staff, HELD; in TWO FRAMES (smeared) he drives his staff down and the rune down with it
  into the floor before him, where it SHATTERS (white and pink, a ring of frost thrown out, the screen kicked). Out of that place FIVE
  LINES OF JAGGED ICE burst up out of the floor in a fan, racing out across the room at the hero, a cluster of spikes at each step
  (solids, the word's blue to white, never the friend's cyan; a pink glint at the heart of the big ones), each up in a flash with
  shards flung off; the floor FROZEN white behind them (the film draws it: how slippery is the rules'); they stand, then shatter.
  The checks (his blow drawn back, held, followed through, a flash), his legs outside the boar, nothing cyan: all pass.
  HIS YES, 12 Nov 2026, by pop-up: “Yes, on to Lightning (Recommended)”.
- LIGHTNING, BALL LIGHTNING (`lightning`, `boltPoseAt`, `orbBits`, `paintOrb`; `pictures/standard/boss_lightning.mp4`, then the
  bursts at half speed): by his rules for the words. HE WRITES the Lightning rune (the word's own bolt, its yellow with his pink at its
  heart) and flings it out over the room, where IT CRACKS OPEN in a flash, bolts thrown down to the floor, and lets out FOUR ORBS (as
  solids: balls of light, the word's yellow white-hot at the heart, his pink at their edge, arcs crackling off them every frame); they
  DRIFT AFTER THE HERO, slow, each from its own side, each ZAPPING the floor about it as it goes (a jagged bolt down); each SWELLS,
  flickering, and BURSTS in a flash and a ring of bolts thrown out along the floor, which is scorched there. How they hunt is the
  rules'. The checks on his cast, his legs outside the boar: all pass.
- HIS WORDS on it, by pop-up: “one big orb that zaps out periodically”. REMADE SO: ONE GREAT ORB out of the rune's crack (twice the
  size, crackling harder), drifting after the hero; three times (`BOLT.zaps`) it SWELLS and crackles, its reach (2.6 tiles) marked on
  the floor round it, then ZAPS OUT: seven bolts lancing from it across the floor all round, the floor scorched; at the last it BURSTS.
  His pick on that, by pop-up: “More crackle”. SO: twice the arcs crackling off it, thicker near it; small bolts flickering down to
  the floor beside it between its zaps, more as it swells; its zaps and its burst drawn as true bolts (jagged, forking, a white-hot
  core inside the word's yellow, a faint pink edge, new every frame); a bigger burst.
  HIS YES, 12 Nov 2026, by pop-up: “Yes, on to Poison (Recommended)”.
- POISON, SPORE MINES (`poison`, `sporePoseAt`, `SPORE_PODS`, `sporeBits`, `paintSpores`; `pictures/standard/boss_poison.mp4`, then the
  cast and the sprouting at half speed): by his rules for the words (the rune makes what strikes, so the mines are pods, not runes).
  HE WRITES the Poison rune (a drop, the word's acid green with his pink at its heart) and flings it out over the room, where it
  BURSTS into a spray of spores flung out all round, each sinking into the floor where it lands; out of each A SPORE POD SPROUTS
  (solids: a swollen bulb of the word's green, dark spotted, his pink glowing in its veins, spore stalks on it, breathing), its reach
  faint on the floor about it. When the hero comes near one it SWELLS (its veins white-hot, its reach bright) and BURSTS in a CLOUD
  OF POISON (solid puffs of the word's green billowing out and up, hanging, thinning from their edges), spores sprayed out; the floor
  stained where it hung. How near, how long and how much are the rules'. The hero is kept in sight over the clouds. The checks on
  his cast, his legs outside the boar: all pass.
- HIS WORDS on it, by pop-up: “have them be poison runes on the ground that trigger like a trap”. REMADE SO: where each spore sinks,
  A POISON RUNE BURNS ITSELF INTO THE FLOOR (a solid lying on it: the word's drop in its green, his pink at its heart, ringed, glowing,
  pulsing: a set trap); stepped near, it SNAPS (flaring white-hot) and the cloud of poison bursts up out of it and hangs. (His rule
  that the runes make what strikes stands: the thrown rune makes the traps; the traps make the clouds.)
- HIS WORDS on it, 12 Nov 2026: “is that the rune for poison?  gimme a bigger spread with the same amount of traps”. Read so: the
  drop was a stand-in, not the game's own Poison rune (the skull). REMADE SO: the traps carry the skull, and the same ten are spread
  wider over the room (from 1.6 to 5 tiles out, where they were packed nearer).
- HIS WORDS, 12 Nov 2026: “i want to see the runes i see in my lexicon on thiese attacks”. Read so: every word's rune, at his hand
  as he writes it and as it flies, is the Lexicon's own rune stone (the carved stone tablet with the word's glyph in its colour,
  `lexiconRune`, drawn as the Lexicon's `runeSprite` draws it), not a rune drawn for the boss. REMADE SO in all five films (Power,
  Flame, Frost, Lightning, Poison), and Poison's floor traps are that same stone. Commit aec723f; the boss's tests pass (4 of 4).
- HIS WORDS, 12 Nov 2026, by pop-up: “not with the stone around it, just the symbol carved into it.  and have him like create it not
  just pull it out of thin air or whatever”; then “i do like the stone with poison on the ground tho”, “just one the ground”, “and
  just poison”. Read so: the runes he writes and throws are the bare symbol from the Lexicon (its glyph in the word's colour, its
  heart in the word's glow, inked round), with no stone; the stone stays only on Poison's traps on the floor. And he MAKES each rune:
  his pink gathers out of the air into his raised claw, a spark swelling there; then a beam reaches from his claw and writes the
  symbol on the air stroke by stroke (on along each stroke, his claw lifted between strokes), the fresh strokes white-hot, cooling to
  the word's colours, sparks thrown off where it writes; written, it flares and hangs burning before him until he throws it. REMADE
  SO in all five films (`tools/endless_boss_film.ts`: `strokeOrder`, `bareGlyph`, `writeRune`, `runeSpot`, `clawTip`); each film's
  half-speed replay now starts at the gathering.
- HIS YES, 12 Nov 2026, by pop-up: “hell yes man thats so awesome.  perfect.  yes lets move on great job” (to: in all five films he
  makes each rune himself, the bare symbol, no stone; the stone only on Poison's traps; Poison done).
- HIS WORDS AS THE BOAR'S DEATH WAS MADE, 12 Nov 2026: “and we want a short line from the wordsmith as an audio signal of the
  attack” (read so: each of his attacks has a short spoken line as he begins it, so it is heard coming; the lines written here for his
  yes, voiced by the sound chat); “and a line about how he.ll miss his steed, or get revenge for his steed during the phase change”;
  “make sure you follow the rules, make it badass, i want to be nervous that hes now on foot”; “and figure out a way for the boar to
  leave the arena so hes not just there for the rest of the fight.  like he turns to ash after the rune power seeps out of him”; and,
  22:45: “going to bed, just keep working on the fight, and ill see what you cooked up in the morning.  make me proud man.  we've set
  a strong foundation, just follow the rules”.
- THE BOAR'S DEATH AND HIS RISING (`fall`, `FALL`, `fallPoseAt`, `fallCarry`, `fallRider`, `fallGrains`, `ashPut`, `paintShade`;
  `pictures/standard/boss_fall.mp4`: the charge, killed, all of it; then from the kill at half speed). KILLED mid-gallop down its lane
  (a flash of his pink out of all of it), its front gives way, its head driven down, its legs slack; over onto its side, the floor
  coming up to meet it (dust and frost), sliding on in frost and grit, stopped, a last kick. HE is thrown up out of the saddle (his
  legs out past its flanks till he is clear), over its head, and lands ON HIS FEET well clear, crouched deep, his boots sliding on in
  the frost (never kneeling); he looks back over his shoulder to it (his line for his steed goes here). ITS POWER SEEPS OUT OF IT
  INTO HIM: its runes go out one by one (brand, armour, greaves, tusks, its eyes last), each flickering out, a ribbon of his pink
  streaming off each through the air into his chest; it greys to ash as they go; he burns brighter with each (a light about him, his
  eyes blazing, the air crackling). HE RISES, his staff thrust high (held, the warning), THE SLAM (two frames, smeared; the frame
  held a tenth of a second, his Movement 7): a ring of his pink rolls out over the floor, cracks thrown out under it; where it meets
  the boar THE ASH BURSTS AND BLOWS AWAY, from its top down, nothing left but a scorch: the arena clear. Dead, the boar has the dark
  seam for its edge, not his pink (the pink edge is the living's). HIS SHADE tears up out of him as he strikes and looms over him
  from behind (his own figure made great, more than twice his height, of his pink, bands of it rising through it, doing as he does a
  moment after him): the second phase begins. Through the bosses' checks (0 findings) and the boss tests (4 of 4).
- THE SECOND PHASE, ON FOOT (made the night of 12 to 13 Nov 2026 at his word, “just keep working on the fight”; not yet shown him):
  HIS STAND ON FOOT (`foot`, `footStandAt`, `FOOT_OVER`): hunched forward like something hunting, his staff planted, his writing hand
  clawed out before him; breathing deep and hard, his shoulders heaving; his head jerking round to the hero and back now and then;
  his runes burning brighter than in the saddle, the air crackling about him; HIS SHADE behind him all the while, doing as he does a
  moment after him (`paintShade`, laid behind him by the game). THE MELDS (`MELD`, `meldRiderAt`; the film's `meldScene`): he
  writes his word at his hand as in the saddle; his shade, a moment after him, writes the other word at its great hand, twice the
  size; his staff thrust high, the two runes fly up and meet over him, wheel round each other faster and faster and MELD in a flash
  into the meld's own rune (the game's, render/melds3.ts, the bare symbol in its own colours); THE SLAM (two frames, smeared)
  drives it down into the floor, and what it makes rises out of the floor. ERUPTION (Power and Flame; `eruption`, `ERUPT`,
  `eruptBits`; `pictures/standard/boss_eruption.mp4`): he writes Power, his shade Flame; where the meld goes in, the floor splits
  in three fissures racing out toward the hero, molten in their depths, his pink at their heart, a vent swelling along each (the
  warning); then from the nearest out, in a rolling wave, each vent BLOWS: a jet of molten rock spraying wide at its top, gobs
  flung out of it, rocks thrown in arcs and smouldering where they land; each falls back into a pool of rock cooling. HAILSTORM
  (Frost and Lightning; `hailstorm`, `HAIL`, `hailBits`; `pictures/standard/boss_hailstorm.mp4`): he writes Frost, his shade
  Lightning; melded, the slam flings the rune straight up out of sight; the storm is high over the room, out of the picture, seen
  by its shadow drifting over the floor in great dark rolls and by its light as its bolts go; HAIL hammers down at random all over
  the floor (each stone's shadow growing as it comes, the warning; each a lump of ice with its streak behind it, shattering where
  it strikes, shards flung, a splash of frost left, thawing); every so often a BOLT cracks down out of the top of the picture onto
  a spot ringed first in crackling white, the whole room lit for a frame. The other eight melds are to come, each for his yes.
- HIS DEATH (`death`, `DEATH`, `deathRiderAt`, `dyingPut`, `deathGrains`; `pictures/standard/boss_death.mp4`), by his brief (“he is
  overwhelmed by the word power he is using and implodes in pink energy that dissipates into tiny runes that blink out until
  nothing is left”; never on his knees): STRUCK, a flash, rocked back a step; OVERWHELMED, wrenched up and back, arched, his staff
  thrust high as if to hold it off, shaking, light splitting out through him in cracks, more and more of him burning white and
  pink, bolts lashing out of him to the floor, his shade dragged back down into him, writhing; IMPLODES, all of him, staff and all,
  crushed in to a point at his heart in a quarter of a second; a beat; then a ring of his light and a burst of TINY RUNES flung
  out, drifting out and up, each blinking out on its own until nothing is left.
- HIS LINES (the sound chat voices them: the queue's boss-voices-and-roars; each said as the move begins, so it is heard coming).
  Drafted long first; his words, 13 Nov 2026, by pop-up: “The attack lines are too long winded.  One to two word lines.  The boar
  death line is solid, his death line is bad”, then “No sorry the boar death is fine, HIS death, the “too many words” line is bad”;
  his death, his pick: “A scream cut short”. SO: Power “Kneel!”; Flame “Burn!”; Frost “Be still.”; Lightning “Storm, come!”;
  Poison “Rot.”; Eruption “Rise, fire!”; Hailstorm “Shatter!”; his steed's death, as drafted: “Rest, old friend. Your fury lives in
  me.”, and on the slam “You will pay for this!”; his death, a scream cut short as he implodes.
- HIS YES TO THE NIGHT'S FILMS, 13 Nov 2026, by pop-up: “Yes, keep going (Recommended)” (boss_fall, boss_eruption,
  boss_hailstorm, boss_death). HIS LAST STAND, his pick: “He climbs into his shade” (offered as: he becomes one giant of pink
  energy, slow and huge, melds raining down).
- Through the bosses' checks (0 findings: fall, foot, eruption, death) and the boss tests (4 of 4).
- HIS WORDS, 13 Nov 2026, 07:38: “His casting arm is still sticking out awkwardly and the hand on the staff is clipping.  That’s a
  rule broken.  It’s not very visible when he’s normal sized, but glaring when the shade pops up.  Also the shade is a bit too close
  to him.  Not so much a carbon copy in pink but more raw energy”. MENDED: on foot his writing arm is in by his side, its elbow down,
  its forearm forward, the hand clawed before him (and in the saddle, at rest, his writing hand in before his belly, raised only to
  write); his staff stands upright in his fist out at his right side, his forearm across it, never along it, and planted, his fist
  sliding along it so its foot is on the floor, its length kept (`staffOf`'s `planted`). HIS SHADE REMADE AS RAW ENERGY
  (`paintShade`): a towering mass of his pink fire only loosely his shape: a hood of flame with narrow slits of white fire for eyes
  and tongues of fire swept back off its crown; great shoulders flowing down into a robe of fire that frays into tongues before it
  reaches the floor (it floats); arms that are streams of it, its hands clawed flares; his staff a beam of light, its ring blazing;
  sparks streaming up off all of it; white-hot at its heart, crimson at its edges, see-through and ragged where it thins. Further
  back and higher (52 behind him, 24 up). The films again: boss_fall, boss_eruption, boss_hailstorm, boss_death.
- HIS LAST STAND (`ascend`, `meldrain`, `ASCEND`, `RAIN`, `ascendRiderAt`, `giantBonesAt`; `pictures/standard/boss_last_stand.mp4`),
  his pick “He climbs into his shade”: struck, he looks up at it; it stoops to him, reaching its great hand down; he rises off the
  floor, arms spread, his head back, drawn up and back into its chest; a flash as he goes in. It burns solid round him and grows
  greater still, coming down onto the floor, he its heart, burning white and pink inside it, seen through it; it throws back its head
  and thrusts its staff up (its roar is the sound chat's) and STAMPS: cracks out from its staff, a ring of his pink rolling out over
  the floor (two frames, smeared, the frame held). Then, its staff held up, MELDS RAIN: meld runes (each its own, the game's)
  falling out of the top of the picture all over the floor, each ringed first in its own colour, each bursting in its own colours,
  his pink through them.
- HIS WORDS, 13 Nov 2026, by pop-up: of the raw-energy shade, “I take it back, I like the old shade better”; of the last stand,
  “Let’s just cut the last stand, I think the shade with him on foot and the multitude of melds and moves will make it unique and
  memorable”. SO: THE OLD SHADE IS BACK (his own figure made great, of his pink, bands rising through it), kept further back and
  higher as he asked before, his arms and staff in it as mended; THE LAST STAND IS CUT (made at 06891c2, in the branch's history;
  `boss_last_stand.mp4` taken away). The fight: phase 1 on the boar; phase 2 on foot with his shade and the melds; his death.
- HIS WORDS, 13 Nov 2026, by pop-up: “No the hand on the staff is bad.  It doesn’t read as a hand”. REMADE (`gripHand`): his fist
  is built round the staff, as the Brawler's fists are: a chunky rounded block bigger than life, closed right round the staff so the
  staff is not seen through it; a row of four knuckles down its front with dark creases between his fingers; his thumb over the top
  from the inside, its tip down in front, a seam round it; his sleeve kept off it. HIS WORDS: “The thumb is too big”: made a thumb,
  thin and short, lying along the top of his fist.
- HIS WORDS on the thumb made smaller: “Not really but I’m sick of working on it so move on”. LEFT AS IT IS; NOT QUITE RIGHT IN HIS
  EYES: his fist on the staff may want another look one day.
- HIS QUESTION, 13 Nov 2026, 09:50: “How is going to turn if the shade stands behind him?  Is the shade going to teleport around him
  as he turns?”; his pick: “Glides round behind him (Recommended)” (offered as: it sweeps round on a curve a beat after he turns,
  never teleporting, and never steps in front of him or your view of him). MADE (`SHADE_GLIDE`, `shadeWants`, `shadeGlide`,
  `paintShade`'s `around`): it stands behind his back as he faces, eased round after where it wants to be the short way round, a
  beat after him (0.3 s), never a jump; always on the far side of him from the eye (within 78 degrees of straight up the picture), so
  facing away he has it looming over him from just above, never round in front covering him. SHOWN turning (`turn`, `TURN`,
  `turnAt`: a heavy turn to his right, held, then back round to his left, his feet stepping round, his staff lifted off the floor as
  he turns; `pictures/standard/boss_turn.mp4`). HIS WORDS: “His arm is all messed up again when he turns”: his hands turned with
  him (their places are along the figure’s own axes, which do not turn), as in the saddle.
- HIS YES to the turn: “Yes, on to Avalanche (Recommended)”. AVALANCHE (Power and Frost; `avalanche`, `AVAL`, `avalancheBits`;
  `pictures/standard/boss_avalanche.mp4`): he writes Power, his shade Frost; melded, the slam drives the rune into the floor before
  him and frost races out down a broad lane (the warning: rimed white, its edges his pink); before him the snow builds up out of the
  floor into a great wall, heaving, and then it comes: a wave of snow taller than he is rolling down the lane, its crest curling over,
  boulders of ice tumbling in it and bounding out ahead, snow flung off its face, his pink deep in it; at the lane's end it breaks
  into drifts that slump and melt away.
- HIS WORDS on it, 13 Nov 2026, by pop-up: “No I want avalanche to bury about 4/5ths of the whole arena, then melt away.  If you’re
  hit your frozen for a duration long enough that you are going to get hit.  Arms look good”. REMADE SO: the frost races out over four
  fifths of the room (the warning), his pink along the edge of the one strip it will not reach; the wall the room's width; the wave
  sweeps across and the room lies BURIED under deep drifts, held a moment (1.4 s), then they slump and melt away (1.8 s); the hero
  caught in it frozen in a block of clear ice till it melts (the film shows him caught). How long the freeze holds in play is the
  main chat's (his words passed on in its queue item). HIS WORDS, 13 Nov 2026: “Well it kinda right but it’s just a bunch of balls
  and not snow”, “No I didn’t get the film.”, “It’s not okay”. REMADE SO: all of it one body of snow, no seams through it; the room
  buried under ONE SNOWFIELD (soft drifts and hollows with no pattern to them, lit where they rise toward the upper left, blue in
  their shade, glittering, its edge ragged and drifted, its lip nearest the eye in shade; melting, it opens in holes and is gone);
  the wave A BILLOWING WALL OF POWDER (dense and white at its heart, its edges ragged and smoking off, its crest curling over,
  powder smoking up off it and flakes blown ahead). (THUNDER, Power and Lightning, made and held till Avalanche has his yes:
  `thunder`, `THUNDER`, three great bolts each locking on faster.)
- AVALANCHE AS HE LAID IT OUT, 13 Nov 2026 (asked what was still off): “OK, here’s what I want. The word Smith does his room. The flies
  to either the left or the right side of the wall. A red warning covers the entire arena except for a little spot at the top or a
  little spot at the bottom then you hear rumbling building up to like a wall like a freight train of snow flying across the street
  wherever that red is on the floor goes on for a few seconds freezes if you’re in it and you take a ton of damage and then once
  it’s done, that’s it”; and of the warning's colour: “Yeah, I’m gonna color to be red or pink cause whatever you use for normal hit
  box warnings on the ground”. REMADE SO (`ARENA`, `AVAL`, `AVAL_OUT`, `avalSpared`, `avalancheBits`): the slam flings the meld rune
  to the left wall, where it sinks in, a flash; the whole floor floods in the bosses' own ground-warning colour (art/mkit.ts FLAME[2],
  as their warnings are drawn: art/boss_shots.ts), all but one little safe spot (here at the bottom) and his own ground, the safe
  spot's edge in its hot gold; the wall rumbles, frost creeping over it, snow sifting out, the screen shaking harder and harder; then
  the snow comes out of the wall like a freight train: one river of snow the room's width, streaked the way it goes, long masses of
  powder hurled along it, speed lines, ice boulders hurtling, parting round the safe spot and round him, for 2.6 s; its tail passes
  and that is it (no burying, no melting). One caught in it frozen and hurt hard: the main chat's numbers.
- Through the bosses' checks (0 findings, every move) and the boss tests.
- NEXT: the other seven melds (Thunder, Blight, Scald, Wildfire, Fumes, Frostbite, Contagion), each for his yes; his other facing
  turned round, not flipped.


## The tools

`tools/endless_tablet/` (Python with Pillow and numpy; run from that folder): `kit.py` (a small pixel-art kit: two picture pixels to
a game pixel, lit from the upper left, an ink seam round every part, banded glows), `emblems.py` (the four bosses' marks),
`tablet.py`, `portal.py` (painted over `docs/mockups/endless_town/pictures/rim3_whole.png`), `bosses.py`, `beasts.py`, `rider.py`,
`mountains.py`; `sheets.py` and `round2.py` to `round6.py` make the sheets in `pictures/`. `brawler.png` is the Brawler's standing
frame from the live heroes' bake (1fdc8d09059a), for size.
