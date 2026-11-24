# What every line on gear really does (the Godot game, 24 Nov 2026)

Asked for by him, 24 Nov 2026, after an evening that turned up three rules that read right and did nothing (flat damage of an
element, melds of two kinds dealing one, the Rusty Wrench): “I think I'm okay with the changes to damage so check everything”.
Read off the code (`godot/scripts/loot.gd derive`, `hero.gd hit_monster` and `hurt_by`, `monster.gd _take`, `words.gd`,
`src/game/items.ts imbueOptions`), not off the cards. NOTHING HERE IS CHANGED: each ODD item waits on his word.

## What was gone through, and what was not

- GONE THROUGH: every stat a piece of gear can carry (42), what each of the 30 words becomes when burned into each kind of
  piece, what kind of damage each source on the hero's side deals, and which bonus makes it more.
- NOT GONE THROUGH ONE BY ONE: what each word does in front of and behind an attack, the 23 melds' own effects, the 52 designed
  melds, the talents. The game's own checks cover those; of `--only=words --cases=meld`, three are out of date (see the end).

## ODD: things that read as if they work and do not, or work in a way the card does not say

1. PULLING BURNED INTO GEAR DOES NOTHING. It becomes “+% pickup range” (`pickupPct`) on every kind of piece. The Godot game
   draws gold and orbs to him from a fixed 3.2 tiles (`loot.gd PULL`) and never reads the stat. The old game did.
2. RESISTANCE HAS NO CAP. The old game stopped fire, frost, lightning and poison resistance at 75%. The Godot game takes it
   whole (`hero.gd resist`), so enough of one word burned into armour makes him take nothing but the least 1 from that element.
3. MONSTERS WITHSTAND NO KIND OF DAMAGE. They have no armour and no resistances. So the kind of a hit (plain, fire, frost,
   lightning) decides only which of his bonuses makes it more and what it leaves (burning, chill, shock). Told him wrongly
   earlier the same evening that each half of a meld is “resisted separately”: there is nothing to resist it.
4. “+% PHYSICAL DAMAGE” IS FOR PLAIN HITS ONLY. It does nothing for an attack with Flame, Frost or Lightning in front of it, and
   now half its work for Eruption, Avalanche and Thunder. An attack with the Poison word is still plain, so it does count there.
5. MANA ON GEAR IS COOLDOWN RECOVERY. There is no mana. “Max Mana” counts as a tenth of itself in cooldown recovery, mana
   regeneration as twice itself; the cards say “Cooldown Recovery”. Volatile and Surging burned into armour give these, and
   several uniques carry them (The Quill's Band, The Cantor's Echo, The Ghostwriter, The Alloy Band, Shortcut). Cooldown
   recovery of every kind stops at 60%.
6. A CHANCE TO STUN ON GEAR DOES NOTHING ON AN ATTACK THAT ALREADY STUNS (Heavy in front): the word's stun is used instead, not
   both. It never stuns a boss; an elite half as long. 50% at most.
7. FLAT POISON IS NOT SIZED BY THE ATTACK. Since tonight it poisons on every hit; it adds its whole amount each hit, whatever
   the attack's share, and no critical makes it more (flat fire, frost and lightning are sized as the hit is). A move that hits
   many times fast (Whirlwind) lays it on fast, up to the poison's most stacks.
8. WHAT HIS UNIQUES AND COMPANIONS DO BY THEMSELVES IS PLAIN DAMAGE: the Drowned Arm's tentacle, the Queen's Talons' bird, the
   Fleshmancer's Brand's risen elite, his companions. They are made more by “+% Damage” and “+% Physical Damage” only, so an
   elemental build gets less from them. The Burr and Shatterglass deal a share of his armour or barrier and no bonus touches
   them.

## AS IT SHOULD BE: every other line, and what it does

| Line | What it does |
|---|---|
| Strength | Life. Makes Strength words stronger. |
| Dexterity | Attack speed and critical chance; more dodge from leather. Makes Dexterity words stronger. |
| Intelligence | Cooldown recovery; more barrier from cloth. Makes Intelligence words stronger. |
| Adds X-Y Damage | Into every hit, of whatever kind the hit is. |
| Adds X-Y Fire / Frost / Lightning Damage | Since tonight: a blow of that element beside every hit (inside a hit already of that element). |
| Adds X-Y Poison Damage | Since tonight: poison on every hit. See ODD 7. |
| +% Damage | Every hit, every kind, and what fights beside him. |
| +% Fire / Frost / Lightning Damage | Hits and halves of that element; talents' blows of that element. |
| +% Poison Damage | All his poison. |
| +% Attack Speed | His attacks faster. |
| +% Critical Chance, +% Critical Damage | As they say. A critical makes the flat fire, frost and lightning beside the hit more too. |
| + Max Life, +% Max Life, Life Regeneration, Life on Hit, Life on Kill | As they say. |
| Armour | Takes off the plain part of a blow on him: armour / (armour + 40 + 20 a floor), 75% at most. |
| Dodge | A chance a blow misses him: 75% of dodge / (dodge + 40 + 20 a floor). Not a trap's blow. |
| Barrier | A second life in front of his life; fills again 3 s after the last harm. |
| Fire / Frost / Lightning / Poison Resistance | That share less of that element on him. See ODD 2. |
| +% Movement Speed, +% Cooldown Recovery, +% Area of Effect | As they say. |
| +% Gold Find, +% Magic Find | More gold; magic and rare pieces likelier. |
| Chance to Block (a piece from before 22 Nov) | Barrier, ten a point. |

## What each word becomes on gear (level 20 sizes not given here)

Weapon, gloves, amulet, ring first; then off-hand, helm, chest, belt, boots.

| Word | Hands and jewellery | Armour pieces |
|---|---|---|
| Power | +% physical damage, added damage, Strength | armour, Strength |
| Leech | life on hit, life on kill | max life, life regeneration |
| Swift | attack speed, Dexterity | dodge (was cooldown recovery), Dexterity; boots: movement speed |
| Twin, Precise | critical chance, Dexterity | critical damage, Dexterity |
| Flame, Frost, Lightning, Poison | +% that element's damage; weapon, gloves, ring: added damage of it too | that element's resistance |
| Volatile | area, Intelligence | max mana (cooldown recovery), Intelligence |
| Heavy | chance to stun, Strength | armour, Strength |
| Frenzied | attack speed, Strength | movement speed, Strength |
| Guarding | barrier (was a chance to block), Strength | the same |
| Pulling | pickup range: DOES NOTHING (ODD 1) | the same |
| Splitting, Hexing | +% damage, and Dexterity or Intelligence | the attribute alone |
| Stilling, Fleeting | cooldown recovery, and Intelligence or Dexterity | the same |
| Binding, Culling | +% damage, Strength | armour or max life, Strength |
| Piercing | critical damage, Dexterity | the same |
| Bleeding | +% physical damage, Strength | life regeneration, Strength |
| Reaping | life on kill, Intelligence | cooldown recovery, Intelligence |
| Surging | area, Intelligence | mana regeneration (cooldown recovery), Intelligence |
| Plundering | gold find, Dexterity | magic find, Dexterity |
| Mirroring, Lasting | +% damage, Intelligence | barrier or life regeneration, Intelligence |
| Vast | area, Strength | armour, Strength |

## The three checks out of date

`--only=words --cases=meld` cases 09 (Scald in front), 14 (Fumes behind) and 49 (Flame II): each expects a fire hit on a burning
enemy to be no harder. Since 22 Nov a burning enemy takes more from every fire hit (`words.gd burn_more`, his words then). The
rule is his; the three checks were not brought up to it. They fail the same with or without tonight's changes.

## Mended since (24 Nov 2026, late)

Asked which of the ODD items to mend, his picks: “Pulling on gear (Recommended), Cap resistance (Recommended), Size flat poison
to the hit, Stale meld checks”.

- ODD 1, PULLING ON GEAR: “+% pickup range” now widens how far gold and orbs fly to him (`loot.gd`, `pickup_pct`), as the old
  game had it. +50%: 4.8 tiles for 3.2.
- ODD 2, RESISTANCE: each stops at 75% (`loot.gd RES_CAP`).
- ODD 7, FLAT POISON: sized as the hit is (the move's share, a critical, his talents' and uniques'), as flat fire, frost and
  lightning are (`hero.gd hit_monster`). Half a Strike lays half the poison.
- THE THREE CHECKS OUT OF DATE (`check_melds.gd`, Scald in front, Fumes behind, Flame II): brought up to the rule that a burning
  enemy takes more from a fire hit, and Scald's to its two kinds of damage. `--only=words --cases=meld`: 0 wrong.
- NOT MENDED, not picked: ODD 3 (monsters withstand nothing), 4 (+% Physical Damage for plain hits only), 5 (mana on gear is
  cooldown recovery), 6 (a chance to stun beside Heavy), 8 (uniques' and companions' own damage is plain).
- Checked: `--only=defuniques` 45 of 45 (lines 41 and 42).
