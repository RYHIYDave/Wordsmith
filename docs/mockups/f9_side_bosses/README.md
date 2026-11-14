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
