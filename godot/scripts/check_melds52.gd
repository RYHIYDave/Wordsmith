## THE 52 DESIGNED MELDS AND THE 11 LEVEL 2 RUNES (melds52.gd, melds52_rules.gd): `--only=words --cases=m52` (or
## `--cases=m52:<id>,<id>`), on floor 2's pack of six skeletons the words check gathers (main.gd _words_shots). With the switch
## on for the check: the bench makes each from its two runes, and two of one of the eleven its level 2; the 23 melds and the
## damage words' ranks as they were; with it off, none of these. Their stones, their gear (one property of each of its two runes,
## each a quarter weaker; a level 2 rune's, half again). Then each in front of the Strike and behind it: its name on the move, its
## line on its page, the blow landing, and its twist seen at work where one Strike at the pack shows it.
extends RefCounted

const Words := preload("res://scripts/words.gd")
const M52 := preload("res://scripts/melds52.gd")

var M
var h
var n := 0
var bad: Array = []

## What one Strike at the pack shows of each twist (rules' tellings, "id:what"), in front and behind.
const FRONT := {"onslaught": "onslaught:second", "viper": "viper:bite", "flashfreeze": "flashfreeze:freeze", "aftershock": "aftershock:burst",
	"flurry": "flurry:stack", "quickdraw": "quickdraw:draw", "momentum": "momentum:build", "tailwind": "tailwind:gust", "blink": "blink:blink",
	"earthquake": "earthquake:wave", "gale": "gale:blow", "marrow": "marrow:drink", "secondwind": "secondwind:wind", "pressurepoint": "pressurepoint:point",
	"concussion": "concussion:boom", "quickfuse": "quickfuse:pop"}
const BEHIND := {"flashfreeze": "flashfreeze:sheet", "aftershock": "aftershock:quake", "gale": "gale:gust", "flurry": "flurry:gust",
	"duelist": "duelist:mark", "needle": "needle:mark", "brand": "brand:mark", "seeker": "seeker:mark", "quickdraw": "quickdraw:mark"}


## (whose twist is seen on a kill, or on one stunned already)
const KILL := ["quickfuse", "concussion"]
const STUNNED := ["pressurepoint"]


func _init(main, hero) -> void:
	M = main
	h = hero


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("MELDS52 %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func run(only := "") -> void:
	var was: bool = M52.ON
	var T: Dictionary = M52.T()
	# --- THE BENCH
	M52.ON = false
	_line(Words.meld_of("twin", "power") == "" and Words.meld_of("swift", "swift") == "" and Words.meld_problem("twin", "power") != "", "switched off, the bench makes none of them (Twin + Power: '%s')" % Words.meld_of("twin", "power"))
	M52.ON = true
	var wrong: Array = []
	for id in T["melds"]:
		var of: Array = T["of"][id]
		if Words.meld_of(of[0], of[1]) != id or Words.meld_of(of[1], of[0]) != id or Words.meld_problem(of[0], of[1]) != "":
			wrong.append(id)
	for id in T["ranks"]:
		var w: String = T["rankOf"][id]["word"]
		if Words.meld_of(w, w) != id or Words.meld_problem(w, w) != "":
			wrong.append(id)
	_line(wrong.is_empty(), "switched on, the bench makes all 52 from their two runes and the 11 level 2 runes from two of one%s" % ("" if wrong.is_empty() else " (not: %s)" % ", ".join(PackedStringArray(wrong))))
	var kept: bool = Words.meld_of("power", "fire") == "eruption" and Words.meld_of("leech", "poison") == "siphon" and Words.meld_of("power", "power") == "power2" and Words.meld_of("twin", "lightning") == "forking"
	_line(kept, "the 23 melds and the damage runes' Rank II as they were (Power + Flame: %s, Twin + Lightning: %s)" % [Words.meld_of("power", "fire"), Words.meld_of("twin", "lightning")])
	# --- STONES AND GEAR
	var L = M.loot
	var no_stone: Array = T["order"].filter(func(id): return not L.pics.has("word:" + id))
	_line(no_stone.is_empty(), "every one has its stone (%d of %d)" % [T["order"].size() - no_stone.size(), T["order"].size()])
	var it := {"slot": "mainhand", "ilvl": 10}
	var no_gear: Array = []
	for id in T["order"]:
		var opts: Array = L.imbue_options(id, it)
		if opts.is_empty() or (not M52.is_new_rank(id) and not opts.all(func(o): return o.has("also") or opts.size() > 0)):
			no_gear.append(id)
	var e: Array = L.imbue_options("onslaught", it)
	var crit_with: Array = e.map(func(o): return "%s+%s" % [o["stat"], o.get("also", "-")])
	_line(no_gear.is_empty(), "on a weapon, every one gives a property of each of its runes (Onslaught: %s)" % ", ".join(PackedStringArray(crit_with.slice(0, 4))))
	# --- AT WORK
	var ids: Array = T["order"]
	if only != "":
		var some := only.split(",")
		ids = ids.filter(func(i): return some.has(i))
	var regen: float = h.stats["life_regen"]
	h.stats["life_regen"] = 0.0
	var fine := 0
	var cases := 0
	var not_seen: Array = []
	for id in ids:
		for side in ["front", "behind"]:
			cases += 1
			h.m52.forget()
			h.m52.told = {}
			for m in M._w_pack:
				m.m52 = {}
				m.dead = false
				m._dead_for = 0.0
				m.modulate.a = 1.0
				m.shock_t = 0.0
				m.chill_t = 0.0
				m.frozen_t = 0.0
				m.freeze_immune = 0.0
				m.stun_t = 0.0
				m.burn_t = 0.0
				m.poison_t = 0.0
				m.mark_t = 0.0
			var r: Dictionary = M._w_set(h, 0, side, [id])
			# (what its twist waits on, made so for the one Strike: a kill, a stunned one)
			for m in M._w_pack:
				if KILL.has(id):
					m.life = 1.0
				if STUNNED.has(id):
					m.stun_t = 3.0
			var wd: Dictionary = T["words"][id]
			var named: bool = str(r["name"]).contains(str(wd["front"]) if side == "front" else str(wd["behind"]).trim_prefix("of "))
			var lined: bool = (r["lines"] as Array).any(func(l): return str(l).contains(str(wd["frontText"] if side == "front" else wd["behindText"]).substr(0, 20)))
			await M._w_strike(h)
			await M._wait(1.6)
			var lost := 0
			for k in M._w_pack.size():
				lost += maxi(0, int(roundf(M._w_was[k] - M._w_pack[k].life)))
			var want: String = (FRONT if side == "front" else BEHIND).get(id, "")
			var seen: bool = want == "" or int(h.m52.told.get(want, 0)) > 0
			if not seen:
				not_seen.append("%s %s" % [id, side])
			var ok: bool = named and lined and lost > 0 and seen
			if ok:
				fine += 1
			else:
				print("MELDS52   %s %s: named %s ('%s'), its line %s, the pack lost %d, its twist %s (%s)" % [id, side, named, r["name"], lined, lost, seen, str(h.m52.told)])
	h.stats["life_regen"] = regen
	_line(fine == cases, "each one in front of the Strike and behind it, %d cases: its name, its line, the blow landing, its twist seen: %d%s" % [cases, fine, "" if not_seen.is_empty() else " (twist not seen: %s)" % ", ".join(PackedStringArray(not_seen))])
	M52.ON = was
	print("MELDS52: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
