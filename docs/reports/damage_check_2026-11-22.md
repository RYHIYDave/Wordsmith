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

## After his word: words in front add up, attributes give less and less (no cap)

His words: “I like the additive bonus to words, but maybe just have attributes have diminishing returns on scaling.  I don't like a
cap”. Built in the Godot game (`words.gd` WORDS_ADD, ATTR_CURVE: an attribute counts in full to 50, then 50 + 100 x ln(1 + the rest
/ 100)), and the check run again, the gear and words chosen afresh for the new rules (the whole run:
damage_check_2026-11-22_after.txt). Damage a second into one enemy, in the fight, all four words (before in brackets):

| Hero | no words | one in front | one in front, one behind | all four | one hit (critical) |
|---|---|---|---|---|---|
| Warrior | 14,664 | 1,011,540 | 1,393,728 | 2,307,014 (85,599,347) | 9,576 (43,092) |
| Ranger | 19,200 | 420,981 | 603,299 | 1,278,333 (19,333,671) | 4,318 (29,796) |
| Tinkerer | 4,507 | 272,903 | 428,304 | 1,130,759 (8,106,251) | 2,974 (16,956) |
| Mage, fire | 852 | 92,975 | 135,515 | 300,906 (1,044,665) | 1,983 (8,927) |
| Mage, frost | 1,190 | 15,970 | 31,627 | 74,564 (110,725) | 2,409 (16,625) |

The best Warrior is now about 31 times the frost Mage (was about 770). Early on, nothing changed (attributes are below 50 there):
a word in front and one behind still about three times the damage for the Ranger and the Warrior.

What is left: the POISON. One poison meld in front (Blight, Contagion, Fumes) still multiplies the damage 22 to 109 times, the
hit only 2 to 5 times of that: each hit's dose is a share of the hit A SECOND, eight doses deep, with poison damage on gear (up
to +405%) on top.

## After his “Yes”: a poison dose spread over its 4 s

(The whole run: damage_check_2026-11-22_poison.txt.) All four words, in the fight: Warrior 487,966; Ranger 518,139; Tinkerer
158,608; fire Mage 86,222; frost Mage 66,648. Early on: the Ranger's Poison in front x1.1 (was x2.2), Poison in front and Power behind
x1.5 (was x3.1); the Warrior's Power in front and behind still x2.7.

His word on it: “Frost is a bit more defensive so it having lower dps makes sense, but a warrior should not be 7x stronger.
Especially if str is also adding bonus health for waaaay more survivability than the mage”. Where the Warrior's lead over the fire
Mage (about 5.7 times) comes from:
- before any word, his Strike a second is 1.6 times her Wave (greatsword 41-58 at 1.05 a second, Strike all of the hit; staff
  41-59 at 1.0, Wave 0.65 of it);
- his words in front add to the hit (Blight carries Power, and is not weakened as the other poison melds are; Heavy), hers mostly
  do not (Fire in front burns, it adds nothing to the hit; Fumes is weakened a fifth): x4.0 against x1.8;
- Strength stacks faster than any other attribute on gear (Rank II Power is the only ranked word that gives one: +41 a piece,
  where the best Intelligence is +27), and Strength gives life besides.

## After his “Yes”: the classes evened; then Frost as hard as the rest

(words.gd EVEN_BASE, ELEMENT_HIT, EVEN_GEAR_ATTR, FROST_HIT 1; the whole run: damage_check_2026-11-22_even.txt; the Tinkerer and the
Mages run again with the elite held where it stands, as their talents threw it out of reach.) All four words, in the fight (worked
out): Warrior 502,784 (403,065); Ranger 472,166 (400,243); Tinkerer 384,605 (412,431); fire Mage 54,509 (125,935); frost Mage
107,947 (116,514). Early on, the fire Mage's Fire in front x2.6 (was x1.6), the Tinkerer's Lightning x1.4 (was x1.1).

What is left between the Mages and the rest: their attacks are slower (1.87 a second against the Ranger's 2.92 and the Tinkerer's
3.24: Dexterity makes attacks faster and more often critical, Intelligence neither), and poison (eight doses deep) still out-does
burning (one at a time).

## The three defences: on at his “Yes.” to their pictures

docs/mockups/defences; loot.gd DEFENCE_LAYERS on; `--only=defence`: 6 checks, 0 wrong.
