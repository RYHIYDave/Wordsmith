# Floor 9: two side bosses for the ward-stone's pieces

Made by the Brawler switch chat (13 Nov 2026) on its branch design/f9-side-bosses, cut from main 2a3f5119 (25.3.16), a new task at his
word after floor 5's temple door. Everything is to go behind a switch of its own, off, until his yes to it in play.

## His words

- His task, 13 Nov 2026 (asked whether to start a new task): “I need two side bosses for level 9.  There are three pieces that need to
  drop for the three obelisks in the swamp boss fight.  The deer boss drops one, I was a spectral wolf boss, and I want a guardian boss,
  the troll guys from the prison”. Read as: floor 9 (the Pinewood, QUESTS610) gets two side bosses, a spectral wolf and a troll; each
  drops one of the ward-stone's three pieces (game/quests610.ts), the Stag the third as now; “I was” read as “I want”.
- The wolf's look: “Giant mist wolf (Recommended)” (offered as: twice the size of the floor's wolves, pale and see-through, trailing
  mist, pink eyes; his ghost glow the enemy's pink, cyan being the friend's).
- The wolf's attacks: “Bite, claw sweep, howl calling the wolves, lunge, I like the mist cloud too” (the lunge offered as: he goes
  see-through and passes through you; the mist cloud as: a cloud of mist that hides him and hurts). Five, at his word.
- The troll: “A new troll chieftain” (offered as: a new look and new moves).
- Where they wait: “I want them in the side areas, but I want the side areas stylized to them.  So like some trollish ramshackle
  barricades or whatever.  Some guardians milling around the entrance.  A misty glade for the wolf, moonlight beam coming down”.
- The chieftain's look: “Huge, crowned in bones (Recommended)” (offered as: half again the prison trolls' size, war paint, a crown of
  antlers and skulls, a tree-trunk club bound with iron).
- The chieftain's attacks: “The first one, but I want the warcry to be a rage that gives him attack speed and move speed” (the first:
  a heavy club smash; a ground slam that cracks the ground in a line; a war cry, his rage, quicker in his blows and his feet; a bull
  rush).

## The plan

Pictures first (his rule): each boss standing, front and back, beside a hero; their two side areas pictured; each attack on film; then
the rules behind the switch, the pieces they drop, and the whole of it filmed in play for his yes.

## The looks

- First shown (pictures/f9_bosses_look.png, first version, commit 4ee6f012): the floor's fog wolf and the pack leaders' chieftain made
  bigger and touched up. His word, 13 Nov 2026: “No draw them correctly”. Read as: draw each new, sculpted as the game's newest
  figures are, on no other figure's bones. The first try's code was taken out.
- Drawn again (pictures/f9_bosses_look.png, now): both sculpted from scratch in src/dev/sculpt_f9_bosses.ts (a mock-up tool; nothing
  of the game imports it), standing, front and back, beside the Brawler, a troll guardian and a fog wolf for size
  (tools/f9_bosses_sheet.ts, .py).
  - THE TROLL CHIEFTAIN: half again a troll guardian's height. A hunched barrel of a troll, slate-blue and mottled; boulder shoulders,
    long arms with iron cuffs, fists like anvils; a crown of bone with two great antlers and three skulls; glowing pink-gold eyes in a
    red war-paint mask, white streaks under them, two tusks; a necklace of teeth; a white zigzag across his chest, a red handprint
    over his heart, three white slashes down his back; a ragged skirt of hide and fur strips on a leather belt; a tree-trunk club,
    two iron bands round its head, leant on the floor before him.
  - THE MIST WOLF: twice a fog wolf's size, its shoulder at the knight's head; pale mist streaked like fur, a heavy ruff, a long head
    low and forward, ears laid back, fangs, pink-gold eyes; its legs, its belly fringe and its tail's end thinning into see-through
    mist; puffs of mist streaming off its back and tail; a haze of mist on the floor round its feet. Pink edge (an enemy's); nothing
    cyan.
- His answer to the looks drawn again: “Yes, film their attacks (Recommended)” (offered as: next, their two side areas, then each
  attack on film).

## Their side areas

Behind F9_LAIRS (off): game/f9_lairs.ts lays them (game/act1_dress.ts calls it; game/act1_layout.ts grows the lair and sets its pack);
art/f9_lairs.ts draws their thirteen pieces (render/act1_pieces.ts takes them on floor 9 while the switch is on).
- THE TROLLS' CAMP, the floor's lair grown to a boss's room (8 by 7 tiles, as the Stag's): barricades of sharpened logs lashed
  across it either side of the way in, skull poles flanking the gap, crooked palisade round the rest of its edge, the trolls' fire
  (the enemy's pink and gold, as the cult's) in its middle, two hide lean-tos, gnawed bones, and the chieftain's seat of boulders,
  logs, a fur and a stag's antlers at its back. Its pack of guardians stands just inside the way in (his “Some guardians milling
  around the entrance”).
- THE MISTY GLADE, the floor's side area: the moonbeam coming down slantwise into its middle (pale, dithered, never a glow), a ring of
  clawed standing stones round it open toward the way in, white dead trees toward its edge, mist lying in drifts, moonflowers, a
  deer's bones. No pack of the floor's is laid in it (his wolves come at the mist wolf's howl); its chests stay.
- Pictured (pictures/f9_side_areas.png): the game's own pictures of both on floor 9 (seed 9), the bosses' standing pictures laid in
  at their spots (they are not in the game yet): tools/scenarios/f9_lairs.mjs (ON=1, WIDE=1.3, CANVAS_OUT), tools/f9_lairs_composite.ts
  and .py. The pieces alone: tools/f9_lairs_sheet.ts and .py.
- His answer to the side areas: “It’s good but his club kinda looks like shit in his hand”. Read as: the areas are right; the
  chieftain's club wrong where he holds it (a stub jutting at the eye, no hand seen round it). Drawn again: over his right shoulder,
  his right arm raised, his fist before the shoulder wrapped round a leather-bound handle (knuckles, fingers, thumb), its knob below
  the fist; the trunk long, knotted, two iron bands round its head, its end flaring to root stubs; seen at its length from in front
  and behind. Pictured: pictures/f9_chief_club.png (and f9_bosses_look.png, f9_side_areas.png made again with it).
- His answer to the club drawn again: “Yes, film the attacks (Recommended)”.

## Their attacks, on film

pictures/f9_bosses_film.mp4 (tools/f9_bosses_film.ts): each move beside the Brawler on a stand-in of the Pinewood's grass, the
blows also at half speed, captioned. Both bosses now sculpted on a rig (dev/sculpt_f9_bosses.ts ChiefPose and WolfPose); their moves as
poses a moment at a time (dev/f9_bosses_moves.ts). Each strike wound up and HELD with its warning marked on the ground, struck in two
frames, followed through.
- THE TROLL CHIEFTAIN: the club smash (both hands, up over his head, a ring marked where it lands; a shockwave, the ground cracked;
  also from behind); the ground slam (crouched, up on his toes with the club straight up, a line marked; driven down, the ground
  cracks open along the line, rock thrust up along it); the war cry (gathered in, then the roar; the rage on him, pink and gold flames
  off him, then three quick heavy strides: his blows and feet quicker); the bull rush (head down, the club tucked like a ram, pawing
  the ground, his line marked; down it at a run; skids to a stop).
- THE MIST WOLF: the bite (gathered back, the lunge in, jaws open, snapped shut); the claw sweep (up a little on its hind legs, a
  forepaw raised, swept across); the howl (head thrown back, rings of it rising; the floor's fog wolves out of the mist either side);
  the lunge (crouched, its line marked; gone to mist, through you, its shape again beyond); the mist cloud (breathed out, it goes into
  it; glints where it hurts; it thins).
- His answer to that film: “No man this all sucks.  There are rules and these animations do not follow any of the rules.  They need to
  be wild and crazy”. Read as: they broke his art rulebook (Animations 1, as far as it will go; Movement 9, big wind-up and a lightning
  strike; Movement 7, the freeze; the screen's kick; Hits 3, the one struck flashes and is thrown; Movement 4, loose things follow).
  Done again to the rules, each checked against them before he saw it:
  - every blow wound up big and HELD, straining (a tremble in the held pose), its warning marked on the ground; struck in two frames,
    smeared (a crescent along the arc the club swept), with after-images of the body; the scene frozen a tenth of a second where it
    lands, the screen kicked; a big wind-down;
  - the Brawler struck: a white flash, his reel, thrown back away from the blow;
  - his kilt and necklace, the wolf's belly mist and tail, left behind by their going and settling after;
  - the chieftain's own wild (the earth and brute force): the smash's burst, rings of shock, the ground cracked out from it glowing,
    stone flung up, embers; the slam a leap and a crash, the line split open with rock thrust up along it as it runs; the war cry
    gathered in shaking, then thrown open: the burst, the roar's rings, the rage's fire bursting up round him and on him, the blast
    throwing you back, then quick strides with speed lines; the bull rush a blur of after-images and speed lines into you;
  - the wolf's own (mist and speed): after-images of it in every strike, the jaws' crescents closing, three great claw crescents, mist
    bursting where it struck and where it went; the howl's rings, the fog wolves bursting out of mist; the lunge gone to mist through
    you in a blink, its streak of mist behind; the mist cloud drawn in, blasted out in a ring, its claws at you out of it (you stay in
    sight in it), its eyes moving in it.
- His word to that film, 13 Nov 2026, 23:50: “The claw sweep is bad.  Most of the guardian stuff is bad but from the phone screen it’s
  probably okay??”. Read as: the claw sweep done again; the guardian (the troll chieftain) rough close up, and his question whether it
  will look all right at the phone's size. Done: the claw sweep made a rear right up on its hind legs, a forepaw cocked high, its sweep
  marked on the ground as an arc, then a crash down across you in two frames with three long claw marks and the ground scored; the
  club's smear filled solid and the after-images made a fading checker of the body (they had read as stripes and scribbles); and a
  film at the phone's own size (pictures/f9_bosses_film_phone.mp4: 1278 picture pixels across, as the game shows a phone 852 points
  wide), each scene a pixel to a pixel.
- His word to the phone-size film, 14 Nov 2026: “Yes, build them in (Recommended)”.

## In the game (behind F9_LAIRS, off until his yes to them in play)

Built in on this branch, the switch F9_LAIRS (game/f9_lairs.ts) holding the side areas and their bosses together:
- THEIR PICTURES (art/f9_bosses_art.ts; the sculpts and the moves moved from dev/ into art/: f9_bosses_sculpt.ts, f9_bosses_moves.ts):
  each seen from in front and from behind (its back as the camera truly sees it, his club in his right hand), facing along the floor's
  grid and turned over for the other way, as every monster is. THE TROLL CHIEFTAIN ('warchief'): his stand (heaving, his jaw working),
  his walk (a heavy rolling stomp, his feet gripping the floor, the floor shaking at each footfall), the smash (his `attack`), the
  slam, the war cry, the bull rush, struck, and HIS DEATH: down on one knee on his club, a last roar at the sky, and TURNED TO STONE
  as he roars (as trolls are), left kneeling there. THE MIST WOLF ('mistwolf'): its stand, its walk (a long low trot), the bite (its
  `attack`), the claw sweep, the howl, the lunge, the mist cloud, struck, and ITS DEATH: its legs give, it sinks down, and it comes
  apart into the mist it was, its eyes last. New since the films: the walks, the stands, the flinches and the deaths (he has not seen
  them yet), and the smash's end (his feet stepped back under him, so he ends as he stands).
- WHAT FOLLOWS THEM is in their pictures (the strike's after-images, the club's smear, the rage's fire and embers, the roar's and the
  howl's arcs, the mist drawn in and streaming off, the jaws' and claws' crescents, speed lines); WHAT LIES ON THE FLOOR is painted
  where it is (art/f9_bosses_fx.ts, render/act1_fx/f9_bosses.ts: the warnings, the ground broken, the bursts, stone and dust, the
  mist's clouds), all of it the films' own painting (art/f9_bosses_paint.ts).
- THEIR RULES (game/act1_rules/f9_bosses.ts): each blow lands where and when its picture's does: the smash on its ring; the slam's
  crack as it reaches you; the bull rush into you; the war cry's roar near him, then THE RAGE (his pick: attack speed and move speed):
  his moves 1.3 times quicker, his feet 1.45 times faster, ready sooner, for 9 seconds; the bite in its ring; the claw across its arc;
  the howl calls two of the floor's fog wolves out of the mist (three about at most); the lunge through you as mist (nothing reaches it
  then, and it lands well beyond you); the mist cloud, its claws at you four times while you stand in it (nothing reaches the wolf in
  it). Heavy blows land with the game held still a moment (0.05 to 0.13 s) and the screen kicked; those that throw you, throw you.
- WHERE: the chieftain before his seat at the back of his camp, the wolf on the moonbeam in its glade, each facing its way in; each as
  hard for the floor as a floor's boss is (as the Stoker is), not the floor's boss. THE PIECES: the wolf carries the side area's piece
  of the ward-stone, the chieftain the lair's, the Hollow Stag his own (game.ts piecesMade).
- Tests: tests/f9_bosses.test.ts. The film of them in play: tools/scenarios/f9_bosses_film.mjs, cut by tools/f9_bosses_cut.py
  (pictures/f9_bosses_in_play.mp4).

## Made too much (14 Nov 2026)

His word to the film of them in play (f9_bosses_in_play.mp4): “That is some of the most uninspired shit I’ve seen so far.   I know you
can do so much better than whatever this is”; and, told what was flat about it: “Nothing was added is  an admonishment that should
never happen.  I have rules in place specifically designed to not have to deal with this.   These animations are boring.  I’m supposed
to be looking for insane animations that need to be toned down but I have yet to see one issue with something being TOO intense”. Read
as: his rulebook (Animations 1, a notch too high) means he should be reining them in, never pushing them; so both redone to be too much:
- GROWN to fill the screen (the chieftain 1.5 of his sculpt, the wolf 1.1: art/f9_bosses_sculpt.ts CK, WK).
- THEIR MOVES PUSHED FURTHER: the smash wound right back behind him and driven down into a crouch; the slam a leap high off the
  ground; the war cry thrown wider; the bull rush lower, a ram; the wolf coiled lower, rearing higher, its howl thrown further back,
  its lunge longer.
- EVERY HEAVY BLOW: the screen flashed white, held still (0.1 to 0.2 s) and kicked hard (up to 16 game pixels); a crater, cracks out
  from it glowing; shockwaves rolling out across the arena; rocks flung high, bouncing; dust boiling up; a burst; speed lines out to the
  screen's edges; its light (art/f9_bosses_paint.ts, art/f9_bosses_fx.ts, render/act1_fx/f9_bosses.ts).
- THE WAR CRY: a wall of fire bursting up round him, the screen's edges red while the rage is on him. THE BULL RUSH: a trench torn
  as he runs. THE SLAM: the ground split open the length of its lane, slabs of rock heaved up along it.
- THE MIST WOLF: shockwaves of mist; the claw's three gouges torn deep and glowing; the howl rolling out again and again, the screen
  darkened and the mist rolling in at its edges; the lunge's tunnel of mist and its streak; the cloud grown (4.8 tiles round), many
  eyes burning in it.
- In play: each squares up to the hero before a move (its pictures face the floor's four ways), the smash strikes under the club too.
- Films of real fights (the game's automatic player fighting each, unhurtable): pictures/f9_chieftain_fight.mp4,
  pictures/f9_mist_wolf_fight.mp4 (tools/scenarios/f9_bosses_fight.mjs, tools/f9_bosses_cut.py).
