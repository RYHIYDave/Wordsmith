## THE SKILL TREES (game/talents.ts; tools/godot_talents.ts -> assets/talents.json): each class's tree of talents, a point to
## spend on one every TALENT_EVERY levels (5), TALENT_MAX (10) in all. A talent is open where the tree begins (none before it), or
## once one JOINED TO IT BY A LINE is his, the one before it or one after it (BOTH_WAYS, his “Every tree, both ways
## (Recommended)”). THE WARRIOR'S THREE WEAPONS (WARRIOR_TREE2): his first point picks the greatsword, the battle axe or the
## warhammer, only one, each with its own three moves; a weapon's own path is that weapon's alone; IRON opens once one is his.
## Undone in town only, for gold (unlearnPerLevel a level), and only when nothing taken hangs on it alone.
## THE WARRIOR'S WEAPON, A PRE-POINT (his words of 22 Nov 2026: “The warrior has an issue where he starts with the greatsword but
## would have to pay a talent point to select greatsword.  So maybe he can swap to axe or hammer at level 1.”; and the morning
## after, “No I mean I don't like the trees starting with a weapon swap.  I want the swap to be available but not be part of the
## talent tree pathing.  Like it's a pre-point, something that can be allocated in the talent tree area but before you get into an
## actual branch”): his weapon is no talent of the tree: picked on the TALENTS page in a row of its own under the tree, before any
## branch (talents_page.gd), the greatsword his as he starts (`starting`), another in its place at any level, anywhere, for nothing,
## so long as nothing more on the old one's path is taken (`swap_out`). It costs no point (`spent`): his ten go on the tree's own,
## the first at level 5, as every hero's; each weapon's path begins at its own first talents, open once it is his weapon.
## IN THIS PORT: a talent whose rules are not brought over yet (PORTED) is shown, read and marked so, and cannot be taken.
extends RefCounted

const PATH := "res://assets/talents.json"
static var D := {}

## The talents whose rules this port has (by class): the rest are shown and read, marked NOT IN THE PORT YET, and cannot be
## taken. (The greatsword is the Warrior's weapon as he starts. His hold is WHIRL, one spin, and the WHIRLWIND talent makes it the
## Whirlwind, more spins, each for less: his word of 22 Nov 2026, “The warrior should start with WHIRL which 1 spin and does more
## damage in an AoE around him than a single strike.  Whirlwind should then be the talent point that decreases the damage but
## adds the channel effect for more spins.”: hero.gd arm. The battle axe and the warhammer bring their own three moves and
## pictures: hero.gd arm, heroes/warrior_arms.gd.)
const PORTED := {
	"warrior": ["greatsword", "gswhirlwind", "sweepingcut", "drilledleap", "footwork", "thickskin", "shieldwall", "secondwind", "bulwark",
		"honededge", "giantslayer", "resolute", "executioner", "mastertop", "unbreakable",
		"battleaxe", "twinaxes", "rend", "redmist", "headlong", "warhammer", "tremors", "heavyhead", "bulldozer", "wideswing"],
	"ranger": ["fleet", "windrunner", "keeneye", "steadyaim", "quickdraw", "longshot", "lightstep", "huntersmark", "widetraps",
		"minefield", "splitshot", "hail", "piercing", "farsight", "venom", "snare", "snipe", "rally",
		"huntcompanion", "wildcompanion"],
	"mage": ["kindling", "searing", "flamewarp", "fuel", "inferno", "charged", "forking", "stormwarp", "overload", "stormcaller",
		"bittercold", "deepfreeze", "frostwarp", "rime", "shatter", "aura", "lasting", "ball", "beam", "spear"],
	"warlock": ["hunger", "feast", "bloodlust", "branded", "hexchain", "phantomstep", "withering", "pyre", "blazingarm", "souldebt",
		"lastrites", "terribleroar", "hellwave", "damnedsouls", "bounddemon"],
	"tinkerer": ["bombsaway", "fortune", "clustervials", "tar", "madmixture", "alchemy", "thebigone", "lightningrod", "shrapnel",
		"prospector", "overdrive", "markii", "growthserum", "gunarm", "contraptions"],
	"brawler": ["vstiffjab", "vviperjab", "vguardup", "vknockdown", "vlauncher", "vlightfeet", "vfirestarter", "vstoke", "vhangtime",
		"vfullset", "vswitchkick", "vlonglegs", "vwallslam", "vaftershock", "vthunderknee"],
}


static func ready_up() -> void:
	if D.is_empty():
		D = JSON.parse_string(FileAccess.get_file_as_string(PATH))
		_own_words()
		_twigs()


## THE ATTACKS CHANGED, A TWIG EACH (his word of 22 Nov 2026: “the different weapon attacks are choices not mandatory in the
## tree.  So swapping from whirl to whirlwind should be a small beach off the main tree.  Etc”; and, asked whether the other
## classes' should be so, “Yes other tree options of attack swapping should all be their own branch off the main paths”): every
## talent that swaps one attack for another is a small stone on a short twig off its own path, reached from it and leading
## nowhere, to take or leave; no path runs through it. THE WARRIOR: Whirlwind (Whirl made the Whirlwind) off Sweeping Cut, Twin
## Axes off Rend, Tremors off Heavy Head. THE RANGER: Snare (for Shot) off Wide Traps, Snipe (for Volley) off Split Shot, Rally
## (for Volley) off Wild Companion. THE MAGE: Ball, Beam and Spear off the first talents of fire, lightning and frost. THE
## TINKERER: Contraption (for the Vial Toss) off Cluster Vials, the first of her vials; Gun Arm (the Golem's cannon for the tesla
## coil) off Lightning Rod, the first of her Golem's; the Contraption no longer a way from Fortune to Mad Mixture, and MARK II
## (which hung off Gun Arm) in Gun Arm's place on the Golem's ring (RELINK).
const TWIGS := {
	"warrior": {
		"gswhirlwind": {"from": "sweepingcut", "at": [2.62, 2.95]},
		"twinaxes": {"from": "rend", "at": [0.62, 2.95]},
		"tremors": {"from": "heavyhead", "at": [4.62, 2.95]},
	},
	"ranger": {
		"snare": {"from": "widetraps", "at": [6.55, -0.05]},
		"snipe": {"from": "splitshot", "at": [6.55, 4.05]},
		"rally": {"from": "wildcompanion", "at": [2.25, 0.3]},
	},
	"mage": {
		"ball": {"from": "kindling", "at": [1.35, -0.6]},
		"beam": {"from": "charged", "at": [1.35, 1.4]},
		"spear": {"from": "bittercold", "at": [1.35, 4.6]},
	},
	"tinkerer": {
		"contraptions": {"from": "clustervials", "at": [-1.15, -0.6]},
		"gunarm": {"from": "lightningrod", "at": [-1.15, 0.6]},
	},
}
const RELINK := {
	"tinkerer": {
		"markii": {"at": [0, 2], "from": ["shrapnel"], "joined": ["shrapnel", "prospector"]},
		"shrapnel": {"joined": ["lightningrod", "markii"]},
		"prospector": {"from": ["markii"], "joined": ["markii", "overdrive"]},
	},
}


static func _twigs() -> void:
	for cls in TWIGS:
		if not D["trees"].has(cls) or (cls == "warrior" and not D["switches"]["warriorTree2"]):
			continue
		var all: Array = D["trees"][cls]["talents"]
		var by := {}
		for t in all:
			by[t["id"]] = t
		for id in TWIGS[cls]:
			if not by.has(id):
				continue
			var main: String = TWIGS[cls][id]["from"]
			for o in all:
				if o["id"] != id:
					(o["from"] as Array).erase(id)
					(o["joined"] as Array).erase(id)
			var t: Dictionary = by[id]
			t["from"] = [main]
			t["joined"] = [main]
			t["at"] = TWIGS[cls][id]["at"]
			t["big"] = false
			by[main]["joined"].append(id)
		for id in RELINK.get(cls, {}):
			for k in RELINK[cls][id]:
				by[id][k] = (RELINK[cls][id][k] as Array).duplicate()


## THE CARDS THIS PORT WORDS ITS OWN WAY (his word of 21 Nov 2026: the Tinkerer's Golem only shoots, small shots, its big shot on
## her whistle in place of its ground pound; the Gun Arm swaps its cannon for the tesla coil, no pick: “we can keep the tesla coil
## for now, but i feel like it will need to be changed in the future”).
const OWN_WORDS := {
	"tinkerer": {
		"gunarm": "Her Golem's cannon is swapped for a tesla coil (Int): every second it zaps the enemy nearest it, leaping on to two more. Her hold charges a beam.",
		"lightningrod": "For three seconds after its big shot, every enemy near the Golem goes after it instead of her.",
		"shrapnel": "The Golem's shots burst where they land, striking everything near.",
		"prospector": "Every big shot of the Golem's digs up a handful of gold where it lands.",
	},
}


static func _own_words() -> void:
	for cls in OWN_WORDS:
		for t in D["trees"][cls]["talents"]:
			if OWN_WORDS[cls].has(t["id"]):
				t["text"] = OWN_WORDS[cls][t["id"]]
				if t["id"] == "gunarm":
					t["pick"] = null


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


## Whether `id` is one of the Warrior's three weapons (WARRIOR_TREE2 on).
static func is_weapon(cls: String, id: String) -> bool:
	ready_up()
	return cls == "warrior" and D["switches"]["warriorTree2"] and _weapons().has(id)


## The points spent: his weapon none of them (a pre-point, not a talent).
static func spent(cls: String, taken: Array) -> int:
	return taken.filter(func(x): return not is_weapon(cls, str(x))).size()


## Whether `cls`'s tree has its weapons picked apart from it (the Warrior's, WARRIOR_TREE2 on).
static func pre_point(cls: String) -> bool:
	ready_up()
	return cls == "warrior" and D["switches"]["warriorTree2"]


## The level his next point to spend comes at, his points spent so far counted (the Warrior's weapon among them), or -1 when all
## are his.
static func next_point(cls: String, level: int, taken: Array) -> int:
	ready_up()
	var most: int = int(D["max"]) * int(D["every"])
	for l in range(level + 1, most + 1):
		if points(l) > spent(cls, taken):
			return l
	return -1


## A new hero's talents: the Warrior's greatsword his already (and, in the checks written for his Whirlwind before his Whirl was
## his again, its talent too: `checks_whirlwind`, main.gd, `--whirl1` for the one spin).
static var checks_whirlwind := false
static func starting(cls: String) -> Array:
	ready_up()
	if cls != "warrior" or not D["switches"]["warriorTree2"]:
		return []
	return ["greatsword", "gswhirlwind"] if checks_whirlwind else ["greatsword"]


## The weapon taking weapon `id` lets go of ("" if none), or why it cannot yet ("!" and the reason): nothing more on its path.
static func swap_out(cls: String, taken: Array, id: String) -> String:
	if not is_weapon(cls, id):
		return ""
	for w in _weapons():
		if w == id or not taken.has(w):
			continue
		var path := ""
		for p in D["weapons"]["paths"]:
			if D["weapons"]["paths"][p] == w:
				path = p
		for x in taken:
			var t := of(cls, str(x))
			if str(x) != w and not t.is_empty() and t["path"] == path:
				return "!Undo the %s's talents first" % str(of(cls, w).get("name", w)).to_lower()
		return w
	return ""


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
	if not is_weapon(cls, id) and spent(cls, taken) >= points(level):
		var nx := next_point(cls, level, taken)
		return "No points left" if nx < 0 else "Next point at level %d" % nx
	if not _way_open(t, taken):
		return "Take one joined to it first"
	var out := swap_out(cls, taken, id)
	if out.begins_with("!"):
		return out.substr(1)
	if out == "" and _other_weapon(cls, id, taken):
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
	var swap_ok := is_weapon(cls, id) and not swap_out(cls, taken, id).begins_with("!")
	return not t.is_empty() and not taken.has(id) and _way_open(t, taken) and (swap_ok or not _other_weapon(cls, id, taken)) \
		and not _not_his_weapon(cls, t, taken) and not _waits_for_weapon(cls, t, taken)


## Why a taken talent cannot be undone (nothing else may hang on it alone), or "" (unlearnProblem).
static func unlearn_problem(cls: String, taken: Array, id: String) -> String:
	if not taken.has(id):
		return "Not taken"
	if is_weapon(cls, id):
		return "Take another to swap"
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
		return starting(cls)
	# (his weapon first, free; the greatsword if none was his)
	for id in list:
		if id is String and is_weapon(cls, id) and out.is_empty():
			out.append(id)
	if out.is_empty():
		out = starting(cls)
	for id in list:
		if id is String and not out.has(id) and take_problem(cls, level, out, id) == "":
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
