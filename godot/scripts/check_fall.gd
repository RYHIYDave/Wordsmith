## THE CHECK OF A FALLEN HERO (--only=fall; game/modes.ts, main.gd will_wake, losses, wake_save, death_info; minimap.gd "death"):
##   NORMAL: on floor 1 with 1,000 gold as he came in, he finds 250 gold, a piece of gear and a word and goes up a level; he falls:
##     he stays down, the screen darkens round him, then YOU FELL: "You wake in town.", and what it cost: what he found (the piece,
##     the word, the 250 gold) and a quarter of the 1,000 he came in with; its button "Back to town". The run he will wake as: as
##     he came in, less the 250, but at his new level. Pictured.
##   HARDCORE: he falls: YOU DIED, who he was and what he did, what the Lexicon and the stash keep; "New run"; one more of the lost
##     counted; nothing to wake as. Pictured.
##   AS IN PLAY (--only=fall_live, the game saving): a Normal hero with 1,000 gold falls on floor 1 and the button is pressed: the
##     game begins again from the save made as he fell, he in his town, up, with 750 gold and the line of what it cost; pictured;
##     then the save is deleted, as the check's own.
## A line a thing; then the sum, FALL.
extends RefCounted

## (fall_live: 0 before the fall, 1 once the game has begun again from its save)
static var stage := 0

const Save := preload("res://scripts/save.gd")

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("FALL %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


## He falls, and the screen comes up (after FALL_SEEN): whether it did.
func _falls() -> bool:
	h.life = 0.0
	h._fall()
	var t := 0.0
	while t < 4.0:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
		if M._mini.open == "death":
			return true
	return false


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	var loot = M.loot
	await M._wait(0.5)
	# NORMAL: as he came into floor 1, 1,000 gold on him
	M.hero_mode = "normal"
	loot.gold = 1000
	var level0: int = loot.level
	M.entry = Save.run_of(M).duplicate(true)
	# (what he finds there: 250 gold, a piece of gear, a word; and a level)
	loot.gold += 250
	var piece = null
	for s in loot.gear:
		if loot.gear[s] is Dictionary:
			piece = loot.gear[s].duplicate(true)
			break
	var put := false
	if piece != null:
		for i in loot.bag.size():
			if loot.bag[i] == null:
				loot.bag[i] = piece
				put = true
				break
		if not put:
			loot.bag.append(piece)
	loot.words["power"] = int(loot.words.get("power", 0)) + 1
	loot.level = level0 + 1
	var up: bool = await _falls()
	await M._wait(0.2)
	await M._snap(dir + "/f01_normal_fell.png")
	var d: Dictionary = M.death_info()
	var lost: Dictionary = M.fall_lost
	_line(up and not h.alive and d["title"] == "YOU FELL" and d["button"] == "Back to town",
		"a Normal hero falls: he stays down, and after %.1f s the screen: %s, its button \"%s\"" % [M.FALL_SEEN, d["title"], d["button"]])
	_line(int(lost.get("items", -1)) == 1 and int(lost.get("words", -1)) == 1 and int(lost.get("gold", -1)) == 250 and int(lost.get("share", -1)) == 250,
		"what it cost: what he found on the floor (%d piece, %d word, %d gold) and a quarter of the 1,000 he came in with (%d): \"%s\"" % [lost.get("items", -1), lost.get("words", -1), lost.get("gold", -1), lost.get("share", -1), d["after"]])
	var w: Dictionary = M.wake_save()
	var bag_had: int = (M.entry["bag"] as Array).filter(func(it): return it is Dictionary).size()
	var bag_wakes: int = (w.get("bag", []) as Array).filter(func(it): return it is Dictionary).size()
	_line(int(w.get("gold", -1)) == 750 and int(w.get("level", -1)) == level0 + 1 and bag_wakes == bag_had and int(w["words"].get("power", 0)) == int(M.entry["words"].get("power", 0)) and w.get("mode") == "normal",
		"he will wake in town as he came in (gold %d, his bag %d pieces, the word gone), less the share, but at his new level (%d)" % [w.get("gold", -1), bag_wakes, w.get("level", -1)])
	M._mini._press("death")
	await M._wait(0.1)
	_line(M._mini.open == "" and h.alive and M.wake_note.begins_with("You wake in town. Lost:"), "its button pressed (in play, the game begins again from the save made as he fell, in town): \"%s\"" % M.wake_note)
	M.wake_note = ""
	# HARDCORE: he falls, and is lost
	M.hero_mode = "hardcore"
	var deaths0: int = M.deaths
	var up2: bool = await _falls()
	await M._wait(0.2)
	await M._snap(dir + "/f02_hardcore_died.png")
	var d2: Dictionary = M.death_info()
	_line(up2 and d2["title"] == "YOU DIED" and d2["button"] == "New run" and M.fall_lost.is_empty() and M.wake_save().is_empty() and M.deaths == deaths0 + 1 and str(d2["after"]).begins_with("The Lexicon keeps"),
		"a Hardcore hero falls: %s, %s; \"%s\"; one more of the lost (%d), nothing to wake as; its button \"%s\"" % [d2["title"], ", ".join(d2["rows"]), d2["after"], M.deaths, d2["button"]])
	M._mini._press("death")
	print("FALL: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


func live(main, hero, dir: String) -> void:
	M = main
	h = hero
	var loot = M.loot
	await M._wait(0.5)
	if stage == 0:
		# (on floor 1, as he came in with 1,000 gold; he falls; the button)
		M.hero_mode = "normal"
		loot.gold = 1000
		M.entry = Save.run_of(M).duplicate(true)
		var up: bool = await _falls()
		_line(up, "as in play: a Normal hero with 1,000 gold falls on floor 1, the screen comes up; its button pressed")
		stage = 1
		M._mini._press("death")
		return
	# (the game begun again from its save)
	var said: bool = loot.msgs.any(func(m): return str(m["text"]).begins_with("You wake in town. Lost:"))
	await M._wait(0.6)
	await M._snap(dir + "/f03_woke_in_town.png")
	_line(M.is_home(M.place) and h.alive and loot.gold == 750 and said and M.hero_mode == "normal",
		"the game began again from the save made as he fell: in %s, up (%s), with %d gold, told \"%s\"" % [M.place, h.alive, loot.gold, loot.msgs.back()["text"] if not loot.msgs.is_empty() else ""])
	DirAccess.remove_absolute(ProjectSettings.globalize_path(Save.PATH))
	print("FALL LIVE: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
	M.get_tree().quit()
