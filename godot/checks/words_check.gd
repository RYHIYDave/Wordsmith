## THE WORDS, HELD AGAINST THE GAME (the cloud chat, 15 Nov 2026). Run from the repository's root:
##   npx tsx tools/godot_words.ts check
##   godot --headless --path godot -s res://checks/words_check.gd
## The first writes assets/words/check.json: what the game's own resolveSkill makes of the Warrior's three moves with every
## word and pair of words in them, for four heroes (1671 loadouts), and what its sockets refuse (socketProblem). This reads
## it, resolves each with scripts/words.gd, and says how many differ, in a number, a name or a line of text: there must be
## none. (check.json is not kept in the repository: it is made when wanted.)
extends SceneTree

const Words := preload("res://scripts/words.gd")
const NUMBERS := {"dmgMult": "dmg_mult", "size": "size", "rate": "rate", "cooldown": "cooldown", "splash": "splash", "splashDmg": "splash_dmg",
	"ignite": "ignite", "chill": "chill", "arcs": "arcs", "arcDmg": "arc_dmg", "poison": "poison", "stun": "stun", "might": "might", "haste": "haste",
	"cloud": "cloud", "cracks": "cracks"}


func _init() -> void:
	var path := "res://assets/words/check.json"
	if not FileAccess.file_exists(path):
		print("WORDS CHECK: no check.json: run `npx tsx tools/godot_words.ts check` first")
		quit(1)
		return
	var c: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(path))
	var bad := 0
	var said := 0
	for row in c["rows"]:
		var got: Dictionary = Words.resolve(row["id"], row["front"], row["behind"], row["d"])
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
