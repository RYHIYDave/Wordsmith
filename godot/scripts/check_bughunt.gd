## THE BUG HUNT'S FINDS, FIXED (24 Nov 2026, his ask: “I'd like some agents to run the game and look for bugs”): `--only=bughunt
## --shots=<dir>`. Frostbite redone on monsters: four carrying it freeze him no more often than one does; Cauterize redone on a
## monster: it sears its wounds once, its own way, not also the old way; the evasive move's long name kept off the slow attack's
## plate (pictured); floor 5's cage walked into once it is down. And from the damage test: Brand in front makes a burn twice as hot
## once, not again on each crit (it grew to millions); a monster's meld makes his burn or poison worse once a burn, not each blow;
## Twin's two waves aimed so the nearer crosses the spot she aims at (heroes/mage.gd TWIN_AIM).
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
	# BRAND IN FRONT (the damage test): ten critical hits on a burning one make its burn twice as hot, not 2^10 times
	m.max_life = 1.0e9
	m.life = 1.0e9
	h.loadout.front[0] = ["brand", null]
	h.loadout._r = [null, null, null]
	m.set_alight(100.0, 30.0)
	var d0: float = m.burn_dps
	for k in 10:
		h.m52.struck(m, 0, 100.0, true, m.world, true, true, false, false, false)
	var d1: float = m.burn_dps
	# (its burn out and lit again: twice as hot again, once)
	m.burn_t = 0.0
	h.m52.status_end(m, "burn")
	m.set_alight(100.0, 30.0)
	for k in 5:
		h.m52.struck(m, 0, 100.0, true, m.world, true, true, false, false, false)
	var d2: float = m.burn_dps
	_line(is_equal_approx(d1, d0 * 2.0) and is_equal_approx(d2, 200.0), "Brand: ten crits on a burning one, its burn %d a second to %d (twice, once); burned out and lit again, five crits, %d" % [int(d0), int(d1), int(d2)])
	h.loadout.front[0] = [null, null]
	h.loadout._r = [null, null, null]
	m.burn_t = 0.0
	# A MONSTER'S MELD ON HIS BURN (Cremate, Flashfire, a Brand crit and the rest): five blows, worse once
	h.burn_t = 10.0
	h.burn_dps = 100.0
	for k in 5:
		h.worse("burn", "cremate", 1.5)
	var hb1: float = h.burn_dps
	h.poison_t = 10.0
	h.poison_dps = 100.0
	for k in 5:
		h.worse("poison", "strangler", 2.0, true)
	var hp1: float = h.poison_dps
	var ht1: float = h.poison_t
	# (both run out as they do, in his own time)
	h.burn_t = 0.01
	h.poison_t = 0.01
	await _wait(0.2)
	h.burn_t = 10.0
	h.burn_dps = 100.0
	h.worse("burn", "cremate", 1.5)
	_line(is_equal_approx(hb1, 150.0) and is_equal_approx(hp1, 200.0) and is_equal_approx(ht1, 5.0) and is_equal_approx(h.burn_dps, 150.0), "his burn after five blows of Cremate %d (from 100), his poison after five of Strangler %d over %.1f s (from 100 over 10); a new burn, worse again: %d" % [int(hb1), int(hp1), ht1, int(h.burn_dps)])
	h.burn_t = 0.0
	h.poison_t = 0.0
	# THE EVASIVE MOVE'S LONG NAME: the longest melds on it in front and behind; pictured
	M.loot.level = 20
	h.loadout.front[2] = ["pressurepoint", "flashfreeze"]
	h.loadout.behind[2] = ["feedingfrenzy", "constellation"]
	h.loadout.front[1] = ["reverb", "twin"]
	h.loadout.behind[1] = ["pressurepoint", null]
	h.loadout._r = [null, null, null]
	await _wait(0.5)
	await M._snap(dir + "/bughunt_hud_long_name.png")
	# FLOOR 5'S CAGE: down, walked into from before it (not set on it), it takes him up
	h.loadout.front[2] = [null, null]
	h.loadout.behind[2] = [null, null]
	h.loadout.front[1] = [null, null]
	h.loadout.behind[1] = [null, null]
	h.loadout._r = [null, null, null]
	await M.go_to("floor5", "start")
	await _wait(1.0)
	var W = M.ways
	var went := false
	var walk := -1
	if W != null and W.way_kind() == "shaft":
		for o in M._monsters.list:
			if is_instance_valid(o) and o.boss:
				o.damage(o.life + o.shield + 10.0, "phys", false, false, [], false, false, -1)
		await _wait(1.0)
		var st0: String = W.state
		# (the Fleshmancer's own fight may keep him from falling to one blow: the way opened as his death opens it)
		if W.state != "opening" and W.state != "open":
			W._boss_dead = true
			W._open()
		var t3 := 0.0
		while t3 < 15.0 and W.state != "open":
			await M.get_tree().process_frame
			t3 += M.get_process_delta_time()
		var goal := Vector2(float(W._w["shaft"]["x"]) + 0.5, float(W._w["shaft"]["y"]) + 0.5)
		walk = M.map.walk[floori(goal.y) * M.map.w + floori(goal.x)]
		h.world = goal + Vector2(0.0, 1.2)
		var here: String = M.place
		var t4 := 0.0
		while t4 < 5.0 and not M._going and M.place == here:
			await M.get_tree().process_frame
			t4 += M.get_process_delta_time()
			var wd: Vector2 = goal - h.world
			h.auto_dir = preload("res://scripts/iso.gd").to_screen(wd.x, wd.y).normalized() if wd.length() > 0.02 else Vector2.ZERO
		h.auto_dir = Vector2.ZERO
		went = M._going or M.place != here
	_line(went and walk == 1, "floor 5's cage down (way %s): its tile walked (%d), and walked into from before it, it takes him up (%s)" % [W.state if W != null else "none", walk, went])
	# TWIN'S WAVES (the damage test: the Frost Mage's Shivering Twin Wave struck nothing 4.5 tiles before her): as they now fly, and
	# aimed (heroes/mage.gd TWIN_AIM), how far each passes from the spot she aims at, against its own reach and an enemy's
	var Mage := preload("res://scripts/heroes/mage.gd")
	var was: bool = Mage.TWIN_AIM
	M.set_class("mage", true)
	h = M.hero
	h.loadout.front[0] = ["shiver", "twin"]
	h.loadout._r = [null, null, null]
	await _wait(0.3)
	var miss := {}
	for on in [false, true]:
		Mage.TWIN_AIM = on
		h.kit.shots.clear()
		var from: Vector2 = h.world
		var to: Vector2 = from + Vector2(4.5, 0.0)
		h.kit._deliver(0, from, to, 1.0, false)
		var near := INF
		for sh in h.kit.shots:
			var p0 := Vector2(sh["x"], sh["y"])
			var v := Vector2(sh["vx"], sh["vy"]).normalized()
			# (where it is as it comes level with the aimed spot: its distance from it)
			var along: float = (to - p0).dot(v)
			near = minf(near, (p0 + v * along).distance_to(to) - float(sh["r"]))
		miss[on] = near
		h.kit.shots.clear()
	Mage.TWIN_AIM = was
	_line(miss[true] < 0.0, "Twin's waves 4.5 tiles out, the nearer's edge from the aimed spot: as now %.2f tiles (an enemy's middle 0.42 in misses past 0.42), aimed %.2f (over it)" % [miss[false], miss[true]])
	print("BUGHUNT: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
