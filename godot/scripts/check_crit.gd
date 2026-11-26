## THE CRITICAL BRAWLER (his words, 26 Nov 2026, of Heavy Hands: “Okay.  Now build a Brawler that gets 100% crit chance through items
## and gear and maximizes crit damage.”): `--only=crit --shots=<dir>` with WS_DMG_GEAR=<tools/godot_dmg_gear.ts 20>. The Brawler
## remade (heroes/brawler2.gd, on for this alone), level 50, the damage check's chooser (check_dmg.gd) going first by his critical
## chance (to 100%), then by his critical damage (Heavy Hands' share of it from his attack speed counted), then by his damage: his
## attribute points, each piece's base and four words, his words. Then the same fight as the damage check's, his quick attack into
## one elite that cannot die (8 s after 2), beside two others chosen the damage check's own way, by his damage alone: the Brawler
## remade with Quick Hands, and the Brawler as he is. Written to <shots>/crit.txt.
extends "res://scripts/check_dmg.gd"

const B2 := preload("res://scripts/heroes/brawler2.gd")

var crit_first := false


func _more_crit() -> float:
	return h.kit.more_crit(0) if h.kit != null and h.kit.has_method("more_crit") else 0.0


func _dps() -> float:
	var d: float = super._dps()
	if not crit_first:
		return d
	var cc: float = minf(100.0, float(h.stats["crit_chance"]))
	var cm: float = float(h.stats["crit_mult"]) + _more_crit()
	# (his critical chance first, to 100%; then its damage; then his damage a second, below a point of either)
	return cc * 1e13 + cm * 1e8 + minf(d, 9.9e7)


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	G = JSON.parse_string(FileAccess.get_file_as_string(OS.get_environment("WS_DMG_GEAR")))
	h.unhurt = true
	M.go_to("floor20", "start")
	await M._wait(2.0)
	_arena()
	var base: Dictionary = {}
	for b in BUILDS:
		if b["id"] == "brawler":
			base = b
	var heavy_t: Array = (base["talents"] as Array).duplicate()
	heavy_t[heavy_t.find("vviperjab")] = "vheavyhands"
	var quick_t: Array = (base["talents"] as Array).duplicate()
	quick_t[quick_t.find("vviperjab")] = "vquickhands"
	var runs := [
		{"label": "THE CRITICAL BRAWLER: Heavy Hands, chosen for his critical chance, then its damage", "b2": true, "crit": true, "talents": heavy_t},
		{"label": "THE BRAWLER REMADE, Quick Hands, chosen by his damage", "b2": true, "crit": false, "talents": quick_t},
		{"label": "THE BRAWLER AS HE IS, chosen by his damage", "b2": false, "crit": false, "talents": base["talents"]},
	]
	# (WS_CRIT_ONLY=1: the critical Brawler alone)
	if OS.has_environment("WS_CRIT_ONLY"):
		runs = runs.slice(0, 1)
	for r in runs:
		B2.on = r["b2"]
		crit_first = r["crit"]
		var b: Dictionary = base.duplicate(true)
		b["talents"] = r["talents"]
		_say("")
		_say("=== %s ===" % r["label"])
		_hero(b, true)
		if kind == "":
			await _set_out()
		_share_points(b)
		var ws: Array = [null, null, null, null]
		_gear(b["cls"])
		ws = _with_must(b, ws, [1, 2, 3])
		var picks := _gear(b["cls"])
		ws = _with_must(b, ws, [1, 2, 3])
		picks = _gear(b["cls"])
		_share_points(b)
		_set_words(ws)
		var s: Dictionary = h.stats
		var more := _more_crit()
		_say("Str %d, Dex %d, Int %d; critical chance %.1f%%; critical damage +%d%% (gear and his class +%d%%, Heavy Hands from his attack speed +%d%%); his jab played at %.2f of its pace" % [s["str"], s["dex"], s["int"], float(s["crit_chance"]), roundi(float(s["crit_mult"]) + more), roundi(float(s["crit_mult"])), roundi(more), h.kit._pace("jab") if h.kit != null else 1.0])
		_say("his quick attack's words: in front %s, %s; behind %s, %s" % [_wn(ws[0]), _wn(ws[1]), _wn(ws[2]), _wn(ws[3])])
		_say("talents: %s" % ", ".join(b["talents"]))
		for sl in picks:
			_say("  %s: %s + %s" % [sl, picks[sl]["base"]["name"], ", ".join((picks[sl]["opts"] as Array).map(func(o): return "%s (%s)" % [o["word"], ", ".join((o["mods"] as Array).map(func(m): return "%s %s" % [m[0], m[1]]))]))])
		var one := await _fight_one(1.5)
		_say("INTO ONE ELITE: %d damage a second (his quick attack alone)" % int(one))
	B2.on = false
	var f := FileAccess.open(dir + "/crit.txt", FileAccess.WRITE)
	f.store_string("\n".join(out) + "\n")
	f.close()
	print("CRIT DONE")


static func _wn(w) -> String:
	return "-" if w == null else str(w)
