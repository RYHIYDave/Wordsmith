## CHECKS: THE RARE RUNES (loot.gd ENDLESS_DROPS, QUEEN_ONLY: his words, 24 Nov 2026, “plundering ... and mirroring should only drop in
## endless. Mirroring should be very, extremely rare ... Drops only from the queen in endless”), `--only=rarerunes`: on floor 18 as
## the story has it, neither drops (what lies about, what a monster carries, what a chained rare leaves); on an endless level,
## Plundering may and Mirroring may not; the Glass Queen on an endless level leaves Mirroring MIRROR_CHANCE of her kills, and never
## on floor 18 as the story has it.
extends RefCounted

var M
var _hero
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("RARERUNES %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _draws(k: int) -> Dictionary:
	var out := {}
	for i in k:
		var w: String = M.loot.drop_ok(M.loot.tilt_word(M.loot.drops_at(M.loot.power()).pick_random()))
		out[w] = int(out.get(w, 0)) + 1
	return out


func run(main, hero_in, _dir: String) -> void:
	M = main
	_hero = hero_in
	var L = M.loot
	M.endless = 0
	M.in_endless = false
	var story: Array = L.words_found_at(18)
	var here: Array = L.drops_at(18)
	_line(story.has("plundering") and story.has("mirroring") and not here.has("plundering") and not here.has("mirroring") and here.size() == story.size() - 2,
		"floor 18 as the story has it: of the %d runes found there, these may drop: %d, no Plundering, no Mirroring" % [story.size(), here.size()])
	_line(L.drop_ok("plundering") != "plundering" and L.drop_ok("mirroring") != "mirroring" and L.drop_ok("twin") == "twin",
		"there, a monster carrying Plundering or Mirroring carries another instead (%s, %s); Twin stays Twin" % [L.drop_ok("plundering"), L.drop_ok("mirroring")])
	M.in_endless = true
	M.endless = 6
	var e: Array = L.drops_at(20)
	_line(e.has("plundering") and not e.has("mirroring"), "on an endless level: Plundering may drop (%s), Mirroring may not (%s)" % [e.has("plundering"), e.has("mirroring")])
	var queen := {"kind": "gqueen", "boss": true}
	var lady := {"kind": "lady", "boss": false}
	var hits := 0
	for i in 20000:
		if L.queen_mirror(queen):
			hits += 1
	_line(L.queen_mirror(queen, 0.0) and not L.queen_mirror(queen, 0.5) and not L.queen_mirror(lady, 0.0) and absf(hits / 20000.0 - L.MIRROR_CHANCE) < 0.004,
		"the Glass Queen on an endless level leaves Mirroring %.2f%% of her kills (%.0f%%); no one else" % [100.0 * hits / 20000.0, 100.0 * L.MIRROR_CHANCE])
	M.in_endless = false
	M.endless = 0
	_line(not L.queen_mirror(queen, 0.0), "the Glass Queen on floor 18 as the story has it: never")
	# GREED (his “Yes build greed”, 24 Nov 2026)
	var Wd := preload("res://scripts/words.gd")
	var gw: Dictionary = Wd.word("greed")
	_line(str(gw.get("name", "")) == "Greed" and Wd.meld_problem("greed", "twin") != "" and Wd.meld_of("greed", "greed") == "" and str(Wd.word("plundering")["frontText"]) == "Kills drop more gold.",
		"Greed is a word (%s / %s), it never melds ('%s'), and Plundering's extra item is Greed's now (Plundering: '%s')" % [gw.get("front", ""), gw.get("behind", ""), Wd.meld_problem("greed", "twin"), Wd.word("plundering")["frontText"]])
	_line(not here.has("greed") and L.drops_at(18).has("greed") == false, "Greed never drops on floor 18 as the story has it")
	M.in_endless = true
	M.endless = 6
	_line(L.drops_at(20).has("greed") and L.drops_at(3).has("greed"), "on an endless level of any floor, Greed may drop")
	M.dungeon_words = ["greed"]
	var mf0: float = L.magic_find()
	M.dungeon_words = []
	var mf1: float = L.magic_find()
	_line(L.door_mf(["greed"]) == 50.0 and is_equal_approx(mf0 - mf1, 75.0), "burned in at the door: the level's magic find 50%% increased, and the 25 every burned word gives: %.0f more in all" % (mf0 - mf1))
	L.kill_mf = 60.0
	var mf2: float = L.magic_find()
	L.kill_mf = 0.0
	_line(is_equal_approx(mf2 - mf1, 60.0), "Greedy's kill: its drops made with %.0f more magic find" % (mf2 - mf1))
	var opts: Array = []
	for slot in ["mainhand", "ring", "helm", "boots"]:
		for o in L.imbue_options("greed", {"slot": slot, "ilvl": 12}):
			opts.append("%s:%s" % [slot, o["stat"]])
	_line(not opts.is_empty() and opts.all(func(x): return str(x).ends_with("magicFind") or str(x).ends_with(":int")) and opts.any(func(x): return str(x).begins_with("mainhand:magicFind")),
		"burned into gear: magic find or Intelligence, on any piece (%s)" % ", ".join(PackedStringArray(opts)))
	M._w_put(_hero, 0, "front", ["greed"])
	var rf: Dictionary = _hero.loadout.r(0)
	M._w_put(_hero, 0, "behind", ["greed"])
	var rb: Dictionary = _hero.loadout.r(0)
	_line(float(rf["greed"]) >= 50.0 and str(rf["name"]).contains("Greedy") and float(rb["greed_item"]) == 0.05 and str(rb["name"]).contains("of Greed"),
		"on the Strike: '%s', %.0f%% increased magic find on its kills' drops; '%s', an extra item %.0f%% of its kills" % [rf["name"], float(rf["greed"]), rb["name"], 100.0 * float(rb["greed_item"])])
	M.in_endless = false
	M.endless = 0
	print("RARERUNES: %d checks, %d wrong" % [n, bad.size()])
