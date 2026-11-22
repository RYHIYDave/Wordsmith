# The damage check, 22 Nov 2026 (the Godot game)

His words: “I'd like you to check on damage.  I feel like right about the time you get a word in back and in front of your
attacks the damage kinda skyrockets.  So can you run, let's say a ranger with full dex scaling, optimized gear rolls for poison
damage, full damage talent tree points, and words to push the poison as far as possible and see how hard it can actually hit in a
min/max build.  Maybe try it with warrior and str and power, tinker with lightning and volatile, and the mage with fire or frost
maxed”

## How it was run

- `npx tsx tools/godot_dmg_gear.ts 20 <file>`: every base and every word a piece of gear can take at item level 20 (the best floor
  20 drops), each at the top of its range, from the game's own item tables.
- `--only=dmg` (`godot/scripts/check_dmg.gd`), with `WS_DMG_GEAR=<file>` (and `WS_DMG_EARLY=<item level 5 file>`): for each hero a
  level 50 hero (all ten talent points, all four word slots on each move), every attribute point in what his attacks grow with,
  his ten talents on damage, and the best gear for his quick attack: each piece a plain one of its best base with four words
  burned in (the most a piece holds), the words on his attack chosen the same way, over again until nothing better was found.
  The only rule given to the choosing: the word in front must be of the build's own (poison, power, lightning, fire, frost), and
  the Tinkerer's Volatile somewhere on the move.
- Then the FIGHT, on floor 20 among its own monsters: his quick attack as he makes it, by itself, into one elite that cannot die
  (what it lost a second, seconds 2 to 10), and into a pack of six of the floor's own held in a knot (seconds till all are dead).
  “Worked out” is the same from his numbers by the fight's own sums; the two agree to within about half again either way (the
  fight has his talents' extra blows and bleeds in it). The fire Mage was run again with the ground his moves leave cleared
  between fights (the first run's burning ground from one fight had run on into the next); the others' fights may each carry a
  little of the step before's.
- Early on: a level 10 hero, his points in his attribute, his first two talents, the best plain weapon of floor 5 and nothing
  else, only words that are found.

Floor 20's monsters: regulars 229 to 633 life, elites 688 to 2,754, the Moth 20,124. Floor 5's: regulars 22 to 115, elites 130 to
764, the Fleshmancer 5,577.

## What came out

Damage a second into one enemy, in the fight (worked out in brackets):

| Hero, level 50, perfect floor 20 gear | no words | one word in front | one in front, one behind | all four |
|---|---|---|---|---|
| Warrior (Blight, Heavy; Power II, Fleeting) | 12,418 (8,185) | 4,133,110 (2,756,124) | 11,518,990 (8,314,056) | 85,599,347 (71,169,587) |
| Ranger (Blight, Precise; Fleeting, Power II) | 33,788 (31,064) | 1,866,974 (1,403,591) | 2,955,063 (2,264,284) | 19,333,671 (13,666,029) |
| Tinkerer (Contagion, Precise; Demolition, Fleeting) | 18,775 (16,635) | 1,027,593 (838,682) | 1,495,364 (1,237,348) | 8,106,251 (6,569,560) |
| Mage, fire (Fumes, Precise; Fleeting, Power II) | 1,722 (1,440) | 206,681 (144,267) | 301,596 (212,964) | 1,044,665 (727,958) |
| Mage, frost (Scald, Heavy; Power II, Fleeting) | 1,761 (1,762) | 28,961 (20,451) | 35,064 (26,996) | 110,725 (82,171) |

One hit of the Warrior's Strike with all four: 129,425 (a critical 582,416). The same four words with only his class's starting
attributes: 15,616,859 a second (the Ranger 6,207,155; the Tinkerer 1,749,825; the fire Mage 442,755; the frost Mage 32,134).

Early on (level 10, a floor 5 weapon and nothing else), damage a second in the fight:

| Hero | no words | the word in front | it and one behind |
|---|---|---|---|
| Ranger | 28 | 66 (Poison) | 92 (Power behind): x3.2 |
| Warrior | 30 | 50 (Power) | 82 (Power behind): x2.7 |
| Tinkerer | 22 | 25 (Lightning) | 29 (Power behind), 39 (Volatile behind) |
| Mage, fire | 18 | 29 (Fire) | 37 (Power behind): x2.0 |
| Mage, frost | 19 | 17 (Frost) | 22 (Power behind) |

## Why it skyrockets

1. **Every word grows with the attribute, with no ceiling.** Power in front is +25% and +0.6% for each point of the attribute; Heavy
   +50% and +0.5% a point; Precise +30% and +0.5% a point; Poison's dose 20% and +0.4% a point of the hit, a second; Power behind
   +6% and +0.1% a point, five times over (`words.gd` resolve, as `game/words.ts` resolveSkill). At 640 Strength: Power +409%,
   Heavy +370%, Power behind +365%.
2. **The words in front multiply each other and the attribute.** The attribute itself is +1% a point on the move (640 Strength: x7.4);
   Power x5.1 on top, Heavy x4.7 on top of that: the Strike x177 before gear.
3. **Attributes on gear have no ceiling.** Rank II Power burned into a piece gives +41 Strength at item level 20 (a found affix
   up to +23); one in every piece is +369. The best gear for every build was attribute in every slot.
4. **A melded word in front is both its words in one slot.** Blight is Power and Poison; Contagion Lightning and Poison; Fumes Fire
   and Poison; Scald Fire and Frost. The best word in front for every build was a meld, and four of five were poison's.
5. **Poison stacks on the size of the hit.** Each hit adds a dose of a share of the hit a second, for 4 s, eight doses deep, and
   poison damage on gear on top (+405% on the Warrior's). With Blight at 640 Strength each dose is 276% of the hit a second: the
   poison alone is about 22 hits a second, times five.
6. **Fleeting behind** was chosen by every build (what its move leaves and gives ticks faster and harder).

Early on the same thing is small but felt: a word in front and one behind is about three times the damage (Ranger x3.2, Warrior
x2.7), when a floor 5 monster has 22 to 115 life.

The builds are far apart: the Warrior's best is about 770 times the frost Mage's.

## What to do about it (for his word)

Recommended: the words ADD their bonuses instead of multiplying them, and what a word gains from the attribute stops at a ceiling
(for one, no more than its own starting figure again); attributes from gear and poison's doses looked at after, with this check
run again to his targets (how many times the damage a word in front and one behind should give early on; how long a min/max hero
should take over floor 20's boss).
