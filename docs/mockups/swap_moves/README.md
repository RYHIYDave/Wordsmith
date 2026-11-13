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

SO, THE MAGE (read back to him as each came):

| Where | Her move | Becomes | What it does |
|---|---|---|---|
| FIRE path, one stone | Wave (tap) | **BALL** | a ball of fire flies at the enemy and bursts where it hits (his “fireball”; named in the plain words he asked for) |
| LIGHTNING path, one stone | Orb (hold) | **BEAM** | his Beam of 4 Oct: it burns toward your finger while held, steered as you move it, through everything in its line |
| FROST path, one stone | Orb (hold) | **SPEAR** | a spear of ice flies where you point, through every enemy in its line, freezing the last it hits |
| WHERE HER THREE PATHS JOIN, in the middle | (new) a tap on her | **AURA** | a circle round her, its kind picked as she takes the stone: FIRE burns every enemy in it; LIGHTNING sends bolts to every enemy in it; FROST shields her and chills the enemies in it. A few seconds on, then a wait |
| FURTHER UP THE TREE, past the Aura | | (a stone) | the Aura stays on |

Orb wears one swap at a time: Beam or Spear. A tap on her is the Warlock's own way of changing (game/warlock.ts: his pact
full, a tap on him); on a pad, as his, the right bumper.

### The Ranger

6. Offered two stones changing his hold, Volley (arrows path: Barrage, arrows streaming where you point while held; traps
   path: Snare, a snare thrown where you point, what walks in held fast, then it bursts), his Shot staying, his words: “i like
   snare, maybe something like SNIPE where the longer you hold it the more damage the shot goes and it pierces through enemies”

SO, THE RANGER (his companions, live, are his other new):

| Where | His move | Becomes | What it does |
|---|---|---|---|
| ARROWS path, one stone | Volley (hold) | **SNIPE** | hold to draw: the longer the hold, the harder the shot, and it goes through enemies |
| TRAPS path, one stone | Volley (hold) | **SNARE** | a snare thrown where you point; what walks into it is held fast, then it bursts |

Volley wears one at a time: Snipe or Snare. His Shot and his Trap roll stay.

## Next

1. THE TREES' NEW SHAPE AS A PICTURE, for his yes (pictures first): the Mage's three paths meeting in the middle at the Aura,
   the stone that leaves it on further up; each swap's stone on its path; the Ranger's two stones on his arrow.
2. The rules, behind a switch that is off; each move's look painted and shown him in play, his yes; then the ship list.
