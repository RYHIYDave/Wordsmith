## THE WORDS ON A MOVE (game/words.ts resolveSkill; game/defs.ts WORDS, SKILLS, SLOT_OPENS, MOVE_OPENS). One rule covers every
## pairing: A WORD IN FRONT OF A MOVE CHANGES THE HIT; A WORD BEHIND IT CHANGES WHAT THE MOVE LEAVES BEHIND.
##
## The words here are those a Warrior can come by on floors 1 to 10: the prison's six (Power, Poison, Frost, Flame, Lightning,
## Swift) and Heavy, the armourer's reward; and the nine more found from floor 6 down (Twin, Leech, Volatile, Precise,
## Frenzied, Guarding, Lasting, Fleeting, Vast). The city's words (floor 11) and the last words (floor 16) are not here yet.
## WORDMELDING (game/melds.ts, melds8.ts): and THE WORDS MELDING MAKES at the wordsmith after the Meldstone (`made`): the ten
## melds of two damage words, Volatile's five, the eight across the groups, the five damage words at rank II. A MELDED WORD does
## the work of both its words (partsOf: so for every rule here it is both of them) and a twist of its own, in front and behind
## (`meld`, `meld_behind`; the fight does the twists: melds.gd); it takes its side's one damage-word place; both its words grow
## with the melded word's own attribute (ATTR_SPLIT.melds). A RANKED WORD is its word, its own figure half as strong again
## (RANK_TUNE), what the attribute adds on top, its rank named in the move's lines ("Power II: ..."). Neither melds again.
##
## Every table and number is the game's own, taken out of it by tools/godot_words.ts into assets/words/words.json: the words
## (their names in front and behind, the attribute each grows with, its element), his three moves (Strike, Whirlwind, Lunge),
## Heavy's and the poison's numbers, when a move and its slots open. What is written here is only the rule itself, word by
## word as resolveSkill has it, in its order. `godot --headless --path godot -s res://checks/words_check.gd` holds it
## against what the game's own resolveSkill makes of 32163 loadouts (tools/godot_words.ts check): every number, name and
## line of text the same.
##
## WHAT A MOVE WITH ITS WORDS COMES TO (`resolve`; the game's Resolved), the keys the fight reads:
##   id, name      the move, and its name with its words ("Flame Strike of Venom")
##   element       "phys", "fire", "frost" or "lightning": the element word in front decides, failing that the one behind
##   dmg_mult      one hit's share of the weapon's damage (the move's own, his Strength, the words)
##   size          how many times as far it reaches and as wide it lands
##   rate          blows a second, for a move that has no wait (Strike)
##   cooldown      its wait, seconds (Whirlwind, Lunge)
##   splash, splash_dmg   a one-enemy move's splash round what it strikes (tiles, before `size`), and its share of the hit
##   pierce        (a shot's: it goes on through; set by an element behind)
##   ignite        FLAME in front: what it strikes burns for this share of the hit more, over 3 s
##   chill         FROST in front: what it strikes is slowed by this share; a second hit on a chilled one freezes it
##   arcs, arc_dmg LIGHTNING in front: so many more enemies the hit jumps to, each for this share of it
##   poison        POISON in front: each hit adds a dose of this share of the hit a second
##   stun          HEAVY in front: seconds what it strikes is stunned
##   might         POWER behind: each hit that lands adds so many % damage for 5 s (five times at most)
##   haste         SWIFT behind: so many % faster on his feet for 3 s after each use
##   zone          an element behind: the ground it leaves, {kind: "burn" | "ice" | "storm", element, dps, slow, dur}; null
##   cloud         POISON behind: a cloud left that poisons for this share of the hit a second
##   cracks        HEAVY behind: seconds of cracked ground left; an enemy walking onto it is staggered
## FLOORS 6 TO 10'S WORDS:
##   count, count_dmg  TWIN in front: so many of each hit (2), each for this share of it
##   echo          TWIN behind: the move repeats a moment later for this share
##   leech         LEECH in front: life back for each enemy hit
##   orb_chance    LEECH behind: the chance an enemy it kills drops a life orb
##   volatile      VOLATILE in front: an enemy it kills explodes for this share of its life
##   rune          VOLATILE behind: it leaves a rune that goes off for this share of the hit
##   precise       PRECISE in front (the hit harder and the area smaller: in dmg_mult and size)
##   mark          PRECISE behind: the first enemy each use hits is marked; his next hit on it is a certain critical
##   frenzy        FRENZIED in front: each use adds a stack of the frenzy (each a share faster: Strike, and every wait)
##   frenzy_feed   FRENZIED behind: each kill adds a stack, and holds the frenzy longer
##   shield        GUARDING in front: each use gives him a shield of this share of his life
##   ward          GUARDING behind: it leaves a ward circle; inside it he takes this share less harm
##   last, pace    LASTING, FLEETING: how long what it makes and gives lasts, as a share of its own time; how fast it ticks
##   boost         FLEETING: how much stronger the boosts it gives are (already in might, haste and shield)
##   wide          VAST in front: how many times as wide its area is for the word (already in size)
##   vast          VAST behind: each hit splashes this share of itself onto every enemy near what it hits
##   lines         what it does, in the game's own words, for its card
## WORDMELDING:
##   pull, vortex  PULLING in front and behind, a city word here only for Implode, the meld it is part of: how far it drags, how
##                 long its vortex lasts (numbers and lines only: neither is in the fight)
##   meld          the melded word in front, or null: the twist its hit does (Thunder's here already: its one harder bolt, no arcs,
##                 its stun)
##   meld_behind   the melded word behind, or null: the twist of what it leaves (Scald's steam and Hailstorm's storm of ice are
##                 here already, in `zone`)
extends RefCounted

const FILE := "res://assets/words/words.json"

## HOW HARD ATTRIBUTES AND WORDS ADD UP (his words, 22 Nov 2026, after the damage check showed a min/max hero's quick attack at
## millions a second, a word in front and one behind three times the damage early on: “I like the additive bonus to words, but
## maybe just have attributes have diminishing returns on scaling.  I don't like a cap”; docs/reports/damage_check_2026-11-22.md):
##   WORDS_ADD   what the words in front add to the hit (Power, Heavy, Precise, Thunder's bolt) is ADDED UP and made one
##               bonus, not each a multiple of the others (+60% and +80% are +140%, not x2.88). What weakens a hit (Poison's
##               20%, Vast's, an element behind) still takes its share.
##   ATTR_CURVE  an attribute's points count in full up to ATTR_KNEE; past it each counts for less the more there are (at
##               ATTR_KNEE + ATTR_SPAN, half; at twice that, a third), and never stops counting: there is no cap. What reads it so:
##               a move's own bonus from its attribute, what every word on it grows by, and Dexterity's attack speed and
##               critical chance (loot.gd derive). His life, mana and cooldowns from his attributes are as they were.
## Both off, every number is the game's own resolveSkill's (checks/words_check.gd turns them off to hold it against the game).
##   POISON_SPREAD  his word after that change's check (the poison was left doing millions: “Yes” to its share being of the
##               hit over the whole of the poison's time, not each second of it): a dose is the same share of the hit, spread over
##               its 4 s (a quarter as much a second); its doses still add up, eight deep, and what gear adds to poison is as it was.
##   THE CLASSES EVENED (his “Yes” after the same check found the Warrior at about 5.7 times the fire Mage: “Frost is a bit more
##   defensive so it having lower dps makes sense, but a warrior should not be 7x stronger.  Especially if str is also adding bonus
##   health for waaaay more survivability than the mage”):
##   EVEN_BASE    every class's quick attack as hard a second before its words as the Warrior's Strike with his greatsword
##                (EVEN: what its share of the weapon's hit is made, for its own weapon's speed and damage: the bow's Shot, the
##                staff's Wave, the wrench's Vial Toss, the tome's Hellbolt; the Brawler's wraps are the greatsword's already).
##   ELEMENT_HIT  Flame, Frost and Lightning in front add to the hit as Power does, each besides its own burn, chill or arcs; of
##                the damage words in front (a melded word's two among them), only the best one's. FROST as much as the rest (his
##                word: “I don't think frost should be less damage, I just think it doesn't have the damage talent tree points or
##                extra damage through burns or bolts.  It has an extra defensive layer of chilling or freezing.  That's the trade
##                off.  Less extra top-end damage for more survivability”): FROST_HIT 1.
##   EVEN_GEAR_ATTR (loot.gd imbue_options) a ranked word burned into gear gives no more Strength, Dexterity or Intelligence than
##                its plain word: no attribute stacks faster than another.
static var WORDS_ADD := true
static var ATTR_CURVE := true
static var POISON_SPREAD := true
static var EVEN_BASE := true
static var ELEMENT_HIT := true
static var EVEN_GEAR_ATTR := true
##   DEFENCE_WORDS (his “Yes to both”, 22 Nov 2026, to the three defences' words): GUARDING the barrier's word, in front each use
##                tops up his barrier (a hero with none has it as a shield a while, as before), on gear barrier in place of a
##                chance to block; SWIFT the dodge's, behind its haste is dodge too (SWIFT_DODGE a point of haste), on the pieces
##                that keep him dodge in place of cooldown recovery; a chance to block gone (loot.gd imbue_options, derive).
static var DEFENCE_WORDS := true
const SWIFT_DODGE := 3.0
##   BURN_MORE   burning's own (his word, 22 Nov 2026, of what sets burning apart from poison: “Or a burning target takes more total
##               fire damage”; and “Yes” to sizing it by the damage check): a burning enemy takes this much more from every fire hit
##               (not from the burning itself: monster.gd _take). Poison stacks, eight doses deep, for the long fight on one; burning
##               does not, it readies the enemy for fire, and spreads (Searing). Sized by the damage check (a fire Mage, her words
##               held still, level 50: none, +50%, +100%: into one elite 121,648 / 161,765 / 230,125 a second, a tough pack dead in
##               16.5 / 12.3 / 10.2 s; docs/reports/damage_check_2026-11-22.md): +100%. WS_BURN_MORE for a run.
static var BURN_MORE := 1.0
##   BURN_HEARTH burning's own the Mage's alone, her fire tree's Hearth (his word, 22 Nov 2026: “Maybe we change some stuff in the
##               mages fire tree for the "burning enemies take more fire damage" cause I don't like that fire is BiS for a str/dex
##               character”): only fire of a hero who has taken Hearth (talents.gd OWN_WORDS, its card; its other half, her mana
##               back the faster, nothing in this port, which has no mana). Off: every hero's fire, as it was.
static var BURN_HEARTH := true


## How much more a burning enemy takes from a fire hit of `hero` (burning's own; none without Hearth while BURN_HEARTH).
static func burn_more(hero) -> float:
	if BURN_HEARTH and (hero == null or not is_instance_valid(hero) or not hero.has("fuel")):
		return 0.0
	return BURN_MORE
## (what Flame and Frost in front of a one-enemy move splash round what it hits, a share of the hit: the game's 1, all of it;
## WS_ELEMENT_SPLASH for a run of the damage check)
static var ELEMENT_SPLASH := 1.0
## (THE MAGE'S OWN, his “Do that.” to bringing her clearing of a pack to within about half again the Warrior's, her one enemy at a
## time left lower: her Wave and her Orb a third and more harder, MAGE_MORE, on top of the Wave's evening)
const MAGE_MORE := 1.35
const EVEN := {"shot": 1.303, "wave": 1.6 * MAGE_MORE, "vialtoss": 1.72, "hellbolt": 1.635, "orb": MAGE_MORE}
const FROST_HIT := 1.0
const ATTR_KNEE := 50.0
const ATTR_SPAN := 100.0


## An attribute as the damage reads it (ATTR_CURVE): in full to the knee, then less and less for each point, never capped.
static func eff_attr(a: float) -> float:
	if not ATTR_CURVE or a <= ATTR_KNEE:
		return a
	return ATTR_KNEE + ATTR_SPAN * log(1.0 + (a - ATTR_KNEE) / ATTR_SPAN)

static var _data := {}


## The game's tables (assets/words/words.json).
static func data() -> Dictionary:
	if _data.is_empty():
		_data = JSON.parse_string(FileAccess.get_file_as_string(FILE))
	return _data


## The words there are to be found, in the game's order.
static func ids() -> Array:
	return data()["ids"]


# --- WORDMELDING (game/melds.ts): the words melding makes ---

## The words melding makes, in the order the game keeps a hero's words in (melds.ts wordIds): the ten, Volatile's five, the eight
## across the groups, the five at rank II. Never found: only made.
static func made() -> Array:
	return data()["made"]


## Is it a melded word (melds.ts isMeld)?
static func is_meld(w) -> bool:
	return w != null and str(word(w)["kind"]) == "meld"


## Is it a ranked word (melds.ts isRank)?
static func is_rank(w) -> bool:
	return w != null and str(word(w)["kind"]) == "rank"


## The words a word does the work of (melds.ts partsOf): a melded word's two, a ranked word's word, or the word itself.
static func parts_of(w: String) -> Array:
	if is_meld(w):
		return data()["melds"]["of"][w]
	if is_rank(w):
		return [data()["melds"]["rankOf"][w]["word"]]
	return [w]


## The words on one side as its rules and looks go by them (melds.ts withParts; game.ts fronts): each melded word and after it
## its two words; a ranked word as its word.
static func with_parts(side: Array) -> Array:
	var out: Array = []
	for w in side:
		if w == null:
			continue
		if is_meld(w):
			out.append(w)
			out.append_array(parts_of(w))
		elif is_rank(w):
			out.append_array(parts_of(w))
		else:
			out.append(w)
	return out


## A word's rank: 2 for a rank II word, 1 for any other (melds.ts rankOf).
static func rank_of(w: String) -> int:
	return int(data()["melds"]["rankOf"][w]["rank"]) if is_rank(w) else 1


## The word one rank up from this one, or "" (melds.ts rankUp): not a damage word, or as high as ranks go for now.
static func rank_up(w: String) -> String:
	var R: Dictionary = data()["melds"]["rankOf"]
	for r in data()["melds"]["ranks"]:
		if R[r]["word"] == w and int(R[r]["rank"]) == rank_of(w) + 1:
			return r
	return ""


## What two words make when melded, or "" (melds.ts meldOf): two of a damage word, its next rank; two different words, the melded
## word of the ten, Volatile's five or the eight that is made of them.
static func meld_of(a: String, b: String) -> String:
	if a == b:
		return rank_up(a) if str(word(a)["kind"]) == "damage" else ""
	var M: Dictionary = data()["melds"]
	for m in M["ten"] + M["volt"] + M["eight"]:
		var of: Array = M["of"][m]
		if (of[0] == a and of[1] == b) or (of[0] == b and of[1] == a):
			return m
	return ""


## Why two words cannot be melded, or "" if they can (melds.ts meldProblem, its switches as the game starts: RANK2, VOLT_MELDS,
## MELDS8 on). The game's own words.
static func meld_problem(a: String, b: String) -> String:
	if a == "" or b == "":
		return "Two words go in"
	if is_rank(a) or is_rank(b):
		return "Rank II is the top, for now" if a == b else "A ranked word melds no further"
	if is_meld(a) or is_meld(b):
		return "A melded word melds no further"
	# (THE EIGHT ACROSS THE GROUPS: their two words meld, whatever their groups)
	var m := meld_of(a, b)
	if m != "" and data()["melds"]["eight"].has(m):
		return ""
	# (VOLATILE'S MELDS: Volatile melds with a damage word too)
	var volt := (a == "volatile" and str(word(b)["kind"]) == "damage") or (b == "volatile" and str(word(a)["kind"]) == "damage")
	if not volt and (str(word(a)["kind"]) != "damage" or str(word(b)["kind"]) != "damage"):
		return "Only damage words and Volatile meld"
	return "" if m != "" else "These do not meld"


## The melded word on a side, or null (words.ts meldIn).
static func meld_in(side: Array):
	for x in side:
		if x != null and is_meld(x):
			return x
	return null


## The attribute a word grows with (defs.ts wordAttr, ATTR_SPLIT on): "" for the ability's own (fire, frost and lightning set
## alone); a melded word's its own; any other word's its own.
static func word_attr(w: String) -> String:
	var D := data()
	if D["byWeapon"].has(w):
		return ""
	if D["melds"]["attr"].has(w):
		return D["melds"]["attr"][w]
	return str(D["words"][w]["attr"])


## A word as the game has it: {name, front, behind, attr, element, kind, about, frontText, behindText, monsterText}.
static func word(w: String) -> Dictionary:
	return data()["words"][w]


## One of his moves as the game has it (defs.ts SKILLS): by its id ("strike", "whirlwind", "leap").
static func skill(id: String) -> Dictionary:
	return data()["skills"][id]


## His three moves' ids: the quick attack, the slow one, the evasive one.
static func moves() -> Array:
	return data()["moves"]


## A damage word (Power, Poison, Frost, Flame, Lightning), or a melded or ranked word, which takes that place: one of them to a
## side (melds.ts isDamageWord).
static func is_damage(w: String) -> bool:
	return word(w)["kind"] in ["damage", "meld", "rank"]


## Whether move `i` (0, 1, 2) is open at a level (defs.ts MOVE_OPENS: the quick attack at once, the slow one at 2, the evasive
## one at 5).
static func move_open(i: int, level: int) -> bool:
	return level >= int(data()["moveOpens"][i])


## How many slots a move has in front and behind at a level (defs.ts socketCount, SLOT_OPENS as the first levels set them:
## one in front at once, one behind at 4, the second in front at 15, the second behind at 20).
static func socket_count(level: int) -> Array:
	var n := [0, 0]
	for lv in data()["slotOpens"]["front"]:
		if level >= int(lv):
			n[0] += 1
	for lv in data()["slotOpens"]["behind"]:
		if level >= int(lv):
			n[1] += 1
	return n


## Why a word cannot go into a side's slots (`group`: its words, null where a slot is empty), or "" if it can (socketProblem):
## no free slot; there already; or a damage word where the side has its one (`most`: how many a side holds).
static func socket_problem(group: Array, w: String, most := 1) -> String:
	if not group.has(null):
		return "No free socket"
	if group.has(w):
		return "Already there"
	if is_damage(w):
		var n := 0
		for x in group:
			if x != null and is_damage(x):
				n += 1
		if n >= most:
			return "Two damage words per side" if most > 1 else "One damage word per side"
	return ""


## The move's name with its words (skillName): "Flame Strike of Venom and Swiftness".
static func skill_name(id: String, front: Array, behind: Array) -> String:
	var parts: Array = []
	for w in front:
		if w != null:
			parts.append(word(w)["front"])
	parts.append(skill(id)["name"])
	var name := " ".join(parts)
	var after: Array = []
	for w in behind:
		if w != null:
			after.append(str(word(w)["behind"]).trim_prefix("of "))
	if not after.is_empty():
		name += " of " + " and ".join(after)
	return name


## A number to one place as the game writes it (toFixed(1): "2.1").
static func _fixed1(n: float) -> String:
	return "%.1f" % n


## A share as the game writes it: a whole number of hundredths, a half rounded up ("17%").
static func _pct(n: float) -> String:
	return "%d%%" % int(floorf(n + 0.5))


## A number as the game writes it: whole where it is whole ("4"), else as short as it is ("0.8").
static func _num(n: float) -> String:
	if is_equal_approx(n, roundf(n)):
		return str(int(roundf(n)))
	return String.num(n, 3).rstrip("0").rstrip(".")


## A MOVE WITH ITS WORDS (resolveSkill), for a hero whose numbers are `d`: {str, dex, int, area, aps, cdr} (stats.ts derive).
## `front`, `behind`: the words in its slots, null where one is empty.
## (`bent`, UNIQUE ITEMS: what a unique makes of the move's words, uniques.gd bend: {boost, meld_boost, meld}: how many times its own
## figure each word is, "half as strong again", as RANK II's is for a ranked word, what its attribute adds staying on top; the same
## for a melded word's two alone; a meld given without melding, the Amalgam's Heart's. Left out: every word as it always was.)
static func resolve(id: String, front: Array, behind: Array, d: Dictionary, cls := "warrior", limit := "cooldown", bent := {}) -> Dictionary:
	var D := data()
	var def: Dictionary = D["skills"][id]
	# (WORDMELDING: a melded word does the work of both its words, so for all that follows it is both of them; a ranked word is its
	# word; the melded word's own twist is added after, by `meld` and `meld_behind`)
	var has := func(side: Array, w: String) -> bool:
		for x in side:
			if x != null and (x == w or parts_of(x).has(w)):
				return true
		return false
	var meld = bent["meld"] if bent.get("meld") != null else meld_in(front)
	var meld_behind = meld_in(behind)
	# (one enemy at a time: a blade. A word that makes "the hit" bigger gives these a splash.)
	var single: bool = def["kind"] in ["melee", "projectile", "summon"]
	var lines: Array = [def["desc"]]
	# (the damage's element: the element word in front decides; failing that, the one behind)
	var element := "phys"
	for w in front + behind:
		if w != null and D["words"][w]["element"] != null:
			element = D["words"][w]["element"]
			break
	# (what the move grows with: the class's own attribute (the Warrior's Strength, the Ranger's Dexterity, ...); a class of two, the
	# Warlock, their sum less HYBRID_LESS)
	# (`cls` may name an attribute in place of a class: what her tree picks for the Tinkerer's arms grows with it, game.ts refresh)
	var lone: bool = cls in ["str", "dex", "int"]
	var CL: Dictionary = {} if lone else D["classes"][cls]
	var attr: String = cls if lone else str(CL["primary"])
	var prim: float = d[attr]
	if not lone and CL["two"] != null:
		prim = maxf(0.0, float(d[CL["two"][0]]) + float(d[CL["two"][1]]) - float(D["hybridLess"]))
	prim = eff_attr(prim)
	# (HOW MUCH A WORD HERE GROWS, defs.ts ATTR_SPLIT: by the attribute of the melded word it is a part of, on that side; fire, frost
	# and lightning set alone, by the move's own attribute; any other word by its own)
	var grows_by := func(side: Array, w: String) -> float:
		var m = meld_in(side)
		var a: String = word_attr(m) if m != null and parts_of(m).has(w) else word_attr(w)
		return eff_attr(float(d[attr if a == "" else a]))
	# (RANK II: a ranked word on this side is its word half as strong again: the word's own figure grows, what the attribute adds
	# stays on top; and its rank is named in its line)
	var rank_in := func(side: Array, w: String) -> int:
		for y in side:
			if y != null and is_rank(y) and D["melds"]["rankOf"][y]["word"] == w:
				return rank_of(y)
		return 1
	var step: float = D["melds"]["rankStep"]
	var BOOST: float = float(bent.get("boost", 1.0))
	var MB: float = float(bent.get("meld_boost", 1.0))
	var st := func(side: Array, w: String) -> float:
		if MB == 1.0:
			return BOOST
		var m = meld_in(side)
		return BOOST * MB if m != null and parts_of(m).has(w) else BOOST
	var rk := func(side: Array, w: String) -> float: return (1.0 + step * (rank_in.call(side, w) - 1)) * st.call(side, w)
	var rn := func(side: Array, w: String) -> String: return ["", "", " II", " III", " IV", " V"][rank_in.call(side, w)]
	var dmg_mult: float = float(def["dmg"]) * (float(EVEN[id]) if EVEN_BASE and EVEN.has(id) else 1.0) * (1.0 + prim * float(D["primaryDmg"]) / 100.0)
	# (what the move comes to with no word in it: `word_k`, below, what its words make of it)
	var dmg_bare: float = dmg_mult
	var size: float = d["area"]
	var rate: float = d["aps"]
	var cooldown: float = float(def["cooldown"]) * (1.0 - float(d["cdr"]))
	# (ABILITIES: MANA, the start screen's and the pause panel's switch: a move that waits costs mana instead, what would have
	# shortened its wait making it cheaper, and needs only a moment between uses: defs.ts MANA_MODE)
	var mana := 0.0
	var by_mana: bool = limit == "mana" and float(def["cooldown"]) > 0.0
	if by_mana:
		var MM: Dictionary = D["manaMode"]
		mana = (float(def.get("mana", 0.0)) * float(MM["cost"]) if float(def.get("mana", 0.0)) > 0.0 else float(MM["evade"])) * (1.0 - float(d["cdr"]))
		cooldown = float(MM["recover"]) if float(def.get("mana", 0.0)) > 0.0 else float(MM["evadeRecover"])
	# (how fast what the move sends flies: an arrow, a wave; Swift in front, faster)
	var proj_speed: float = float(def["speed"])
	var waits: bool = float(def["cooldown"]) > 0.0
	var heavy: Dictionary = D["heavy"]
	var r := {
		"id": id, "name": skill_name(id, front, behind), "element": element, "dmg_mult": 0.0, "size": 1.0, "rate": 0.0, "cooldown": 0.0, "mana": 0,
		"splash": 0.0, "splash_dmg": 0.0, "pierce": false,
		"ignite": 0.0, "chill": 0.0, "arcs": 0, "arc_dmg": 0.0, "poison": 0.0, "stun": 0.0,
		"might": 0.0, "haste": 0.0, "zone": null, "cloud": 0.0, "cracks": 0.0, "lines": lines,
		# (floors 6 to 10's words)
		"count": 1, "count_dmg": 1.0, "echo": 0.0, "leech": 0.0, "orb_chance": 0.0, "volatile": 0.0, "rune": 0.0, "precise": false, "mark": false,
		"frenzy": false, "frenzy_feed": false, "shield": 0.0, "ward": 0.0, "last": 1.0, "pace": 1.0, "boost": 1.0, "vast": 0.0, "wide": 1.0,
		# (WORDMELDING)
		"meld": meld, "meld_behind": meld_behind, "pull": 0.0, "vortex": 0.0,
		# (THE CITY'S WORDS: in front, Splitting's copies, Hexing's curse, Stilling's slow, Binding's hold; behind, Splitting's shards,
		# Hexing's circle, Stilling's bubble, Binding's snare)
		"split": 0.0, "hex": 0.0, "still": 0.0, "bind": 0.0, "shards": 0.0, "hex_circle": 0.0, "bubble": 0.0, "snare": 0.0,
		# (THE HIGH CITY'S SEVEN LAST WORDS: in front and behind)
		"through": 0.0, "lance": 0.0, "bleed": 0.0, "thorns": 0.0, "reap": 0.0, "spirit": 0.0, "cull": 0.0, "cull_mark": 0.0,
		"surge": 0.0, "dodge_surge": 0.0, "plunder": 0.0, "plunder_burst": 0.0, "mirror": 0.0, "mirror_leave": 0.0,
	}
	var frenzy: Dictionary = D["frenzy"]
	var guard: Dictionary = D["guard"]
	# (WORDS_ADD: the bonuses of the words in front, added up, made one at the end)
	var front_more := 0.0
	# (ELEMENT_HIT: the best of the damage words' own bonuses to the hit)
	var word_hit := 0.0

	# ----- in front: the hit -----
	if has.call(front, "power"):
		var a: float = grows_by.call(front, "power")
		var k: float = rk.call(front, "power")
		var dmg := 25.0 * k + 0.6 * a
		var big := 20.0 * k + 0.3 * a
		if ELEMENT_HIT:
			word_hit = maxf(word_hit, dmg)
		elif WORDS_ADD:
			front_more += dmg
		else:
			dmg_mult *= 1.0 + dmg / 100.0
		size *= 1.0 + big / 100.0
		if single:
			r["splash"] = maxf(r["splash"], 1.2)
			r["splash_dmg"] = maxf(r["splash_dmg"], 0.5)
		lines.append("Power%s: +%s damage, +%s size%s." % [rn.call(front, "power"), _pct(dmg), _pct(big), ", splashes nearby enemies" if single else ""])
	if has.call(front, "swift"):
		var a: float = grows_by.call(front, "swift")
		if waits:
			var cut := minf(60.0, 20.0 + 0.3 * a)
			if by_mana:
				mana *= 1.0 - cut / 100.0
				lines.append("Swift: costs %s less mana." % _pct(cut))
			else:
				cooldown *= 1.0 - cut / 100.0
				lines.append("Swift: %s shorter cooldown." % _pct(cut))
		else:
			var fast := 25.0 + 0.5 * a
			rate *= 1.0 + fast / 100.0
			lines.append("Swift: +%s attack speed." % _pct(fast))
		proj_speed *= 1.3
	if has.call(front, "twin"):
		# (the owner's rule for words that add: they take something too. Two of everything, each the weaker for it)
		var each := minf(80.0, 55.0 + 0.25 * grows_by.call(front, "twin"))
		r["count"] = 2
		r["count_dmg"] = each / 100.0
		match def["kind"]:
			"projectile":
				lines.append("Twin: two shots, each for %s. One enemy takes only one of them." % _pct(each))
			"beam":
				lines.append("Twin: two beams side by side, each for %s. One enemy takes only one of them." % _pct(each))
			"wave":
				lines.append("Twin: two waves, fanned apart, each for %s. One enemy takes only one of them." % _pct(each))
			"summon":
				lines.append("Twin: every familiar shoots two bolts, each for %s. One enemy takes only one of them." % _pct(each))
			"orb":
				lines.append("Twin: every wave comes twice, each for %s." % _pct(each))
			"whirl":
				lines.append("Twin: every turn cuts twice, each for %s." % _pct(each))
			"volley":
				lines.append("Twin: the arrows come down in pairs, each for %s." % _pct(each))
			"roll":
				lines.append("Twin: a second trap where the roll ends, each for %s." % _pct(each))
			"leap":
				lines.append("Twin: lands with two shocks, each for %s." % _pct(each))
			"warp":
				lines.append("Twin: arrives with two bursts, each for %s." % _pct(each))
			_:
				lines.append("Twin: hits twice, each for %s." % _pct(each))
	if has.call(front, "fire"):
		var burn: float = 30.0 * rk.call(front, "fire") + 0.8 * grows_by.call(front, "fire")
		r["ignite"] = burn / 100.0
		if single:
			r["splash"] = maxf(r["splash"], 1.5)
			r["splash_dmg"] = maxf(r["splash_dmg"], ELEMENT_SPLASH)
		if ELEMENT_HIT:
			var fh: float = 25.0 * rk.call(front, "fire") + 0.6 * grows_by.call(front, "fire")
			word_hit = maxf(word_hit, fh)
			lines.append("Flame%s: +%s damage, fire damage%s, burns for %s more over 3 s." % [rn.call(front, "fire"), _pct(fh), ", explodes on contact" if single else "", _pct(burn)])
		else:
			lines.append("Flame%s: fire damage%s, burns for %s more over 3 s." % [rn.call(front, "fire"), ", explodes on contact" if single else "", _pct(burn)])
	if has.call(front, "frost"):
		var slow: float = minf(70.0, 30.0 * rk.call(front, "frost") + 0.3 * grows_by.call(front, "frost"))
		r["chill"] = slow / 100.0
		if single:
			r["splash"] = maxf(r["splash"], 1.5)
			r["splash_dmg"] = 1.0
		if ELEMENT_HIT:
			var ch: float = (25.0 * rk.call(front, "frost") + 0.6 * grows_by.call(front, "frost")) * FROST_HIT
			word_hit = maxf(word_hit, ch)
			lines.append("Frost%s: +%s damage, frost damage%s, slows by %s; a second hit freezes." % [rn.call(front, "frost"), _pct(ch), ", bursts on contact" if single else "", _pct(slow)])
		else:
			lines.append("Frost%s: frost damage%s, slows by %s; a second hit freezes." % [rn.call(front, "frost"), ", bursts on contact" if single else "", _pct(slow)])
	if has.call(front, "lightning"):
		var a: float = grows_by.call(front, "lightning")
		var arc: float = 40.0 * rk.call(front, "lightning") + 0.5 * a
		r["arcs"] = 2 + floori(a / 40.0)
		r["arc_dmg"] = arc / 100.0
		var lh: float = 25.0 * rk.call(front, "lightning") + 0.6 * a
		if ELEMENT_HIT:
			word_hit = maxf(word_hit, lh)
		# (THUNDER: one big bolt instead of arcs: its twist, below)
		if meld == "thunder":
			lines.append("Lightning: %slightning damage." % (("+%s damage, " % _pct(lh)) if ELEMENT_HIT else ""))
		elif ELEMENT_HIT:
			lines.append("Lightning%s: +%s damage, lightning damage, arcs to %d more enemies for %s." % [rn.call(front, "lightning"), _pct(lh), r["arcs"], _pct(arc)])
		else:
			lines.append("Lightning%s: lightning damage, arcs to %d more enemies for %s." % [rn.call(front, "lightning"), r["arcs"], _pct(arc)])
	# (ELEMENT_HIT: the best damage word's bonus to the hit, as one of the words in front)
	if ELEMENT_HIT and word_hit > 0.0:
		if WORDS_ADD:
			front_more += word_hit
		else:
			dmg_mult *= 1.0 + word_hit / 100.0
	if has.call(front, "leech"):
		r["leech"] = 1.0 + 0.08 * grows_by.call(front, "leech")
		lines.append("Leeching: heals %s life per enemy hit." % _fixed1(r["leech"]))
	if has.call(front, "poison"):
		# (a weaker hit, and the poison does the work: every hit adds a dose. BLIGHT: the hit is not weakened)
		var dose: float = 20.0 * rk.call(front, "poison") + 0.4 * grows_by.call(front, "poison")
		r["poison"] = dose / 100.0 / (float(D["poison"]["time"]) if POISON_SPREAD else 1.0)
		if meld != "blight":
			dmg_mult *= 0.8
		if POISON_SPREAD:
			lines.append("Poison%s: %s for %s of the hit over %s s. Up to %s doses add up." % [rn.call(front, "poison"), "poisons" if meld == "blight" else "hits 20% softer; poisons", _pct(dose), _num(D["poison"]["time"]), _num(D["poison"]["stacks"])])
		else:
			lines.append("Poison%s: %s for %s of the hit a second for %s s. Up to %s doses add up." % [rn.call(front, "poison"), "poisons" if meld == "blight" else "hits 20% softer; poisons", _pct(dose), _num(D["poison"]["time"]), _num(D["poison"]["stacks"])])
	if has.call(front, "volatile"):
		var boom: float = 12.0 + 0.2 * grows_by.call(front, "volatile")
		r["volatile"] = boom / 100.0
		lines.append("Volatile: enemies it kills explode for %s of their life." % _pct(boom))
	if has.call(front, "heavy"):
		# (slower, much harder, and it stuns)
		var more: float = 50.0 + 0.5 * grows_by.call(front, "heavy")
		if WORDS_ADD:
			front_more += more
		else:
			dmg_mult *= 1.0 + more / 100.0
		if waits and by_mana:
			mana *= float(heavy["slower"])
		elif waits:
			cooldown *= float(heavy["slower"])
		else:
			rate /= float(heavy["slower"])
		r["stun"] = float(heavy["stun"])
		lines.append("Heavy: +%s damage, %s slower; stuns for %s s." % [_pct(more), _pct((float(heavy["slower"]) - 1.0) * 100.0), _num(heavy["stun"])])
	if has.call(front, "precise"):
		# (more damage, not a critical chance; and a smaller area)
		var more: float = 30.0 + 0.5 * grows_by.call(front, "precise")
		var area: float = D["precise"]["area"]
		if WORDS_ADD:
			front_more += more
		else:
			dmg_mult *= 1.0 + more / 100.0
		size *= area
		r["precise"] = true
		lines.append("Precise: +%s damage, %s smaller area." % [_pct(more), _pct((1.0 - area) * 100.0)])
	if has.call(front, "vast"):
		# (the opposite of Precise)
		var V: Dictionary = D["vast"]
		var wider := minf(float(V["widerMost"]), float(V["wider"]) + 0.001 * grows_by.call(front, "vast"))
		size *= 1.0 + wider
		r["wide"] = 1.0 + wider
		dmg_mult *= 1.0 - float(V["softer"])
		lines.append("Vast: %s bigger area, %s less damage." % [_pct(wider * 100.0), _pct(float(V["softer"]) * 100.0)])
	if has.call(front, "frenzied"):
		r["frenzy"] = true
		lines.append("Frenzied: each use makes the next %s faster, up to %s times; it fades %s s after the last." % [_pct(float(frenzy["each"]) * 100.0), _num(frenzy["max"]), _num(frenzy["hold"])])
	if has.call(front, "guarding"):
		r["shield"] = minf(0.2, float(guard["shield"]) + 0.001 * grows_by.call(front, "guarding"))
		if DEFENCE_WORDS:
			lines.append("Guarding: each use tops up your barrier by %s of your life (with no barrier, it holds that much for %s s)." % [_pct(r["shield"] * 100.0), _num(guard["shieldTime"])])
		else:
			lines.append("Guarding: each use gives you a shield of %s of your life for %s s." % [_pct(r["shield"] * 100.0), _num(guard["shieldTime"])])
	# THE CITY'S WORDS IN FRONT (Version 23.8; his doc "Wordsmith: The New Words": the numbers its starting points, each growing a
	# little with its attribute, a tenth of a percent a point, a two-hundredth of a tile for Pulling's drag)
	var C: Dictionary = D.get("city", {"pull": D["pull"]})
	if has.call(front, "pulling"):
		var PU: Dictionary = D["pull"]
		var k: float = rk.call(front, "pulling")
		r["pull"] = minf(float(PU["most"]) * k, float(PU["far"]) * k + 0.005 * grows_by.call(front, "pulling"))
		lines.append("Pulling: drags the enemies it hits up to %s tiles toward where it struck." % _fixed1(r["pull"]))
	if has.call(front, "splitting"):
		var SP: Dictionary = C["split"]
		var k: float = rk.call(front, "splitting")
		r["split"] = minf(float(SP["most"]) * k, float(SP["share"]) * k + 0.001 * grows_by.call(front, "splitting"))
		lines.append("Splitting: its first hit breaks into %d copies of %s that fly on to other enemies." % [int(SP["copies"]), _pct(r["split"] * 100.0)])
	if has.call(front, "hexing"):
		var HX: Dictionary = C["hex"]
		var k: float = rk.call(front, "hexing")
		r["hex"] = minf(float(HX["most"]) * k, float(HX["more"]) * k + 0.001 * grows_by.call(front, "hexing"))
		lines.append("Hexing: curses what it hits for %s s: it takes %s more damage from everything." % [_num(HX["secs"]), _pct(r["hex"] * 100.0)])
	if has.call(front, "stilling"):
		var SL: Dictionary = C["still"]
		var k: float = rk.call(front, "stilling")
		r["still"] = minf(float(SL["most"]), float(SL["slower"]) * k + 0.001 * grows_by.call(front, "stilling"))
		lines.append("Stilling: what it hits is slowed in time for %s s: it moves, attacks and shoots %s slower." % [_num(SL["secs"]), _pct(r["still"] * 100.0)])
	if has.call(front, "binding"):
		var BD: Dictionary = C["bind"]
		var k: float = rk.call(front, "binding")
		r["bind"] = minf(float(BD["most"]) * k, float(BD["secs"]) * k + 0.004 * grows_by.call(front, "binding"))
		lines.append("Binding: holds what it hits in place for %s s (an elite half as long, a boss not at all)." % _num(roundf(r["bind"] * 10.0) / 10.0))
	# ----- THE LAST WORDS (8 Nov 2026; defs.ts PIERCE to MIRRORING), in front -----
	var LW: Dictionary = D.get("last", {})
	if has.call(front, "piercing"):
		var PI_: Dictionary = LW["pierce"]
		r["pierce"] = true
		r["through"] = minf(float(PI_["throughMost"]), float(PI_["through"]) + 0.002 * grows_by.call(front, "piercing"))
		lines.append("Piercing: goes through every enemy in its path (a blow goes on through the first, %s tiles, for %s)." % [_num(PI_["line"]), _pct(r["through"] * 100.0)])
	if has.call(front, "bleeding"):
		var BL: Dictionary = LW["bleed"]
		r["bleed"] = minf(float(BL["dpsMost"]), float(BL["dps"]) + 0.001 * grows_by.call(front, "bleeding"))
		lines.append("Bleeding: what it hits bleeds for %s of the hit a second for %s s, %s times as much while it moves." % [_pct(r["bleed"] * 100.0), _num(BL["secs"]), _num(BL["moving"])])
	if has.call(front, "reaping"):
		var RP: Dictionary = LW["reap"]
		r["reap"] = minf(float(RP["secsMost"]), float(RP["secs"]) + 0.001 * grows_by.call(front, "reaping"))
		lines.append("Reaping: an enemy it kills leaves a soul that takes %s s off every cooldown." % _num(roundf(r["reap"] * 10.0) / 10.0))
	if has.call(front, "culling"):
		var CU: Dictionary = LW["cull"]
		r["cull"] = minf(float(CU["underMost"]), float(CU["under"]) + 0.0005 * grows_by.call(front, "culling"))
		lines.append("Culling: an enemy it leaves under %s of its life dies outright (an elite under half that, a boss never)." % _pct(r["cull"] * 100.0))
	if has.call(front, "surging"):
		var SU: Dictionary = LW["surge"]
		r["surge"] = minf(float(SU["dmgMost"]), float(SU["dmg"]) + 0.001 * grows_by.call(front, "surging"))
		lines.append("Surging: every %srd use releases a shockwave round you for %s of a hit." % [_num(SU["every"]), _pct(r["surge"] * 100.0)])
	if has.call(front, "plundering"):
		var PL: Dictionary = LW["plunder"]
		r["plunder"] = minf(float(PL["goldMost"]), float(PL["gold"]) + 0.005 * grows_by.call(front, "plundering"))
		lines.append("Plundering: an enemy it kills drops %s more gold, and now and then an extra item." % _pct(r["plunder"] * 100.0))
	if has.call(front, "mirroring"):
		var MI: Dictionary = LW["mirroring"]
		r["mirror"] = minf(float(MI["shareMost"]), float(MI["share"]) + 0.001 * grows_by.call(front, "mirroring"))
		lines.append("Mirrored: a reflection of you makes the same attack beside you, for %s." % _pct(r["mirror"] * 100.0))

	# ----- behind: the wake -----
	var softer := false
	if has.call(behind, "power"):
		r["might"] = 6.0 * rk.call(behind, "power") + 0.1 * grows_by.call(behind, "power")
		lines.append("of Power%s: each hit that lands adds +%s damage for 5 s (up to 5 times)." % [rn.call(behind, "power"), _pct(r["might"])])
	if has.call(behind, "swift"):
		r["haste"] = 15.0 + 0.2 * grows_by.call(behind, "swift")
		if DEFENCE_WORDS:
			lines.append("of Swiftness: +%s movement speed and +%d dodge for 3 s after each use." % [_pct(r["haste"]), roundi(r["haste"] * SWIFT_DODGE)])
		else:
			lines.append("of Swiftness: +%s movement speed for 3 s after each use." % _pct(r["haste"]))
	if has.call(behind, "twin"):
		var again := minf(100.0, 40.0 + 0.5 * grows_by.call(behind, "twin"))
		r["echo"] = again / 100.0
		lines.append("of Echoes: repeats a moment later for %s." % _pct(again))
	# (the first element behind, a melded word's in its own words' order)
	var behind_parts: Array = []
	for x in behind:
		if x != null:
			behind_parts.append_array(parts_of(x))
	for w in behind_parts:
		if w != "fire" and w != "frost" and w != "lightning":
			continue
		var a: float = grows_by.call(behind, w)
		var k: float = rk.call(behind, w)
		var tag: String = rn.call(behind, w)
		softer = true
		r["pierce"] = true
		if w == "fire":
			var dps := 25.0 * k + 0.6 * a
			r["zone"] = {"kind": "burn", "element": "fire", "dps": dps / 100.0, "slow": 0.0, "dur": 4.0}
			lines.append("of Flame%s: passes through, leaves ground that burns for %s a second." % [tag, _pct(dps)])
		elif w == "frost":
			var slow := minf(75.0, 40.0 * k + 0.3 * a)
			var dps := 10.0 * k + 0.2 * a
			r["zone"] = {"kind": "ice", "element": "frost", "dps": dps / 100.0, "slow": slow / 100.0, "dur": 4.0}
			lines.append("of Frost%s: passes through, leaves ice that slows by %s." % [tag, _pct(slow)])
		else:
			var zap := 30.0 * k + 0.6 * a
			r["zone"] = {"kind": "storm", "element": "lightning", "dps": zap / 100.0, "slow": 0.0, "dur": 4.0}
			lines.append("of Lightning%s: passes through, leaves a storm that strikes for %s." % [tag, _pct(zap)])
		# (one element behind)
		break
	if has.call(behind, "leech"):
		var chance := minf(90.0, 35.0 + 0.4 * grows_by.call(behind, "leech"))
		r["orb_chance"] = chance / 100.0
		lines.append("of Leeching: enemies it kills drop a life orb %s of the time." % _pct(chance))
	if has.call(behind, "poison"):
		var dose: float = 25.0 * rk.call(behind, "poison") + 0.5 * grows_by.call(behind, "poison")
		r["cloud"] = dose / 100.0
		lines.append("of Venom%s: leaves a cloud that poisons for %s of the hit a second." % [rn.call(behind, "poison"), _pct(dose)])
	if has.call(behind, "volatile"):
		var boom: float = 70.0 + grows_by.call(behind, "volatile")
		r["rune"] = boom / 100.0
		lines.append("of Ruin: leaves a rune that detonates for %s." % _pct(boom))
	if has.call(behind, "heavy"):
		r["cracks"] = float(heavy["cracks"])
		lines.append("of Quakes: leaves cracked ground for %s s; an enemy walking onto it is staggered." % _num(r["cracks"]))
	if has.call(behind, "precise"):
		r["mark"] = true
		lines.append("of the Mark: marks the first enemy it hits; your next hit on it is a certain critical.")
	if has.call(behind, "frenzied"):
		r["frenzy_feed"] = true
		lines.append("of Frenzy: each kill adds a stack and holds the frenzy %s s more." % _num(frenzy["hold"]))
	if has.call(behind, "guarding"):
		r["ward"] = minf(0.5, float(guard["ward"]) + 0.002 * grows_by.call(behind, "guarding"))
		lines.append("of Warding: leaves a ward circle for %s s; inside it you take %s less damage." % [_num(guard["wardTime"]), _pct(r["ward"] * 100.0)])
	# THE CITY'S WORDS BEHIND (Version 23.8)
	if has.call(behind, "pulling"):
		r["vortex"] = float(D["pull"]["vortex"]) * rk.call(behind, "pulling")
		lines.append("of the Vortex: leaves a vortex for %s s that keeps drawing enemies in to its middle." % _num(roundf(r["vortex"] * 10.0) / 10.0))
	if has.call(behind, "splitting"):
		var SP: Dictionary = C["split"]
		var k: float = rk.call(behind, "splitting")
		r["shards"] = minf(float(SP["shardMost"]) * k, float(SP["shardShare"]) * k + 0.001 * grows_by.call(behind, "splitting"))
		lines.append("of Shards: where it ends, %d shards of %s fly out in every direction." % [int(SP["shards"]), _pct(r["shards"] * 100.0)])
	if has.call(behind, "hexing"):
		var HX: Dictionary = C["hex"]
		var k: float = rk.call(behind, "hexing")
		r["hex_circle"] = minf(float(HX["weakest"]), float(HX["weaker"]) * k + 0.001 * grows_by.call(behind, "hexing"))
		lines.append("of Hexes: leaves a hex circle for %s s; enemies inside deal %s less damage." % [_num(HX["circle"]), _pct(r["hex_circle"] * 100.0)])
	if has.call(behind, "stilling"):
		var SL: Dictionary = C["still"]
		var k: float = rk.call(behind, "stilling")
		r["bubble"] = minf(float(SL["crawlMost"]), float(SL["crawl"]) * k + 0.001 * grows_by.call(behind, "stilling"))
		lines.append("of Stillness: leaves a bubble for %s s where enemies and their shots are %s slower." % [_num(SL["bubble"]), _pct(r["bubble"] * 100.0)])
	if has.call(behind, "binding"):
		var BD: Dictionary = C["bind"]
		var k: float = rk.call(behind, "binding")
		r["snare"] = minf(float(BD["snareMost"]) * k, float(BD["snareSecs"]) * k + 0.004 * grows_by.call(behind, "binding"))
		lines.append("of the Snare: leaves a snare; the next enemy to cross it is held in place for %s s." % _num(roundf(r["snare"] * 10.0) / 10.0))
	# ----- THE LAST WORDS, behind -----
	if has.call(behind, "piercing"):
		var PI_: Dictionary = LW["pierce"]
		r["lance"] = minf(float(PI_["lanceMost"]), float(PI_["lance"]) + 0.002 * grows_by.call(behind, "piercing"))
		lines.append("of the Lance: a moment later a lance of light strikes down its line for %s of a hit." % _pct(r["lance"] * 100.0))
	if has.call(behind, "bleeding"):
		var BL: Dictionary = LW["bleed"]
		r["thorns"] = minf(float(BL["thornsMost"]), float(BL["thorns"]) + 0.001 * grows_by.call(behind, "bleeding"))
		lines.append("of Thorns: leaves thorns for %s s that cut whatever walks in them for %s of a hit a second, and make it bleed." % [_num(BL["thornLife"]), _pct(r["thorns"] * 100.0)])
	if has.call(behind, "reaping"):
		var RP: Dictionary = LW["reap"]
		r["spirit"] = minf(float(RP["spiritDmgMost"]), float(RP["spiritDmg"]) + 0.001 * grows_by.call(behind, "reaping"))
		lines.append("of Spirits: an enemy it kills rises as a spirit that fights for you for %s s, for %s of a hit." % [_num(RP["spiritSecs"]), _pct(r["spirit"] * 100.0)])
	if has.call(behind, "culling"):
		var CU: Dictionary = LW["cull"]
		r["cull_mark"] = minf(float(CU["markMost"]), float(CU["markUnder"]) + 0.0005 * grows_by.call(behind, "culling"))
		lines.append("of the Reaper: leaves a reaper's mark; the first enemy under %s of its life to cross it dies." % _pct(r["cull_mark"] * 100.0))
	if has.call(behind, "surging"):
		var SU: Dictionary = LW["surge"]
		r["dodge_surge"] = minf(float(SU["dodgeMost"]), float(SU["dodge"]) + 0.001 * grows_by.call(behind, "surging"))
		lines.append("of the Surge: your dodge releases a surge for %s of this attack's hit." % _pct(r["dodge_surge"] * 100.0))
	if has.call(behind, "plundering"):
		var PL: Dictionary = LW["plunder"]
		r["plunder_burst"] = minf(float(PL["burstMost"]), float(PL["burst"]) + 0.005 * grows_by.call(behind, "plundering"))
		lines.append("of Plunder: an enemy it kills bursts with gold that flies to you, %s more." % _pct(r["plunder_burst"] * 100.0))
	if has.call(behind, "mirroring"):
		var MI: Dictionary = LW["mirroring"]
		r["mirror_leave"] = minf(float(MI["leaveMost"]), float(MI["leaveShare"]) + 0.001 * grows_by.call(behind, "mirroring"))
		lines.append("of Mirrors: leaves a mirror where you stood; your next attack it makes again from there, for %s." % _pct(r["mirror_leave"] * 100.0))
	if has.call(behind, "vast"):
		var V: Dictionary = D["vast"]
		r["vast"] = minf(float(V["splashMost"]), float(V["splash"]) + 0.001 * grows_by.call(behind, "vast"))
		lines.append("of the Expanse: each hit splashes %s of itself onto every enemy within %s tiles of what it hits." % [_pct(r["vast"] * 100.0), _num(V["splashR"])])
	# LASTING and FLEETING, the same wherever they sit (his "Well it makes everything connected to lasting last longer")
	var last_front: bool = has.call(front, "lasting")
	if last_front or has.call(behind, "lasting"):
		var LA: Dictionary = D["lasting"]
		var longer := minf(float(LA["longerMost"]), float(LA["longer"]) + 0.001 * grows_by.call(front if last_front else behind, "lasting"))
		r["last"] *= 1.0 + longer
		lines.append("%s: everything it makes and gives lasts %s longer; its poison and burning as hard, for longer." % ["Lasting" if last_front else "of Ages", _pct(longer * 100.0)])
	if has.call(front, "fleeting") or has.call(behind, "fleeting"):
		var FL: Dictionary = D["fleeting"]
		r["last"] *= 1.0 - float(FL["shorter"])
		r["pace"] /= 1.0 - float(FL["shorter"])
		r["boost"] *= 1.0 + float(FL["stronger"])
		lines.append("%s: everything it makes is %s shorter and does as much in that time; its boosts %s stronger." % ["Fleeting" if has.call(front, "fleeting") else "of Moments", _pct(float(FL["shorter"]) * 100.0), _pct(float(FL["stronger"]) * 100.0)])
	# (an element behind: it passes through, and hits softer)
	if softer:
		dmg_mult *= 0.7

	# ----- WORDMELDING: each melded word's twist, in front and behind (game/melds.ts, melds8.ts) -----
	var T: Dictionary = D["melds"]["tune"]
	var E: Dictionary = D["melds"]["eightTune"]
	if meld != null:
		var said := ""
		match meld:
			"eruption":
				said = "the blast leaves a pool of molten ground that burns for %s of the hit a second." % _pct(float(T["eruption"]["poolDps"]) * 100.0)
			"avalanche":
				said = "shoves enemies %s tiles back; one that is stopped by a wall or another is frozen." % _num(T["avalanche"]["shove"])
			"thunder":
				# (one big bolt instead of arcs, and it stuns)
				r["arcs"] = 0
				r["arc_dmg"] = 0.0
				if WORDS_ADD:
					front_more += float(T["thunder"]["bolt"]) * 100.0
				else:
					dmg_mult *= 1.0 + float(T["thunder"]["bolt"])
				r["stun"] = maxf(r["stun"], float(T["thunder"]["stun"]))
				said = "one bolt %s harder instead of arcs; it stuns for %s s." % [_pct(float(T["thunder"]["bolt"]) * 100.0), _num(T["thunder"]["stun"])]
			"blight":
				said = "the hit is not weakened, and its poison bites up to %s times harder as the enemy's life runs out." % _num(T["blight"]["most"])
			"scald":
				said = "a burning enemy that gets chilled, or a chilled one set burning, cracks for %s of the hit." % _pct(float(T["scald"]["crack"]) * 100.0)
			"wildfire":
				said = "its arcs set burning what they strike."
			"fumes":
				said = "an enemy both burning and poisoned gives off a toxic cloud."
			"hailstorm":
				said = "its arcs chill what they strike; a frozen enemy passes the arc on."
			"frostbite":
				said = "a chilled enemy loses %s of the hit a second, a frozen one twice that." % _pct(float(T["frostbite"]["bite"]) * 100.0)
			"contagion":
				said = "every enemy its arcs strike is poisoned."
			# (VOLATILE'S MELDS: what Volatile in front does, and more)
			"demolition":
				said = "its explosions %s bigger; an elite or a boss explodes once at half its life." % _pct((float(T["demolition"]["bigger"]) - 1.0) * 100.0)
			"powderkeg":
				said = "a burning enemy killed explodes harder, and the blast sets others burning."
			"shatter":
				said = "a frozen enemy killed bursts into shards that hit those around it for %s of its life." % _pct(float(T["shatter"]["share"]) * 100.0)
			"chainreaction":
				said = "an exploding enemy sends arcs to the %s nearest; those it kills explode too." % _num(T["chainreaction"]["arcs"])
			"rupture":
				said = "a poisoned enemy killed bursts, splashing its poison on those around."
			# (THE EIGHT ACROSS THE GROUPS)
			"siphon":
				said = "your poison heals you %s of the harm it does." % _pct(float(E["siphon"]["heal"]) * 100.0)
			"cauterize":
				said = "killing a burning enemy heals you %s of your life." % _pct(float(E["cauterize"]["heal"]) * 100.0)
			"forking":
				said = "every hit arcs to the nearest other enemy within %s tiles for %s of it." % [_num(E["forking"]["reach"]), _pct(float(E["forking"]["share"]) * 100.0)]
			"shiver":
				said = "a critical hit freezes the target for %s s." % _num(E["shiver"]["secs"])
			"sunder":
				said = "an enemy it stuns takes %s more from every hit while stunned." % _pct(float(E["sunder"]["more"]) * 100.0)
			"fervor":
				said = "each kill burns %s hotter for %s s, up to %s at once." % [_pct(float(E["fervor"]["burn"]) * 100.0), _num(E["fervor"]["secs"]), _num(E["fervor"]["most"])]
			"rimeward":
				said = "blocking a hit chills its maker by %s for %s s." % [_pct(float(E["rimeward"]["slow"]) * 100.0), _num(E["rimeward"]["secs"])]
			"implode":
				said = "drags enemies within %s tiles together, then bursts there for %s of the hit." % [_num(E["implode"]["reach"]), _pct(float(E["implode"]["share"]) * 100.0)]
		if said != "":
			lines.append("%s: %s" % [word(meld)["name"], said])
	if meld_behind != null:
		var B: float = E["behind"]
		var said := ""
		# (a line of one of its words that its twist does in another way)
		var drop := func(start: String) -> void:
			for k in lines.size():
				if str(lines[k]).begins_with(start):
					lines.remove_at(k)
					return
		match meld_behind:
			"eruption":
				said = "each hit builds heat; at %s, the next hit erupts for %s." % [_num(T["eruption"]["heat"]), _pct(float(T["eruption"]["blast"]) * 100.0)]
			"avalanche":
				said = "every hit on a chilled enemy, %s harder." % _pct(float(T["avalanche"]["chilled"]) * 100.0)
			"thunder":
				said = "every %s hits, a thunderclap bursts around you for %s." % [_num(T["thunder"]["every"]), _pct(float(T["thunder"]["clap"]) * 100.0)]
			"blight":
				said = "an enemy it poisons takes %s more damage from everything while poisoned." % _pct(float(T["blight"]["more"]) * 100.0)
			"scald":
				# (fire meeting ice on the ground: steam, in place of either)
				drop.call("of Flame:")
				var a: float = grows_by.call(behind, "fire")
				r["zone"] = {"kind": "steam", "element": "fire", "dps": float(T["scald"]["steamDps"]) + 0.004 * a, "slow": float(T["scald"]["slow"]), "dur": float(T["scald"]["dur"])}
				said = "fire meets ice: it leaves steam that hurts and slows by %s, and hides you while you stand in it." % _pct(float(T["scald"]["slow"]) * 100.0)
			"wildfire":
				said = "the burning ground throws sparks at enemies within %s tiles." % _num(T["wildfire"]["reach"])
			"fumes":
				said = "the poison cloud explodes when anything burning comes into it."
			"hailstorm":
				# (a storm of ice: the storm, slowing, in place of the ice)
				drop.call("of Frost:")
				var a: float = grows_by.call(behind, "lightning")
				r["zone"] = {"kind": "storm", "element": "lightning", "dps": (30.0 + 0.6 * a) / 100.0, "slow": float(T["hailstorm"]["slow"]), "dur": 4.0}
				said = "a storm of ice that strikes and slows by %s." % _pct(float(T["hailstorm"]["slow"]) * 100.0)
			"frostbite":
				said = "the ice on the ground poisons what crosses it."
			"contagion":
				said = "the poison cloud shocks whatever stands in it."
			# (VOLATILE'S MELDS: what Volatile behind leaves, its rune, does more)
			"demolition":
				said = "one huge rune, %s harder and %s times as wide, slow to go off." % [_pct((float(T["demolition"]["runeHard"]) - 1.0) * 100.0), _num(T["demolition"]["runeWide"])]
			"powderkeg":
				said = "the rune leaves burning ground when it goes off."
			"shatter":
				said = "the rune freezes what is near, then bursts."
			"chainreaction":
				said = "your runes are linked: one going off sets off the rest."
			"rupture":
				said = "the rune bursts into a poison cloud."
			# (THE EIGHT ACROSS THE GROUPS, behind: the same twist, `behind` as strong)
			"siphon":
				said = "your poison heals you %s of the harm it does." % _pct(float(E["siphon"]["heal"]) * B * 100.0)
			"cauterize":
				said = "killing a burning enemy heals you %s of your life." % _pct(float(E["cauterize"]["heal"]) * B * 100.0)
			"forking":
				said = "every hit arcs to another enemy nearby for %s of it." % _pct(float(E["forking"]["share"]) * B * 100.0)
			"shiver":
				said = "a critical hit freezes the target for %s s." % _num(float(E["shiver"]["secs"]) * B)
			"sunder":
				said = "an enemy it stuns takes %s more while stunned." % _pct(float(E["sunder"]["more"]) * B * 100.0)
			"fervor":
				said = "each kill burns %s hotter for a few seconds." % _pct(float(E["fervor"]["burn"]) * B * 100.0)
			"rimeward":
				said = "blocking a hit chills its maker by %s." % _pct(float(E["rimeward"]["slow"]) * B * 100.0)
			"implode":
				said = "drags enemies together a little, then a small burst for %s of the hit." % _pct(float(E["implode"]["share"]) * B * 100.0)
		if said != "":
			lines.append("%s: %s" % [word(meld_behind)["behind"], said])

	# (LASTING and FLEETING on what it leaves and the boosts it gives: its ground longer or shorter, Fleeting's as much in all; the
	# boosts Fleeting's stronger)
	if r["zone"] != null:
		var z: Dictionary = r["zone"]
		r["zone"] = {"kind": z["kind"], "element": z["element"], "dps": float(z["dps"]) * r["pace"], "slow": z["slow"], "dur": float(z["dur"]) * r["last"]}
	r["might"] *= r["boost"]
	r["haste"] *= r["boost"]
	r["shield"] *= r["boost"]

	dmg_mult *= 1.0 + front_more / 100.0
	r["dmg_mult"] = dmg_mult
	# (WHAT ITS WORDS MAKE OF ITS HITS, over the move with none in it: what else it sets off grows with them too, hero.gd side)
	r["word_k"] = dmg_mult / dmg_bare if dmg_bare > 0.0 else 1.0
	r["size"] = size
	r["rate"] = rate
	r["cooldown"] = cooldown
	r["mana"] = floori(mana + 0.5)
	r["proj_speed"] = proj_speed
	return r
