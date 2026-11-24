## THE DOOR WORDS: CHAINS, SIEGE, TOLL AND CROWN (his idea, 24 Nov 2026: “We have words for the 4 different encounters in levels
## (chained rare, strongholds, muffled bells, and cards).  If you put those words in the endless door, you get more encounters of
## that type.”; asked whether the words we have or new ones, his pick: “Four new door-only words”, “Like Greed: Chains, Siege, Toll
## and Crown. Each is only for the door: no monster carries it and it only brings more of its encounter.”). Each goes only into the
## Rim's door (no move, no piece of gear, no stronghold's altar takes it; it never melds), drops only on an endless level (the four
## sharing one rune's share of what drops there, loot.gd drops_at), and burned into the door, no monster of that level carries it
## and it drops no more often for it (loot.gd DOOR_WORDS), and that level holds more of its encounter:
##   CHAINS, the chained rares: twice as many (chained_rare.gd ENDLESS_N, 2 to 3, made 4 to 6).
##   SIEGE, the strongholds: twice as many: four of the cult's altar rooms where there would be two; on floors 6 to 10, whose own
##     strongholds stay as they are, two altar rooms beside them (act1/altar_rooms.gd, act1/quest610.gd).
##   TOLL, the Muffled Bells: on the level for sure (not one level in three, act2/bells_any.gd), and every bell rung calls its tough
##     ones twice over (act2/bells.gd _tough); on the city's floors, where the Bells ring for sure already, the tough ones twice.
##   CROWN, the royals' packs: on the level for sure (not one level in two) and twice as many of its packs touched by a royal (half,
##     not a quarter: main.gd royal_packs); on the High City's floors, whose own royals stay, a quarter more of its packs touched.
## ON: pictures first (their stones, docs/mockups/door_words/, https://claude.ai/artifact/QxnGXdmQm1j11rGyFaGCYe); ON at his pick,
## “Switch them on (Recommended)”, 24 Nov 2026.
extends RefCounted

const IDS := ["chains", "siege", "toll", "crown"]
static var ON := true
## (how many times as many chained rares, strongholds, royals' packs; the tough ones at each bell)
const MORE := 2
## (Crown on the High City's floors, their own royals kept: the share of the packs left that a royal touches)
const CROWN_OWN := 0.25
## (Siege on floors 6 to 10, their own strongholds kept: the altar rooms beside them)
const SIEGE_OWN := 2


static func is_door(w) -> bool:
	return w != null and IDS.has(str(w))


## The door words that can do anything now: Siege only while the altar rooms are laid (act1/altar_rooms.gd ON, pictures first):
## until then it neither drops nor is listed among the words to find, so none is found that does nothing.
static func live() -> Array:
	var rooms_on: bool = bool(load("res://scripts/act1/altar_rooms.gd").ON)
	return IDS.filter(func(w): return w != "siege" or rooms_on)


## How many times `w` is burned into the level he is on (main.gd dungeon_words): 0 or 1, as the door takes a word only once.
static func burned(main, w: String) -> int:
	if main == null or not bool(main.get("in_endless")):
		return 0
	var n := 0
	for o in main.dungeon_words:
		if str(o) == w:
			n += 1
	return n


## What it does burned in, as the Rim's door says it (inventory.gd, the gate's lines): `short` its line under its name there.
static func line(w: String, short := false) -> String:
	match w:
		"chains":
			return "Twice as many chained rares." if short else "Twice as many chained rares in it"
		"siege":
			return "Twice as many strongholds." if short else "Twice as many strongholds in it"
		"toll":
			return "The Muffled Bells for sure, twice the tough ones." if short else "The Muffled Bells in it for sure, and twice the tough ones at each bell"
		"crown":
			return "Royal packs for sure, twice as many." if short else "Royal packs in it for sure, and twice as many of them"
	return ""
