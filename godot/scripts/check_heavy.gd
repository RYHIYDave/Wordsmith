## QUICK HANDS AGAINST HEAVY HANDS, FOUGHT (his words, 26 Nov 2026: “K let's fight it.  Do it the fast hands way and both of our calcs
## for slow”): `--only=heavy --shots=<dir>` with WS_DMG_GEAR=<tools/godot_dmg_gear.ts 20>. The Brawler remade (heroes/brawler2.gd),
## level 50, his gear and words chosen once by the damage check's chooser with Quick Hands, then the same man fought four ways, his
## quick attack alone into one elite that cannot die (8 s, after 2 s: check_dmg.gd _fight_one): Quick Hands; Heavy Hands as first
## written ("add"); the main chat's ("whole": his whole critical k times as hard); his ("base": the base critical k times as big,
## his gear's critical damage multiplying it). Written to <shots>/heavy.txt.
extends "res://scripts/check_dmg.gd"

const B2 := preload("res://scripts/heroes/brawler2.gd")


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	G = JSON.parse_string(FileAccess.get_file_as_string(OS.get_environment("WS_DMG_GEAR")))
	h.unhurt = true
	B2.on = true
	M.go_to("floor20", "start")
	await M._wait(2.0)
	_arena()
	var base: Dictionary = {}
	for b in BUILDS:
		if b["id"] == "brawler":
			base = b
	var quick_t: Array = (base["talents"] as Array).duplicate()
	quick_t[quick_t.find("vviperjab")] = "vquickhands"
	var heavy_t: Array = (base["talents"] as Array).duplicate()
	heavy_t[heavy_t.find("vviperjab")] = "vheavyhands"
	var b: Dictionary = base.duplicate(true)
	b["talents"] = quick_t
	_hero(b, true)
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
	_say("THE SAME BRAWLER FOUR WAYS: Str %d, Dex %d; critical chance %.1f%%, critical damage +%d%% (a critical %.1f times a regular hit)" % [s["str"], s["dex"], float(s["crit_chance"]), roundi(float(s["crit_mult"])), 1.0 + float(s["crit_mult"]) / 100.0])
	_say("his quick attack's words: in front %s, %s; behind %s, %s" % [_wn(ws[0]), _wn(ws[1]), _wn(ws[2]), _wn(ws[3])])
	for sl in picks:
		_say("  %s: %s + %s" % [sl, picks[sl]["base"]["name"], ", ".join((picks[sl]["opts"] as Array).map(func(o): return "%s (%s)" % [o["word"], ", ".join((o["mods"] as Array).map(func(m): return "%s %s" % [m[0], m[1]]))]))])
	var ways := [["QUICK HANDS", quick_t, "add"], ["HEAVY HANDS as first written (attack speed into critical damage, added)", heavy_t, "add"],
		["HEAVY HANDS, the main chat's (his whole critical times his speed)", heavy_t, "whole"],
		["HEAVY HANDS, his (the base critical times his speed, his gear's critical damage multiplying it)", heavy_t, "base"]]
	for w in ways:
		h.talents = (w[1] as Array).duplicate()
		h.talents_changed()
		B2.HEAVY_MODE = w[2]
		M.loot.derive()
		var more: float = h.kit.more_crit(0) if h.kit != null and h.kit.has_method("more_crit") else 0.0
		var crit_x: float = 1.0 + (float(h.stats["crit_mult"]) + more) / 100.0
		var one := await _fight_one(1.5)
		_say("%s: his jab at %.2f of its pace; a critical %.1f times a regular hit; INTO ONE ELITE %d damage a second" % [w[0], h.kit._pace("jab"), crit_x, int(one)])
	B2.HEAVY_MODE = "add"
	var f := FileAccess.open(dir + "/heavy.txt", FileAccess.WRITE)
	f.store_string("\n".join(out) + "\n")
	f.close()
	print("HEAVY DONE")


static func _wn(w) -> String:
	return "-" if w == null else str(w)
