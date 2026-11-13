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
- NEXT: HIS WORDS FROM THE SADDLE, one at a time, each a film for his yes: Power (the hammer from the sky), Flame (the firestorm),
  Frost (ice spikes), Lightning (ball lightning), Poison (spore mines); each in its own colour with his pink through it. Then the
  boar's death and his landing; then phase 2 (his pink shade, the melds); his last stand; his death.

## The tools

`tools/endless_tablet/` (Python with Pillow and numpy; run from that folder): `kit.py` (a small pixel-art kit: two picture pixels to
a game pixel, lit from the upper left, an ink seam round every part, banded glows), `emblems.py` (the four bosses' marks),
`tablet.py`, `portal.py` (painted over `docs/mockups/endless_town/pictures/rim3_whole.png`), `bosses.py`, `beasts.py`, `rider.py`,
`mountains.py`; `sheets.py` and `round2.py` to `round6.py` make the sheets in `pictures/`. `brawler.png` is the Brawler's standing
frame from the live heroes' bake (1fdc8d09059a), for size.
