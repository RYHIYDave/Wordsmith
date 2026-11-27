## FLOOR 1'S LOOT, THE HERO'S GEAR, HIS LEVELS AND HIS WORDS, as the game has them (game.ts dropLoot, updateDrops, takeItem,
## gainXp; game/stats.ts derive; tools/godot_loot.ts saved the game's own gear and pictures: assets/loot).
##   WHAT FALLS (dropLoot, with LOOT2), the gold each time the floor's level: an ordinary monster, gold 25% of the time (3 to
##   8), a piece of gear 4%, a life orb 6%; a pack's leader, gold 8 to 16 and a piece 75% of the time (a leader's luck); a
##   guardian, gold 15 to 25, two pieces (a hoard's luck, then an ordinary one; from floor 6 both a hoard's) and an orb, and the
##   flasks filled; a boss, gold 25 to 45, three pieces (four on floors 5, 10, 15 and 20: the first never plain, the others
##   a better monster's luck, from floor 6 a hoard's), now and then his own unique, and an orb. The dead the Warden calls leave
##   nothing. Each piece is of the rarity the game's rules roll (UNIQUE ITEMS below) and one the game itself rolled on that
##   floor (items.json), so their kinds, names, rarities and properties are the game's.
##   TAKING IT (updateDrops): walking; nothing is taken till it has lain 0.4 s; gold and orbs within 3.2 tiles fly to him
##   at 9 a second and are taken at 0.75; gear lies where it fell and is taken within 1.1: worn at once in an empty slot
##   it fits, else into the bag of 24, else "Your bag is full". An orb gives back 15% of his life.
##   THE FLASKS: three, each 45% of his life (Q); one comes back for every 18 kills.
##   LEVELS (gainXp; defs.ts xpToNext = 3 x (45 + 33L + 9L^2)): each gives 12 life, all of it back, and +5 to one of Str,
##   Dex or Int, his choice (inventory.gd asks).
##   HIS STATS (stats.ts derive): every worn piece's properties added together; the weapon's own damage among them.
##   THE FALLEN WORDSMITH (game.ts enterDungeon, placeBody, searchBody): he lies on floor 1 until its way down has been
##   taken (searched already, if the hero has searched one); on a later floor ONLY for a hero who has neither the lit ring
##   nor the stone and has not searched one. Walking within 1.3 tiles of him searches him: before the ring is lit, the
##   Master Rune-stone and the flasks filled (it is carried to the wordsmith in town, who lights the ring and gives the
##   first word, POWER: town.gd); once it is lit, the flasks filled and the Warrior's first word laid beside him.
##   WORDS (game.ts wordsFall, spawn, dropLoot, updateProps, updateDrops): none falls before the ring is lit, nor on floor
##   1. From then a monster that carries a word gives it up where it falls (a boss always carries one; the rune over its
##   head says so); an ordinary monster leaves one 3 times in 1000 and a chest 5 in 100 (the first chest opened in a
##   treasure vault 25), the likelier the deeper (wordGrowth), one of the floor's own (wordsAt). A word on the floor is an
##   event: it stands in a shaft of its own light under its name (render.ts drawWordDrops), 1 s before it can be taken,
##   comes to him from 3.2 tiles and is taken at 0.75. Then it is among his words (`words`), the top of the screen says
##   WORD FOUND (hud.gd), and, while no word of his is at work yet, the gear screen opens on it at the next quiet moment
##   (main.ts `offer`, `quiet`).
##   BURNING A WORD INTO A PIECE (game.ts imbue; items.ts imbueProblem, imbueOptionsFor, imbueItem): the word is used up,
##   and becomes one of the things it can become on that kind of piece, picked evenly, its size rolled (items.json `imbue`:
##   every size the game's own imbueItem can roll). A piece has room for four properties, those it was found with and the
##   words burned in, and never two of a kind.
##   THE ARMOURER'S QUEST (game/quests15.ts; game.ts armourerDue, armourerHandIn, furnaceGearTaken, turnCrank): `furnace`,
##   where the hero stands in it; it is his, and outlasts the place (town.gd asks and rewards; furnace.gd tells it of the
##   gear and of the furnace going out).
##   THE MELDSTONE (game/quests15.ts, the wordsmith's quest; game/melds.ts STONE_RISE; game.ts dropLoot, updateDrops,
##   takeMeldstone, meldAskDue; render/meld_drops.ts riseOf, takenOf; art/meld_drops.ts, its pictures, tools/godot_fx.ts `ms_`):
##   once the armourer has rewarded him, the wordsmith asks for it (`meld_ask`); as the Fleshmancer dies (fleshmancer.gd) it
##   waits under the floor while he is dragged down (2.6 s), its light cracking the floor, then bursts up spinning where he went
##   down, its halves torn apart, slams together and comes down to hang, turning to and fro, "Meldstone" over it; it cannot be
##   taken for 1.2 s, then comes to him as gold does and is taken (`meld` "stone"): it leaps over his head, slams together and
##   dives into him. Given to the wordsmith (town.gd), `meld` "open": he gives the two words to meld (FLAME and FROST) and says
##   the lesson's lines; and from then on he melds (the block WORDMELDING AT THE WORDSMITH below; his page, inventory.gd).
##   WORDMELDING: two spare words and runedust in, one word out (game.ts meldProblem, meldWords); the words melding makes on gear
##   as the game has them (EVERY WORD ON GEAR: a melded word's two properties in one place, `alsoRolls`; tools/godot_loot.ts).
extends Node

const Iso := preload("res://scripts/iso.gd")
const Hero := preload("res://scripts/hero.gd")
const Words := preload("res://scripts/words.gd")
const Melds52 := preload("res://scripts/melds52.gd")
const FoeWords := preload("res://scripts/foe_words.gd")
const DoorWords := preload("res://scripts/door_words.gd")
const FloorMap := preload("res://scripts/floor_map.gd")
const Perils := preload("res://scripts/perils.gd")

const DIR := "res://assets/loot"
const EQUIP := ["mainhand", "offhand", "helm", "chest", "gloves", "belt", "boots", "amulet", "ring1", "ring2"]

## THE THREE DEFENCES (his words, 22 Nov 2026: “I was also thinking about other defensive layers like barrier that scales with int
## or dodge that scales with dex.  What do you think about that?  Those values can be base values on pieces of gear.  Str gear with
## armor, Dex gear with dodge and int gear with barrier.  Barrier differing from armor by not giving damage mitigation but a second
## pool of HP before the life pool.”; then “I feel like some of the gear already tries to do this”, “We don't have mana, we have
## cooldowns so we don't need that on cloth gear”, “So maybe cdr on cloth”). The three kinds of piece the gear already has, each
## its own defence built into it, and one small thing more:
##   HEAVY   (Iron, Steel, War: plate, helm, gauntlets, belt, greaves)  ARMOUR, as ever (and Strength his life, as ever)
##   LEATHER (Hide, Leather, Studded; the hoods)  DODGE in place of its armour, its speed or life kept: a chance that a blow misses
##           him altogether, dodge / (dodge + 40 + 20 a floor) of hero.gd DODGE_K, never certain; Dexterity makes it more (DEX_DODGE %
##           a point, as the damage reads attributes: words.gd eff_attr)
##   CLOTH   (Linen, Silk, Velvet: robe, gloves, sash)  BARRIER in place of its mana, and a little cooldown recovery: a second life
##           in front of his life that takes every harm first (no less for it), and fills again when nothing has touched him for
##           hero.gd BARRIER_WAIT seconds; Intelligence makes it more (INT_BARRIER % a point)
## A piece's defence is sized by its kind's heavy piece's armour at its level (HEAVY_ARMOUR: items.ts GEAR_KINDS), LEATHER_K of it
## for leather, LEATHER_K x BARRIER_K for cloth. ON at his “Yes.” to its pictures (docs/mockups/defences: the barrier round his
## life globe, its line over his life and its shimmer on him, DODGE over him, the cards and the stats page), 22 Nov 2026.
static var DEFENCE_LAYERS := true
## A CRITICAL HIT AT LEAST DOUBLE A REGULAR ONE (his words, 26 Nov 2026, told a critical hit does 50% more at base: “See there's the
## problem.  A crit should be at least double a regular hit”, then “Maybe 2.5x”): every class's base critical damage +150% (a
## critical hit 2.5 times a regular one) in place of the items table's +50% (tune baseCritMult), what gear adds on top. ON at his
## yes, 26 Nov 2026: “Both on (Recommended)”.
static var CRIT_DOUBLE := true
const CRIT_DOUBLE_BASE := 150.0
## THE THREE DEFENCES EVENED (his pick, 26 Nov 2026, “Fix the balance (Recommended)”, after the speed and tank test found every
## hero's toughest build all Strength and heavy armour, his dodge never past 1%): see derive. ON at his yes to the numbers (the
## toughest builds before and after, docs/tests/speed_tank_2026-11-26.txt), 26 Nov 2026: “Yes, both (Recommended)”.
static var DEFENCE_EVEN := true
## (each point of Dexterity's dodge, each of Intelligence's barrier, with DEFENCE_EVEN on: as each of Strength is 3 life, items.json
## attr strLife; dodge reckoned as armour is, d / (d + 40 + 20 a floor): hero.gd dodge_chance)
const EVEN_DEX_DODGE := 0.8
const EVEN_INT_BARRIER := 2.5
const HEAVY_ARMOUR := {"helm": [5.0, 3.0], "chest": [8.0, 5.0], "gloves": [3.0, 2.0], "belt": [3.0, 2.0], "boots": [3.0, 2.0]}
const LEATHER_K := 0.75
const BARRIER_K := 2.0
const CLOTH_CDR := 0.05
## (how much more each point of Dexterity makes his gear's dodge, and each of Intelligence his gear's barrier, %: as the damage
## reads attributes, words.gd eff_attr; with no leather or cloth on, neither)
const DEX_DODGE := 0.5
const INT_BARRIER := 0.5
## (what the dodge chance and the barrier's filling are: hero.gd DODGE_K, BARRIER_WAIT, BARRIER_FILL)


## THE UNIQUES' DEFENCES (his words, 23 Nov 2026: “I'd like you to go back and look at our uniques that we made and change them to
## reflect what the class that would be using them would be most likely using as a defense. So if it's a mage unique and it has
## some flat armor on it, change that to barrier. Or if it's a ranger unique, add dodge.”; game/uniques.ts THE UNIQUES' DEFENCES).
## A unique's piece may say its own (`udef`: "armor", "dodge", "barrier"): on a piece of armour its base's defence is that one
## instead, as big as a piece of that kind is at its level, what else is built into it kept; on anything else (an amulet, a ring)
## it is one more thing built in, as big as a pair of gloves'. A leveling unique (`bare`) carries nothing of its base (“nothing
## but 20% movement speed”), so no defence of its base's kind either: only what is written on it.
const UDEF_FAMILY := {"armor": "heavy", "dodge": "leather", "barrier": "cloth"}


static func _slot_of(it: Dictionary) -> String:
	return str(it.get("slot", "")).trim_suffix("1").trim_suffix("2")


static func _udef(it: Dictionary) -> String:
	var u = it.get("udef")
	return str(u) if u != null and UDEF_FAMILY.has(str(u)) else ""


## The kind a piece of gear is of by its base's name alone: "heavy", "leather", "cloth", or "" (a weapon, an off-hand, a ring...).
static func base_family(it) -> String:
	if it == null or not (it is Dictionary):
		return ""
	if not HEAVY_ARMOUR.has(_slot_of(it)):
		return ""
	var base: String = str(it.get("base", it.get("name", "")))
	if base.ends_with("Hood"):
		return "leather"
	for w in ["Hide ", "Leather ", "Studded "]:
		if base.begins_with(w):
			return "leather"
	for w in ["Linen ", "Silk ", "Velvet "]:
		if base.begins_with(w):
			return "cloth"
	for w in ["Iron ", "Steel ", "War "]:
		if base.begins_with(w):
			return "heavy"
	return ""


## The kind a piece of gear is of: its base's, or the one a unique says is its own (`udef`); a leveling unique, none.
static func family(it) -> String:
	if it == null or not (it is Dictionary):
		return ""
	if it.get("bare", false) == true:
		return ""
	var u := _udef(it)
	if u != "" and HEAVY_ARMOUR.has(_slot_of(it)):
		return UDEF_FAMILY[u]
	return base_family(it)


## THE UNIQUES' DEFENCES: the defence a unique's amulet, ring or other piece that is not armour has built in: [stat, value], or [].
static func jewel_defence(it: Dictionary) -> Array:
	var u := _udef(it)
	if not DEFENCE_LAYERS or u == "" or it.get("bare", false) == true or HEAVY_ARMOUR.has(_slot_of(it)):
		return []
	var heavy: float = defence_size(str(it.get("slot", "")), float(it.get("ilvl", 1))) / (LEATHER_K * 1.2)
	return [u, roundf(heavy * (1.0 if u == "armor" else LEATHER_K * (BARRIER_K if u == "barrier" else 1.0)))]


## What is built into a piece (its implicit), as the three defences make it: [[stat, value], ...].
static func implicit_of(it: Dictionary) -> Array:
	var im: Array = it.get("imods", [])
	if not DEFENCE_LAYERS:
		return im
	var jewel := jewel_defence(it)
	if not jewel.is_empty():
		return im + [jewel]
	var fam := family(it)
	var was := base_family(it)
	if fam == "" or (fam == "heavy" and was == "heavy"):
		return im
	var slot := _slot_of(it)
	var H: Array = HEAVY_ARMOUR[slot]
	var heavy: float = float(H[0]) + float(H[1]) * (float(it.get("ilvl", 1)) - 1.0)
	var size: float = heavy * LEATHER_K
	var out: Array = []
	# (THE UNIQUES' DEFENCES: a piece whose defence is not its base's kind's: that one, what else is built in kept)
	if fam != was:
		out.append(["armor", roundf(heavy)] if fam == "heavy" else (["dodge", roundf(size)] if fam == "leather" else ["barrier", roundf(size * BARRIER_K)]))
		for m in im:
			if m[0] != "armor" and m[0] != "maxMana":
				out.append(m)
		return out
	if fam == "leather":
		out.append(["dodge", roundf(size)])
		for m in im:
			if m[0] != "armor":
				out.append(m)
	else:
		out.append(["barrier", roundf(size * BARRIER_K)])
		var mana := 0.0
		for m in im:
			if m[0] == "maxMana":
				mana += float(m[1])
		out.append(["cdr", maxf(1.0, roundf(mana * 0.1 * CLOTH_CDR * 10.0))])
	return out


## THE THREE DEFENCES' WORDS on gear: how big a barrier or a dodge burned into a piece of this kind and level is at most (as a
## leather or cloth piece's own, times the 1.2 a word burned in has over an affix; a weapon, a ring or an amulet as gloves, an
## off-hand as a helm).
static func defence_size(slot: String, ilvl: float) -> float:
	var s := slot.trim_suffix("1").trim_suffix("2")
	var H: Array = HEAVY_ARMOUR.get("helm" if s == "offhand" else s, HEAVY_ARMOUR["gloves"])
	return (float(H[0]) + float(H[1]) * (ilvl - 1.0)) * LEATHER_K * 1.2


## A word's option on a piece as the three defences' words make it: a chance to block, barrier; Swift's cooldown recovery on a
## piece that keeps him (off-hand, helm, chest, belt), dodge. Each roll where it fell in the old range, in the new (from 55% of
## the most to the most; a melded word's three quarters of that).
func _defence_option(w: String, slot: String, ilvl: float, o: Dictionary) -> Dictionary:
	var k := 0.75 if Words.is_meld(w) else 1.0
	var to := {}
	var swift_here: bool = Words.parts_of(w).has("swift") and slot.trim_suffix("1").trim_suffix("2") in ["offhand", "helm", "chest", "belt"]
	for r in o.get("rolls", []):
		for m in r[1]:
			if m[0] == "blockChance":
				to["blockChance"] = ["barrier", defence_size(slot, ilvl) * BARRIER_K * k, "Barrier"]
			elif m[0] == "cdr" and swift_here:
				to["cdr"] = ["dodge", defence_size(slot, ilvl) * k, "Dodge"]
	if to.is_empty():
		return o
	var lo := {}
	var hi := {}
	for r in o["rolls"]:
		for m in r[1]:
			if to.has(m[0]):
				lo[m[0]] = minf(float(lo.get(m[0], 1e9)), float(m[1]))
				hi[m[0]] = maxf(float(hi.get(m[0], -1e9)), float(m[1]))
	var rolls: Array = []
	var nlo := 1e9
	var nhi := 0.0
	var label := ""
	for r in o["rolls"]:
		var mods: Array = []
		var lines: Array = []
		var old_lines: Array = r[2] if r.size() > 2 else []
		for idx in (r[1] as Array).size():
			var m: Array = r[1][idx]
			if to.has(m[0]):
				var span: float = float(hi[m[0]]) - float(lo[m[0]])
				var f: float = (float(m[1]) - float(lo[m[0]])) / span if span > 0.0 else 1.0
				var v: float = maxf(1.0, roundf(float(to[m[0]][1]) * (0.55 + 0.45 * f)))
				mods.append([to[m[0]][0], v])
				lines.append("+%d %s" % [int(v), to[m[0]][2]])
				nlo = minf(nlo, v)
				nhi = maxf(nhi, v)
				label = to[m[0]][2]
			else:
				mods.append(m)
				if idx < old_lines.size():
					lines.append(old_lines[idx])
		rolls.append([r[0], mods, lines])
	var out := o.duplicate(true)
	out["rolls"] = rolls
	if to.has(str(o["stat"])):
		out["stat"] = to[str(o["stat"])][0]
		out["range"] = "+%d to %d %s" % [int(nlo), int(nhi), label]
	return out


## Everything a piece gives (its `mods`, its implicit as the three defences make it).
static func mods_of(it: Dictionary) -> Array:
	var mods: Array = it.get("mods", [])
	if not DEFENCE_LAYERS or not _built_changed(it):
		return mods
	var rest: Array = mods.duplicate()
	for m in it.get("imods", []):
		for k in rest.size():
			if rest[k][0] == m[0] and float(rest[k][1]) == float(m[1]):
				rest.remove_at(k)
				break
	return implicit_of(it) + rest


## Is what is built into this piece other than its base's own, by the three defences (a leather or cloth piece; a unique's own)?
static func _built_changed(it: Dictionary) -> bool:
	return family(it) != ("heavy" if base_family(it) == "heavy" else "") or not jewel_defence(it).is_empty()


## The lines of what is built into a piece, as the three defences make it (lines_of with "implicit").
static func implicit_lines(it: Dictionary) -> Array:
	var out: Array = []
	for m in implicit_of(it):
		match str(m[0]):
			"dodge":
				out.append("+%d Dodge" % int(m[1]))
			"barrier":
				out.append("+%d Barrier" % int(m[1]))
			"cdr":
				out.append("+%d%% Cooldown Recovery" % int(m[1]))
			"moveSpeed":
				out.append("+%d%% Movement Speed" % int(m[1]))
			"atkSpeed":
				out.append("+%d%% Attack Speed" % int(m[1]))
			"maxLife":
				out.append("+%d Max Life" % int(m[1]))
			"armor":
				out.append("+%d Armour" % int(m[1]))
			_:
				out.append("+%s %s" % [m[1], m[0]])
	return out
const BAG := 24
const RARITY_COLOR := [Color("#cfc6bc"), Color("#6f8cff"), Color("#ffe070"), Color("#ff8a3a")]
const PULL := 3.2
const TAKE := 0.75
const GEAR_TAKE := 1.1
const FLY := 9.0
const WAIT := 0.4
const POTIONS := 3
const POTION_HEAL := 0.45
const KILLS_A_POTION := 18
const ORB_HEAL := 0.15
const SEARCH := 1.3
## (defs.ts MSG: news about words; every line of a quest; the flasks; what cannot be done)
const MSG_WORD := Color("#7af8f0")
const MSG_QUEST := Color("#7af8f0")
const MSG_LIFE := Color("#ff9aa0")
const MSG_BAD := Color(0.96, 0.27, 0.47)
## (main.ts: monsters awake this near keep a moment from being quiet; a new player's first word is seen so long in its
## light before the screen opens for it, any other so long; how long WORD FOUND stays, large and small)
const BUSY_NEAR := 10.0
const OFFER_FIRST := 2.4
const OFFER_WAIT := 0.9
const TOAST_BIG := 3.6
const TOAST := 2.8

var hero: Hero
var monsters  # monsters.gd
var stands: Node2D
var sfx  # sfx.gd
var map  # floor_map.gd

var gear := {}
var bag: Array = []
var attrs := {"str": 14.0, "dex": 8.0, "int": 6.0}
var level := 1
var xp := 0.0
var gold := 0
var potions := POTIONS
var kills := 0
## THE WORDS HE HOLDS, unset: by id, how many (game.ts hero.words). A word he has never held has no entry.
var words := {"power": 0}
var quest := ""
var ring_lit := false
## the wordsmith has asked for the stone (guide: "Take the STAIRS down" from then on)
var quest_given := false
## seconds left of the "carry" or "ring" prompt (QUEST_ITEM.promptSecs)
var prompt_t := 0.0
## (game.ts bodySearched: he has searched a fallen wordsmith)
var body_searched := false
## (game.ts cleared, how many floors' ways on he has taken: here the deepest floor he has come into, less one)
var cleared := 0
## THE ARMOURER'S QUEST, where he stands in it (quests15.ts FurnaceStep; game.ts hero.furnace): "" not asked, "asked", "gear"
## (he carries the crank's gear), "out" (the furnace put out), "done" (rewarded).
var furnace := ""
## THE MELDSTONE (game.ts hero.meld, hero.meldAsk): "" not his, "stone" carried, "open" given to the wordsmith; and whether
## the wordsmith has asked for it.
var meld := ""
var meld_ask := false
## (game.ts toldCarrier: what the rune over a monster's head means has been said)
var told_carrier := false
## THE CHAINED RARE: the floors of the story whose chained rare he has beaten; there he is never chained again (chained_rare.gd).
## His pick, 22 Nov 2026, asked whether one should come back each time the floor is laid: “Once per floor”.
var chained_beaten: Array = []
## A NEW PLAYER'S FIRST WORD HAS BEEN SET IN AN ATTACK (game.ts guide.set, endGuide): the lesson of the first word is over.
## Until then a word he holds is pressed on him (guide.gd), and goes on an attack and nowhere else.
var taught := false
## ABILITIES: COOLDOWNS or MANA (main.ts meta.limit, flipLimit; the start screen's options and the pause panel): what limits his
## moves that wait, the device's own choice, kept with the Lexicon
var limit := "cooldown"


## A piece's lines (`key`: "implicit", "lines"), or a word's on it, as they read under the limit: with mana, its Max Mana and Mana
## Regen as themselves and its cooldown recovery as less Mana Cost (items.ts statView, modLines; tools/godot_loot.ts `...Mana`).
func lines_of(it: Dictionary, key := "lines") -> Array:
	# (THE THREE DEFENCES: a leather or cloth piece's built-in lines as they make it)
	if key == "implicit" and DEFENCE_LAYERS and _built_changed(it):
		# (THE UNIQUES' DEFENCES: an amulet's or a ring's own: its base's lines, and the defence's after them)
		var jewel := jewel_defence(it)
		if not jewel.is_empty():
			var base_lines: Array = (it[key + "Mana"] if limit == "mana" and it.get(key + "Mana") is Array else it.get(key, [])).duplicate()
			base_lines.append("+%d %s" % [int(jewel[1]), {"armor": "Armour", "dodge": "Dodge", "barrier": "Barrier"}[jewel[0]]])
			return base_lines
		return implicit_lines(it)
	if limit == "mana" and it.get(key + "Mana") is Array:
		return it[key + "Mana"]
	return it.get(key, [])


## The switch turned: his moves made again under the other limit, his mana full.
## THE MANA OPTION GONE (his words, 22 Nov 2026: “We don't have mana, we have cooldowns”, “Mana option should go”): his moves
## always wait on their cooldowns; the start screen and the pause panel no longer offer mana, and a save kept with it comes back
## with cooldowns.
func set_limit(_l: String) -> void:
	limit = "cooldown"
	if hero != null:
		derive()
		hero.mana = hero.max_mana
		if hero.kit != null:
			hero.kit.limit_changed()
## THE WORD JUST COME BY, for the top of the screen (main.ts toast; hud.gd WORD FOUND): {word, t, big}, empty when none.
var toast := {}
## A word waiting for a quiet moment to be offered a place (game.ts offer), and the word the gear screen is opened on
## (inventory.gd takes it in hand).
var offer := ""
var offered := ""
## What a word has just become on a piece (game.ts `burned`): {word, item, text}, for the gear screen's card.
var burned := {}
var main  # main.gd
## a level-up's +5 still to be placed (inventory.gd asks which)
var points := 0
var msgs: Array = []  # {text, t, color, life}

var sheet: Texture2D
var pics := {}
var stat_info := {}
var _pools := {}
## (any floor: the same pools as the game rolls them on each floor, tools/godot_loot.ts; floor 1's where a floor has none. Read
## from depth/<d>.json for the floor a drop is of, and let go of with the next: `_depths` the floors that have their own)
var _depths: Array = []
## (QUESTS1115: the armourer's pick for the clapper, fully modded rares by level and slot: tools/godot_loot.ts fullRares)
var _full_rares := {}
## UNIQUE ITEMS (game/uniques.ts, UNIQUES on; items.json `uniques`, tools/godot_loot.ts): what each is and where it drops (`defs`),
## pieces of each as the game's own makeUnique made them at each floor's level, a leveling unique at its own (`pieces`), the odds
## (`drops`, `gamble`), the chances of Normal, Magic and Rare at each floor's level (`chances`) and LOOT2's (`loot2`).
##   WHERE THEY DROP (game.ts rollGear, poolUnique, makePoolUnique, dropBossUnique, gamble; uniques.ts poolChance, levelChance,
##   levelPoolFor): any piece of gear about to drop is now and then one of the pool's instead: 2 in 1000 from an ordinary monster,
##   4 from a better one, 8 from a hoard, times (1 + his magic find / 100), from floor 2; the ones for everyone and his own, never
##   another hero's, and a Warrior only his own weapon's of his three. Failing that, as often, one of the leveling uniques of this
##   floor's level or below (anyone's, or his class's), on any floor. A boss drops his own one kill in ten (floor 13's pair as the
##   last falls); the stranger's gamble gives one of the pool's of the kind gambled for 5 throws in 1000. Each lands with the
##   rare chime.
##   MAGIC FIND (items.ts rollRarity; game.ts rollGear): the chances of Magic and Rare at the floor's level, each times (1 + his
##   magic find / 100) and a better monster's luck (1.5, 2) or a hoard's (3, 4), and from floor 6 (LOOT2.from) every roll's 1.25
##   times; a boss's or a guardian's first never plain (from floor 6 a rare at the least). A piece of the rarity rolled is one the
##   game rolled on this floor (out of all its pools: luck changes only the rarity).
var _uniques := {}
## (the floor of the last drop: the pieces the game rolled there, by rarity, Normal, Magic, Rare: the uniques among them left out)
var _by_rarity := {}
## THE ROYAL CARDS (act3/royal_cards.gd; items.json `royal`): the cards he holds, by royal (game.ts Hero.cards: kept for good,
## save.gd); where in the bag the pieces the last hand handed in brought lie (game.ts wonHand); the deck's names, colours, numbers
## and what a hand may pay.
var cards := {}
var won_hand: Array = []
var royal := {}
## (items.ts VALUE_BY_RARITY, VALUE_PER_AFFIX, VALUE_IMBUED: a piece's price from its own, `vbase`: tools/godot_loot.ts VALUE)
var _value := {}
## the vendors' shelves (Game.rollShop on his first day in town)
var shops := {}
## (what he has sold to the vendors on this visit, oldest first: game.ts `sold`)
var sold: Array = []
## (what each word becomes on each kind of piece; which words are found where; the armourer's quest's own lines:
## tools/godot_loot.ts. What each word becomes is read when first asked for, one option at a time: imbue_options)
var _imbue := {}
var _imbue_read := {}
var _words := {}
var quest_text := {}
var _starters := {}
var _tune := {}
var _attr := {}
var _drops: Array = []  # {kind, at, node, age, amount?, item?, word?}
## (the fallen wordsmith where he lies in this place: {at, searched, node}; null where none lies)
var _body = null
## (floor 1's fallen wordsmith, where the loot's own file has him; a floor's own is where its layout says: FloorMap.body)
var _body1 = null
var _body_floor := 1
var _quiet := 0.0
var _font: Font
## (the clock the Meldstone bobs and turns by; the Meldstone taken, as it leaps over him and into him: {g, from, pics, slammed})
var _clock := 0.0
var _taken := {}


func _ready() -> void:
	_font = ThemeDB.fallback_font
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(DIR + "/items.json"))
	_pools = data["pools"]
	_depths = data.get("split", {}).get("depths", [])
	_full_rares = data.get("fullRares", {})
	_uniques = data.get("uniques", {})
	_value = data.get("value", {})
	shops = data["shops"]
	_words = data["words"]
	quest_text = data["quest"]
	stat_info = data["stats"]
	_tune = data["tune"]
	_gamble = data.get("gamble", {})
	_arms = data.get("warriorArms", {})
	royal = data.get("royal", {})
	stash = []
	stash.resize(int(_tune["stashSize"]))
	_attr = data["attr"]
	sheet = load(DIR + "/icons.png")
	for p in JSON.parse_string(FileAccess.get_file_as_string(DIR + "/icons.json")):
		pics[p["key"]] = {"rect": Rect2(p["x"], p["y"], p["w"], p["h"]), "anchor": Vector2(p["ax"], p["ay"])}
	# (THE 52 DESIGNED MELDS AND THE 11 LEVEL 2 RUNES, melds52.gd: their stones under the sheet's own, and their colours)
	var anchor52: Vector2 = pics["word:power"]["anchor"]
	sheet = Melds52.stones(sheet, func(id, r): pics["word:" + id] = {"rect": r, "anchor": anchor52})
	# (and the words kept beside them, Greed and the door words, melds52.json `extra`)
	for id in Melds52.T()["order"] + Melds52.T().get("extra", {}).keys():
		_words["color"][id] = Melds52.T()["color"][id]
	for s in EQUIP:
		gear[s] = null
	gear["mainhand"] = data["starter"].duplicate(true)
	_starters = data.get("starters", {})
	if data["body"] != null:
		_body1 = Vector2(data["body"]["x"], data["body"]["y"])
	derive()
	hero.life = hero.max_life


func setup_body() -> void:
	if _body == null:
		return
	var n := Sprite2D.new()
	n.centered = false
	n.position = Iso.to_screen(_body["at"].x, _body["at"].y)
	stands.add_child(n)
	_body["node"] = n
	_show_body()


func _show_body() -> void:
	var key := "body:searched" if _body["searched"] else "body"
	_body["node"].texture = _pic_tex(key)
	_body["node"].offset = -pics[key]["anchor"]


# --- his stats ---

## stats.ts derive: what every worn piece gives, added together, made into the numbers he fights with.
func derive() -> void:
	var s := {}
	for slot in EQUIP:
		var it = gear[slot]
		if it == null:
			continue
		for m in mods_of(it):
			s[m[0]] = s.get(m[0], 0.0) + float(m[1])
	# (UNIQUE ITEMS: which work for him, their numbers as they rolled; what they add that is not written on them: uniques.gd)
	var U = hero.uniques if hero != null else null
	var changed := false
	if U != null:
		changed = U.set_gear(gear, cls)
		for m in U.mods():
			s[m[0]] = s.get(m[0], 0.0) + float(m[1])
	var g := func(k: String) -> float: return s.get(k, 0.0)
	var str_: float = attrs["str"] + g.call("str")
	var dex: float = attrs["dex"] + g.call("dex")
	var int_: float = attrs["int"] + g.call("int")
	var weapon = gear["mainhand"]
	var dmin: float = g.call("dmgMin")
	var dmax: float = g.call("dmgMax")
	var aps: float = weapon["aps"] if weapon != null and weapon["aps"] > 0 else float(_tune["unarmedAps"])
	if weapon == null:
		dmin += float(_tune["unarmedMin"])
		dmax += float(_tune["unarmedMax"])
	dmax = maxf(dmax, dmin)
	var life := roundf((float(_tune["baseLife"]) + float(_tune["lifePerLevel"]) * (level - 1) + str_ * float(_attr["strLife"]) + g.call("maxLife")) * (1.0 + g.call("maxLifePct") / 100.0))
	hero.stats = {
		"str": str_, "dex": dex, "int": int_, "level": level,
		"dmg_min": dmin, "dmg_max": dmax,
		"aps": aps * (1.0 + (g.call("atkSpeed") + Words.eff_attr(dex) * float(_attr["dexSpeed"])) / 100.0),
		# (his damage's bonuses, %: all of it; and by the element of the blow, as game.ts hitMonster adds them: a plain blow his
		# physical, a word's element its own; his poison's)
		"dmg_pct": g.call("dmgPct"),
		"phys_pct": g.call("physPct"), "fire_pct": g.call("firePct"), "frost_pct": g.call("frostPct"), "light_pct": g.call("lightPct"),
		"poison_pct": g.call("poisonPct"),
		"crit_chance": float(_tune["baseCrit"]) + g.call("critChance") + Words.eff_attr(dex) * float(_attr["dexCrit"]),
		"crit_mult": (CRIT_DOUBLE_BASE if CRIT_DOUBLE else float(_tune["baseCritMult"])) + g.call("critMult"),
		"life_regen": float(_tune["baseLifeRegen"]) + g.call("lifeRegen"),
		"life_on_hit": g.call("lifeOnHit"), "life_on_kill": g.call("lifeOnKill"),
		"armor": g.call("armor"), "move_speed": g.call("moveSpeed"), "area": 1.0 + g.call("areaPct") / 100.0,
		"gold_find": g.call("goldFind"), "magic_find": g.call("magicFind"),
		# (what a word burned into a piece may add besides: the damage added to his hits of one element (items.ts FLAT_PAIRS;
		# game.ts baseFor), his chance to stun, what he withstands of each element)
		"fire_min": g.call("fireMin"), "fire_max": g.call("fireMax"), "frost_min": g.call("frostMin"), "frost_max": g.call("frostMax"),
		"light_min": g.call("lightMin"), "light_max": g.call("lightMax"), "poison_min": g.call("poisonMin"), "poison_max": g.call("poisonMax"),
		"stun_chance": g.call("stunChance"),
		# (Guarding burned into a piece: a chance to block a blow outright, 50% at most: game.ts hurtHero)
		"block_chance": g.call("blockChance"),
		# (what he withstands of each element, at most TUNE.resCap, 75%: stats.ts derive, `Math.min(cap, stats.fireRes)`; uncapped,
		# a hero with enough of it took nothing from that element at all: the speed and tank test, 26 Nov 2026)
		"res_fire": minf(float(_tune["resCap"]), g.call("fireRes")), "res_frost": minf(float(_tune["resCap"]), g.call("frostRes")),
		"res_light": minf(float(_tune["resCap"]), g.call("lightRes")), "res_poison": minf(float(_tune["resCap"]), g.call("poisonRes")),
	}
	hero.set_max_life(maxf(1.0, life))
	# (THE THREE DEFENCES: his dodge and his barrier, his gear's and what Dexterity and Intelligence add)
	if DEFENCE_LAYERS:
		# (THE FIFTEEN OF THE THREE DEFENCES: the Glazier's Ring, his gear's armour barrier instead; Featherweight, more dodge and no
		# armour; Tailwind, his movement speed dodge too: uniques.gd)
		var from_armour := 0.0
		var more_dodge := 0.0
		if U != null:
			from_armour = float(hero.stats["armor"]) * U.armour_as_barrier()
			if from_armour > 0.0 or U.no_armour():
				hero.stats["armor"] = 0.0
			more_dodge = U.speed_as_dodge(float(hero.stats["move_speed"]))
		hero.stats["dodge"] = roundf((g.call("dodge") + more_dodge) * (1.0 + Words.eff_attr(dex) * DEX_DODGE / 100.0) * (U.dodge_more() if U != null else 1.0))
		# (THE THREE DEFENCES EVENED, DEFENCE_EVEN: every point of Dexterity his own dodge too, as every point of Strength is his own
		# life: so that a hero built on it is as hard to kill as one built on Strength)
		# (but only with a dodge on his gear to begin with, as Intelligence's barrier below: his words, 27 Nov 2026, asked whether
		# Dodge should go as Barrier had, “does strength give armor?  i dont think so”: Strength gives no armour of its own)
		if DEFENCE_EVEN and hero.stats["dodge"] > 0.0:
			hero.stats["dodge"] += roundf(dex * EVEN_DEX_DODGE)
		# (THE THREE DEFENCES' WORDS: a chance to block gone; a piece that had one burned into it before, its barrier: ten a point)
		var from_block := 0.0
		if Words.DEFENCE_WORDS:
			from_block = g.call("blockChance") * 10.0
			hero.stats["block_chance"] = 0.0
		# (DEFENCE_EVEN: every point of Intelligence his own barrier too, as every point of Strength is his own life; but only with a
		# barrier on his gear to begin with, his words, 27 Nov 2026: “if you have no barrier on gear i dont think you should have just
		# because you have 1 point of int”)
		var gear_barrier: float = g.call("barrier") + from_block + from_armour
		hero.set_max_barrier(roundf(gear_barrier * (1.0 + Words.eff_attr(int_) * INT_BARRIER / 100.0) + (int_ * EVEN_INT_BARRIER if DEFENCE_EVEN and gear_barrier > 0.0 else 0.0)))
	else:
		hero.stats["dodge"] = 0.0
		hero.set_max_barrier(0.0)
	# (his moves' words: the slots his level and the lit ring open, and the numbers the words read. Cooldown recovery as
	# stats.ts derive has it: his gear's, a tenth of its mana and twice its mana regeneration, a quarter of his Intelligence,
	# 60% at most)
	# (ABILITIES: MANA: no mana turned into quicker waits; his mana, as stats.ts derive has it: a base, three for each point of
	# Intelligence and his gear's; it comes back as fast as its base, his Intelligence's share and his gear's say)
	var mana_cdr: float = g.call("maxMana") * 0.1 + g.call("manaRegen") * 2.0 if limit == "cooldown" else 0.0
	var cdr: float = minf(0.6, (g.call("cdr") + mana_cdr + int_ * float(_attr["intCdr"])) / 100.0)
	hero.stats["cdr"] = cdr
	hero.max_mana = float(roundi(float(_tune["baseMana"]) + int_ * float(_attr["intMana"]) + g.call("maxMana")))
	hero.mana_regen = float(_tune["baseManaRegen"]) + int_ * float(_attr["intManaRegen"]) + g.call("manaRegen")
	hero.mana = minf(hero.mana, hero.max_mana)
	hero.loadout.limit = limit
	hero.loadout.set_level(level, ring_lit)
	# (a unique taken off: the slots it opened close, and the words in them come back to his pouch: game.ts refresh)
	if changed:
		for w in hero.loadout.trim():
			words[w] = int(words.get(w, 0)) + 1
		hero.uniques_changed()
	hero.loadout.set_stats({"str": str_, "dex": dex, "int": int_, "area": hero.stats["area"], "aps": hero.stats["aps"], "cdr": cdr})


# --- his words ---

## How many words he holds, unset (ui/hud.ts `spare`).
func spare() -> int:
	var n := 0
	for w in words:
		n += int(words[w])
	return n


## The words he holds, in the order the game lists them (types.ts WORD_IDS: his pouch on the gear screen).
func held() -> Array:
	var out: Array = []
	# (and after them the 52 designed melds and the 11 level 2 runes, melds52.gd)
	# (and the words kept beside them, Greed and the door words: melds52.json `extra`)
	for w in _words["order"] + Melds52.T()["order"] + Melds52.T().get("extra", {}).keys():
		if int(words.get(w, 0)) > 0:
			out.append(w)
	return out


## The first of the words he holds, or "" (ui/hud.ts: the rune beside the INVENTORY button; ui/guide.ts guideWord).
func first_spare() -> String:
	var h := held()
	return h[0] if not h.is_empty() else ""


## His class's first word (defs.ts FIRST_WORD): the wordsmith's as his ring is lit, and the fallen wordsmith's satchel's.
func first_word() -> String:
	return str(_words.get("firstOf", {}).get(cls, {}).get("word", _words["first"]))


## HIS CLASS (main.gd set_class): his first word and the armourer's word for him; a new hero's starting attributes and weapon.
var cls := "warrior"


func set_class(c: String, fresh: bool) -> void:
	cls = c
	var C: Dictionary = Words.data()["classes"][c]
	if fresh:
		for k in ["str", "dex", "int"]:
			attrs[k] = float(C["attrs"][k])
		var st = _starters.get(c)
		if st != null:
			gear["mainhand"] = st.duplicate(true)
	if quest_text.has("wordOf"):
		quest_text["word"] = quest_text["wordOf"].get(c, quest_text["word"])
		quest_text["reward"] = quest_text["rewardOf"].get(c, quest_text["reward"])
	derive()
	hero.life = hero.max_life


## Do words fall here and now (game.ts wordsFall): not before the ring is lit, and not on floor 1.
func words_fall() -> bool:
	return ring_lit and map != null and int(map.depth) > 1


## Has he put a word to work yet (game.ts wordAtWork): one set in a move, or burned into a piece he wears or carries?
func word_at_work() -> bool:
	if hero.loadout.any():
		return true
	for slot in EQUIP:
		if gear[slot] != null and not gear[slot].get("imbues", []).is_empty():
			return true
	for it in bag:
		if not it.get("imbues", []).is_empty():
			return true
	return false


## Is there a free slot somewhere that this word may go into (game.ts placeable)?
func placeable(w: String) -> bool:
	for i in 3:
		for side in ["front", "behind"]:
			if hero.loadout.problem(i, side, w) == "":
				return true
	return false


## Is the lesson of the first word still to come (game.ts `guide` with nothing set): no word has been set in a move yet?
func lesson() -> bool:
	return not taught and not hero.loadout.any()


## Is his first word waiting to be set (ui/guide.ts guideCoach, not done)? Until it is set it goes on an attack and nowhere
## else.
func first_word_waits() -> bool:
	return lesson() and spare() > 0


## A WORD COME BY (game.ts: hero.words[w]++, and the event wordGot): it is among his words; the top of the screen says so
## (hud.gd WORD FOUND: large for a new player's first); and, `place` asked and no word of his at work yet, it is offered a
## place at the next quiet moment (updateDrops: "A character's FIRST word is pressed on them").
func gain_word(w: String, place := true) -> void:
	words[w] = int(words.get(w, 0)) + 1
	toast = {"word": w, "t": 0.0, "big": lesson()}
	_quiet = 0.0
	if place and not word_at_work() and placeable(w):
		offer = w


## (game.ts giveRingWord) The wordsmith gives the word, and the gear screen opens on it (`offer`). (In the game the word is
## announced first, WORD FOUND, and the screen opens 2.4 s on; here at once, as the first quest has had it.)
func give_word(w: String) -> void:
	words[w] = int(words.get(w, 0)) + 1
	say("The wordsmith gives you a word: %s." % str(Words.word(w)["name"]).to_upper(), MSG_WORD)
	sfx.play("rare")
	if main != null:
		offered = w
		main.offer_word(w)


# --- what falls ---

## A monster has fallen (monster.gd _die): his experience, and what it leaves (game.ts dropLoot).
func on_kill(m) -> void:
	# (THE PRACTICE ROOM: no experience, and nothing to collect but the odd life orb: game.ts gainXp, dropLoot)
	var practising: bool = main != null and main.get("practice") == true
	if not practising:
		gain_xp(m.xp)
	hero.heal_flat(hero.stats["life_on_kill"])
	# (UNIQUE ITEMS: The Physician's Coat, no flask refills from kills)
	var counts: bool = hero.uniques == null or hero.uniques.flasks_from_kills()
	if counts:
		kills += 1
	if counts and kills % KILLS_A_POTION == 0 and potions < POTIONS:
		potions += 1
		say("A flask fills", Color(0.86, 0.3, 0.36))
	var at: Vector2 = m.world
	# (whatever else it leaves, a monster that carried a word gives it up: the boss's too. None before the ring is lit. THE CHAINED
	# RARE's always, freed and killed: on an endless level's floor 1 too, where nothing else gives one up: chained_rare.gd)
	if words_fall() or m.get("chained") == 2:
		for w in m.carries:
			_word(at, drop_ok(str(w)))
		# (GREED on it: it carried better loot, an extra item of a hoard's luck)
		if m.has_method("word_share") and m.word_share("greed") > 0.0:
			_item(at, 2)
		# (THE RARE RUNES: the Glass Queen on an endless level, now and then, Mirroring)
		if queen_mirror(m):
			_word(at, "mirroring")
			say("The Queen leaves MIRRORING", Color("#e8f4ff"))
	# (THE ROYAL CARDS, the High City's: one a royal touched drops that royal's card: game.ts kill)
	var r: String = str(m.get("royal")) if m.get("royal") != null else ""
	if r != "" and royal_floor() and (not ROYAL_ONE_A_PACK or _last_of_pack(m)):
		_card(at, r)
	# (ENDLESS_KEY: the boss of an endless level on floor 5, 10, 15 or 20, his shard of the tablet: shards.gd)
	if main != null and main.get("shards") != null:
		main.shards.boss_down(m)
	# (ENDLESS MODE, NO STORY: none of the quests' pieces from what dies on an endless level: game.ts storyHere)
	var story: bool = main == null or main.story_here()
	# (FLOORS 6 TO 10: a piece of the ward-stone it carried, the Queen's feather and her eyrie's scene: act1/quest610.gd)
	if story and main != null and main.quest610 != null:
		main.quest610.killed(m)
	# (FLOORS 11 TO 15: an unstruck page, as the last of floor 13's pair falls and as the Physician does: act2/quest1115.gd)
	if story and main != null and main.quest1115 != null:
		main.quest1115.killed(m)
	# (FLOORS 16 TO 20: the songbird's key as the Prince falls, its spring as the Queen does: act3/quest1620.gd)
	if story and main != null and main.get("quest1620") != null:
		main.quest1620.killed(m)
	if m.summoned:
		return
	if practising:
		if randf() < float(_tune["dropOrb"]):
			_orb(at)
		return
	# (FLOOR 13'S DOUBLE BOSS: the first of the pair to fall leaves part of a boss's hoard, the last the whole of it; the other
	# fights on alone: game.ts kill)
	var other = _partner_of(m) if m.boss else null
	# (gold by the floor's level, game.ts dropLoot `goldBase`; LOOT2: from floor 6 a boss's later pieces and a guardian's second
	# with a hoard's luck; a boss one more on floors 5, 10, 15 and 20, TUNE.bossItemsFifth)
	var p := power()
	var deep := p >= int(_uniques.get("loot2", {}).get("from", 6))
	# (ENDLESS_KEY: THE WARPED WORDSMITH, the best drops in the game (game.ts finalLoot, final_arena.ts FINAL_LOOT): a great hoard of
	# gold, six pieces of a boss's first quality, two words, a life orb; one kill in four, one of his own two uniques)
	if m.kind == "wsboss":
		var F: Dictionary = {"gold": [70, 110], "items": 6, "words": 2}
		if main != null and main.get("final_data") is Dictionary and main.final_data.has("loot"):
			F = main.final_data["loot"]
		_gold(at, randi_range(int(F["gold"][0]), int(F["gold"][1])) * maxi(1, p))
		for i in int(F["items"]):
			_item(at, 4)
		if words_fall():
			for i in int(F["words"]):
				_word(at, tilt_word(drops_at(p).pick_random()))
		if not _uniques.is_empty() and randf() < float(_uniques["drops"].get("final", 0.0)):
			var two: Array = []
			for id in _uniques["defs"]:
				if _uniques["defs"][id]["from"] == "final":
					two.append(id)
			if not two.is_empty():
				var it = unique_piece(two.pick_random())
				if it != null:
					_drop("gear", _scatter(at), it["icon"], {"item": it})
					sfx.play("rare", linear_to_db(0.9))
		_orb(at)
		return
	if other != null:
		say("%s falls. %s fights on alone." % [m.title, other.title], Color("#ff8a3a"))
		_gold(at, randi_range(12, 22) * p)
		_item(at, 4)
		_orb(at)
		return
	if m.boss:
		_gold(at, randi_range(25, 45) * p)
		var n := 3 + (int(_tune.get("bossItemsFifth", 1)) if map != null and int(map.depth) % 5 == 0 else 0)
		for i in n:
			_item(at, 4 if i == 0 else (2 if deep else 1))
		_boss_unique(m, at)
		_orb(at)
	elif m.champion:
		potions = POTIONS
		_gold(at, randi_range(15, 25) * p)
		_item(at, 2)
		_item(at, 2 if deep else 0)
		_orb(at)
	elif m.elite:
		_gold(at, randi_range(8, 16) * p)
		if randf() < 0.75:
			_item(at, 1)
	else:
		# (THE TINKERER's tree: Alchemy, what her vials kill always drops gold: game.ts dropLoot, `brewing`)
		var alchemy: bool = hero.kit != null and hero.kit.get("brewing") == true and hero.has("alchemy")
		if randf() < 0.25 or alchemy:
			_gold(at, randi_range(3, 8) * p)
		# (the words burned into the dungeon at the Rim's gate: 30% likelier items and words for each, game.ts dropLoot `bonus`)
		var bonus: float = 1.0 + 0.3 * (main.burned_weight() if main != null else 0.0)
		if randf() < 0.04 * bonus:
			_item(at, 0)
		if randf() < 0.06:
			_orb(at)
		# (an ordinary monster holds a word very rarely: TUNE.dropWord, the likelier the deeper)
		if randf() < float(_tune["dropWord"]) * bonus * _growth() and words_fall():
			_word(at, _found())


## A barrel or an urn broken (game.ts breakProps): maybe gold (1 to 5), a life orb, a piece of gear.
func from_breakable(at: Vector2) -> void:
	if randf() < 0.4:
		_gold(at, randi_range(1, 5))
	if randf() < 0.08:
		_orb(at)
	if randf() < 0.04:
		_item(at, 0)


## A chest opened (game.ts updateProps): one piece (in a treasure vault perhaps two, the first a hoard's), and gold, laid
## before it; and now and then a word (TUNE.chestWord; the first chest opened in a treasure vault, TUNE.vaultWord: the
## likeliest place on a floor to find one).
func from_chest(at: Vector2, vault: bool) -> void:
	var before := at + Vector2(0, 0.6)
	var n: int = 1 + (1 if vault and randf() < 0.5 else 0) + (hero.uniques.chest_more() if hero.uniques != null else 0)
	for i in n:
		_item(before, 2 if vault and i == 0 else 1)
	_gold(before, randi_range(10, 20) * (2 if vault else 1))
	var chance := float(_tune["vaultWord"]) if vault and _first_in_vault(at) else float(_tune["chestWord"])
	if randf() < chance * _growth() and words_fall():
		_word(before, _found())


## Is the chest at `at` the first opened in its treasure vault: no other chest of that room is open?
func _first_in_vault(at: Vector2) -> bool:
	if map == null:
		return false
	for r in map.rooms:
		if r.get("kind", "") != "treasure" or not FloorMap.in_room(r, Vector2(floorf(at.x), floorf(at.y))):
			continue
		for p in map.props:
			if p["kind"] == "chest" and int(p["state"]) == 1 and FloorMap.in_room(r, Vector2(p["tx"], p["ty"])) and Vector2(p["x"], p["y"]).distance_to(at) > 0.01:
				return false
		return true
	return false


## How many times as likely a word is on this floor (defs.ts wordGrowth), and one of the words found on it (types.ts wordsAt).
func _growth() -> float:
	# (defs.ts wordGrowth: by the floor's strength, `power`; past the table, as it grows: a tenth more for each level, held at triple)
	var p := power()
	return float(_words["growth"].get(str(p), minf(3.0, 1.0 + 0.1 * float(p - 1)))) if map != null else 1.0


func _found() -> String:
	var here: Array = drops_at(power()) if map != null else [_words["first"]]
	return tilt_word(here.pick_random())


## THE RIM'S DOOR: WHAT IS BURNED IN DROPS MORE (his yes, 23 Nov 2026, “Yes”, to: “each rune you burn into the door makes that rune
## three times as likely whenever a rune drops on that level. Burn the same rune in more than once and it stacks: two Lightnings
## make Lightning five times as likely, three make it seven times. A meld counts for both of its runes”; every rune that drops
## there, an elite's, a chest's, the rare ones from ordinary monsters). Each burning adds BURN_MORE to its rune's share, one the
## share of every other rune the level gives. The door takes a rune only once (main.gd plan_problem, as the game always had it), so
## a rune is burned in twice only as its Rank II: Lightning's Rank II makes Lightning five times as likely.
const BURN_MORE := 2.0
## THE RIM'S DOOR AND PLUNDERING (his words, 24 Nov 2026: “adding them to the endless door shouldn't give all enemies that word, it
## should just increase either the gold dropped or magic find of the floor as a whole. It would be pretty game breaking to put
## plundering in the door once, get a bunch back, meld it into every word on your attacks and be able to put it on every door for the
## rest of eternity”): burned in at the door, Plundering is carried by no monster there (main.gd) and drops no more often for it
## (tilt_word); instead the level's gold is worth DOOR_GOLD % more for each one burned in (its gold picked up). The rewards every
## burned rune gives, Plundering too, as before (+30% items, +25 rarity, +10% experience).
const DOOR_GOLD_WORDS := ["plundering"]
const DOOR_GOLD := 50.0
## (GREED likewise: burned in, carried by none, no more often for it; the level's magic find DOOR_MF increased for each)
const DOOR_MF_WORDS := ["greed"]
const DOOR_MF := 50.0
## (THE DOOR WORDS likewise, door_words.gd: burned in, carried by none, no more often for it; each brings more of its encounter)
const DOOR_WORDS := ["plundering", "greed", "chains", "siege", "toll", "crown"]
## (GREED in front of the move that killed what is falling: the magic find its drops are made with, hero's kill to its drops)
var kill_mf := 0.0


## How much more magic find the level gives, %, for the Greed burned into it at the door.
func door_mf(ws = null) -> float:
	var B := burned_runes(ws)
	var n := 0
	for w in DOOR_MF_WORDS:
		n += int(B.get(w, 0))
	return DOOR_MF * n


## How much more the level's gold is worth, %, for the Plundering burned into it at the door.
func door_gold(ws = null) -> float:
	var B := burned_runes(ws)
	var n := 0
	for w in DOOR_GOLD_WORDS:
		n += int(B.get(w, 0))
	return DOOR_GOLD * n


## How many times each rune is burned into the level he is on (main.gd dungeon_words), or into `ws`: a meld's two runes once each,
## a level 2 rune's own rune twice (it is two of it).
func burned_runes(ws = null) -> Dictionary:
	var out := {}
	var laid: Array = ws if ws is Array else (main.dungeon_words if main != null else [])
	for w in laid:
		var parts: Array = FoeWords.parts_of(str(w))
		if FoeWords.is_rank(str(w)):
			parts = [parts[0], parts[0]]
		for p in parts:
			out[p] = int(out.get(p, 0)) + 1
	return out


## A rune about to drop on the level he is on, or to be carried by a monster made there (so the rune over its head is what it
## leaves): `w`, as it would have been, one of the `n` runes the level gives; with runes burned into the level, one of them in its
## place now and then, so that each is (1 + BURN_MORE x its burnings) times as likely as any other: with chance
## BURN_MORE x S / (n + BURN_MORE x S), S all the burnings, one of the burned (each by its burnings), else `w`.
func tilt_word(w: String, rng: RandomNumberGenerator = null) -> String:
	var B := burned_runes()
	# (Plundering burned in drops no more often for it: DOOR_GOLD_WORDS; nor what may not drop here: THE RARE RUNES)
	for k in DOOR_WORDS:
		B.erase(k)
	for k in B.keys():
		if not may_drop(str(k)):
			B.erase(k)
	if B.is_empty():
		return w
	var n := maxi(1, drops_at(power()).size())
	var sum := 0
	for k in B:
		sum += int(B[k])
	var roll: float = rng.randf() if rng != null else randf()
	if roll >= BURN_MORE * sum / (float(n) + BURN_MORE * sum):
		return w
	var r: int = (rng.randi() if rng != null else randi()) % sum
	for k in B:
		r -= int(B[k])
		if r < 0:
			return str(k)
	return w


## Where a thing lands: about where it fell, on open floor, a little apart from the rest; on a floor with pits (the Ledge
## Road's drop, the Fen's water), what falls over one lands on the nearest floor, not in the hole (game.ts addDrop).
func _scatter(at: Vector2) -> Vector2:
	for i in 12:
		var p := at + Vector2(randf_range(-0.9, 0.9), randf_range(-0.9, 0.9))
		if map.walkable(floori(p.x), floori(p.y)):
			return p
	return _off_pits(at, at)


## (game.ts addDrop, PITS) Where a thing dropped at `p` (fallen at `at`) lies: where it is, on a floor with no pits or ledges;
## else, off floor, where it fell if that is floor, else the nearest floor.
func _off_pits(p: Vector2, at: Vector2) -> Vector2:
	if map == null or map.step.is_empty() or _on_floor(p):
		return p
	return at if _on_floor(at) else floor_near(at)


## Floor that can be stood on, not a pit, not a wall, not the wall half of a tile cut corner to corner (game.ts onFloor).
func _on_floor(p: Vector2) -> bool:
	return map.tile(floori(p.x), floori(p.y)) == FloorMap.FLOOR and not map.in_wall(p.x, p.y)


## The middle of the nearest tile within 4 a body may stand on, or `at` itself if there is none (game.ts floorNear).
func floor_near(at: Vector2) -> Vector2:
	var best := at
	var best_d := INF
	for ty in range(floori(at.y) - 4, floori(at.y) + 5):
		for tx in range(floori(at.x) - 4, floori(at.x) + 5):
			var d := Vector2(tx + 0.5, ty + 0.5).distance_squared_to(at)
			if map.walkable(tx, ty) and d < best_d:
				best_d = d
				best = Vector2(tx + 0.5, ty + 0.5)
	return best


func _gold(at: Vector2, amount: int) -> void:
	var key := "gold:2" if amount >= 30 else ("gold:1" if amount >= 8 else "gold:0")
	_drop("gold", _scatter(at), key, {"amount": amount})


## (UNIQUE ITEMS: The Miser's Purse, a hit he takes spills gold round him: uniques.gd)
func spill_gold(at: Vector2, amount: int) -> void:
	_gold(at, amount)


func _orb(at: Vector2) -> void:
	_drop("orb", _scatter(at), "orb", {})


## (LEECH behind, game.ts kill: an enemy killed by a move carrying it drops a life orb now and then: hero.gd killed)
func orb_at(at: Vector2) -> void:
	if map != null:
		_orb(at)


func _item(at: Vector2, quality: int) -> void:
	var it: Dictionary = roll_gear(quality)
	_drop("gear", _scatter(at), it["icon"], {"item": it})


## The floor's level, what is found on it is made for (game.ts `power`): the floor's depth; in town, the floor he came up from.
## ENDLESS MODE: on an endless level, and in town once they are open to him, the depth of the one he has reached (endless.ts
## endlessPower: past the last floor). What is rolled from the game's tables (its pieces, their chances, the words found) is
## rolled as on the last floor (`_tp`): the tables go no deeper; the gold and the rest go by the whole depth.
## (game.ts talentLevel) The level his talent points are counted by: his own; in the practice room, every point (PRACTICE_TALENTS:
## his words, 7 Nov 2026, “And can I get all the talent points in practice mode?”).
func talent_level() -> int:
	if main != null and bool(main.get("practice")):
		return 99999
	return level


func power() -> int:
	if main != null and int(main.endless) > 0 and (main.in_endless or main.is_home(main.place)):
		return main.endless_power()
	if map != null and int(map.depth) >= 1:
		return clampi(int(map.depth), 1, 20)
	return _town_power()


func _tp() -> int:
	return clampi(power(), 1, 20)


## (types.ts wordsAt) The words that may be found at depth `d` (the game's table, its last floor's past it).
func words_found_at(d: int) -> Array:
	return _words["at"].get(str(clampi(d, 1, 20)), [_words["first"]])


## THE RARE RUNES (his words, 24 Nov 2026: “plundering and the quality word and mirroring should only drop in endless. Mirroring should
## be very, extremely rare. Like most players will never see it. ... Drops only from the queen in endless. But again, extremely
## rare.”): Plundering drops only on an endless level; Mirroring only from the Glass Queen on one, MIRROR_CHANCE of her kills. What
## the monsters fight with is as it was (words_found_at); what they leave, and what lies about, is of these (drops_at, drop_ok).
const ENDLESS_DROPS := ["plundering", "greed", "chains", "siege", "toll", "crown"]
## (on an endless level, now and then a carrier carries Plundering or Greed, and fights with it: the next level's prize: RARE_CARRY of them)
const RARE_CARRY := 0.05
const QUEEN_ONLY := ["mirroring"]
const MIRROR_CHANCE := 0.01


func _endless_here() -> bool:
	return main != null and bool(main.get("in_endless"))


## May rune `w` drop here?
func may_drop(w: String) -> bool:
	return not QUEEN_ONLY.has(w) and (_endless_here() or not ENDLESS_DROPS.has(w))


## The runes that may drop at depth `d`, here.
func drops_at(d: int) -> Array:
	var out: Array = words_found_at(d).filter(func(w): return may_drop(str(w)))
	# (Greed, found in no floor's table: on an endless level, one of them)
	if _endless_here() and not out.has("greed"):
		out.append("greed")
	# (THE DOOR WORDS, door_words.gd: on an endless level, the four sharing one rune's share, one of them at random each time)
	if _endless_here() and DoorWords.ON:
		out.append(DoorWords.live().pick_random())
	return out if not out.is_empty() else [_words["first"]]


## `w` if it may drop here, else another the level gives.
func drop_ok(w: String, rng: RandomNumberGenerator = null) -> String:
	if may_drop(w):
		return w
	var pool := drops_at(power())
	return str(pool[(rng.randi() if rng != null else randi()) % pool.size()])


## The Glass Queen on an endless level, falling: whether she leaves Mirroring (MIRROR_CHANCE).
func queen_mirror(m, roll := -1.0) -> bool:
	return str(m.kind) == "gqueen" and bool(m.boss) and _endless_here() and (randf() if roll < 0.0 else roll) < MIRROR_CHANCE


## His magic find, % (game.ts rollGear: his gear's; the gate's words are not laid in the Godot version).
func magic_find() -> float:
	# (and 25 for each word burned into the dungeon at the Rim's gate: game.ts rollGear, wordsWeight(dungeonWords))
	var burned: float = main.burned_weight() if main != null else 0.0
	# (and GREED: its kill's drops, and the level's for each burned in at the door)
	# (DELVE DEEPER: 15 more for each depth past the first, on an endless level: main.gd delve_mf)
	var deep_mf: float = float(main.delve_mf()) if main != null and main.has_method("delve_mf") else 0.0
	return float(hero.stats.get("magic_find", 0.0)) + 25.0 * burned + kill_mf + door_mf() + deep_mf if hero != null else 0.0


## A piece of gear for this floor, of quality `quality` (game.ts rollGear: 0 an ordinary monster's, 1 a better one's, 2 a
## hoard's, 3 a boss's first before LOOT2, 4 a boss's or a guardian's first): now and then a unique (`_pool_unique`), else of the
## rarity its luck and his magic find roll.
func roll_gear(quality: int) -> Dictionary:
	var mf := magic_find()
	var u = _pool_unique(quality, mf)
	if u != null:
		sfx.play("rare", linear_to_db(0.9))
		return u
	return _piece_of(_tp(), _rarity(quality, mf))


## items.ts rollRarity, with game.ts rollGear's luck and least.
func _rarity(quality: int, mf: float) -> int:
	var p := _tp()
	var w: Array = _uniques.get("chances", {}).get(str(p), [100.0, 0.0, 0.0])
	var boost := maxf(0.0, 1.0 + mf / 100.0)
	var luck: Array = [1.0, 1.0]
	if quality == 1:
		luck = _tune["betterLuck"]
	elif quality >= 2:
		luck = _tune["hoardLuck"]
	var L2: Dictionary = _uniques.get("loot2", {})
	var deep: bool = not L2.is_empty() and p >= int(L2["from"])
	if deep:
		luck = [float(luck[0]) * float(L2["deep"]), float(luck[1]) * float(L2["deep"])]
	var w0 := float(w[0])
	var w1 := float(w[1]) * boost * float(luck[0])
	var w2 := float(w[2]) * boost * float(luck[1])
	var r := randf() * (w0 + w1 + w2)
	var i := 0 if r < w0 else (1 if r < w0 + w1 else 2)
	var least := 0
	if quality == 3:
		least = 1
	elif quality == 4:
		least = 2 if deep else 1
	return maxi(i, least)


## One of the pieces the game rolled on floor `p` of rarity `rarity` (the nearest rarity there is, if none).
func _piece_of(p: int, rarity: int) -> Dictionary:
	var key := str(p)
	if not _by_rarity.has(key):
		# (MEMORY, 22 Nov 2026: only this floor's pieces held, read from their own file: tools/godot_loot_split.mjs)
		_by_rarity.clear()
		var here: Dictionary = _pools
		if _depths.has(key):
			here = JSON.parse_string(FileAccess.get_file_as_string(DIR + "/depth/" + key + ".json"))
		var lists: Array = [[], [], []]
		for q in here:
			for it in here[q]:
				var r := int(it["rarity"])
				if r <= 2:
					lists[r].append(it)
		_by_rarity[key] = lists
	var by: Array = _by_rarity[key]
	for k in [rarity, rarity - 1, rarity - 2, rarity + 1, rarity + 2]:
		if k >= 0 and k <= 2 and not (by[k] as Array).is_empty():
			return (by[k] as Array).pick_random().duplicate(true)
	var any: Array = _pools["0"]
	return any.pick_random().duplicate(true)


## game.ts poolUnique: a unique in place of a piece of quality `quality` (of slot `slot`, of weapon `weapon`, where asked), or
## null: nearly always null.
func _pool_unique(quality: int, mf: float, slot := "", weapon := ""):
	if _uniques.is_empty() or (main != null and main.get("practice") == true):
		return null
	var D: Dictionary = _uniques["drops"]
	var p := power()
	var boost := maxf(0.0, 1.0 + mf / 100.0)
	var P: Dictionary = D["pool"]
	var base := float(P["hoard"] if quality >= 2 else P["elite"] if quality == 1 else P["plain"])
	if p >= int(P["from"]) and randf() < base * boost:
		return make_pool_unique(slot, weapon)
	# (THE LEVELING UNIQUES: a roll of their own, as often; one of those of this floor's level or below, anyone's or his class's)
	var L: Dictionary = D["level"]
	base = float(L["hoard"] if quality >= 2 else L["elite"] if quality == 1 else L["plain"])
	if randf() < base * boost:
		var pool: Array = []
		for id in _uniques["defs"]:
			var d: Dictionary = _uniques["defs"][id]
			if d.get("set") == "level2" and not LEVEL2_UNIQUES:
				continue
			if d.get("set") == "level3" and not LEVEL3_UNIQUES:
				continue
			if d["from"] == "level" and int(d["level"] if d["level"] != null else 1) <= p and (d["cls"] == null or d["cls"] == cls) \
					and (slot == "" or d["slot"] == slot) and (weapon == "" or d["weapon"] == weapon):
				pool.append(id)
		if not pool.is_empty():
			return unique_piece(pool.pick_random())
	return null


## THE FIFTEEN OF THE THREE DEFENCES (game/uniques.ts DEFENCE_DEFS; uniques.gd): five uniques for armour, five for barrier, five
## for dodge, the pool's (his words, 23 Nov 2026: “give me maybe 15 more uniques that each sort of go with, 5 for armor, 5 for
## barrier, 5 for dodge. So we can sort of include those new mechanics in the move pool. Sorry, not the move pool, the item
## pool.”). ON at his yes, 23 Nov 2026, shown their cards (docs/mockups/defence_uniques): “Yes, switch them on”. With it off none
## drops or is gambled for; one worn all the same (a check's) works.
static var DEFENCE_UNIQUES := true
## THE FIFTEEN'S OWN PICTURES (art/items_unique.ts DEFENCE_PAINTERS; a piece's `uicon`): his words, 23 Nov 2026, told they wore their
## bases' pictures: “Uniques always have unique sprite art”. ON at his yes to them, 23 Nov 2026, shown their sheet and a bag of
## them (docs/mockups/defence_uniques): “Yes, turn them on”. Off, each its base's orange look.
static var DEFENCE_ART := true


## FIFTEEN MORE LEVELING UNIQUES (game/uniques.ts LEVEL2_DEFS; his words, 24 Nov 2026: “Give me 15 more leveling uniques”): as the
## twenty are, each its level's own, stats alone. ON at his yes, 24 Nov 2026, shown their cards and pictures: “They’re all good.
## A unique weapon needs a skin to go on the Warrior if he equips it.  So you’ll have to get that going” (the Barn Door's:
## skins.gd). With it off none drops.
static var LEVEL2_UNIQUES := true


## TWELVE LEVELING WEAPONS (game/uniques.ts LEVEL3_DEFS; his words, 24 Nov 2026: “we should have 3-4 for each class”; told them
## before any art, “Yes good to go”): two more for each hero, each with a skin on him (skins.gd). ON at his yes, 24 Nov 2026,
## shown their cards, their pictures and each hero holding his two: “Yes, switch them on (Recommended)”. With it off none drops.
static var LEVEL3_UNIQUES := true


## game.ts makePoolUnique: one of the pool's for him (of that slot, of that weapon, where asked), made for this floor; null if none.
func make_pool_unique(slot := "", weapon := ""):
	var pool: Array = []
	var arms := ["greatsword", "battleaxe", "warhammer"]
	for id in _uniques["defs"]:
		var d: Dictionary = _uniques["defs"][id]
		if d["from"] != "pool" or (d["cls"] != null and d["cls"] != cls and _uniques["rules"]["ownOnly"]):
			continue
		if d.get("set") == "defence" and not DEFENCE_UNIQUES:
			continue
		if slot != "" and d["slot"] != slot:
			continue
		# (a Warrior finds only the uniques of the weapon he uses, of his three)
		var w: String = str(d["weapon"]) if d["weapon"] != null else ""
		if cls == "warrior" and hero != null and w in arms and w != str(hero.weapon):
			continue
		if weapon != "" and w != weapon:
			continue
		pool.append(id)
	return unique_piece(pool.pick_random()) if not pool.is_empty() else null


## A piece of unique `id` as the game made it for this floor (a leveling unique at its own level; a boss's at his floor).
func unique_piece(id: String):
	var it = _unique_piece(id)
	# (THE FIFTEEN'S OWN PICTURES, with their switch on)
	if it != null and DEFENCE_ART and it.has("uicon") and pics.has(str(it["uicon"])):
		it["icon"] = it["uicon"]
	return it


func _unique_piece(id: String):
	var all: Array = _uniques.get("pieces", {}).get(id, [])
	if all.is_empty():
		return null
	var d: Dictionary = _uniques["defs"][id]
	if d["from"] == "level":
		return all.pick_random().duplicate(true)
	var p := power()
	var best: Array = []
	# (past any gap there could be: from 999, at an endless level past it none was nearer and a null was copied, a script error;
	# the bug hunt's sixth round)
	var gap := 1 << 30
	for it in all:
		var g := absi(int(it.get("floor", p)) - p)
		if g < gap:
			gap = g
			best = []
		if g == gap:
			best.append(it)
	return best.pick_random().duplicate(true)


## game.ts dropBossUnique: a boss dies; his own unique, one kill in ten.
func _boss_unique(m, at: Vector2) -> void:
	if _uniques.is_empty():
		return
	for id in _uniques["defs"]:
		var d: Dictionary = _uniques["defs"][id]
		if d["from"] == "boss" and d["boss"] is Array and str(m.kind) in d["boss"]:
			if randf() < float(_uniques["drops"]["boss"]):
				var it = unique_piece(id)
				if it != null:
					_drop("gear", _scatter(at), it["icon"], {"item": it})
					sfx.play("rare", linear_to_db(0.9))
			return


## A piece given him, laid at his feet (game.ts addDrop 'item': QUESTS1620's whole court and the knight-captain's gift).
func lay_item(at: Vector2, it: Dictionary) -> void:
	_drop("gear", _scatter(at), it["icon"], {"item": it})


## (QUESTS1115, game.ts layOut) A piece of a pick of three laid out before `by` (the armourer), at `at`: taken, the others go back.
func lay_pick(at: Vector2, it: Dictionary, by: String) -> void:
	_drop("gear", at, it["icon"], {"item": it, "choice": by})


## (the same) What of `by`'s pick lies laid out is taken away.
func take_back(by: String) -> void:
	var keep: Array = []
	for d in _drops:
		if str(d.get("choice", "")) == by:
			if is_instance_valid(d["node"]):
				d["node"].queue_free()
		else:
			keep.append(d)
	_drops = keep


## A WORD FALLS (game.ts addDrop 'word'; the event wordDrop): within 0.7 of where it fell, or just there; it is heard.
func _word(at: Vector2, w: String, just_there := false) -> void:
	# (a word that is not one of floors 1 to 5's has no rune stone here yet)
	if not pics.has("word:" + w):
		return
	var p := at
	if not just_there:
		p = at + Vector2(randf_range(-0.7, 0.7), randf_range(-0.7, 0.7))
		if map == null or not map.walkable(floori(p.x), floori(p.y)):
			p = at
	p = _off_pits(p, at)
	var n := _WordDrop.new()
	n.sheet = sheet
	n.src = pics["word:" + w]["rect"]
	n.anchor = pics["word:" + w]["anchor"]
	n.color = word_color(w)
	n.title = str(Words.word(w)["name"]).to_upper()
	n.phase = p.x
	n.position = Iso.to_screen(p.x, p.y)
	stands.add_child(n)
	_drops.append({"kind": "word", "at": p, "node": n, "age": 0.0, "word": w})
	sfx.play("rare", linear_to_db(0.8))


## A word's own colour (art/icons.ts WORD_COLOR).
func word_color(w: String) -> Color:
	return Color(_words["color"].get(w, "#ffffff"))


func _drop(kind: String, at: Vector2, pic: String, extra: Dictionary) -> void:
	var n := Node2D.new()
	var s := Sprite2D.new()
	s.texture = _pic_tex(pic)
	s.centered = false
	s.offset = -pics[pic]["anchor"]
	n.add_child(s)
	if kind == "gear":
		var tag := _Tag.new()
		extra["tag"] = tag
		var it: Dictionary = for_him(extra["item"])
		s.texture = _pic_tex(it["icon"])
		s.offset = -pics[it["icon"]]["anchor"]
		tag.text = it["kind"]
		tag.color = RARITY_COLOR[int(it["rarity"])]
		tag.z_index = 60
		n.add_child(tag)
	n.position = Iso.to_screen(at.x, at.y)
	stands.add_child(n)
	var d := {"kind": kind, "at": at, "node": n, "age": 0.0}
	d.merge(extra)
	_drops.append(d)


## (THE LAST FLOOR 1–10 MELDS: Lifeline behind, its life orbs fly straight to him, `speed` tiles a second.) True if any flew.
func pull_orbs(dt: float, speed: float) -> bool:
	var any := false
	for d in _drops:
		if d["kind"] == "orb" and float(d["age"]) >= WAIT and hero != null:
			d["at"] = (d["at"] as Vector2).move_toward(hero.world, speed * dt)
			d["node"].position = Iso.to_screen(d["at"].x, d["at"].y)
			any = true
	return any


func _pic_tex(key: String) -> AtlasTexture:
	var t := AtlasTexture.new()
	t.atlas = sheet
	t.region = pics[key]["rect"]
	return t


# --- taking it ---

func _process(dt: float) -> void:
	prompt_t = maxf(0.0, prompt_t - dt)
	for m in msgs:
		m["t"] += dt
	msgs = msgs.filter(func(m): return m["t"] < m["life"])
	# (held while the floor's name is up, as the HUD holds it: hud.gd)
	var held: bool = main != null and main.get("_hud") != null and not (main._hud.floor_card as Dictionary).is_empty()
	if not toast.is_empty() and not held:
		toast["t"] += dt
		if toast["t"] > (TOAST_BIG if toast["big"] else TOAST):
			toast = {}
	_lay_tags()
	_clock += dt
	_show_taken(dt)
	if hero == null or not hero.alive:
		return
	if Input.is_action_just_pressed("potion"):
		drink()
	_search_body()
	_tell_carrier()
	_offer(dt)
	var keep: Array = []
	var picked := ""
	for d in _drops:
		d["age"] += dt
		var take := false
		var dist: float = d["at"].distance_to(hero.world)
		if d["kind"] == "word":
			# (a word on the floor lights the room round it: render.ts, the dark's own spot)
			if main != null and main.look != null:
				main.look.spot(Iso.to_screen(d["at"].x, d["at"].y) / 2.0 + Vector2(0, -10), 40.0, 0.85)
		if d["kind"] == "stone":
			_show_stone(d)
		# (a word stands in its light for a moment before it can be taken: it is an event, not a coin; the Meldstone, while it
		# bursts up and comes down to hang)
		if d["age"] >= (float(_tune["wordStands"]) if d["kind"] == "word" else STONE_STANDS if d["kind"] == "stone" else WAIT):
			if d["kind"] == "gear":
				take = picked == "" and dist <= GEAR_TAKE and _take_item(d["item"])
				# (QUESTS1115: one of the armourer's pick taken: the others laid with it go back, game.ts pickTaken)
				if take and d.has("choice"):
					picked = str(d["choice"])
			else:
				if dist <= PULL:
					d["at"] = d["at"].move_toward(hero.world, FLY * dt)
					d["node"].position = Iso.to_screen(d["at"].x, d["at"].y)
				if d["at"].distance_to(hero.world) <= TAKE:
					take = true
					if d["kind"] == "stone":
						_stone_taken(d)
					elif d["kind"] == "gold":
						var n := int(round(d["amount"] * (1.0 + (hero.stats["gold_find"] + door_gold()) / 100.0)))
						gold += n
						say("+%d gold" % n, Color(1.0, 0.85, 0.4))
						sfx.play("gold", -6.0)
					elif d["kind"] == "word":
						gain_word(d["word"])
						sfx.play("word")
					elif d["kind"] == "card":
						_card_taken(d["royal"], d["at"])
					else:
						hero.heal(ORB_HEAL)
						# (THE 52 DESIGNED MELDS: Bloodlust and Second Wind behind, what an orb gives: melds52_rules.gd)
						hero.m52.orb_taken()
						sfx.play("pickup", -6.0)
		if take:
			d["node"].queue_free()
		else:
			keep.append(d)
	_drops = keep
	if picked != "":
		take_back(picked)
		if main != null and main.quest1115 != null:
			main.quest1115.pick_taken(picked)


## (main.ts `quiet`, `offer`) A word come by that has somewhere to go is offered its place at the first quiet moment: nothing
## awake within 10 tiles for 2.4 s (a new player's first word, seen in its light first) or 0.9 s; then the gear screen
## opens on it.
func _offer(dt: float) -> void:
	if offer != "" and (int(words.get(offer, 0)) <= 0 or not placeable(offer)):
		offer = ""
	if offer == "" or main == null:
		return
	var busy := false
	if monsters != null:
		for m in monsters.list:
			if is_instance_valid(m) and not m.dead and m.state != "sleep" and m.world.distance_to(hero.world) < BUSY_NEAR:
				busy = true
				break
	_quiet = 0.0 if busy else _quiet + dt
	if _quiet > (OFFER_FIRST if lesson() else OFFER_WAIT):
		offered = offer
		offer = ""
		main.offer_word(offered)


## (game.ts wake: "a character's first dungeon: say what the rune over its head means, once") The first time a monster that
## carries a word, and is no boss, wakes on floor 1 before its way down has been taken. (As the game stands nothing on
## floor 1 carries a word, so this is never said: "no words on monsters for dungeon 1".)
func _tell_carrier() -> void:
	if told_carrier or map == null or int(map.depth) != 1 or cleared != 0 or monsters == null:
		return
	for m in monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss and m.state != "sleep" and not m.carries.is_empty():
			told_carrier = true
			say("%s carries a WORD. Kill it and the word is yours." % m.title, MSG_WORD)
			return


## takeItem: worn at once in an empty slot it fits, else into the bag, else it stays.
func _take_item(it: Dictionary) -> bool:
	var slot := _empty_slot_for(it)
	if slot != "":
		gear[slot] = it
		derive()
		say("%s equipped" % it["name"], RARITY_COLOR[int(it["rarity"])])
		sfx.play("equip", -4.0)
		return true
	if bag.size() < BAG:
		bag.append(it)
		say(it["name"], RARITY_COLOR[int(it["rarity"])])
		sfx.play("pickup", -6.0)
		return true
	say("Your bag is full", MSG_BAD)
	return false


func _empty_slot_for(it: Dictionary) -> String:
	for s in slots_for(it):
		if gear[s] == null and not (s == "offhand" and _two_handed()):
			return s
	return ""


func slots_for(it: Dictionary) -> Array:
	match it["slot"]:
		"ring":
			return ["ring1", "ring2"]
		_:
			return [it["slot"]]


func _two_handed() -> bool:
	return gear["mainhand"] != null and int(gear["mainhand"]["hands"]) == 2


## Wear a piece from the bag (game.ts equipFromBag): what was worn there goes into the bag in its place; a two-handed
## weapon sends the off-hand to the bag too.
func equip_from_bag(i: int) -> void:
	var it: Dictionary = bag[i]
	var slots := slots_for(it)
	var slot: String = slots[0]
	for s in slots:
		if gear[s] == null:
			slot = s
			break
	if slot == "offhand" and _two_handed():
		say("Your weapon takes both hands", MSG_BAD)
		return
	bag.remove_at(i)
	if gear[slot] != null:
		bag.append(gear[slot])
	gear[slot] = it
	if slot == "mainhand" and int(it["hands"]) == 2 and gear["offhand"] != null:
		bag.append(gear["offhand"])
		gear["offhand"] = null
	derive()
	sfx.play("equip", -4.0)


func unequip(slot: String) -> void:
	if gear[slot] == null:
		return
	if bag.size() >= BAG:
		say("Your bag is full", MSG_BAD)
		return
	bag.append(gear[slot])
	gear[slot] = null
	derive()


func drink() -> void:
	# (UNIQUE ITEMS: Bloodprice, a flask may be drunk at full life: its fury)
	var blood: bool = hero.uniques != null and hero.uniques.wears("bloodprice")
	if potions <= 0 or (hero.life >= hero.max_life and not blood):
		return
	potions -= 1
	# (the first dungeon's fight lesson: TAP THE FLASK to HEAL, done: guide.gd)
	if main != null and main.guide != null:
		main.guide.flask = true
	# (UNIQUE ITEMS: Bloodprice, a flask heals nothing: it makes him hit harder for a while)
	if hero.uniques == null or not hero.uniques.blood_flask():
		hero.heal(POTION_HEAL)
	# (THE FIFTEEN OF THE THREE DEFENCES: the Decanter, a flask fills his barrier)
	if hero.uniques != null:
		hero.uniques.flask_drunk()
	sfx.play("potion", -4.0)
	# (THE SKILL TREES REMADE: Second Wind, a flask throws back what is near, and nothing hurts him for a second)
	hero.second_wind()


# --- levels ---

func xp_to_next(l: int) -> float:
	return 3.0 * (45.0 + 33.0 * l + 9.0 * l * l)


func gain_xp(n: float) -> void:
	# (10% more for each word burned into the dungeon at the Rim's gate: game.ts gainXp)
	if main != null and main.burned_weight() > 0.0:
		n = roundf(n * (1.0 + 0.1 * main.burned_weight()))
	xp += n
	while xp >= xp_to_next(level):
		xp -= xp_to_next(level)
		var had: Array = Words.socket_count(level) if ring_lit else [0, 0]
		level += 1
		points += 1
		derive()
		hero.life = hero.max_life
		say("Level %d!" % level, Color(0.35, 0.9, 1.0))
		sfx.play("levelup")
		# THE FIRST LEVELS: a move opens with this level (game.ts gainXp, `moveOpen`): its moment on the HUD, and the news
		if hero.first_levels and not hero.practice and main != null:
			var opens: Array = Words.data()["moveOpens"]
			var now: Array = []
			for i in range(1, opens.size()):
				if int(opens[i]) == level:
					now.append(i)
					# (his own move, not the demon's while he is it: the bug hunt's sixth round)
					say("A new move: %s." % str(Words.skill(hero.own_move_id(i))["name"]).to_upper(), MSG_WORD)
			# (two opening with one level, words.gd EVADE_AT: their moments one after the other)
			if not now.is_empty():
				main.move_toast = {"skill": now[0], "t": 0.0, "then": now.slice(1)}
		# (a new slot has opened on his attacks: say so, and if a word he holds fits it, offer it a place: game.ts gainXp)
		var has: Array = Words.socket_count(level) if ring_lit else [0, 0]
		if int(has[0]) > int(had[0]) or int(has[1]) > int(had[1]):
			var front: bool = int(has[0]) > int(had[0])
			var nth: String = ["A", "A second", "A third"][clampi(int(has[0] if front else has[1]) - 1, 0, 2)]
			say("%s word slot has opened %s your attacks." % [nth, "IN FRONT of" if front else "BEHIND"], MSG_WORD)
			for w in held():
				if placeable(w):
					offer = w
					_quiet = 0.0
					break


func choose_attr(a: String) -> void:
	if points <= 0:
		return
	points -= 1
	attrs[a] += 5.0
	derive()


# --- the fallen wordsmith and the first word ---

func _search_body() -> void:
	if _body == null or _body["searched"] or _body["node"] == null:
		return
	if hero.world.distance_to(_body["at"]) > SEARCH:
		return
	_body["searched"] = true
	body_searched = true
	_show_body()
	sfx.play("rare")
	# (game.ts searchBody, THE FIRST LEVELS: before the ring is lit the satchel holds the Master Rune-stone, not a word, and
	# the flasks are filled; it is carried to the wordsmith in town)
	if not ring_lit:
		quest = "heart"
		potions = POTIONS
		prompt_t = 6.0
		say("You take the MASTER RUNE-STONE.", MSG_QUEST)
		return
	# (the ring lit: the satchel gives up its word, the Warrior's first, laid where he lies; and the flasks: the second half
	# of the floor is met fresh)
	_word(_body["at"], _words["first"], true)
	potions = POTIONS
	say("A fallen wordsmith. In the satchel: full flasks, and a WORD.", MSG_WORD)


## A new place: what lay on the floor of the last is gone with it. THE FALLEN WORDSMITH (game.ts enterDungeon): on floor 1
## he lies until its way down has been taken, searched already if the hero has searched one (the game lays floor 1 again
## each time it is come into, its body with it); on a later floor only for a hero who has neither the lit ring nor the
## stone and has not searched one ("A hero who left the first dungeon without searching the fallen wordsmith finds him
## again in the next ... and so on until he is found").
func enter_place(m, st: Node2D, mons, is_floor1: bool) -> void:
	map = m
	stands = st
	monsters = mons
	_drops = []
	_taken = {}
	_body = null
	_quiet = 0.0
	if m == null or int(m.depth) < 1 or stands == null or m.rooms.size() <= 1:
		return
	var first: bool = is_floor1 and cleared == 0
	cleared = maxi(cleared, int(m.depth) - 1)
	# (ENDLESS MODE, NO STORY: no fallen wordsmith on an endless level: game.ts storyHere)
	if main != null and not main.story_here():
		return
	var lies: bool = first or (not ring_lit and quest == "" and not body_searched)
	var at = Vector2(m.body["x"], m.body["y"]) if m.body != null else (_body1 if is_floor1 else null)
	if not lies or at == null:
		return
	_body_floor = int(m.depth)
	_body = {"at": at, "searched": body_searched, "node": null}
	setup_body()


# --- burning a word into a piece ---

## The piece worn in a slot (`where` its name) or lying in the bag (`where` its place there), or null.
func piece(where):
	if where is String:
		return gear.get(where)
	return bag[int(where)] if int(where) >= 0 and int(where) < bag.size() else null


## How many more words a piece will take (items.ts itemRoom): four properties in all, less those it was found with and the
## words already in it; a unique piece none.
func room(it: Dictionary) -> int:
	if int(it["rarity"]) == 3:
		return 0
	return maxi(0, int(_words["room"]) - int(it.get("affixes", 0)) - it.get("imbues", []).size())


## WHAT A WORD CAN STILL BECOME ON THIS PIECE (items.ts imbueOptionsFor): what it becomes on a piece of that kind and
## level, less whatever the piece already carries, or anything of the same kind (statGroup). Empty when it has no room.
func burn_options(w: String, it: Dictionary) -> Array:
	if room(it) <= 0:
		return []
	var has: Array = it.get("has", []).duplicate()
	for im in it.get("imbues", []):
		has.append_array(im["stats"])
	var kinds: Array = has.map(_group)
	var all: Array = imbue_options(w, it)
	# (WORDMELDING: a melded word's two properties must both be free; of its pairs, the first two that are)
	var free := func(st) -> bool: return st == null or (not has.has(st) and not kinds.has(_group(st)))
	var out: Array = all.filter(func(o): return free.call(o["stat"]) and free.call(o.get("also")))
	return out.slice(0, 2) if Words.is_meld(w) else out


## WHAT A WORD BECOMES ON A PIECE OF THAT KIND AND LEVEL (items.ts imbueOptions), all of it, whatever the piece has. MEMORY (22 Nov
## 2026, after the web game's crashes on his phone on the later floors: “Will this be a problem in godot?”): the table, 40 MB of
## text and 687 MB once read whole, is read an option at a time as it is asked for (tools/godot_loot_split.mjs): which options a word
## has on each kind of piece (imbue.json `of`), and each option once, as its own line of text (`opts`), made a thing when first wanted.
func imbue_options(w: String, it: Dictionary) -> Array:
	# (GREED: magic find or Intelligence, on any piece: Plundering's magic find, and Intelligence where it gives Dexterity)
	if w == "greed":
		var mf_of := func(ilvl: float) -> Dictionary:
			for o in imbue_options("plundering", {"slot": "helm", "ilvl": ilvl}):
				if str(o["stat"]) == "magicFind":
					return o
			return {}
		var g: Array = []
		for o in imbue_options("plundering", it):
			var st: String = str(o["stat"])
			if st == "goldFind" or st == "magicFind":
				var mfo: Dictionary = mf_of.call(float(it["ilvl"]))
				if not mfo.is_empty():
					g.append(mfo)
			elif st == "dex":
				for q in imbue_options("reaping", it):
					if str(q["stat"]) == "int":
						g.append(q)
						break
		return g
	# (THE 52 DESIGNED MELDS AND THE 11 LEVEL 2 RUNES: made from their runes' own: melds52_options)
	if Melds52.is_new(w):
		return melds52_options(w, it)
	if _imbue.is_empty():
		_imbue = JSON.parse_string(FileAccess.get_file_as_string(DIR + "/imbue.json"))
	var nums: Array = _imbue["of"].get(w, {}).get("%s:%d" % [it["slot"], int(it["ilvl"])], [])
	var opts: Array = _imbue["opts"]
	var out: Array = []
	for n in nums:
		var i := int(n)
		if not _imbue_read.has(i):
			_imbue_read[i] = JSON.parse_string(str(opts[i]))
		out.append(_imbue_read[i])
	# (THE THREE DEFENCES' WORDS, words.gd DEFENCE_WORDS: a chance to block on gear is barrier; Swift on a piece that keeps him,
	# dodge in place of cooldown recovery)
	if DEFENCE_LAYERS and Words.DEFENCE_WORDS:
		out = out.map(func(o): return _defence_option(w, str(it["slot"]), float(it["ilvl"]), o))
	# (THE CLASSES EVENED, words.gd EVEN_GEAR_ATTR: a ranked word gives no more of an attribute than its plain word: its option of
	# Strength, Dexterity or Intelligence is the plain word's own)
	if Words.EVEN_GEAR_ATTR and Words.is_rank(w):
		var plain: Array = imbue_options(str(Words.parts_of(w)[0]), it)
		for k in out.size():
			var st: String = str(out[k]["stat"])
			if st in ["str", "dex", "int"]:
				for o in plain:
					if str(o["stat"]) == st:
						out[k] = o
	return out


func _group(stat: String) -> String:
	return _words["groups"].get(stat, stat)


## THE 52 DESIGNED MELDS AND THE 11 LEVEL 2 RUNES (melds52.gd) on a piece of that kind and level, as the game makes a melded
## word's (items.ts imbueOptions): each option of its first rune with each of its second's, so long as the two are not of a kind,
## each a quarter weaker than its rune gives alone (Melds52.GEAR), rolled on its own; a level 2 rune's, its rune's own half as
## strong again (Melds52.GEAR_RANK). Made when first asked for.
var _opts52 := {}


func melds52_options(w: String, it: Dictionary) -> Array:
	var key := "%s|%s:%d" % [w, it["slot"], int(it["ilvl"])]
	if _opts52.has(key):
		return _opts52[key]
	var of: Array = Words.parts_of(w)
	var out: Array = []
	if Melds52.is_new_rank(w):
		out = imbue_options(of[0], it).map(func(o): return _scaled(o, Melds52.GEAR_RANK) if not str(o["stat"]) in ["str", "dex", "int"] else o)
	else:
		var a: Array = imbue_options(of[0], it).map(func(o): return _scaled(o, Melds52.GEAR))
		var b: Array = imbue_options(of[1], it).map(func(o): return _scaled(o, Melds52.GEAR))
		for x in a:
			for y in b:
				if _group(str(x["stat"])) == _group(str(y["stat"])):
					continue
				var o: Dictionary = x.duplicate()
				o["also"] = y["stat"]
				o["alsoRolls"] = y["rolls"]
				o["range"] = "%s and %s" % [x.get("range", ""), y.get("range", "")]
				out.append(o)
		if out.is_empty():
			out = a
	_opts52[key] = out
	return out


## A number of a property as `k` of itself (items.ts roundStat, the table's own steps): a property counted in whole numbers stays
## whole, never under one; one counted in tenths (`tenths`: Life on Hit) to a tenth, never under one.
static func _scale_value(v: float, k: float, tenths := false) -> float:
	if not tenths:
		return maxf(1.0 if v > 0.0 else 0.0, roundf(v * k))
	return maxf(0.1, roundf(v * k * 10.0 + 0.0001) / 10.0)


static var _num_re: RegEx


## Text with its numbers shown anew: each number, in order, matched to the next of `olds` it shows (as itself, or a tenth or a
## hundredth of it: "+3.0% Cooldown Recovery" is 30), written as the same share of the next of `news`, as many places as it had.
static func _retext(s: String, olds: Array, news: Array) -> String:
	if _num_re == null:
		_num_re = RegEx.create_from_string("\\d+(\\.\\d+)?")
	var out := ""
	var at := 0
	var k := 0
	for m in _num_re.search_all(s):
		if k >= olds.size():
			break
		var t := float(m.get_string())
		var dec := maxi(0, m.get_string(1).length() - 1)
		var j := -1
		for jj in 4:
			if absf(t - float(olds[k]) / pow(10.0, jj)) < 0.0001:
				j = jj
				break
		if j < 0:
			continue
		var v: float = float(news[k]) / pow(10.0, j)
		out += s.substr(at, m.get_start() - at) + (("%." + str(dec) + "f") % v if dec > 0 else str(int(roundf(v))))
		at = m.get_end()
		k += 1
	return out + s.substr(at)


## An option of the table (imbue.json) as `k` of itself: each of its sizes, its lines and its range; sizes that come to the same
## made one, their chances added.
static func _scaled(o: Dictionary, k: float) -> Dictionary:
	var out: Dictionary = o.duplicate()
	var rolls: Array = []
	var at := {}
	var lo := INF
	var hi := -INF
	var lo2 := INF
	var hi2 := -INF
	# (a property counted in tenths: any of its sizes not a whole number)
	var tenths := {}
	for r in o["rolls"]:
		for m in r[1]:
			if not is_equal_approx(float(m[1]), roundf(float(m[1]))):
				tenths[m[0]] = true
	for r in o["rolls"]:
		var olds: Array = []
		var news: Array = []
		var mods: Array = []
		for m in r[1]:
			var v := _scale_value(float(m[1]), k, tenths.has(m[0]))
			olds.append(float(m[1]))
			news.append(v)
			mods.append([m[0], v])
		lo = minf(lo, float(r[1][0][1]))
		hi = maxf(hi, float(r[1][r[1].size() - 1][1]))
		lo2 = minf(lo2, news[0])
		hi2 = maxf(hi2, news[news.size() - 1])
		var key := str(mods)
		if at.has(key):
			rolls[at[key]][0] = float(rolls[at[key]][0]) + float(r[0])
			continue
		var nr: Array = [r[0], mods]
		for q in range(2, r.size()):
			nr.append((r[q] as Array).map(func(l): return _retext(str(l), olds, news)))
		at[key] = rolls.size()
		rolls.append(nr)
	out["rolls"] = rolls
	for f in ["range", "rangeMana"]:
		if o.has(f):
			out[f] = _retext(str(o[f]), [lo, hi], [lo2, hi2])
	return out


## Why a word cannot be burned into that piece, or "" if it can (game.ts imbueProblem; items.ts imbueProblem).
func burn_problem(w: String, where) -> String:
	# (THE DOOR WORDS, door_words.gd: no piece of gear takes one)
	if DoorWords.is_door(w):
		return "Only for the Rim's door"
	if not ring_lit:
		return _words["dark"]
	var it = piece(where)
	if it == null:
		return "Nothing there"
	if first_word_waits():
		return "Your first word goes on an attack"
	if int(words.get(w, 0)) <= 0:
		return "No spare word"
	if int(it["rarity"]) == 3:
		return "A unique piece takes no word"
	# (SPLITTING and BINDING change a piece at the bench rather than burn into it, items.ts ITEM_WORDS: split_problem, bind_problem)
	if w == "splitting":
		return split_problem(where)
	if w == "binding":
		return "A unique piece will not bind" if int(it["rarity"]) == 3 else ""
	if room(it) <= 0:
		return "That piece is full"
	if burn_options(w, it).is_empty():
		return "It already has what this word gives"
	return ""


## BURN A WORD INTO A PIECE (game.ts imbue; items.ts imbueItem): the word is used up; which of the things it can become
## there is picked evenly, and its size rolled as the game rolls it (each size of the table as likely as the game makes
## it). The piece's colour follows the count of its properties. "" if it was done (`burned` says what it became), else why
## not.
func burn(w: String, where) -> String:
	var why := burn_problem(w, where)
	if why != "":
		return why
	var it: Dictionary = piece(where)
	var o: Dictionary = burn_options(w, it).pick_random()
	var got: Array = _roll_of(o["rolls"])
	# (WORDMELDING: a melded word's second property, rolled on its own: tools/godot_loot.ts twoPart)
	if o.has("alsoRolls"):
		var two: Array = _roll_of(o["alsoRolls"])
		got = [got[0], got[1] + two[1], got[2] + two[2], (got[3] if got.size() > 3 else got[2]) + (two[3] if two.size() > 3 else two[2])]
	var stats: Array = []
	for m in got[1]:
		stats.append(m[0])
	it["mods"] = it["mods"] + got[1]
	if not it.has("imbues"):
		it["imbues"] = []
	# (and how they read with mana the limit, where that differs)
	var im := {"word": w, "lines": got[2], "stats": stats, "mods": got[1]}
	if got.size() > 3 and got[3] != got[2]:
		im["linesMana"] = got[3]
	it["imbues"].append(im)
	var n: int = int(it.get("affixes", 0)) + it["imbues"].size()
	it["rarity"] = maxi(int(it["rarity"]), 2 if n >= 3 else (1 if n >= 1 else 0))
	# (its price with that many words in it, as the game counts it, items.ts itemValue: a fifth more for each word, and its
	# colour's own worth where the word has changed its colour: tools/godot_loot.ts `worth`)
	var worth: Array = it.get("worth", [])
	var nth: int = it["imbues"].size() - 1
	# (a piece split or bound has no `worth` kept: its price by the game's sum from its own, item_value)
	if nth < worth.size():
		it["value"] = int(worth[nth])
	elif it.has("vbase"):
		it["value"] = item_value(it)
	else:
		it["value"] = roundi(float(it.get("value", 0)) * 1.2)
	words[w] = int(words[w]) - 1
	if where is String:
		derive()
	sfx.play("imbue")
	burned = {"word": w, "item": it["name"], "text": ", ".join(lines_of(im))}
	# (WORDMELDING: what a made word becomes on gear is known from now on: game.ts learn(word, 'gear'))
	if Words.made().has(w) or Melds52.is_new(w):
		_know(w)["gear"] = true
	return ""


# --- SPLITTING AND BINDING CHANGE THE PIECE (items.ts ITEM_WORDS, splitProblem, splitItem, bindProblem, bindItems; game.ts
# itemWordProblem, splitPiece, bindPieces). His words, 4 Nov 2026, 19:15: “And I really love the erasing type words that don’t
# craft a specific mod but change the item in a different way.  Like splitting would make take a single item and turn it into two
# items and divide the mods up between them.  And maybe another that takes two items and slaps them into 1 item and takes mods
# from both.” SPLITTING shares a piece's properties between it and a second like it, at random (the first the odd one), the
# second into the bag; BINDING takes a second piece of the same kind into the first, which keeps its own and as many of the other's
# as there is room for (four in all, never two of a kind; at least one of each's, the rest rolled), the second gone. A piece's
# colour follows the count of its properties, its picture and its price with it. ---

## A price by the game's sum (items.ts itemValue), from what the piece was before its colour, its properties and its words.
func item_value(it: Dictionary) -> int:
	if not it.has("vbase") or _value.is_empty():
		return int(it.get("value", 0))
	var v: float = float(it["vbase"]) * float(_value["rarity"][int(it["rarity"])]) * (1.0 + float(_value["affix"]) * int(it.get("affixes", 0))) * pow(float(_value["imbued"]), it.get("imbues", []).size())
	return maxi(1, roundi(v))


## Its properties, each {a: one it was found with} or {i: a word burned into it}, in its own order.
func _props_of(it: Dictionary) -> Array:
	var out: Array = []
	for a in it.get("props", []):
		out.append({"a": a})
	for im in it.get("imbues", []):
		out.append({"i": im})
	return out


func _prop_group(p: Dictionary) -> String:
	var mods: Array = p["a"]["mods"] if p.has("a") else p["i"].get("mods", [])
	if mods.is_empty():
		return str(p["i"]["stats"][0]) if p.has("i") and not p["i"]["stats"].is_empty() else ""
	return _group(str(mods[0][0]))


## (items.ts withProps) The piece with these properties and no others; its colour, its picture and its price theirs.
func _with_props(it: Dictionary, props: Array) -> Dictionary:
	var out: Dictionary = it.duplicate(true)
	var affs: Array = []
	var ims: Array = []
	for p in props:
		if p.has("a"):
			affs.append(p["a"].duplicate(true))
		else:
			ims.append(p["i"].duplicate(true))
	out["props"] = affs
	out["imbues"] = ims
	out["affixes"] = affs.size()
	var mods: Array = it.get("imods", []).duplicate(true)
	var has: Array = []
	var lines: Array = []
	var lines_mana: Array = []
	for a in affs:
		mods.append_array(a["mods"])
		lines.append_array(a["lines"])
		lines_mana.append_array(a["linesMana"] if a.get("linesMana") is Array else a["lines"])
		for m in a["mods"]:
			has.append(m[0])
	for im in ims:
		mods.append_array(im.get("mods", []))
	out["mods"] = mods
	out["has"] = has
	out["lines"] = lines
	out.erase("linesMana")
	if lines_mana != lines:
		out["linesMana"] = lines_mana
	if int(out["rarity"]) != 3:
		var n := affs.size() + ims.size()
		out["rarity"] = 2 if n >= 3 else (1 if n >= 1 else 0)
		var base := str(out["icon"]).split(":")[0]
		if pics.has("%s:%d" % [base, int(out["rarity"])]):
			out["icon"] = "%s:%d" % [base, int(out["rarity"])]
	out["value"] = item_value(out)
	out.erase("worth")
	return out


## Why Splitting will not split the piece at `where`, or "" (it wants room in the bag for the second piece).
func split_problem(where) -> String:
	var it = piece(where)
	if it == null:
		return "Nothing there"
	if int(it["rarity"]) == 3:
		return "A unique piece will not split"
	if not it.has("props"):
		return "Nothing on it to share between two"
	if _props_of(it).size() < 2:
		return "Nothing on it to share between two"
	if bag.size() >= BAG:
		return "No room in your bag for the second piece"
	return ""


## Why Binding will not take the piece at `other` into the one at `into`, or "".
func bind_problem(into, other) -> String:
	var a = piece(into)
	var b = piece(other)
	if a == null or b == null:
		return "Nothing there"
	if typeof(into) == typeof(other) and into == other:
		return "Bind it to another piece"
	if str(a["slot"]) != str(b["slot"]):
		return "Only two pieces of the same kind bind"
	if int(a["rarity"]) == 3 or int(b["rarity"]) == 3:
		return "A unique piece will not bind"
	if not a.has("props") or not b.has("props"):
		return "Only two pieces of the same kind bind"
	return ""


## SPLITTING at the bench: the piece and a second like it in the bag, its properties shared between them at random. "" if done.
func split_piece(where) -> String:
	var why := split_problem(where) if int(words.get("splitting", 0)) > 0 else "No spare word"
	if why != "":
		return why
	var it: Dictionary = piece(where)
	var ps := _props_of(it)
	ps.shuffle()
	var half := ceili(ps.size() / 2.0)
	var one := _with_props(it, ps.slice(0, half))
	var two := _with_props(it, ps.slice(half))
	if where is String:
		gear[where] = one
	else:
		bag[int(where)] = one
	bag.append(two)
	words["splitting"] = int(words["splitting"]) - 1
	if where is String:
		derive()
	_know("splitting")["gear"] = true
	sfx.play("imbue")
	burned = {"word": "splitting", "item": it["name"], "text": "Split in two: the second is in your bag"}
	return ""


## BINDING at the bench: the piece at `other` taken into the one at `into`, which keeps its own and as many of the other's as
## there is room for; the other gone. "" if done.
func bind_pieces(into, other) -> String:
	var why := bind_problem(into, other) if int(words.get("binding", 0)) > 0 else "No spare word"
	if why != "":
		return why
	var a: Dictionary = piece(into)
	var b: Dictionary = piece(other)
	var mine := _props_of(a)
	var groups: Array = mine.map(_prop_group)
	var theirs: Array = _props_of(b).filter(func(p): return not groups.has(_prop_group(p)))
	var room_n := int(_words["room"])
	var keep: Array = []
	if mine.size() + theirs.size() <= room_n:
		keep = mine + theirs
	else:
		var x: Array = mine.duplicate()
		var y: Array = theirs.duplicate()
		x.shuffle()
		y.shuffle()
		if not x.is_empty():
			keep.append(x.pop_front())
		if not y.is_empty():
			keep.append(y.pop_front())
		var rest: Array = x + y
		rest.shuffle()
		while keep.size() < room_n and not rest.is_empty():
			keep.append(rest.pop_front())
		# (in the piece's own order: what it was found with, then the words burned in)
		keep.sort_custom(func(p, q): return p.has("a") and q.has("i"))
	var made := _with_props(a, keep)
	if into is String:
		gear[into] = made
	else:
		bag[int(into)] = made
	if other is String:
		gear[other] = null
	else:
		bag.remove_at(int(other))
	words["binding"] = int(words["binding"]) - 1
	if into is String or other is String:
		derive()
	_know("binding")["gear"] = true
	sfx.play("imbue")
	var lines: Array = []
	for p in keep:
		lines.append_array(lines_of(p["a"]) if p.has("a") else lines_of(p["i"]))
	burned = {"word": "binding", "item": made["name"], "text": ", ".join(lines)}
	return ""


## One of a table's sizes, each as likely as its count makes it: [count, mods, lines].
static func _roll_of(rolls: Array) -> Array:
	var total := 0.0
	for r in rolls:
		total += float(r[0])
	var at := randf() * total
	for r in rolls:
		at -= float(r[0])
		if at < 0.0:
			return r
	return rolls[rolls.size() - 1]


# --- WORDMELDING AT THE WORDSMITH (game.ts meldProblem, meldWords; game/melds.ts MELD_TUNE): once the Meldstone has been given
# him (`meld` "open"), two spare words and runedust go in, one word comes out. The page itself: inventory.gd, its block THE
# WORDSMITH'S HALF. ---

## The last word the wordsmith melded, and whether it was the first of its kind (game.ts `melded`: his half shows it).
var melded := {}
## What the hero knows of each word melding makes (the Lexicon's meta.known): {found, front, behind, gear}.
var known := {}


## A made word's knowing (made when first wanted).
func _know(w: String) -> Dictionary:
	if not known.has(w):
		known[w] = {"found": false, "front": false, "behind": false, "gear": false}
	return known[w]


## (game.ts learn) A word used, its use known in the Lexicon: on the gate, burned into a dungeon ("dungeon").
func learn(w: String, use := "dungeon") -> void:
	_know(w)["found"] = true
	_know(w)[use] = true


## The runedust he carries (act1/quest610.gd `dust`, counted as the game counts it).
func dust() -> int:
	return int(main.quest610.dust) if main != null and main.quest610 != null else 0


## What a meld costs (MELD_TUNE.cost).
static func meld_cost() -> int:
	return int(Words.data()["melds"]["tune"]["cost"])


## Why the wordsmith cannot meld these two spare words just now, or "" if he can (game.ts meldProblem): the ring dark; the
## Meldstone not yet brought to him; not two words that meld (melds.ts meldProblem); not his to give; not the runedust it takes.
func meld_problem(a: String, b: String) -> String:
	if not ring_lit:
		return _words["dark"]
	if meld != "open":
		return "Give him the MELDSTONE first" if meld == "stone" else "He needs the MELDSTONE to meld"
	var why := Words.meld_problem(a, b)
	if why != "":
		return why
	if int(words.get(a, 0)) <= 0 or int(words.get(b, 0)) <= 0:
		return "No spare word"
	# (RANK II: two of the same word take two of it)
	if a == b and int(words.get(a, 0)) < 2:
		return "Two of the word go in"
	if dust() < meld_cost():
		return "Needs %d runedust" % meld_cost()
	return ""


## THE WORDSMITH MELDS two spare words into one, for runedust (game.ts meldWords): both used up, the word made among his words,
## known from now on, in front and behind. `melded` says what came of it, and whether it was the first of its kind. "" if it was
## done, else why not.
func meld_words(a: String, b: String, quiet := false) -> String:
	var why := meld_problem(a, b)
	if why != "":
		return why
	var m := Words.meld_of(a, b)
	if m == "":
		return "These do not meld"
	words[a] = int(words[a]) - 1
	words[b] = int(words[b]) - 1
	words[m] = int(words.get(m, 0)) + 1
	main.quest610.dust -= meld_cost()
	var k := _know(m)
	var first: bool = not k["found"]
	k["found"] = true
	k["front"] = true
	k["behind"] = true
	melded = {"word": m, "first": first}
	# (`quiet`: THE MELDING STONE plays the chime as the new rune forms, inventory.gd RUNE_BAG)
	if not quiet:
		sfx.play("rare")
	return ""


# --- the armourer's quest ---

## Floor 3's furnace still burns for this hero (game.ts furnaceBurns): one who has been down past floor 3 has it out.
func furnace_burns() -> bool:
	return furnace != "out" and furnace != "done" and cleared < 3 and (main == null or int(main.way_depth) < 4)


## What the armourer has for this hero (game.ts armourerDue): "furnace", his quest (the ring lit, the furnace burning, not
## yet asked); "reward" (the furnace out); or "".
func armourer_due() -> String:
	if not ring_lit:
		return ""
	if furnace == "out":
		return "reward"
	if furnace == "" and furnace_burns():
		return "furnace"
	return ""


## THE ARMOURER, USED WITH SOMETHING DUE (game.ts handIn, armourerHandIn): he asks the hero to put out floor 3's furnace;
## or, the furnace out, he gives his word for the Warrior, HEAVY. False if he had nothing (then his shop opens).
func armourer_hand_in() -> bool:
	var what := armourer_due()
	if what == "furnace":
		furnace = "asked"
		sfx.play("power", linear_to_db(0.6))
		say(quest_text["furnaceAsk"], MSG_QUEST)
		return true
	if what == "reward":
		furnace = "done"
		gain_word(quest_text["word"], false)
		sfx.play("rare")
		say(quest_text["reward"], MSG_QUEST)
		return true
	return false


## The crank's gear taken up where the Stoker fell (game.ts furnaceGearTaken); the crank turned with it and the furnace
## out (turnCrank). furnace.gd tells both. One whom the armourer has rewarded is not sent back.
func furnace_gear() -> void:
	if furnace == "" or furnace == "asked":
		furnace = "gear"


func furnace_out() -> void:
	if furnace != "done":
		furnace = "out"


# --- the Meldstone ---

## (game/melds.ts STONE_RISE: how long it waits under the floor as he is dragged down, and how long from its rising until it
## can be taken; MELD_DUST_COLOR, the friend's cyan it is named in)
const STONE_WAIT := 2.6
const STONE_STANDS := 1.2
const MELD_COLOR := Color("#5ce8f8")
## (game/quests15.ts QUEST_TEXT; game.ts takeMeldstone)
const MELD_ASK := "The wordsmith: \"The cult holds the prison yet. Under the ossuary lies their stronghold, and in it the MELDSTONE. Bring it to me, and I will unbar the gate down the mountain.\""
const MELD_TAKES := "The wordsmith takes the MELDSTONE. He can meld words now."
const MELD_WORDS := "He gives you two words, %s and %s, to meld."
const MELD_LESSON := [
	"MELDING: two damage words made one. Open the wordsmith, then MELD.",
	"Tap a word, then a hollow; then the other word, the other hollow. MELD makes them one word, for runedust.",
]
## (render/meld_drops.ts: how high it hangs, how far it bobs; RISE and TAKEN, the moments of its rising and of its taking)
const HOVER := 8.0
const BOB := 1.5
const RISE := {"crack_from": -0.4, "top": 0.3, "slam": 0.55, "burst": 0.32, "down": 1.2, "top_z": 38.0}
const TAKEN := {"leap": 0.22, "slam": 0.5, "burst": 0.3, "gone": 0.8, "top_z": 46.0, "chest_z": 20.0}


## Has the wordsmith his ask for the Meldstone (game.ts meldAskDue): the armourer has rewarded him, it is not asked, not his,
## and the gate down the mountain is still barred.
func meld_ask_due() -> bool:
	return furnace == "done" and not meld_ask and meld == "" and (main == null or int(main.way_depth) < 6)


## The wordsmith asks for it (game.ts handIn 'meldAsk').
func ask_meld() -> void:
	meld_ask = true
	sfx.play("power", linear_to_db(0.6))
	say(MELD_ASK, MSG_QUEST)


## THE FLESHMANCER DEAD (fleshmancer.gd died; game.ts dropLoot): until it has been brought to the wordsmith, and while none lies
## there yet, the Meldstone, under the floor just where he went down (STONE_RISE), to burst up out of it.
func meldstone_rises(at: Vector2) -> void:
	if meld != "" or stands == null or map == null:
		return
	for d in _drops:
		if d["kind"] == "stone":
			return
	var p := at if map.open_at(floori(at.x), floori(at.y)) else _scatter(at)
	var holder := Node2D.new()
	stands.add_child(holder)
	var pics: Array = []
	for i in 3:
		var q := _FilmPic.new()
		stands.add_child(q)
		pics.append(q)
	var label := _Tag.new()
	label.text = "Meldstone"
	label.color = MELD_COLOR
	label.z_index = 60
	label.visible = false
	stands.add_child(label)
	_drops.append({"kind": "stone", "at": p, "node": holder, "age": -STONE_WAIT, "pics": pics, "label": label, "slammed": false})


## THE MELDSTONE AS IT DROPS AND LIES (render.ts standMeldDrop; render/meld_drops.ts riseOf): the crack of its light in the
## floor, then it shoots up spinning, its halves torn apart, hangs, slams together in a burst of light (the screen kicked),
## and comes down to hang over the floor, turning to and fro, named; its light on the floor under it.
func _show_stone(d: Dictionary) -> void:
	var R := rise_of(d["age"], _clock)
	var at: Vector2 = d["at"]
	var scr := Iso.to_screen(at.x, at.y)
	var dd := at.x + at.y
	var pics: Array = d["pics"]
	var c = R["crack"]
	pics[0].visible = c != null and pics[0].put("ms_crack", mini(5, floori(c["k"] * 6.0)), scr, dd - 0.45, 0.0, 1.0, c["alpha"])
	var z: float = R["z"]
	if z < 0.0:
		pics[1].visible = false
		pics[2].visible = false
		d["label"].visible = false
		return
	pics[1].put(_stone_film(R), _stone_frame(R), scr, dd + 0.05, z * 2.0, R["scale"])
	var b = R["burst"]
	pics[2].visible = b != null and pics[2].put("ms_burst", 0, scr, dd + 0.06, z * 2.0, b["scale"], b["alpha"])
	if R["slammed"] and not d["slammed"]:
		d["slammed"] = true
		hero.kick(3.0)
	d["label"].visible = R["shown"] == "hang"
	d["label"].position = scr + Vector2(0, (20.0 - z - 16.0) * 2.0)
	if main != null and main.look != null:
		main.look.spot(scr / 2.0, 16.0, 0.4)
		main.look.spot(scr / 2.0 - Vector2(0, z), 14.0, 0.4)


## TAKEN (game.ts updateDrops 'stone'): his, to be brought to the wordsmith; it leaps over his head, wrenches apart, slams
## together and dives into him (render/meld_drops.ts takenOf).
func _stone_taken(d: Dictionary) -> void:
	for q in d["pics"]:
		q.queue_free()
	d["label"].queue_free()
	if meld == "":
		meld = "stone"
	sfx.play("rare")
	say("You take the MELDSTONE.", MSG_QUEST)
	var pics: Array = []
	for i in 2:
		var q := _FilmPic.new()
		stands.add_child(q)
		pics.append(q)
	_taken = {"g": 0.0, "from": d["at"], "pics": pics, "slammed": false}


func _show_taken(dt: float) -> void:
	if _taken.is_empty():
		return
	_taken["g"] += dt
	var pics: Array = _taken["pics"]
	var T := taken_of(_taken["g"], _taken["from"], hero.world)
	if T.is_empty() or not is_instance_valid(pics[0]):
		for q in pics:
			if is_instance_valid(q):
				q.queue_free()
		_taken = {}
		return
	var scr := Iso.to_screen(T["x"], T["y"])
	var hd := hero.world.x + hero.world.y
	var z: float = T["z"]
	pics[0].put(_stone_film(T), _stone_frame(T), scr, hd + 0.05, z * 2.0, T["scale"])
	var b = T["burst"]
	pics[1].visible = b != null and pics[1].put("ms_burst", 0, scr, hd + 0.06, z * 2.0, b["scale"], b["alpha"])
	if T["slammed"] and not _taken["slammed"]:
		_taken["slammed"] = true
		hero.kick(3.5)


## Its picture: spinning torn apart, spinning fused, or hanging (render.ts meldStoneSprite).
func _stone_film(R: Dictionary) -> String:
	return "ms_apart" if R["shown"] == "apart" else ("ms_whole" if R["shown"] == "whole" else "ms_stone")


func _stone_frame(R: Dictionary) -> int:
	if R["shown"] == "hang":
		return floori(_clock * 12.0) % 24
	# (art/meld_drops.ts spinStep: the step of its turn, of 16)
	return posmod(roundi(float(R["yaw"]) / 360.0 * 16.0), 16)


static func _ease(k: float) -> float:
	return k * k * (3.0 - 2.0 * k)


## render/meld_drops.ts riseOf: the Meldstone as it drops, by its age (below 0, under the floor), and the clock for its bob:
## {z (game pixels; less than 0 not shown), yaw, shown, scale, burst {scale, alpha} or null, crack {k, alpha} or null, slammed}.
static func rise_of(age: float, t: float) -> Dictionary:
	var crack = null
	if age >= RISE["crack_from"] and age < 0.25:
		crack = {"k": clampf((age - RISE["crack_from"]) / -RISE["crack_from"], 0.0, 1.0), "alpha": 1.0 if age < 0.0 else 1.0 - age / 0.25}
	var out := {"z": -1.0, "yaw": 0.0, "shown": "whole", "scale": 1.0, "burst": null, "crack": crack, "slammed": false}
	if age < 0.0:
		return out
	var top_z: float = RISE["top_z"]
	if age < RISE["top"]:
		# (shot up out of the floor, spinning, torn apart)
		var k: float = age / RISE["top"]
		out.merge({"z": top_z * (1.0 - (1.0 - k) * (1.0 - k)), "yaw": 1080.0 * k, "shown": "apart", "scale": 0.7 + 0.3 * k}, true)
		return out
	if age < RISE["slam"]:
		# (hung at the top, still spinning, straining)
		var k: float = (age - RISE["top"]) / (RISE["slam"] - RISE["top"])
		out.merge({"z": top_z + 2.0 * sin(k * PI), "yaw": 1080.0 + 400.0 * k, "shown": "apart", "scale": 1.0 + 0.15 * k}, true)
		return out
	var since: float = age - RISE["slam"]
	if since < RISE["burst"]:
		out["burst"] = {"scale": 0.5 + since / RISE["burst"] * 1.1, "alpha": 1.0 - since / RISE["burst"]}
	out["slammed"] = true
	var bob := BOB * sin(t * PI)
	if age < RISE["down"]:
		# (slammed together; down to hang, its spin running down)
		var k := _ease((age - RISE["slam"]) / (RISE["down"] - RISE["slam"]))
		out.merge({"z": top_z + (HOVER + bob - top_z) * k, "yaw": 1480.0 + 260.0 * k, "shown": "whole"}, true)
		return out
	out.merge({"z": HOVER + bob, "shown": "hang"}, true)
	return out


## render/meld_drops.ts takenOf: the Meldstone `g` seconds after it was taken, between where it hung and him: {x, y, z, yaw,
## shown, scale, burst, slammed}; empty once it is gone into him.
static func taken_of(g: float, from: Vector2, to: Vector2) -> Dictionary:
	if g < 0.0 or g >= TAKEN["gone"]:
		return {}
	var since: float = g - TAKEN["slam"]
	var burst = null
	if since >= 0.0 and since < TAKEN["burst"]:
		burst = {"scale": 0.6 + since / TAKEN["burst"] * 1.2, "alpha": 1.0 - since / TAKEN["burst"]}
	var top_z: float = TAKEN["top_z"]
	if g < TAKEN["leap"]:
		var k := _ease(g / TAKEN["leap"])
		var p := from.lerp(to, k)
		return {"x": p.x, "y": p.y, "z": HOVER + (top_z - HOVER) * k, "yaw": 720.0 * k, "shown": "apart" if k > 0.4 else "whole", "scale": 1.0, "burst": burst, "slammed": false}
	if g < TAKEN["slam"]:
		# (over his head, wrenched wider and wider apart)
		var k: float = (g - TAKEN["leap"]) / (TAKEN["slam"] - TAKEN["leap"])
		return {"x": to.x, "y": to.y, "z": top_z + 2.0 * sin(k * PI), "yaw": 720.0 + 300.0 * k, "shown": "apart", "scale": 1.0 + 0.3 * k, "burst": burst, "slammed": false}
	# (slammed; dives into his chest)
	var k := clampf((g - TAKEN["slam"] - 0.06) / (TAKEN["gone"] - TAKEN["slam"] - 0.06), 0.0, 1.0)
	return {"x": to.x, "y": to.y, "z": top_z + (TAKEN["chest_z"] - top_z) * k * k, "yaw": 1020.0 + 360.0 * k, "shown": "whole", "scale": 1.15 - 0.95 * k * k, "burst": burst, "slammed": true}


## GIVEN TO THE WORDSMITH (game.ts takeMeldstone; town.gd gives it): he can meld from now on; the two words to meld, and his
## lesson. (Melding itself: meld_words below, at his page, inventory.gd.)
func give_meldstone() -> void:
	meld = "open"
	sfx.play("rare")
	say(MELD_TAKES, MSG_QUEST)
	var ws: Array = Words.data()["meldstone"]
	gain_word(ws[0], false)
	words[ws[1]] = int(words.get(ws[1], 0)) + 1
	say(MELD_WORDS % [str(Words.word(ws[0])["name"]).to_upper(), str(Words.word(ws[1])["name"]).to_upper()], MSG_QUEST)
	for line in MELD_LESSON:
		say(line, MSG_QUEST)


# --- what is said ---

## A line of what has just happened (game.ts msg; render/fx.ts messages): up for 5 s, a long one longer to be read.
## The other of floor 13's pair, alive (pair.ts partnerOf).
func _partner_of(m):
	var want := "quill" if m.kind == "scraper" else ("scraper" if m.kind == "quill" else "")
	if want == "" or m.mgr == null:
		return null
	for o in m.mgr.list:
		if is_instance_valid(o) and not o.dead and o != m and o.kind == want and o.pack_id == m.pack_id:
			return o
	return null


func say(text: String, color := Color.WHITE) -> void:
	msgs.append({"text": text, "t": 0.0, "color": color, "life": maxf(5.0, 2.5 + text.length() * 0.08)})
	if msgs.size() > 5:
		msgs.pop_front()


# --- THE WARRIOR'S THREE WEAPONS (game/items.ts asWarriorWeapon; game.ts forHim, allForHim): a greatsword, battle axe or warhammer
# found, bought or won by a Warrior made his own weapon's kind of the same name tier (his words, 7 Nov 2026, 21:11: “These will
# change his current weapon drops as well.  Swords become hammers become axes.”); his weapon picked or changed, every one he wears
# and carries, and the vendors' shelves, made it. Its name, picture and kind its new kind's; its numbers, words and colour kept. ---

var _arms := {}


func for_him(it):
	# (a unique keeps its own weapon, and its moves: his pick of 12 Nov 2026, "Each keeps its weapon's moves")
	if not (it is Dictionary) or cls != "warrior" or hero == null or _arms.is_empty() or it.get("unique") != null:
		return it
	var to: Dictionary = _arms.get(str(hero.weapon), {})
	var from := ""
	for k in _arms:
		if _arms[k]["kind"] == it.get("kind"):
			from = k
	if to.is_empty() or from == "" or from == str(hero.weapon):
		return it
	var tier := maxi(0, (_arms[from]["names"] as Array).find(it.get("base", "")))
	var nb: String = to["names"][tier]
	var ob: String = it.get("base", "")
	if ob != "" and str(it["name"]).contains(ob):
		it["name"] = str(it["name"]).replace(ob, nb)
	it["base"] = nb
	it["kind"] = to["kind"]
	var key := "%s:%s" % [to["icon"], str(it["icon"]).get_slice(":", 1)]
	if pics.has(key):
		it["icon"] = key
	return it


func all_for_him() -> void:
	if cls != "warrior":
		return
	for slot in gear:
		if gear[slot] != null:
			for_him(gear[slot])
	for it in bag:
		if it != null:
			for_him(it)
	for k in shops:
		for it in shops[k]:
			for_him(it)


# --- the vendors ---

## Buy a piece off a vendor's shelf (game.ts buy): its price, into the bag; gone from the shelf.
func buy(shop: String, i: int) -> void:
	var stock: Array = shops.get(shop, [])
	if i < 0 or i >= stock.size():
		return
	var it: Dictionary = stock[i]
	var price := int(it["value"])
	if gold < price:
		say("Not enough gold", MSG_BAD)
		return
	if bag.size() >= BAG:
		say("Your bag is full", MSG_BAD)
		return
	gold -= price
	stock.remove_at(i)
	bag.append(it)
	say("Bought %s" % it["name"], RARITY_COLOR[int(it["rarity"])])
	sfx.play("coin", -4.0)


## What a piece sells for (game.ts sellValue): a quarter of its worth (TUNE.sellRate), never less than one.
func sell_value(it: Dictionary) -> int:
	return maxi(1, floori(float(it.get("value", 0)) * float(_tune.get("sellRate", 0.25))))


## Sell a piece from the bag (game.ts sell): what it sells for. The vendor keeps it for the rest of this visit, to be bought back
## for the same (`sold`, TUNE.soldKept of them; the oldest goes for good).
func sell(i: int) -> void:
	if i < 0 or i >= bag.size():
		return
	var it: Dictionary = bag[i]
	var n := sell_value(it)
	bag.remove_at(i)
	gold += n
	sold.append(it)
	if sold.size() > int(_tune.get("soldKept", 30)):
		sold.remove_at(0)
	say("Sold %s: +%d gold" % [it["name"], n], Color(1.0, 0.85, 0.4))
	sfx.play("coin", -4.0)


## Take back piece `i` of what was sold on this visit, for what was paid for it (game.ts buyBack). Why not, or "".
func buy_back(i: int) -> String:
	if i < 0 or i >= sold.size():
		return "Nothing there"
	var it: Dictionary = sold[i]
	var price := sell_value(it)
	if gold < price:
		return "Not enough gold"
	if bag.size() >= BAG:
		return "Bag is full"
	gold -= price
	bag.append(it)
	sold.remove_at(i)
	sfx.play("coin", -4.0)
	return ""


# --- THE WORDSMITH'S TRADE IN WORDS (game.ts rollShop's lot of words, wordPrice, wordSellValue, buyWord, sellWord, buyBackWord;
# defs.ts TUNE.wordStock and the rest): on each coming into town, his shelf: TUNE.wordStock words, no two the same, drawn from the
# words found at the depth of the floor he has come from (types.ts wordsAt) by a lot of their own, the game's own sequence for the
# game's seed (the one the floors were taken with), so that the same run at the same point has the same shelf. One costs
# TUNE.wordPrice gold for each floor cleared so far (never less than one floor's worth); he pays TUNE.wordSellRate of that for a
# spare word, and keeps the last TUNE.wordsSoldKept sold to him on this visit to be had back for what he paid. ---

## (the game's seed the floors were taken with: tools/godot_export.ts 1 <depth>)
const GAME_SEED := 1
## (the game's own refusal while his ring is dark: game.ts DARK_RING)
const DARK_RING := "The runes are dark"
## His shelf on this visit: a word, or null where one has been bought (its place stays, "SOLD"). What he has been sold, oldest first.
var word_stock: Array = []
var words_sold: Array = []


## Math.imul: the low 32 bits of a x b, as a signed number (the halves kept apart, so that nothing overflows).
static func imul(a: int, b: int) -> int:
	a &= 0xffffffff
	b &= 0xffffffff
	var lo := (a & 0xffff) * (b & 0xffff)
	var mid := (((a >> 16) * (b & 0xffff) + (a & 0xffff) * (b >> 16)) & 0xffff) << 16
	var r := (lo + mid) & 0xffffffff
	return r - 0x100000000 if r >= 0x80000000 else r


## The game's RNG (engine/rng.ts, mulberry32): `s` its state; the next float in [0, 1).
static func mulberry(st: Array) -> float:
	st[0] = (int(st[0]) + 0x6d2b79f5) & 0xffffffff
	var t: int = st[0]
	t = imul(t ^ (t >> 15), t | 1) & 0xffffffff
	t = (t ^ ((t + (imul(t ^ (t >> 7), t | 61) & 0xffffffff)) & 0xffffffff)) & 0xffffffff
	return float((t ^ (t >> 14)) & 0xffffffff) / 4294967296.0


## His shelf for this visit, he having come from floor `depth` (game.ts rollShop): and nobody has anything of his yet.
func roll_word_stock(depth: int) -> void:
	var st := [((imul(GAME_SEED, 69069) ^ (depth * 7919 + cleared * 104729 + 0x57a1)) & 0xffffffff)]
	if st[0] == 0:
		st[0] = 0x9e3779b9
	var pool: Array = (_words["at"].get(str(clampi(depth, 1, 10)), [_words["first"]]) as Array).duplicate()
	word_stock = []
	while word_stock.size() < int(_tune["wordStock"]) and not pool.is_empty():
		var hi := pool.size() - 1
		var k := int(floorf(mulberry(st) * (hi + 1)))
		word_stock.append(pool[k])
		pool.remove_at(k)
	words_sold = []
	# (and what was sold to the vendors is theirs for good once he has gone: game.ts `sold`, a visit's)
	sold = []
	# (and the stranger has thrown nothing for him yet on this visit: game.ts rollShop, `won`)
	won = -1


## What one of his words costs on this visit (game.ts wordPrice).
func word_price() -> int:
	return int(_tune["wordPrice"]) * maxi(1, cleared)


## What he pays for a word (game.ts wordSellValue).
func word_sell_value() -> int:
	return maxi(1, floori(word_price() * float(_tune["wordSellRate"])))


## The word in place `i` of his shelf bought: it joins his spare words. "" or why not, in the game's own words.
func buy_word(i: int) -> String:
	if not ring_lit:
		return DARK_RING
	if i < 0 or i >= word_stock.size() or word_stock[i] == null:
		return "Sold"
	var price := word_price()
	if gold < price:
		return "Not enough gold"
	var w: String = word_stock[i]
	gold -= price
	words[w] = int(words.get(w, 0)) + 1
	word_stock[i] = null
	sfx.play("word")
	return ""


## A spare word sold him: he keeps it for the rest of this visit (the oldest of more than he keeps goes for good).
func sell_word(w: String) -> String:
	if not ring_lit:
		return DARK_RING
	if int(words.get(w, 0)) <= 0:
		return "No spare word"
	words[w] = int(words[w]) - 1
	gold += word_sell_value()
	words_sold.append(w)
	if words_sold.size() > int(_tune["wordsSoldKept"]):
		words_sold.remove_at(0)
	sfx.play("gold")
	return ""


## Word `i` of those sold him on this visit taken back, for what he paid for it.
func buy_back_word(i: int) -> String:
	if not ring_lit:
		return DARK_RING
	if i < 0 or i >= words_sold.size():
		return "Nothing there"
	var price := word_sell_value()
	if gold < price:
		return "Not enough gold"
	var w: String = words_sold[i]
	gold -= price
	words[w] = int(words.get(w, 0)) + 1
	words_sold.remove_at(i)
	sfx.play("word")
	return ""


## (render.ts labels) The names of the pieces lying about, the lowest on the screen first, each moved up 8 game pixels at a
## time (at most 12 times) while it would lie over one already placed.
func _lay_tags() -> void:
	var tags: Array = []
	for d in _drops:
		if d.has("tag") and is_instance_valid(d["tag"]) and is_instance_valid(d["node"]):
			tags.append(d)
	if tags.size() < 2:
		for d in tags:
			d["tag"].position.y = 0.0
		return
	tags.sort_custom(func(a, b): return a["node"].position.y > b["node"].position.y)
	var placed: Array = []
	for d in tags:
		var tag: Node2D = d["tag"]
		var at: Vector2 = d["node"].position / 2.0
		var w := _Tag.PF.width(tag.text, "small") + 4.0
		var x := roundf(at.x - w / 2.0)
		var y0 := roundf(at.y - 20.0)
		var y := y0
		for tries in 12:
			var hit := false
			for p in placed:
				if absf(p.y - y) < 8.0 and x < p.x + p.z and p.x < x + w:
					hit = true
					break
			if not hit:
				break
			y -= 8.0
		placed.append(Vector3(x, y, w))
		tag.position.y = (y - y0) * 2.0


## A piece's name over it as it lies on the floor (render.ts labels): in the small letters on a dark strip, 20 game pixels up,
## in its rarity's colour, over the dark.
class _Tag extends Node2D:
	const PF := preload("res://scripts/pixel_font.gd")
	var text := ""
	var color := Color.WHITE
	## (how high over the floor point it hangs, game pixels: a piece's 20, a royal's card's 14)
	var up := 20.0

	func _draw() -> void:
		draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
		var t := text if text.length() <= 30 else text.substr(0, 29) + "."
		var w := PF.width(t, "small") + 4.0
		var x := roundf(-w / 2.0)
		var y := -up
		draw_rect(Rect2(x, y - 1.0, w, 7.0), Color(Color("#07050a"), 0.78))
		PF.draw(self, t, x + 2.0, y, color, {"font": "small"})


## A WORD LYING ON THE FLOOR (render.ts: the drops, and drawWordDrops): its rune stone, hopping up as it lands (9 game
## pixels over 0.4 s) and bobbing where it hangs; over everything, a shaft of its own light 50 tall that grows in 0.35 s
## and flickers, and its name on a plate above it, in its colour, that can be read from across the room.
class _WordDrop extends Node2D:
	var sheet: Texture2D
	var src := Rect2()
	var anchor := Vector2.ZERO
	var color := Color.WHITE
	var title := ""
	var phase := 0.0
	var age := 0.0
	var clock := 0.0
	var _light

	func _ready() -> void:
		_light = _WordLight.new()
		_light.drop = self
		_light.z_index = 60
		add_child(_light)

	func _process(dt: float) -> void:
		age += dt
		clock += dt
		queue_redraw()
		_light.queue_redraw()

	func _draw() -> void:
		var pop := sin(age / 0.4 * PI) * 9.0 if age < 0.4 else 0.0
		var bob := sin(clock * 4.0 + phase) * 1.5 + 3.0
		draw_texture_rect_region(sheet, Rect2(-anchor + Vector2(0, roundf(-(pop + bob) * 2.0)), src.size), src)


## (the shaft of light a word on the floor stands in, and its name on its plate: over everything, in game pixels)
class _WordLight extends Node2D:
	const PF := preload("res://scripts/pixel_font.gd")
	var drop

	func _draw() -> void:
		draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
		var grow := minf(1.0, maxf(0.0, drop.age) / 0.35)
		var t: float = drop.clock + drop.phase
		var i := 0.0
		while i < 50.0 * grow:
			var k := 1.0 - i / 50.0
			draw_rect(Rect2(-3, -8 - i, 7, 2), Color(drop.color, 0.32 * k * (0.8 + 0.2 * sin(t * 9.0 + i * 0.4))))
			draw_rect(Rect2(0, -8 - i, 1, 2), Color(1, 1, 1, 0.55 * k))
			i += 2.0
		var tw: float = PF.width(drop.title)
		var px := -floorf(tw / 2.0) - 4.0
		var py := -42.0 + roundf(sin(drop.clock * 3.0 + drop.phase) * 1.5) - roundf((1.0 - grow) * 8.0)
		draw_rect(Rect2(px, py, tw + 8.0, 13.0), drop.color)
		draw_rect(Rect2(px + 1.0, py + 1.0, tw + 6.0, 11.0), Color("#1b1622"))
		PF.draw(self, drop.title, px + 4.0, py + 3.0, drop.color)


## ONE OF THE GAME'S OWN PICTURES OF A FILM (assets/fx: tools/godot_fx.ts; perils.gd holds the sheets), stood among the figures:
## the Meldstone's (here), the town's gate's (town.gd).
class _FilmPic extends Node2D:
	const Perils := preload("res://scripts/perils.gd")
	var _s := Sprite2D.new()

	func _init() -> void:
		_s.centered = false
		_s.region_enabled = true
		add_child(_s)

	## Picture `i` of the film `name` (its `stand` layer), its floor point at `at` (picture pixels), sorted at depth `d`, drawn
	## `up` picture pixels over it, `scale` times its size about that point (render.ts stand), `alpha` as strong. False, and
	## hidden, where the film or the picture is not there.
	func put(name: String, i: int, at: Vector2, d: float, up := 0.0, scale := 1.0, alpha := 1.0) -> bool:
		var F = Perils._fx.get("films", {}).get(name)
		var L: Array = F["layers"].get("stand", []) if F != null else []
		visible = i >= 0 and i < L.size() and int(L[i]) >= 0 and alpha > 0.0
		if not visible:
			return false
		var q: Array = Perils._fx["pics"][int(L[i])]
		position = Vector2(at.x, d * 16.0)
		_s.texture = Perils._sheet(int(q[0]))
		_s.region_rect = Rect2(q[1], q[2], q[3], q[4])
		_s.offset = Vector2(q[5], q[6])
		_s.position = Vector2(0.0, at.y - up - d * 16.0)
		_s.scale = Vector2(scale, scale)
		_s.modulate.a = alpha
		return true


# --- THE STRANGER'S GAMBLE (ui/trades.ts gambleSide; game.ts gambleKinds, gamblePrice, gamble; defs.ts TUNE.gambleMult,
# gambleOdds): the kinds of piece he throws for (tools/godot_loot.ts `gamble`), a throw for one costing so many times a plain
# piece of that kind at the vendors' as he comes up from his floor; paid, a piece of that kind: plain most often, magic
# sometimes, now and then rare (the game's own odds), one the game itself rolled for that kind, quality and floor. (Its very
# rare unique, gambleOdds.unique: the uniques are not in the Godot version.) ---

var _gamble := {}
## (the stranger's pieces at the floor he came up from, read when he throws: gamble/<d>.json; `_gamble_at` that floor)
var _gamble_held: Array = []
var _gamble_at := -1
## (where in the bag the piece the last throw brought lies; -1: nothing thrown for on this visit)
var won := -1


func gamble_kinds() -> Array:
	return _gamble.get("kinds", [])


## (the floor he came up from: game.ts `power`, his depth while he is in town)
func _town_power() -> int:
	# (ENDLESS MODE: once its levels are open to him, what the vendors have grows on with the one he has reached: game.ts power)
	if main != null and int(main.endless) > 0:
		return 20
	return clampi(int(main.last_floor) if main != null else 1, 1, 20)


func _gamble_pieces() -> Array:
	var d := _town_power()
	if d != _gamble_at:
		_gamble_held = JSON.parse_string(FileAccess.get_file_as_string(DIR + "/gamble/%d.json" % d))
		_gamble_at = d
	return _gamble_held


func gamble_price(k: int) -> int:
	var row: Array = _gamble["price"][str(_town_power())]
	return int(row[k]) if k >= 0 and k < row.size() else 0


## Why a throw for kind `k` cannot be made just now, or "" (ui/trades.ts problem).
func gamble_problem(k: int) -> String:
	if gold < gamble_price(k):
		return "Not enough gold"
	if bag.size() >= BAG:
		return "Bag is full"
	return ""


## A throw for kind `k`: "" or why not, in the game's own words.
func gamble(k: int) -> String:
	if k < 0 or k >= gamble_kinds().size():
		return "Nothing there"
	var price := gamble_price(k)
	if gold < price:
		return "Not enough gold"
	if bag.size() >= BAG:
		return "Bag is full"
	var odds: Dictionary = _tune["gambleOdds"]
	var roll := randf()
	var rarity := 2 if roll < float(odds["rare"]) else (1 if roll < float(odds["rare"]) + float(odds["magic"]) else 0)
	var pool: Array = _gamble_pieces()[k][rarity]
	# (UNIQUE ITEMS: his "very low chance to give a unique", TUNE.gambleOdds.unique: one of the pool's of the kind gambled for, if
	# there is one for him; a dice of its own)
	var kind: Dictionary = gamble_kinds()[k]
	var unique = null
	if not _uniques.is_empty() and randf() < float(odds.get("unique", 0.0)):
		unique = make_pool_unique(str(kind["slot"]), str(kind.get("weapon", "")) if kind["slot"] == "mainhand" and kind.get("weapon") != null else "")
	var it: Dictionary = unique if unique != null else for_him(pool[randi() % pool.size()].duplicate(true))
	gold -= price
	bag.append(it)
	won = bag.size() - 1
	sfx.play("rare" if rarity >= 2 or unique != null else "buy")
	return ""


# --- THE STASH (ui/town.ts stashSide; game.ts stashItem, unstashItem; defs.ts TUNE.stashSize): pieces put away out of the bag
# and taken out again, TUNE.stashSize places. In the game it outlasts the character (meta.stash); the Godot version keeps no
# saved game yet, so here it lasts as long as the game is open. ---

var stash: Array = []


func stash_item(i: int) -> String:
	if i < 0 or i >= bag.size():
		return "Nothing there"
	var free := stash.find(null)
	if free < 0:
		return "Stash is full"
	stash[free] = bag[i]
	bag.remove_at(i)
	sfx.play("equip")
	return ""


func unstash_item(i: int) -> String:
	if i < 0 or i >= stash.size() or stash[i] == null:
		return "Nothing there"
	if bag.size() >= BAG:
		return "Bag is full"
	bag.append(stash[i])
	stash[i] = null
	sfx.play("equip")
	return ""


# --- THE LEXICON'S SHELF (ui/lexicon.ts lexiconSide; game.ts keepCost, depositWord, withdrawWord): a spare word kept in the book,
# for gold, for his next character: TUNE.keepCost, doubled for each word kept there already; taken out again for nothing. Like
# the stash, the game keeps it past the character (meta.lexicon); here, as long as the game is open. ---

## (how many of each word are kept in the book)
var lexicon := {}


func keep_cost() -> int:
	var kept := 0
	for w in lexicon:
		kept += int(lexicon[w])
	return int(_tune["keepCost"]) * int(pow(2, mini(20, kept)))


func deposit_word(w: String) -> String:
	if int(words.get(w, 0)) <= 0:
		return "No spare word"
	if Words.is_meld(w):
		return "The Lexicon keeps no melded word"
	if Words.is_rank(w):
		return "The Lexicon keeps no ranked word"
	var cost := keep_cost()
	if gold < cost:
		return "Needs %d gold" % cost
	gold -= cost
	words[w] = int(words[w]) - 1
	lexicon[w] = int(lexicon.get(w, 0)) + 1
	sfx.play("word")
	return ""


func withdraw_word(w: String) -> String:
	if int(lexicon.get(w, 0)) <= 0:
		return "None in the Lexicon"
	lexicon[w] = int(lexicon[w]) - 1
	if int(lexicon[w]) <= 0:
		lexicon.erase(w)
	words[w] = int(words.get(w, 0)) + 1
	_know(w)["found"] = true
	sfx.play("word")
	return ""



# =====================================================================================================================
# THE ROYAL CARDS (game/royal_cards.ts; act3/royal_cards.gd): a royal's card dropped, taken, and hands handed in to the stranger.

const RoyalCards := preload("res://scripts/act3/royal_cards.gd")


## ONE CARD A PACK (his words, 23 Nov 2026: “we want the royal card to only drop one card per pack of monsters”): a pack a royal
## touched drops its one card as the last of it falls, not one from each. Off: one from each, as the browser game.
static var ROYAL_ONE_A_PACK := true


## Whether `m` is the last of its pack a royal touched still standing (one alone is its own pack).
func _last_of_pack(m) -> bool:
	if int(m.pack_id) < 0 or main == null or main._monsters == null:
		return true
	for o in main._monsters.list:
		if is_instance_valid(o) and o != m and not o.dead and int(o.pack_id) == int(m.pack_id) and str(o.royal) == str(m.royal):
			return false
	return true


## Whether this floor's packs may be touched by the royals: a floor of the High City (royalFloor).
func royal_floor() -> bool:
	if map == null or main == null or main.is_home(main.place):
		return false
	# (ENDLESS ANY LEVEL: an endless level of any floor may have royals' packs: main.gd royal_packs)
	return (int(map.depth) >= 16 and int(map.depth) <= 20) or bool(main.get("in_endless"))


## A royal's card lying face up where a touched one died (render.ts: the card, popping up as it lands; named in its royal's colour,
## render/royal_cards.ts royalLabelColor).
func _card(at: Vector2, r: String) -> void:
	if not pics.has("card:" + r):
		return
	var p := _scatter(at)
	_drop("card", p, "card:" + r, {"royal": r})
	var d: Dictionary = _drops[-1]
	var tag := _Tag.new()
	tag.text = "The %s's card" % royal["names"][r]["one"]
	tag.color = Color(royal["label"][r])
	tag.up = 14.0
	tag.z_index = 60
	d["node"].add_child(tag)
	d["tag"] = tag
	var pop := _CardPop.new()
	pop.pic = d["node"].get_child(0)
	d["node"].add_child(pop)


## (the card hopping up as it lands, 9 game pixels over 0.4 s: render.ts `pop`)
class _CardPop extends Node:
	var pic: Sprite2D
	var age := 0.0
	var base := 0.0

	func _ready() -> void:
		base = pic.position.y

	func _process(dt: float) -> void:
		age += dt
		var pop := sin(age / 0.4 * PI) * 9.0 if age < 0.4 else 0.0
		pic.position.y = base - roundf(pop) * 2.0
		if age >= 0.4:
			set_process(false)


## A royal's card walked over: his for good, for the stranger's hands (game.ts updateDrops, `card`).
func _card_taken(r: String, at: Vector2) -> void:
	cards[r] = int(cards.get(r, 0)) + 1
	if main != null and main.fx != null:
		main.fx.event({"t": "cardGot", "royal": r, "x": at.x, "y": at.y})
		main.fx.event({"t": "text", "x": hero.world.x, "y": hero.world.y, "text": "THE %s'S CARD" % str(royal["names"][r]["one"]).to_upper(), "color": "#e8dcc0"})
	sfx.play("word", linear_to_db(0.6))


## Every hand his cards make, best first (handsFrom).
func hands() -> Array:
	return RoyalCards.hands_from(cards)


## Why hand `h` cannot be handed in just now, or "" (ui/royal_cards.ts problem).
func hand_problem(h: Dictionary) -> String:
	var n: int = RoyalCards.hand_pays(h)["n"]
	var free := BAG - bag.size()
	if free < n:
		return "Bag is full" if n == 1 else "Bag needs %d free places" % n
	return ""


## THE ROYAL CARDS (game.ts handInCards): hand `h` in to the stranger, in town: its cards are his no more, and what it pays is in his
## bag: so many pieces of that rarity (rolled by the game's own rollItem: items.json royal.pieces), so many levels over what the
## stranger throws for. "" if it was handed in; else why not.
func hand_in(h: Dictionary) -> String:
	if main == null or not main.is_home(main.place):
		return "Only in town"
	if not RoyalCards.can_make(cards, h):
		return "You do not hold that hand"
	var pays := RoyalCards.hand_pays(h)
	var n: int = pays["n"]
	if BAG - bag.size() < n:
		return "Bag is full" if n == 1 else "Bag needs %d free places" % n
	for r in RoyalCards.hand_cards(h):
		cards[r] = int(cards.get(r, 0)) - 1
	for r in RoyalCards.ROYALS:
		if int(cards.get(r, 0)) <= 0:
			cards.erase(r)
	won_hand = []
	var lv := clampi(_town_power() + int(pays["plus"]), 1, 25)
	var pool: Array = royal["pieces"][str(lv)][str(int(pays["rarity"]))]
	for k in n:
		var it: Dictionary = pool[randi() % pool.size()].duplicate(true)
		bag.append(it)
		won_hand.append(bag.size() - 1)
	sfx.play("rare" if int(pays["rarity"]) >= 2 else "buy")
	return ""
