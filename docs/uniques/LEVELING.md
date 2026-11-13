# Leveling uniques, poison damage, and rolls for the 62

Branch `build/leveling-uniques`, cut from `build/uniques-on` (the 62 switched on at his yes; that branch is on the ship list as
`build-unique-items`). Made by the Uniques tuning chat, 12 Nov 2026, from the queue item `design-leveling-uniques`, pulled at
his pick “Leveling uniques now”. **Nothing here is live: LEVEL_UNIQUES and POISON_DMG are off in the game; both are on for his
unique-items test page only (src/main.ts, `try=uniques`). The 62's rolls are not behind a switch: they ride with the uniques.**

## His words

His idea, 12 Nov 2026, 18:19 Eastern, told the 62 are made at the level of the floor they drop on:
“i like that idea, especially for uniques that dont have values for what their special mods do.  but i also want some uniques
that are specific to the level and drop for leveling.  like level 1 uniques boots with nothing but 20% movement speed.  things to
twink out your character.  or a battle axe that deals no physical damage but deals 150% poison damage and has 10-20 flat poison
damage on it.” Then: “maybe just add that to the queue and we can work on it later”; then, asked whether to start a new task,
“Leveling uniques now”.

His picks, by pop-up:

- Where they drop: “Any level higher than its base level.  So some crazy endgame unique can’t drop in level 1 but a level 1
  unique can drop in endless.”
- Who wears them: “Anyone, unless it's a hero's weapon (Recommended)”.
- How many: “About 20, spread more evenly”; “Levels 1 to 30: 15 on the way, 5 endgame (Recommended)”.
- Poison, asked how the axe's poison should hurt (the game had poison only as a word): “There really should be poison damage in
  the game”; then “Over a few seconds, stacking (Recommended)” and “On all gear, like fire (Recommended)”.
- The endgame rule, of two drafts that went past a rare's best with no price: “If 20% is max, these will be BiS no questions
  asked.  Every single build will want them.  I guess that’s good but they should probably drop from the big boss”; “Things that
  are going to exceed what a yellow rare item can roll without a drawback are going to be BiS.  And will hurt build diversity”.
- Rolls: “If one has a roll, they all have to have a roll.  And I think we want rolls”. Read as (told him): every number rolls
  from about a fifth under to a fifth over what was agreed; The Last Word's price 50 to 100%, his own range.
- Build: “Yes, build it now (Recommended)” (offered as: poison damage and the 20, behind a switch that stays off, then a test
  page).
- Then, of the 62, 20:12: “I’d like the uniques we have currently to have rolls if they have those types of mods.  Or maybe add
  some of those mods that might need a roll.  We just want a little randomness, and to give a player something to keep playing
  for, like a really well rolled unique”. Read as (told him): every number on a unique's card rolls, a fifth either way, prices
  too; those with none stay as they are for now (to suggest a few that could take one, once he has seen the rest). His answer:
  “Nice that’s great”.

## The twenty (src/game/uniques.ts LEVEL_DEFS)

Each made at its level and asking for it; its numbers set by its own ranges, never grown with the floor. Armour and jewellery
carry nothing of their base; a weapon its base's damage alone. A price among its stats shows as a red minus.

| Level | Piece | Name | What it rolls | His word |
| --- | --- | --- | --- | --- |
| 1 | Boots | The Errand Boots | +16–24% movement speed | yes |
| 2 | Ring | The Tin Band | +24–36 life, +1.6–2.4 life on hit | yes |
| 3 | Gloves | Scrapper's Mitts | −12 to −18% attack speed; adds 5–7 to 8–12 damage | “Gimme -15% attack speed, and more flat damage”; then yes |
| 4 | Amulet | The Copper Charm | +40–60% magic find, +40–60% gold find | yes |
| 5 | Bow (Ranger) | The Fledgling | +20–30% attack speed, +5–7% critical chance | yes |
| 6 | Helm | The Lantern Cap | +20–30% to all four resistances (one roll); −8 to −12% max life | “Gimme -10% max life or something like that” |
| 7 | Wraps (Brawler) | Taped Knuckles | +6–10% critical chance, +48–72% critical damage | yes |
| 8 | Staff (Mage) | The Kindling Rod | every hit fire, no other kind of damage; adds 6–10 to 11–17 fire to fire hits; +32–48% fire damage | his wording: “Can deal no other type of damage” |
| 10 | Battle Axe (Warrior) | The Rot Axe | no physical damage: its physical hits poison for 120–180% of their damage over the poison's 4 s, stacking; adds 8–12 to 16–24 poison to poison hits | his own; “Yes, level 10” |
| 11 | Belt | The Packstrap | Guarding's shield always on him, 8–12% of his life; broken, back after 3.2–4.8 s without a blow | “always gives GUARDIAN …”; “4 seconds without taking damage” |
| 12 | Tome (Warlock) | The Hornbook | +40–60% fire damage, +12–18% cooldown recovery | yes |
| 13 | Wrench (Tinkerer) | The Borrowed Spanner | +20–30% attack speed, +16–24 dexterity | yes |
| 14 | Chest | The Quilted Coat | +96–144 armour, +64–96 life | yes |
| 16 | Amulet | The Poisoner's Locket | +32–48% poison damage; adds 8–12 to 14–22 poison to poison hits | yes |
| 18 | Ring | The Sure Thing | every hit a critical hit; critical hits no harder (nothing to roll) | his idea: “You gotta have something that has 100% chance to crit, crits do no extra damage.  Always a classic” |
| 21 | Boots | The Long Road | +28–42% movement speed, +20–30% cooldown recovery; −20 to −30% all resistances | “How about -25% to all resistances” |
| 23 | Gloves | The Thousand Cuts | +32–48% attack speed, +5–7% critical chance; −20 to −30% damage | yes, with that price |
| 25 | Chest | The Vault Door | +240–360 armour, +160–240 life, +20–30% all resistances; −16 to −24% movement speed | yes |
| 27 | Helm | The Rime Crown | +48–72% frost damage; −16 to −24% fire resistance (takes more fire) | “Maybe pick one element then a weakness to another.  Like 60% frost damage, take 20% more fire damage” |
| 30 | Ring | The Last Word | every word of the tap and hold attacks 40–60% stronger; every cooldown 50–100% longer | “Higher price.  50% longer.  Or give everything a roll 50-100% longer.” |

Where they drop (`levelPoolFor`, `levelChance`): a roll of their own on every piece of gear that drops, as often as the pool's
(`UNIQUE_DROPS.level`), on any floor, floor 1 and endless included; one of those whose level is the floor's level or below,
never another hero's weapon. The 62's own odds are not touched. Not from the stranger's gamble (not asked).

## Poison damage (src/game/items.ts POISON_DMG)

New stats: Poison Damage (`poisonPct`), “Adds X-Y Poison Damage to Poison Hits” (`poisonMin`, `poisonMax`), Poison Resistance
(`poisonRes`), and Max Life as a share (`maxLifePct`, the Lantern Cap's price alone). With the switch on, gear rolls Poison
Damage and Poison Resistance as it rolls fire's, and the Poison word burned in gives poison's own (as Flame's: damage or flat on
a weapon, gloves and a ring; resistance on what keeps). The stats work wherever a piece has them, switch or none: Poison Damage
makes every poison of the hero's more (the word's, vials, talents, the snake: `poisonMonster`); flat poison goes on a hit that
poisons, over the poison's time; Poison Resistance takes its share off what poisons him. Poison lasts the game's 4 s
(`TUNE.poisonTime`) and stacks as it always has. The character sheet shows Poison Resist with the switch on, or where his gear has
some.

## The 62's rolls

24 of the 62 have a number on their card; each of those numbers rolls per piece from 0.8 to 1.2 times the tune's
(`ROLL_SPAN`), the factor kept on the piece (`Item.uroll`), so a number retuned moves every piece with it. A piece found before
the rolls reads as the tune's own. In play the rules read the tune as the worn pieces rolled it (`Game.ut`, `rolledTune`); each
“half as strong again” is its own piece's (`Game.halves`). Counts are made whole (the Physician's Coat's hits). The others (the
Two-Faced Mask and its like, and counts such as the Fan's three arrows or the Fourth Globe's four) roll nothing yet.

## His test page

The same link as the 62's, **https://claude.ai/artifact/TDTUvbr5FhjV56vrCu3Tbs**, version `1794536201-d24b` (12 Nov 2026,
about 21:15 Eastern): `index.html` alone published again (sha256 begins 44db29a6675aaeb6, 7,941,217 bytes; the stamp TEST UNIQUES
2026-11-12); the four folders as they were (25.3.13's marks: the bakes' marks are unchanged by this branch). On it LEVEL_UNIQUES
and POISON_DMG are on too (src/main.ts), and a test hero of the level select is handed his fifteen leveling uniques beside the 62
(his bag's nine free places, then the stash), each made so he can wear it there.

## Checked

- `tsc --noEmit`: only main's own error (tests/relief.test.ts 378).
- tests/uniques_level.test.ts (new, 12) and tests/uniques_rolls.test.ts (new, 3), all passed.
- `unit --only` the uniques' tests, the items', the words', melds, economy, trades, small, first_levels, town, endless, guide,
  tinkerer, golem_rocket and the core on 02a5083134: 54 files, 50 passed. Of the four: flat_damage (it read every flat pair as
  one of the four elements) and uniques_game's first test (a unique made by hand, read at the tune's own numbers) mended and
  passed on fe412d80f1; items_a_game's test 4 (“battleaxe: a picture of the art's”) fails the same on main d39dcde; words.test.ts
  ran out of its twenty minutes beside another file, and passed alone, 35 of 35, in 29 minutes.
- Played as published, served from its folder, a finger on a phone's screen (852 by 393, three dots to a point):
  `uniques_try.mjs` as the Warrior on floor 12 and the Ranger on floor 8 (24 uniques in his bag, 28 in his stash, none he cannot
  wear); `uniques_level_look.mjs` (new) as the Warrior on floor 10 with the Rot Axe, the Packstrap and the Lantern Cap: his
  shield on him, his Strike poisoning a monster of the floor's own (no number of its own; the poison's numbers in poison's
  colour), the shield broken and back after its time by the game's clock, the three cards read (the axe's rule with its roll,
  “+21% All Resistances”, “-12% Max Life” in red, Poison on the character sheet). All finished clean; pictures looked at.

## Not checked

His phone; the page as the app serves it; a whole run with them dropping. The Warrior holding a Battle Axe is drawn with the
weapon his talents picked (a greatsword till then): not this branch's.
