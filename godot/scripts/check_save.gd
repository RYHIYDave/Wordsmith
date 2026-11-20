## THE CHECK OF THE SAVED GAME, in two runs of the app, as he would close it and open it again:
##   --only=save_write: a hero part way through the game (level 12, his gear and bag, spare words and words set in his Strike,
##     gold, the ring lit, the furnace out, the Meldstone his, runedust, the feather given, two of the ward-stone's pieces, floor 8
##     reached, up from floor 7 with seven cleared, a word bought from the wordsmith, a piece in the stash, a word kept in the
##     Lexicon) is written; then the app closes.
##   --only=save_read: the app opened again: all of it read back, he in his town at its start (the gate down the mountain open,
##     as floor 8 reached has it), life and flasks full; pictured; then the save is deleted, as the check's own.
## A line a thing; then the sum, SAVE.
extends RefCounted

const Save := preload("res://scripts/save.gd")

var M
var h
var n := 0
var bad: Array = []

const GOLD := 4321
const LEVEL := 12


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("SAVE %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func write(main, hero, dir: String) -> void:
	M = main
	h = hero
	var loot = M.loot
	await M.go_to("town", "gate")
	await M._wait(0.5)
	h.walked = 40.0
	loot.level = LEVEL
	loot.xp = 1234.0
	loot.points = 5
	loot.attrs = {"str": 30.0, "dex": 12.0, "int": 9.0}
	loot.gold = GOLD
	loot.ring_lit = true
	loot.quest_given = true
	loot.body_searched = true
	loot.quest = ""
	loot.furnace = "done"
	loot.meld = "open"
	loot.meld_ask = true
	loot.taught = true
	loot.cleared = 7
	M.way_depth = 8
	M.last_floor = 7
	M.quest610.dust = 3
	M.quest610.feather = "given"
	M.quest610.pieces = 2
	for k in loot.words.keys():
		loot.words[k] = 0
	loot.words["power"] = 2
	loot.words["fire"] = 1
	loot.words["scald"] = 1
	loot.derive()
	h.loadout.put(0, "front", "lightning")
	loot.bag = [loot._pools["1"][0].duplicate(true), loot._pools["2"][0].duplicate(true)]
	loot.gear["ring1"] = _ring_of(loot).duplicate(true)
	loot.stash[0] = loot._pools["4"][0].duplicate(true)
	loot.lexicon = {"frost": 1}
	loot._know("power")["found"] = true
	loot._know("power")["front"] = true
	loot.roll_word_stock(7)
	loot.word_stock[1] = null
	loot.derive()
	await M._wait(0.3)
	var ok: bool = M.save_now()
	var f := Save.read()
	_line(ok and f.get("run") is Dictionary and f.get("meta") is Dictionary, "written to %s: the run and what outlasts him (%d bytes)" % [Save.PATH, FileAccess.get_file_as_string(Save.PATH).length()])
	print("SAVE: written; open the app again (--only=save_read) to read it back")


func read(main, hero, dir: String) -> void:
	M = main
	h = hero
	var loot = M.loot
	await M._wait(1.0)
	var file := Save.read()
	_line(not file.is_empty(), "the app opened again: a save there to read back")
	_line(M.place == "town" and h.world.distance_to(M.map.start) < 0.1 and h.life == h.max_life and loot.potions == loot.POTIONS and h.walked >= 40.0 and M.guide.banner().is_empty(),
		"he is back in his town (%s), at its start, his life and flasks full; no first lesson shown again (walked %.0f)" % [M.place, h.walked])
	_line(loot.level == LEVEL and absf(loot.xp - 1234.0) < 0.01 and loot.points == 5 and float(loot.attrs["str"]) == 30.0 and loot.gold == GOLD,
		"level %d, experience %.0f, %d points to place, strength %.0f, %d gold" % [loot.level, loot.xp, loot.points, loot.attrs["str"], loot.gold])
	_line(loot.bag.size() == 2 and loot.gear["ring1"] != null and str(loot.gear["ring1"]["name"]) == str(_ring_of(loot)["name"]) and loot.gear["mainhand"] != null,
		"his gear (his ring: %s) and his bag (%d pieces)" % [loot.gear["ring1"]["name"] if loot.gear["ring1"] != null else "-", loot.bag.size()])
	_line(int(loot.words.get("power", 0)) == 2 and int(loot.words.get("fire", 0)) == 1 and int(loot.words.get("scald", 0)) == 1 and h.loadout.front[0].has("lightning"),
		"his spare words (POWER x%d, FLAME x%d, SCALD x%d) and LIGHTNING set in front of his Strike (%s)" % [int(loot.words.get("power", 0)), int(loot.words.get("fire", 0)), int(loot.words.get("scald", 0)), h.loadout.front[0]])
	_line(loot.ring_lit and loot.furnace == "done" and loot.meld == "open" and loot.meld_ask and loot.body_searched and loot.quest_given,
		"the ring lit, the furnace quest done, the Meldstone his, the fallen wordsmith searched")
	_line(M.quest610.dust == 3 and M.quest610.feather == "given" and M.quest610.pieces == 2,
		"floors 6 to 10's quests: %d runedust, the feather %s, %d of the ward-stone's pieces" % [M.quest610.dust, M.quest610.feather, M.quest610.pieces])
	_line(M.way_depth == 8 and M.last_floor == 7 and loot.cleared == 7 and M.town != null and not M.town.barred,
		"the floors: floor %d reached, up from floor %d, %d cleared; the gate down the mountain open (barred %s)" % [M.way_depth, M.last_floor, loot.cleared, M.town.barred if M.town != null else "-"])
	_line(loot.word_stock.size() == 3 and loot.word_stock[1] == null and loot.word_stock[0] != null,
		"the wordsmith's shelf, the word bought from it still gone: %s" % [loot.word_stock])
	_line(loot.stash[0] != null and int(loot.lexicon.get("frost", 0)) == 1 and bool(loot._know("power")["front"]),
		"what outlasts him: the stash (%s), FROST kept in the Lexicon, POWER known in front" % [loot.stash[0]["name"] if loot.stash[0] != null else "-"])
	await M._snap(dir + "/v01_back_in_town.png")
	M._inv.toggle()
	await M._wait(0.3)
	await M._snap(dir + "/v02_his_gear.png")
	M._inv.toggle()
	DirAccess.remove_absolute(ProjectSettings.globalize_path(Save.PATH))
	print("SAVE: %d things of the saved game read back, %d as they were written%s" % [n, n - bad.size(), "" if bad.is_empty() else "; NOT: " + str(bad)])


## The first ring among the pieces the game rolled for floor 1's chests.
static func _ring_of(loot) -> Dictionary:
	for it in loot._pools["2"]:
		if str(it["slot"]) == "ring":
			return it
	return loot._pools["2"][1]
