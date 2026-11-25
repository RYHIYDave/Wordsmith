## REAPING WITH THE DAMAGE RUNES (meldsreap_rules.gd; behind melds52.gd REAP_ON): `--only=words --cases=reap5 --shots=<dir>`, on
## floor 2's pack of six skeletons the words check gathers (main.gd _words_shots). Switched off, the bench makes none of the five;
## on, each from Reaping and its damage rune; each has its stone and its gear. Then each of the five: IN FRONT of the Strike, a kill
## tells its soul and does its twist on those near (the fire passed on, the shatter's chill, the soul's bolt, the poison's burst,
## his might); BEHIND it, the kill rises as its own creature (not the grey spirit), which fights: its blow is let fly and lands, and
## the pack loses life to it; ON AN ENEMY, one carrying it dies and rises as its creature against him, which marks its blow on
## the floor where he stands (the perils' warning) and hurts him if he stays. A picture of each creature at work.
extends RefCounted

const Words := preload("res://scripts/words.gd")
const M52 := preload("res://scripts/melds52.gd")
const R := preload("res://scripts/meldsreap_rules.gd")

var M
var h
var n := 0
var bad: Array = []
var dir := ""

const RUNE := {"cinderbrood": "fire", "wintergrave": "frost", "stormwake": "lightning", "bogborn": "poison", "charnel": "power"}
## (what one kill in front shows of each twist)
const FRONT := {"cinderbrood": "spread", "wintergrave": "shatter", "stormwake": "bolt", "bogborn": "puff", "charnel": "might"}
## (what its creature's blow shows)
const BLOW := {"cinderbrood": "land", "wintergrave": "land", "stormwake": "zap", "bogborn": "land", "charnel": "slam"}


func _init(main, hero) -> void:
	M = main
	h = hero
	dir = str(M._arg("shots"))


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("REAP5 %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _fresh() -> void:
	h.m52.forget()
	h.m52.told = {}
	h.last.spirits = []
	h.last.reap.fresh_place()
	h.might = 0.0
	h.might_t = 0.0
	for m in M._w_pack:
		m.m52 = {}
		m.dead = false
		m._dead_for = 0.0
		m.modulate.a = 1.0
		m.visible = true
		m.risen = false
		m.shock_t = 0.0
		m.chill_t = 0.0
		m.frozen_t = 0.0
		m.freeze_immune = 0.0
		m.stun_t = 0.0
		m.burn_t = 0.0
		m.poison_t = 0.0
		m.words = []
		m.max_life = 600.0
		m.life = 600.0
	M._w_reset(h)
	for m in M._w_pack:
		m.max_life = 600.0
		m.life = 600.0


## The one of the pack nearest him in front: the one the Strike takes first.
func _first():
	var best = null
	var bd := 99.0
	for m in M._w_pack:
		var d: float = m.world.distance_to(h.world)
		if d < bd:
			bd = d
			best = m
	return best


var _had := {}


## (how much life the pack has now, those standing, by each; and how much they have lost since `_mark`)
func _mark() -> void:
	_had = {}
	for m in M._w_pack:
		_had[m.get_instance_id()] = m.life


func _lost() -> float:
	var s := 0.0
	for m in M._w_pack:
		if not m.dead and _had.has(m.get_instance_id()):
			s += maxf(0.0, float(_had[m.get_instance_id()]) - m.life)
	return s


func run(_only := "") -> void:
	var was: bool = M52.REAP_ON
	var T: Dictionary = M52.T()
	var ids: Array = T["reap"]
	# --- THE BENCH
	M52.REAP_ON = false
	var none: bool = ids.all(func(id): return Words.meld_of("reaping", RUNE[id]) == "")
	_line(none and Words.meld_problem("reaping", "fire") != "", "switched off, the bench makes none of the five (Reaping + Flame: '%s', '%s')" % [Words.meld_of("reaping", "fire"), Words.meld_problem("reaping", "fire")])
	M52.REAP_ON = true
	var made: Array = ids.filter(func(id): return Words.meld_of("reaping", RUNE[id]) == id and Words.meld_of(RUNE[id], "reaping") == id and Words.meld_problem("reaping", RUNE[id]) == "")
	_line(made.size() == 5, "switched on, it makes all five from Reaping and its rune: %s" % ", ".join(PackedStringArray(made.map(func(id): return T["words"][id]["name"]))))
	# (with itself and with Twin, Reaping's own level 2 and the High City's Revenants, now the High City's melds are on (melds52.gd
	# HIGH_ON, his “Switch them on (Recommended)”, 24 Nov 2026); none of the five's: the bug hunt's third round found this line from
	# before)
	var hi: bool = M52.HIGH_ON
	var with_self: String = Words.meld_of("reaping", "reaping")
	var with_twin: String = Words.meld_of("reaping", "twin")
	_line(not ids.has(with_self) and not ids.has(with_twin) and (with_self != "" if hi else with_self == "") and (with_twin != "" if hi else with_twin == ""), "and none of the five else of Reaping's (with itself: '%s', with Twin: '%s'%s)" % [with_self, with_twin, ", the High City's" if hi else ""])
	var L = M.loot
	var stones: Array = ids.filter(func(id): return L.pics.has("word:" + id))
	var it := {"slot": "mainhand", "ilvl": 10}
	var gear: Array = ids.filter(func(id): return not L.imbue_options(id, it).is_empty())
	var o: Array = L.imbue_options("charnel", it)
	_line(stones.size() == 5 and gear.size() == 5, "each its stone (%d of 5) and its gear (%d of 5; Charnel on a weapon: %s)" % [stones.size(), gear.size(), ", ".join(PackedStringArray(o.slice(0, 3).map(func(q): return "%s+%s" % [q["stat"], q.get("also", "-")])))])
	var regen: float = h.stats["life_regen"]
	h.stats["life_regen"] = 0.0
	for id in ids:
		await _front(id)
		await _behind(id)
		await _foe(id)
	h.stats["life_regen"] = regen
	await _lineup()
	M52.REAP_ON = was
	_fresh()
	print("REAP5: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## IN FRONT: one kill, what fell set up for the twist.
func _front(id: String) -> void:
	_fresh()
	var r: Dictionary = M._w_set(h, 0, "front", [id])
	var m = _first()
	m.life = 1.0
	match id:
		"cinderbrood":
			m.set_alight(20.0, 3.0)
		"wintergrave":
			m.frozen_t = 1.0
		"bogborn":
			m.dose(20.0)
	var named: bool = str(r["name"]).contains(str(M52.T()["words"][id]["front"]))
	_mark()
	await M._w_strike(h)
	await M._wait(0.4)
	var told: Dictionary = h.m52.told
	var what: String = FRONT[id]
	var did := ""
	match id:
		"cinderbrood":
			var n2: int = M._w_pack.filter(func(o): return not o.dead and o.burn_t > 0.0).size()
			did = "%d near it set burning" % n2
		"wintergrave":
			var n2: int = M._w_pack.filter(func(o): return not o.dead and o.chill_t > 0.0).size()
			did = "%d near it chilled" % n2
		"stormwake":
			did = "the pack lost %d" % int(_lost())
		"bogborn":
			var n2: int = M._w_pack.filter(func(o): return not o.dead and o.poison_t > 0.0).size()
			did = "%d near it poisoned" % n2
		"charnel":
			did = "his might %d%%" % int(h.might)
	var ok: bool = named and m.dead and int(told.get(id + ":soul", 0)) > 0 and int(told.get(id + ":" + what, 0)) > 0 and not did.begins_with("0 ") and did != "the pack lost 0" and did != "his might 0%"
	_line(ok, "%s in front ('%s'): the kill's soul, its %s: %s" % [M52.T()["words"][id]["name"], r["name"], what, did])
	if dir != "":
		await M._snap("%s/reap_%s_front.png" % [dir, id])


## BEHIND: one kill rises as its creature, which fights the rest.
func _behind(id: String) -> void:
	_fresh()
	var r: Dictionary = M._w_set(h, 0, "behind", [id])
	var m = _first()
	m.life = 1.0
	await M._w_strike(h)
	await M._wait(0.2)
	var sp = null
	for s in h.last.spirits:
		if str(s.get("kind", "")) != "":
			sp = s
	var kind: String = str(sp["kind"]) if sp != null else "(none)"
	_mark()
	var shot := false
	var t := 0.0
	while t < 4.5:
		await M._wait(0.25)
		t += 0.25
		h.world = M._w_home
		if not shot and int(h.m52.told.get(id + ":" + BLOW[id], 0)) > 0 and dir != "":
			shot = true
			await M._snap("%s/reap_%s_behind.png" % [dir, id])
	var lost := _lost()
	var ok: bool = m.dead and kind == R.KIND[id] and int(h.m52.told.get(id + ":rise", 0)) > 0 and int(h.m52.told.get(id + ":" + BLOW[id], 0)) > 0 and lost > 0.0
	_line(ok, "%s behind ('%s'): the kill rose as its %s, its blow let fly and landed %d times, the pack lost %d to it" % [M52.T()["words"][id]["name"], r["name"], kind, int(h.m52.told.get(id + ":" + BLOW[id], 0)), int(lost)])


## ON AN ENEMY: one carrying it dies and rises as its creature against him.
func _foe(id: String) -> void:
	_fresh()
	M._w_set(h, 0, "front", [])
	var m = _first()
	m.words = [id, "reaping", RUNE[id]]
	m.life = 1.0
	m.dmg_min = 60.0
	m.dmg_max = 60.0
	var life0: float = h.life
	var dodge: float = float(h.stats.get("dodge", 0.0))
	h.stats["dodge"] = 0.0
	var P = h.monsters.perils
	var warned0 := 0
	await M._w_strike(h)
	await M._wait(0.2)
	var foes: Array = h.last.reap.foes
	var kind: String = str(foes[0]["kind"]) if not foes.is_empty() else "(none)"
	var warned := 0
	var hurt := 0.0
	var shot := false
	var t := 0.0
	var low: float = h.life
	var blows := 0
	h.last_blow = {}
	while t < 4.0 and not foes.is_empty():
		await M._wait(0.1)
		t += 0.1
		h.world = M._w_home
		if not h.last_blow.is_empty():
			blows += 1
			hurt += float(h.last_blow.get("dmg", 0.0))
			h.last_blow = {}
		for p in P.list:
			if str(p.get("kind", "")) == "warn" and float(p.get("t", 1.0)) < 0.11 and float(p.get("dmg", 0.0)) > 0.0:
				warned += 1
				if not shot and dir != "":
					shot = true
					await M._snap("%s/reap_%s_foe.png" % [dir, id])
		low = minf(low, h.life)
	hurt = maxf(hurt, life0 - low)
	h.life = h.max_life
	h.stats["dodge"] = dodge
	var ok: bool = m.dead and kind == R.KIND[id] and warned > 0 and blows > 0 and int(h.m52.told.get(id + ":rise", 0)) > 0
	_line(ok, "%s on an enemy: it died and rose as its %s against him, marked %d blows on the floor where he stood; %d landed on him, for %d" % [M52.T()["words"][id]["name"], kind, warned, blows, int(hurt)])


## A picture of all five standing beside him in the game, his (cyan) in a row before him and the five risen against him (pink)
## behind them, the pack put away.
func _lineup() -> void:
	_fresh()
	for m in M._w_pack:
		m.dead = true
		m.visible = false
	var kinds: Array = ["imp", "rimeling", "stormwisp", "toad", "bonebrute"]
	var ids: Array = ["cinderbrood", "wintergrave", "stormwake", "bogborn", "charnel"]
	var home: Vector2 = M._w_home
	var cnt := 0
	for k in 5:
		var at := home + Vector2(1.4 + k * 1.1, -1.4 + k * 1.1)
		h.last.spirits.append({"id": 9000 + k, "x": at.x, "y": at.y, "t": 1.0, "life": 99.0, "next": 99.0, "skill": 0, "share": 0.5,
			"meld": ids[k], "kind": kinds[k], "atk": -1.0, "fx": 1.0, "fy": 0.0})
		var bt := home + Vector2(3.0 + k * 1.1, -3.0 + k * 1.1)
		h.last.reap.foes.append({"id": 9100 + k, "meld": ids[k], "kind": kinds[k], "x": bt.x, "y": bt.y, "t": 1.0, "life": 99.0,
			"next": 99.0, "atk": -1.0, "fx": -1.0, "fy": 0.0, "dmg": 0.0, "foe": true, "words": [], "share": 0.0, "skill": -1})
		cnt += 2
	var t := 0.0
	while t < 1.2:
		await M._wait(0.1)
		t += 0.1
		h.world = home
		for s in h.last.spirits:
			s["t"] = 1.0
			s["next"] = 99.0
		for f in h.last.reap.foes:
			f["t"] = 1.0
			f["next"] = 99.0
	var standing: int = h.last.spirits.filter(func(s): return str(s.get("kind", "")) != "").size() + h.last.reap.foes.size()
	if dir != "":
		await M._snap("%s/reap_lineup.png" % dir)
	_line(standing == cnt, "all five beside him in the game, his and risen against him: %d of %d standing" % [standing, cnt])
	h.last.spirits = []
	h.last.reap.fresh_place()
