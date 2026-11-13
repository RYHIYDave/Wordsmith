# Moves to swap between for the Mage and the Ranger: the design talk (12 Nov 2026)

Branch `design/swap-moves-mage-ranger`, from main 2a3f5119 (25.3.16). The queue item `design-swappable-moves-mage-ranger`,
pulled by the Brawler switch chat at his pick, asked whether to start another task: “Yes, Mage and Ranger moves
(Recommended)”. NOTHING OF THE GAME IS CHANGED YET: this is what he picked, for the tree's picture and then the build.

## Where it came from

His words, 4 Nov 2026 (docs/NEXT_VERSION.md), 19:18: “I had an idea for the warrior where your passives can swap his weapon
from broadsword to battle axe to greathammer and that would change his possible tap and holds.  Him and the mage and less so
the ranger need some work to get up to the level of the new three classes.” 19:19: “They just need different moves to swap
between.  I thought I would have just a ton of different classes to fill the archetypes, but I like the 6 currently and have
ideas for others that will be a bit different.”

The Warrior's half is live (25.3.11: his first talent point picks the greatsword, battle axe or warhammer). And at his pick of
28 Oct (“Everyone own moves”, game/defs.ts OWN_MOVES) the Mage kept Wave and Orb, “Slam, Familiar and Beam kept to come back
later as skill-tree swaps”: Beam is still in the code (game/defs.ts SKILLS.beam, from his words of 4 Oct).

## His picks, 12 Nov 2026, by pop-up, all by 21:43 (Eastern)

### The Mage

1. Offered her first talent point picking her weapon, the staff (Wave, Orb) or the wand (Familiar, Beam), as the Warrior's
   does: **“No weapon pick, swaps in her paths”** (offered as: she keeps the staff; talents turn Wave or Orb into something
   else). So she keeps the staff, her drops are as they are, Warp stays her swipe, her three paths stay.
2. Offered one swap on each path (fire: Wave to Familiar; lightning: Orb to Beam; frost: Orb to Blizzard), his words:
   “beam is good for lightning, ball for tap maybe in the fire slot for fireball, blizzard is too on the nose.  and id like the
   trees to reconnect in the middle to a tap on the hero ability called Aura and it turns on an aura around the mage.  it can
   do something like fire DoT or send out bolts to every enemy in the aura, or shields you and chills enemies in the circle”
3. Offered three frost swaps by their looks (Ice Mirror, Frost Bloom, Cold Snap), his words: “it needs a more generic word.  like
   orb or beam or wave or ball”. Then, offered Wall, Spear and Ring: **“Spear”** (the first time the pop-up came back
   “[No preference]”; he asked “send that again”).
4. The Aura's kind, offered “Her biggest path (Recommended)”, “Each tap switches it” and “She picks when she takes it”:
   **“She picks when she takes it”** (chosen once on the tree; unlearn to change).
5. How long the Aura stays on, offered “A few seconds, then a wait (Recommended)”, “On till tapped off, costs mana” and
   “Always on once taken”, his words: “one, and then maybe another passive that leaves it on further into the tree”.

SO, THE MAGE (read back to him as each came; as it stands after 7):

| Where | Stone | What it gives |
|---|---|---|
| FIRE path, beside its first stone | **BALL** | a move: a ball flies at the enemy and bursts where it hits (his “fireball”, but of no element of its own) |
| LIGHTNING path, beside its first stone | **BEAM** | a move: his Beam of 4 Oct, burning toward your finger while held, steered as you move it, through everything in its line (held only) |
| FROST path, beside its first stone | **SPEAR** | a move: a spear flies where you point, through every enemy in its line (not of ice) |
| WHERE HER THREE PATHS JOIN, in the middle | **AURA** | a tap on her: a circle round her, its kind picked as she takes the stone: FIRE burns every enemy in it; LIGHTNING sends bolts to every enemy in it; FROST shields her and chills the enemies in it. A few seconds on, then a wait |
| THE FAR END, from any path's last stone | **LASTING AURA** | the Aura stays on |

The new moves have no element of their own: they take her words' as Wave and Orb do. She can take stones on any path, and on
her ATTACKS page she puts any two of Wave, Orb, Ball, Beam and Spear on her tap and her hold (Beam only on the hold). A tap on
her is the Warlock's own way of changing (game/warlock.ts: his pact full, a tap on him); on a pad, as his, the right bumper.

### The Ranger

7. (The Mage again, 21:48) “i dont want spear to be ice spear, i want it to be spear, same with the others.  youll be able to dip
   into multiple trees so maybe you want spear and ball or beam and spear”. Offered: each stone adds its move and she sets any two
   of her moves on tap and hold, or each stone swaps a set one: **“She sets tap and hold (Recommended)”**.

6. Offered two stones changing his hold, Volley (arrows path: Barrage, arrows streaming where you point while held; traps
   path: Snare, a snare thrown where you point, what walks in held fast, then it bursts), his Shot staying, his words: “i like
   snare, maybe something like SNIPE where the longer you hold it the more damage the shot goes and it pierces through enemies”

8. Asked whether he too sets any two of his moves on tap and hold: “i like snare to swap for shot and snipe to swap for volley”.
10. Asked (22:06) “what is the distinction between ball, wave, and spear?”, told: Wave wide and short, Ball stops and explodes, Spear
    thin and long, each taking her words' element; his words: “nice, thats exactly what i was thinking”.
11. Shown the two drafted trees (pictures/mage_tree_draft.png, ranger_tree_draft.png): **“Yes, build it (Recommended)”**. At 22:44:
    “k going to bed, just finish up those trees and moves and ill see themm in the morning”.

9. 21:53: “and maybe something for the companions?  like Rally or something that gives nearby allies attack speed and damage or
   something”; and “as another swap for volley”.

SO, THE RANGER (his companions, live, are his other new):

| Where | His move | Becomes | What it does |
|---|---|---|---|
| TRAPS barb, beside its first stone | Shot (tap) | **SNARE** | a snare thrown where you point; what walks into it is held fast, then it bursts |
| ARROWS barb, beside its first stone | Volley (hold) | **SNIPE** | hold to draw: the longer the hold, the harder the shot, and it goes through enemies |
| beside his WILD COMPANION | Volley (hold) | **RALLY** | a call: his companions and allies near him attack faster and harder for a few seconds |

Volley takes one: Snipe or Rally. He can have Snare and Snipe (or Rally) together. His Trap roll stays.

## In the game, behind its switch (12 Nov 2026, by 23:00)

ALL OF IT IS BUILT, BEHIND `SWAP_MOVES` (game/talents.ts, OFF): off, the game is as it was (tests/swap_moves.test.ts test 1).

- THE TREES: MAGE2 and RANGER2 (game/talents.ts), as he was shown them. Every old stone keeps its id and works as now.
- game/swap_moves.ts: SWAP_TUNE (every number below, ours, his to change); which moves go where (swapInto, moveChoices).
- HER MOVES: BALL (a projectile that stops on the first enemy and bursts, 1.6 tiles, 60% of the hit round it; 0.9 of a hit);
  SPEAR (through everything in its line, 11 tiles, fast; 0.8 of a hit); BEAM (Version 12's, as it was). On her ATTACKS page the
  touched attack shows CHANGE TO …, cycling through what she has learned (ui/inventory.ts); kept in her picks (`@tap`, `@hold`),
  saved. Never one move in both places; Beam only on her hold. Ball and Spear are spells, as Wave and Orb.
- HER AURA: a tap on her (main.ts, as the Warlock's change), R, or the right bumper; its kind picked on its stone's card, three
  buttons, once (`pick.lock`: “Unlearn to change”); 6 s on, 10 s wait; 3.2 tiles; FIRE burns every enemy in it (30% of a hit a
  second), LIGHTNING bolts each every 0.8 s (45% of a hit, shocked), FROST a shield on her of 25% of her life and every enemy in it
  at half speed. LASTING AURA: on, always (frost's shield back 10 s after it breaks).
- HIS: SNARE on his tap (thrown where he aims, 7 tiles; what walks in held 2 s, then a burst of a hit; three lie at once); SNIPE
  (drawn while held, loosed on letting go or at 3 s; through its line; 0.6 to 2.6 of a hit by the draw, full at 1.5 s); RALLY (his
  companions' waits 30% quicker and their bites 30% harder, 5 s; 8 s to wait). With Snipe and Rally both, CHANGE on his hold.
  Rally hangs off Windrunner where companions are off (they are on in the release).
- THE LOOKS ARE STAND-INS: Ball a ball of light drawn large; Spear a streak of her element, its head lit; Aura a ring of its
  colour edged in cyan; Snare the trap's jaws; Snipe an arrow; Rally sparks; the skill bar's icons borrowed (Orb, Shot, Trap,
  Volley). Their own looks are for after his yes to the moves in play.
- FILMED in the practice room at a phone's size with the stand-ins (tools/scenarios/swap_moves_film.mjs, CLS=mage|ranger):
  pictures/mage_moves_standin.mp4 (Ball, Spear, Beam, the three Auras), pictures/ranger_moves_standin.mp4 (Snare, Snipe, Rally).
- CHECKED: tsc clean; tests/swap_moves.test.ts 12 of 12; unit `--only swap_moves, companions, practice_talents, talent_lines,
  talents, talents2, tinkerer_talents, traps, warrior_tree` and the core on 0b2a71349b: 30 passed, word_kinds.test.ts failing as
  it pinned the spells; mended (Ball and Spear are spells): `--only word_kinds` and the core on c0106ac4d5, all passed.
- KNOWN: switched on, an old Mage's stones past the middle (her warps and on) are not hers until she takes Aura (cleanTalents
  checks the way); their points come back to spend.

## Next

1. THE TREES' NEW SHAPE, DRAFTED IN THE GAME (game/talents.ts SWAP_MOVES, off: MAGE2, RANGER2; ui/talents.ts the new runes) and
   pictured from its own TALENTS page (tools/scenarios/swap_moves_trees.mjs; pictures/mage_tree_draft.png,
   ranger_tree_draft.png), for his yes. Every old stone keeps its id and works as now; the Mage's warps and what follows them
   moved past the Aura (MAGE2_AT). The new stones' cards say “A DRAFT: NOT IN PLAY YET”.
2. DONE: the rules, behind the switch (above). LEFT: HIS YES TO THE MOVES IN PLAY (the two films); then each move's own look and
   icon, drawn to the game's standard and shown him; then SWAP_MOVES on and the ship list.
