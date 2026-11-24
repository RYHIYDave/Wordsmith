## THE UNIQUE WEAPONS DRAWN AS THEMSELVES (art/heroes.ts wornSkin; the switches STAFF_SKINS, BOW_SKINS, WRENCH_SKINS, WARRIOR_SKINS,
## WRAP_SKINS and TOME_SKINS, all on at his yes, 14 and 15 Nov 2026, each shown him in the game first): a hero holding one of the
## unique weapons below is drawn holding it, his pictures that weapon's own group of the bake (`<class>-<skin>`, render/baked.ts
## bakeGroups; tools/godot_heroes.mjs), its places `<skin>` in a dungeon and `<skin>Town` in town (the Warlock's `<skin>Blaze` too,
## his arm blazing; his demon a group of its own, `warlock-demon`, whatever book he wears). The Warrior's only when it is of the kind
## he is drawn with: a great sword's while his tree has not given him the war axe or the maul, an axe's or a hammer's once it has.
extends RefCounted

## (art/heroes.ts STAFF_OF_UNIQUE, BOW_OF_UNIQUE, WRENCH_OF_UNIQUE, WRAP_OF_UNIQUE, TOME_OF_UNIQUE: the unique's id, the skin it is)
const OF_UNIQUE := {
	"mage": {"shepherdscrook": "crook", "tide": "ebb", "tuningstaff": "resonance", "kindlingrod": "rod"},
	"ranger": {"rainwalker": "rainwalker", "fan": "threefold", "poachersbow": "poachers", "fledgling": "fledgling"},
	"tinkerer": {"secondwhistle": "secondwhistle", "stickywrench": "stickywrench", "foremanswrench": "foremanswrench", "borrowedspanner": "borrowedspanner"},
	"brawler": {"lastround": "lastround", "fourthglobe": "fourthglobe", "winningstreak": "winningstreak", "tapedknuckles": "tapedknuckles"},
	"warlock": {"ledgerofdebts": "ledgerofdebts", "restlesstome": "restlesstome", "burningverse": "burningverse", "hornbook": "hornbook"},
}
## (art/heroes.ts WARRIOR_SKIN_KIND: each of his is a skin of his great sword (""), the war axe or the maul)
const WARRIOR_KIND := {
	"millstone": "", "windcutter": "", "undertow": "",
	# (FIFTEEN MORE LEVELING UNIQUES: the Barn Door, level 5; his word, 24 Nov 2026: “A unique weapon needs a skin to go on the
	# Warrior if he equips it.”; art/sword_skins.ts BARNDOOR_SWORD, baked alone: tools/bake_one_group.mjs warrior-barndoor)
	"barndoor": "",
	"gyre": "axe", "redtithe": "axe", "widowfall": "axe", "rotaxe": "axe",
	"deathknell": "hammer", "deadweight": "hammer", "starbreaker": "hammer",
}


## The skin a hero of `cls` holding `item` is drawn with, if any: {group, dungeon, town, blaze}; `arms`: the Warrior's war axe or
## maul ("axe", "hammer"), "" for his great sword.
static func worn(cls: String, item, arms := "") -> Dictionary:
	if item == null or not (item is Dictionary) or int(item.get("rarity", 0)) != 3 or str(item.get("unique", "")) == "":
		return {}
	var u := str(item["unique"])
	var id := ""
	if cls == "warrior":
		if WARRIOR_KIND.has(u) and WARRIOR_KIND[u] == arms:
			id = u
	elif OF_UNIQUE.has(cls):
		id = str(OF_UNIQUE[cls].get(u, ""))
	if id == "":
		return {}
	return {"group": "%s-%s" % [cls, id], "dungeon": id, "town": id + "Town", "blaze": id + "Blaze"}
