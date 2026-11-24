## THE BUG HUNT'S FINDS, FIXED (24 Nov 2026, his ask: “I'd like some agents to run the game and look for bugs”): `--only=bughunt
## --shots=<dir>`. Frostbite redone on monsters: four carrying it freeze him no more often than one does; Cauterize redone on a
## monster: it sears its wounds once, its own way, not also the old way; the evasive move's long name kept off the slow attack's
## plate (pictured).
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")
const FoeWords := preload("res://scripts/foe_words.gd")

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("BUGHUNT %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _wait(secs: float) -> void:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()


func _near(k: int) -> Array:
	var alive: Array = M._monsters.list.filter(func(o): return is_instance_valid(o) and not o.dead and not o.boss)
	alive.sort_custom(func(a, b): return a.world.distance_to(h.world) < b.world.distance_to(h.world))
	return alive.slice(0, k)


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	M.loot.ring_lit = true
	M.loot.taught = true
	await M.go_to("floor8", "start")
	await _wait(1.0)
	# FROSTBITE: one carrier, then four, him chilled all the while; how long he is held of six seconds
	var held := []
	var ms: Array = _near(4)
	for o in ms:
		o.words = []
	for k in [1, 4]:
		var on: Array = ms.slice(0, k)
		for i in on.size():
			on[i].words = ["frostbite"] + FoeWords.parts_of("frostbite")
			on[i].world = h.world + Vector2(1.5, 0.0).rotated(i * 1.3)
			on[i].stun_for(30.0)
		h.foe_hi.erase("rd_fb")
		h.held = 0.0
		var t := 0.0
		var ht := 0.0
		while t < 6.0:
			await M.get_tree().process_frame
			var dt: float = M.get_process_delta_time()
			t += dt
			h.chill_t = 3.0
			h.chill_k = 0.2
			if h.held > 0.0:
				ht += dt
		held.append(ht)
		for o in on:
			o.words = []
		h.held = 0.0
		h.chill_t = 0.0
		await _wait(0.6)
	_line(held[0] > 0.5 and held[1] < held[0] * 1.5, "Frostbite on monsters: held %.1f s of 6 by one carrier, %.1f s by four (no more often for more of them)" % held)
	# CAUTERIZE: brought low, it sears once, its own way (15% back); not the old searing (35%) as well
	var m = _near(1)[0]
	m.words = ["cauterize"] + FoeWords.parts_of("cauterize")
	m.max_life = 10000.0
	m.life = 4000.0
	m.stun_for(30.0)
	await _wait(0.3)
	m.life = 2000.0
	var most := 0.0
	var t2 := 0.0
	var last: float = m.life
	var ups := 0
	while t2 < 3.0:
		await M.get_tree().process_frame
		t2 += M.get_process_delta_time()
		if m.life > last + 1.0:
			ups += 1
			most = maxf(most, m.life)
		last = m.life
	_line(M52.is_redo("cauterize") and ups == 1 and most <= 2000.0 + 0.16 * 10000.0, "Cauterize on a monster at a fifth of its life: seared %d time(s), up to %d of 10000 (its own 15%%, not 35%% more)" % [ups, int(most)])
	m.words = []
	# THE EVASIVE MOVE'S LONG NAME: the longest melds on it in front and behind; pictured
	M.loot.level = 20
	h.loadout.front[2] = ["pressurepoint", "flashfreeze"]
	h.loadout.behind[2] = ["feedingfrenzy", "constellation"]
	h.loadout.front[1] = ["reverb", "twin"]
	h.loadout.behind[1] = ["pressurepoint", null]
	h.loadout._r = [null, null, null]
	await _wait(0.5)
	await M._snap(dir + "/bughunt_hud_long_name.png")
	print("BUGHUNT: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
