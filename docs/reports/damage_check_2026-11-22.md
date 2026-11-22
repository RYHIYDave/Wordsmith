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

## The fairer fight, and burning's own

His “Yes to both”: each hero's quick attack and his hold, the same four words in each, into the elite and into a tough pack (six of
the floor's own, 2,000,000 life each, held where they stand), what one fight leaves to come gone off on nothing before the next
(damage_check_2026-11-22_fair.txt). Into the elite, and the pack dead in: Ranger 504,260 a second, 6.2 s; Warrior 686,321, 5.2 s;
Tinkerer 720,084, 3.7 s; fire Mage (Fumes, a poison meld) 259,430, 8.8 s; frost Mage 136,225, over 30 s (its pack slid out of
reach: the pack now held where it stands).

Burning's own (his word: “a burning target takes more total fire damage”; words.gd BURN_MORE): the fire Mage, her words held still
(Fire II, Twin; Power II, Fleeting), none / +50% / +100%: into the elite 121,648 / 161,765 / 230,125 a second; the pack dead in
16.5 / 12.3 / 10.2 s (damage_check_2026-11-22_burn.txt). Set at +100%.

## The Mage's Wave and Orb harder; the Warlock and the Brawler checked

His “Do that.” (the Mage's packs to within about half again the Warrior's, her one enemy lower) “And check the brawler and warlock
as well.” words.gd MAGE_MORE 1.35 on her Wave and Orb; the fair fight (damage_check_2026-11-22_mage_warlock_brawler.txt), into the
elite, and the tough pack dead in: fire Mage 320,810 a second, 7.5 s (the Warrior 686,321, 5.2 s); frost Mage (Scald, fire and frost
melded) 351,591, 5.7 s; Brawler 424,658, 7.2 s (his quick attack alone 6.6 s); Warlock, as a man, 439,587 a second with his bolt
alone, the pack dead in 0.9 s: his Hex Chain (a bolt leaping on to three more cursed, 70% each), Blazing Arm (his bolt bursting
round what it hits while his pact is full, 50%), his hellfire burning and burning's own on it, in a knot of six, about fourteen
times the Warrior's clearing.

## The Warlock's packs: the cause found and mended; the Brawler with his build

The trace, counting each hit as it lands (after the curse, burning's own and the rest: monster.gd trace), showed the pack's life
all but wholly from his Hellfire Bolt, half of it burning's own. The cause: with Fire in front his bolt bursts where it strikes,
and every enemy caught in that burst was taken as struck by the bolt itself, each setting off a Hex Chain and a Blazing Arm burst
of its own: in a knot of six one bolt came to some forty bolts' worth. Now only the one the bolt itself strikes sets them off
(heroes/kit.gd splashing, heroes/warlock.gd on_hit; `--only=talents` with WS_TALENTS_ONLY=warlock: 20 checks, 0 wrong). Into the
elite, and the tough pack dead in (his bolt alone; with his hold, the Curse): Hex Chain 35% and Blazing Arm 25%, halved as set,
472,332 a second, 3.3 s (5.2 s); at the game's own 70% and 50%, 451,384, 2.9 s (4.2 s). Kept halved: beside the Tinkerer's 3.0 s
(3.7 s), the quickest of the rest.

The Brawler with his build (his words: “he's a dex/str hybrid so poison, power, and crit could make for a powerful combo”):
Blight and Heavy in front, Power II and Fleeting behind, gear chosen for them (Strength 463, Dexterity 119; critical 75% for +470%;
1.64 attacks a second): his quick attack into the elite 344,675 a second, the pack dead in 7.4 s (with his hold 271,669, 7.7 s).
The build chosen before (Fumes and Heavy; Power II and Fleeting; Dexterity 376, 2.13 attacks a second): 452,975, 6.6 s (424,658,
7.2 s). Fumes is fire and poison together, and burning's own doubles its fire half.
(damage_check_2026-11-22_warlock_brawler2.txt)

## Burning's own the Mage's alone

His words: “Maybe we change some stuff in the mages fire tree for the "burning enemies take more fire damage" cause I don't like
that fire is BiS for a str/dex character”. A burning enemy takes double from a fire hit only of a hero who has taken Hearth, the
fourth of the Mage's fire path (words.gd BURN_HEARTH; Hearth's card in place of its mana half, which this port has not). The fair
fight again (damage_check_2026-11-22_hearth.txt), his quick attack into the elite and the pack dead in (with his hold):
- the Brawler, his words found afresh: Blight and Precise in front, Power II and Fleeting behind, no fire (Strength 381,
  Dexterity 180): 375,012 a second, 6.5 s (384,973, 9.2 s). Before, Fumes: 452,975, 6.6 s.
- the Warlock (Fire II, Swift; Power II, Fleeting): 283,098, 5.9 s (192,407, 8.9 s); with Hex Chain and Blazing Arm at the game's
  own 70% and 50%: 263,265, 4.5 s (192,507, 7.5 s). Before, with burning's own: 472,332, 3.3 s.
- the fire Mage, Hearth hers (Fire II, Twin; Power II, Fleeting): 158,128, 11.3 s (318,846, 7.2 s), as before (320,810, 7.5 s).
- the frost Mage, Scald (fire and frost melded), no Hearth: 109,969, 23.9 s (209,068, 10.7 s). Before: 219,763, 15.5 s (351,591, 5.7 s).

Then his words: “It should be good for the mage since she's elemental, and good for the warlock since he's DoT focused.  But not
for everyone.” Burning's own the Warlock's too, his own, on what burns in his hellfire as well (words.gd burn_more; his Hellfire
Bolt's card says so): 442,283 a second, the pack dead in 3.1 s (295,743, 5.5 s), as he was. Hex Chain and Blazing Arm kept halved.

And his words: “It could still be some %more fire damage to burning enemies so you could spec into fire if you wanted to.” Every
other hero's fire +25% on what burns (words.gd BURN_MORE_ALL). The Brawler with Fumes and Heavy, Power II and Fleeting (gear chosen
for them, Dexterity 376), his quick attack into the elite and the pack (with his hold), the others' share at none / +25% / +50%:
431,231, 7.4 s (381,827, 6.7 s) / 440,001, 6.6 s (427,456, 7.2 s) / 443,825, 6.6 s (475,039, 6.2 s). Burning's own was never
what made Fumes his best: it is fire and poison at once (a piece it is burned into gives both), and poison stacks.

## What is one class's own is in its tree

His words: “If we want something to be for only certain characters, it needs to be built into their tree / Like poison stacks 4
times naturally, but up to 8 for the ranger if you take the talent point / And maybe the warlock gets some blanket for Damage over
time like it has infinite duration or something.  It can't be the same but the specialization in the tree is the point”. Poison
four doses deep for all, eight with the Ranger's Venom; burning's own off the Warlock's class; his Pyre, his curses never run out
(his burns on a cursed enemy never going out are the Burning Verse's already, a unique). `--only=talents`, WS_TALENTS_ONLY ranger
and warlock: 23 and 21 checks, 0 wrong. The fair fight (damage_check_2026-11-22_trees.txt), each his quick attack into the elite
and the tough pack dead in (with his hold):
- Ranger (Blight, Precise; Power II, Fleeting; Venom his): 456,305, 4.5 s (484,650, 4.4 s)
- Tinkerer (Contagion, Precise; Demolition, Fleeting): 424,778, 3.7 s (434,626, 3.9 s)
- Warlock (Fire II, Swift; Power II, Fleeting): 342,086, 5.2 s (221,898, 7.4 s); Hex Chain and Blazing Arm at the game's own
  70% and 50%: 315,847, 4.3 s (218,333, 6.8 s)
- Warrior (Blight, Heavy; Fleeting, Power II): 318,661, 7.4 s (394,938, 6.9 s)
- Brawler (Fumes, Heavy; Power II, Fleeting): 256,627, 7.9 s (297,492, 8.2 s)
- the fire Mage (no poison in her words) as before: 158,128, 11.3 s (318,846, 7.2 s)
The words are those found best before; with poison four deep the Warrior's and the Brawler's best may now be others.

Then his words: “I mean, if he already has the talent he doesn't need another one.” (Pyre as it was: his burns on a cursed enemy
never going out the Burning Verse's, a unique) and the Curse thrown where he aims, on at his “That's fine.  If his damage numbers
are still okay I'm fine with it being on a unique”. The Warlock (Fire II, Swift; Power II, Fleeting), without the unique:
308,258 a second into the elite, the pack dead in 5.4 s (with his Curse 206,231, 7.7 s): among the rest, below the Ranger and
the Tinkerer, about the Warrior.

## Each hero's best words

His words: “I love to know what the best word combos are.  Just for my knowledge”. For each hero (level 50, gear chosen for
each set of words), the best four worked out, and the best with each kind of damage first in front; each fought, his quick attack
alone (damage_check_2026-11-22_best_words.txt). Behind, in every one: Power II and Fleeting. Best into the elite / best into the
pack:
- Ranger: Contagion and Precise, 763,988 a second and 2.2 s, both (Frostbite and Precise 744,293, 2.6 s; Fumes and Precise
  722,935, 2.9 s; Blight and Precise 477,355, 4.8 s)
- Tinkerer: Frostbite and Precise 493,625 (5.9 s) / Contagion and Precise 3.4 s (449,251)
- Warlock: Blight and Heavy 545,500 (5.3 s) / Volatile and Blight 5.2 s (373,377); his Fire II and Swift 314,562, 5.0 s
- Warrior: Blight and Heavy, 341,906 and 6.6 s, both
- Brawler: Frostbite and Heavy 275,160 (8.9 s) / Contagion and Heavy 4.9 s (272,175)
- fire Mage: Fumes and Heavy 230,394 (10.5 s) / Wildfire and Twin 7.9 s (103,561); her Orb not counted
- frost Mage: Fumes and Heavy 188,300 (11.9 s) / Wildfire and Twin 8.9 s (97,460); her Orb not counted
What it shows: a poison meld (Blight, Contagion, Frostbite, Fumes) is in the best words of every hero, poison four doses deep or
not; Contagion's arcs carry poison through a pack; the Ranger with Venom's eight doses and Contagion is the strongest of all.
(The search worked out alone picks Blight for most; fought, the melds of poison with an element often beat it: the worked out
counts one enemy, and not a meld's spreading.)

## Why the poison melds are so strong

His question: “Yes why are poison melds so strong for everyone”. In the code (hero.gd hit_monster, monster.gd dose): a dose is its
share of the hit as it lands, the hit already made more by damage, its element's bonus, the word bonuses and a critical; then
Poison Damage makes the dose more again, on top. Two bonuses that multiply each other; and a poison meld burned into gear gives
both on one piece (Contagion +40% lightning and +40% poison, where a plain word gives +54% of one, a Rank II +81% of one). Poison
also adds up dose on dose, where burning does not. Contagion's arcs carry the poison to the rest of a pack.
How much of the pack's harm was poison (damage_check_2026-11-22_poison_why.txt): the Warrior's Blight and Heavy 76%; the Brawler's
Frostbite and Heavy 80%; the Ranger's Contagion and Precise 47% (his lightning hits the rest).
A switch made to try (words.gd POISON_ADD, off): a dose is its share of the hit without the hit's element bonus, and damage and
Poison Damage added together. With it, the best words found again: the Ranger's best Shiver and Swift, 493,472 a second, 3.3 s
(Blight and Swift 261,103, 7.9 s); the Warrior's Sunder and Swift 251,839, 9.8 s (Blight and Swift 168,984, 12.7 s). Poison no
longer the first choice; the top of every hero lower. The Brawler's search came out far lower in the fight than worked out
(96,429 a second against 170,948): to be looked at before anything is set by it.

## Poison mended, and the heroes evened again

His “Yes both”: poison's bonus added to damage's, not on top of the hit's (words.gd POISON_ADD on), and poison growing with
Dexterity in any word, Blight too (POISON_DEX). The Brawler's punches did not read Twin, though his card says “hits twice”: now
each blow lands twice (heroes/brawler.gd _hit; Fire II and Twin fought 102,217 a second before, 167,963 after; the heroes check,
the Brawler, 7 steps, 7 as the game's). Then the Warrior and the Brawler the lowest: their quick attacks made more (words.gd
WARRIOR_MORE 1.5 on Strike, Cleave, Chop and Smash; BRAWLER_MORE 2.0 on his punches). Each hero's best (quick attack alone; into
the elite / the pack; damage_check_2026-11-22_poison_fixed.txt):
- Ranger: Shiver and Swift 481,261 a second (3.4 s); Forking and Swift the pack in 3.1 s
- Tinkerer: Forking and Swift 470,725, 2.1 s
- Warlock: Eruption and Swift 356,821 (4.5 s); Wildfire and Swift the pack in 3.7 s
- Brawler: Fire II and Twin 351,641, 7.0 s
- Warrior: Sunder and Swift 349,238, 6.2 s
- fire Mage: Scald and Twin 180,454 (12.2 s); Wildfire and Twin 7.2 s (her Orb not counted)
- frost Mage: Eruption and Swift 148,328 (14.3 s); Wildfire and Twin 8.9 s (her Orb not counted)
Poison no hero's first choice now; Blight's best 290,148 (the Ranger's). Behind, every one: Power II and Fleeting.
