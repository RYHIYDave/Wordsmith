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
