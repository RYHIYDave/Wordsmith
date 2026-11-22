## THE WORDS, HELD AGAINST THE GAME (the cloud chat, 15 Nov 2026). Run from the repository's root:
##   npx tsx tools/godot_words.ts check
##   godot --headless --path godot -s res://checks/words_check.gd
## The first writes assets/words/check.json: what the game's own resolveSkill makes of the Warrior's three moves with every
## word and pair of words in them, for four heroes (32163 loadouts, the sixteen words of floors 1 to 10; and, WORDMELDING, 27057
## more with the 28 words melding makes: 59220 in all), and what its sockets refuse (socketProblem). This reads
## it, resolves each with scripts/words.gd, and says how many differ, in a number, a name or a line of text: there must be
## none. (check.json is not kept in the repository: it is made when wanted.)
extends SceneTree

const Words := preload("res://scripts/words.gd")
const NUMBERS := {"dmgMult": "dmg_mult", "size": "size", "rate": "rate", "cooldown": "cooldown", "splash": "splash", "splashDmg": "splash_dmg",
	"projSpeed": "proj_speed",
	"ignite": "ignite", "chill": "chill", "arcs": "arcs", "arcDmg": "arc_dmg", "poison": "poison", "stun": "stun", "might": "might", "haste": "haste",
	"cloud": "cloud", "cracks": "cracks",
	# (floors 6 to 10's words)
	"count": "count", "countDmg": "count_dmg", "echo": "echo", "leech": "leech", "orbChance": "orb_chance", "volatile": "volatile", "rune": "rune",
	"shield": "shield", "ward": "ward", "last": "last", "pace": "pace", "boost": "boost", "vast": "vast", "wide": "wide",
	# (the High City's seven last words)
	"through": "through", "lance": "lance", "bleed": "bleed", "thorns": "thorns", "reap": "reap", "spirit": "spirit", "cull": "cull",
	"cullMark": "cull_mark", "surge": "surge", "dodgeSurge": "dodge_surge", "plunder": "plunder", "plunderBurst": "plunder_burst",
	"mirror": "mirror", "mirrorLeave": "mirror_leave"}
## (what is said yes or no: floors 6 to 10's Precise in front and behind, Frenzied in front and behind)
const FLAGS := {"precise": "precise", "mark": "mark", "frenzy": "frenzy", "frenzyFeed": "frenzy_feed"}


func _init() -> void:
	# (the game's own numbers: words that multiply, attributes in full, poison a share a second: words.gd WORDS_ADD, ATTR_CURVE,
	# POISON_SPREAD off)
	Words.WORDS_ADD = false
	Words.ATTR_CURVE = false
	Words.POISON_SPREAD = false
	Words.POISON_DEX = false
	Words.MELD_RANK2 = false
	Words.EVEN_BASE = false
	Words.ELEMENT_HIT = false
	Words.DEFENCE_WORDS = false
	var path := "res://assets/words/check.json"
	if not FileAccess.file_exists(path):
		print("WORDS CHECK: no check.json: run `npx tsx tools/godot_words.ts check` first")
		quit(1)
		return
	var c: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(path))
	var bad := 0
	var said := 0
	for row in c["rows"]:
		var got: Dictionary = Words.resolve(row["id"], row["front"], row["behind"], row["d"], row.get("cls", "warrior"))
		var want: Dictionary = row["r"]
		var why := ""
		for k in NUMBERS:
			if absf(float(got[NUMBERS[k]]) - float(want[k])) > 1e-9 * maxf(1.0, absf(float(want[k]))):
				why += " %s %s not %s;" % [k, got[NUMBERS[k]], want[k]]
		if got["name"] != want["name"]:
			why += " name '%s' not '%s';" % [got["name"], want["name"]]
		if got["element"] != want["element"]:
			why += " element %s not %s;" % [got["element"], want["element"]]
		if bool(got["pierce"]) != bool(want["pierce"]):
			why += " pierce;"
		for k in FLAGS:
			if bool(got[FLAGS[k]]) != bool(want[k]):
				why += " %s %s not %s;" % [k, got[FLAGS[k]], want[k]]
		# (WORDMELDING: the melded word in front and behind, whose twists the fight does)
		for k in {"meld": "meld", "meldBehind": "meld_behind"}:
			var mk: String = {"meld": "meld", "meldBehind": "meld_behind"}[k]
			if got[mk] != want.get(k):
				why += " %s %s not %s;" % [k, got[mk], want.get(k)]
		if (got["zone"] == null) != (want["zone"] == null):
			why += " zone there or not;"
		elif got["zone"] != null:
			for k in ["kind", "element"]:
				if got["zone"][k] != want["zone"][k]:
					why += " zone %s;" % k
			for k in ["dps", "slow", "dur"]:
				if absf(float(got["zone"][k]) - float(want["zone"][k])) > 1e-9:
					why += " zone %s %s not %s;" % [k, got["zone"][k], want["zone"][k]]
		if got["lines"] != want["lines"]:
			for i in maxi(got["lines"].size(), want["lines"].size()):
				var a: String = got["lines"][i] if i < got["lines"].size() else "(none)"
				var b: String = want["lines"][i] if i < want["lines"].size() else "(none)"
				if a != b:
					why += " line %d '%s' not '%s';" % [i, a, b]
		if why != "":
			bad += 1
			if said < 12:
				said += 1
				print("DIFFERS: %s %s | %s, str %s dex %s int %s:%s" % [row["id"], row["front"], row["behind"], row["d"]["str"], row["d"]["dex"], row["d"]["int"], why])
	var bad_sockets := 0
	for q in c["refused"]:
		var want_why: String = q["why"] if q["why"] != null else ""
		var got_why: String = Words.socket_problem(q["group"], q["word"], int(q["most"]))
		if got_why != want_why:
			bad_sockets += 1
			if said < 16:
				said += 1
				print("SOCKET DIFFERS: %s into %s (most %s): '%s' not '%s'" % [q["word"], q["group"], q["most"], got_why, want_why])
	print("WORDS CHECK: %d loadouts resolved, %d differ from the game; %d sockets asked, %d differ" % [c["rows"].size(), bad, c["refused"].size(), bad_sockets])
	quit(1 if bad + bad_sockets > 0 else 0)
