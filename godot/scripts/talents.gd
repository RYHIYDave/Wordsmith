## THE SKILL TREES (game/talents.ts; tools/godot_talents.ts -> assets/talents.json): each class's tree of talents, a point to
## spend on one every TALENT_EVERY levels (5), TALENT_MAX (10) in all. A talent is open where the tree begins (none before it), or
## once one JOINED TO IT BY A LINE is his, the one before it or one after it (BOTH_WAYS, his “Every tree, both ways
## (Recommended)”). THE WARRIOR'S THREE WEAPONS (WARRIOR_TREE2): his first point picks the greatsword, the battle axe or the
## warhammer, only one, each with its own three moves; a weapon's own path is that weapon's alone; IRON opens once one is his.
## Undone in town only, for gold (unlearnPerLevel a level), and only when nothing taken hangs on it alone.
## IN THIS PORT: a talent whose rules are not brought over yet (PORTED) is shown, read and marked so, and cannot be taken.
extends RefCounted

const PATH := "res://assets/talents.json"
static var D := {}

## The talents whose rules this port has (by class): the rest are shown and read, marked NOT IN THE PORT YET, and cannot be
## taken. (The greatsword is the Warrior's weapon as he starts: taking it changes nothing but opens his tree. His Whirlwind is
## his from the start in this port, at his pick of 14 Nov 2026, so the Whirlwind talent waits; and the battle axe's and the
## warhammer's moves are not here yet.)
const PORTED := {
	"warrior": ["greatsword", "sweepingcut", "drilledleap", "footwork", "thickskin", "shieldwall", "secondwind", "bulwark",
		"honededge", "giantslayer", "resolute", "executioner", "mastertop", "unbreakable"],
	"ranger": [],
	"mage": [],
	"warlock": [],
	"tinkerer": [],
	"brawler": [],
}


static func ready_up() -> void:
	if D.is_empty():
		D = JSON.parse_string(FileAccess.get_file_as_string(PATH))


static func tree(cls: String) -> Dictionary:
	ready_up()
	return D["trees"].get(cls, D["trees"]["warrior"])


static func of(cls: String, id: String) -> Dictionary:
	for t in tree(cls)["talents"]:
		if t["id"] == id:
			return t
	return {}


static func ported(cls: String, id: String) -> bool:
	return (PORTED.get(cls, []) as Array).has(id)


## How many points a hero of `level` has had in all (talentPoints).
static func points(level: int) -> int:
	ready_up()
	return mini(int(D["max"]), floori(level / float(D["every"])))


## The level his next point comes at, or -1 when all are his (nextTalentLevel).
static func next_level(level: int) -> int:
	var n := points(level)
	return -1 if n >= int(D["max"]) else (n + 1) * int(D["every"])


static func _way_open(t: Dictionary, taken: Array) -> bool:
	if (t["from"] as Array).is_empty():
		return true
	for f in t["joined"]:
		if taken.has(f):
			return true
	return false


static func _weapons() -> Array:
	return D["weapons"]["picks"]


static func _not_his_weapon(cls: String, t: Dictionary, taken: Array) -> bool:
	var w = D["weapons"]["paths"].get(t["path"])
	return cls == "warrior" and D["switches"]["warriorTree2"] and w != null and t["id"] != w and not taken.has(w)


static func _other_weapon(cls: String, id: String, taken: Array) -> bool:
	if cls != "warrior" or not D["switches"]["warriorTree2"] or not _weapons().has(id):
		return false
	for w in _weapons():
		if w != id and taken.has(w):
			return true
	return false


static func _waits_for_weapon(cls: String, t: Dictionary, taken: Array) -> bool:
	if cls != "warrior" or not D["switches"]["warriorTree2"] or t["path"] != "iron" or not (t["from"] as Array).is_empty():
		return false
	for w in _weapons():
		if taken.has(w):
			return false
	return true


## Why this talent cannot be taken now, or "" if it can (takeProblem; and here, one not in the port yet).
static func take_problem(cls: String, level: int, taken: Array, id: String) -> String:
	var t := of(cls, id)
	if t.is_empty():
		return "No such talent"
	if taken.has(id):
		return "Taken"
	if taken.size() >= points(level):
		var nx := next_level(level)
		return "No points left" if nx < 0 else "Next point at level %d" % nx
	if not _way_open(t, taken):
		return "Take one joined to it first"
	if _other_weapon(cls, id, taken):
		return "One weapon only"
	if _not_his_weapon(cls, t, taken):
		return "Not your weapon"
	if _waits_for_weapon(cls, t, taken):
		return "Pick your weapon first"
	if not ported(cls, id):
		return "Not in the port yet"
	return ""


## Whether it could be taken were there a point to spend (talentOpen).
static func open(cls: String, taken: Array, id: String) -> bool:
	var t := of(cls, id)
	return not t.is_empty() and not taken.has(id) and _way_open(t, taken) and not _other_weapon(cls, id, taken) and not _not_his_weapon(cls, t, taken) \
		and not _waits_for_weapon(cls, t, taken)


## Why a taken talent cannot be undone (nothing else may hang on it alone), or "" (unlearnProblem).
static func unlearn_problem(cls: String, taken: Array, id: String) -> String:
	if not taken.has(id):
		return "Not taken"
	var rest := taken.filter(func(x): return x != id)
	var reach := []
	for n in rest.size() + 1:
		for x in rest:
			var d := of(cls, x)
			if not d.is_empty() and not reach.has(x) and _way_open(d, reach) and not _not_his_weapon(cls, d, rest):
				reach.append(x)
	return "" if reach.size() == rest.size() else "Undo the ones after it first"


## What the taken talents add to his numbers (talentMods: only those that are numbers alone, none remade).
static func mods(cls: String, taken: Array) -> Array:
	var out := []
	for id in taken:
		var t := of(cls, id)
		if not t.is_empty():
			out.append_array(t["mods"])
	return out


## A taken list made safe (an old save, a damaged one): only this class's, each once, in an order that could be taken, no more
## than the level gives (cleanTalents).
static func clean(cls: String, level: int, list) -> Array:
	var out := []
	if not list is Array:
		return out
	for id in list:
		if id is String and take_problem(cls, level, out, id) == "":
			out.append(id)
	return out


## The price of undoing one now (unlearnPrice).
static func unlearn_price(level: int) -> int:
	ready_up()
	return int(D["unlearnPerLevel"]) * level


## His weapon by his tree (warriorWeapon): the greatsword till one is picked.
static func warrior_weapon(taken: Array) -> String:
	ready_up()
	for w in _weapons():
		if taken.has(w):
			return w
	return "greatsword"
